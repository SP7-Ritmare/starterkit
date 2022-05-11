#########################################################################
#
# Copyright (C) 2022 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################
import logging
import os
import requests
import re
from collections import namedtuple
from typing import NamedTuple
from uuid import uuid4

import requests
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext as _
from geonode import settings
from geonode.base.bbox_utils import BBOXHelper
from geonode.base.models import ExtraMetadata, Link
from geonode.geoserver.security import set_geowebcache_invalidate_cache
from geonode.layers.models import Layer
from geonode.services.enumerations import HARVESTED
from geonode.services.serviceprocessors.base import (
    ServiceHandlerBase,
    get_geoserver_cascading_workspace,
)
from sos4py.main import connection_sos
from urllib.parse import parse_qs, urlparse, urlencode
from geosk.geonode_sos.models import create_dynamic_model_instance, Offerings, ServiceProvider, SensorResponsible
from geosk.geonode_sos.parser import DescribeSensorParser, namespaces
from dynamic_models.models import ModelSchema
from django.conf import settings as django_settings


logger = logging.getLogger(__name__)


class SosServiceHandler(ServiceHandlerBase):

    service_type = "SOS"

    def __init__(self, url):
        ServiceHandlerBase.__init__(self, url)
        self.proxy_base = None
        self.url = url
        self.indexing_method = HARVESTED
        self.content_response = None
        self.name = slugify(self.url)[:255]
        self.workspace = get_geoserver_cascading_workspace(create=False)

    @property
    def parsed_service(self):
        _url = self.url
        parsed_url = urlparse(_url)
        captured_value = parse_qs(parsed_url.query)
        if not captured_value:
            _url += '?' + urlencode({"service": "SOS", "request": "GetCapabilities"})
        return connection_sos(_url)

    def has_resources(self) -> bool:
        return len(self.parsed_service.contents) > 0

    def get_keywords(self):
        return []

    def get_resource(self, resource_id):
        """Return a single resource's representation."""
        procedure = [
            proc
            for proc in self._get_procedure_list()
            if resource_id in proc
        ]
        return procedure[0] if procedure else None

    def get_resources(self):
        """Return an iterable with the service's resources."""
        return [self._create_obj(x, None, None) for x in self._get_procedure_list()]

    def create_geonode_service(self, owner, parent=None):
        """Create a new geonode.service.models.Service instance
        Saving the service instance in the database is not a concern of this
        method, it only deals with creating the instance.

        :arg owner: The user who will own the service instance
        :type owner: geonode.people.models.Profile
        """
        from geonode.services.models import Service

        _response = self.parsed_service.sosServiceIdentification()

        if '2.0.0' not in _response.versions:
            raise Exception("SOS parsing is valid only for 2.0.0")

        instance = Service(
            uuid=str(uuid4()),
            base_url=self.url,
            type=self.service_type,
            method=self.indexing_method,
            owner=owner,
            parent=parent,
            metadata_only=True,
            version="2.0.0",
            name=self.name,
            title=_response.title,
            abstract=_response.abstract or _("Not provided"),
            online_resource=self.url
        )
        instance.save()
        self._service_provider(instance)

        return instance

    def harvest_resource(self, resource_id: str, geonode_service) -> Layer:
        """Harvest a single resource from the service
        This method creates new ``geonode.layers.models.Layer``
        instances (and their related objects too) and save them in the
        database.

        :arg resource_id: The resource's identifier
        :type resource_id: str
        :arg geonode_service: The already saved service instance
        :type geonode_service: geonode.services.models.Service
        """
        _exists = self.get_resource(resource_id=resource_id)
        if _exists:
            _resource_detail = self._get_procedure_detail(_exists)
            _resource_as_dict = self._from_resource_to_layer(_resource_detail)

            existance_test_qs = Layer.objects.filter(
                name=_resource_as_dict["name"],
                store=_resource_as_dict["store"],
                workspace=_resource_as_dict["workspace"],
            )
            if existance_test_qs.exists():
                raise RuntimeError(
                    f"Resource {_resource_as_dict['name']} has already been harvested"
                )
            if settings.RESOURCE_PUBLISHING or settings.ADMIN_MODERATE_UPLOADS:
                _resource_as_dict["is_approved"] = False
                _resource_as_dict["is_published"] = False
            layer = self._create_layer(_resource_as_dict, geonode_service)
            self._set_extra_metadata(layer, _resource_detail)
            foi_table_name =  self._set_feature_of_interest(layer, _resource_detail)
            self._set_offerings(layer, _resource_detail)
            self._set_responsibles(layer, _resource_detail)
            self._publish_data_to_geoserver(foi_table_name)

            self._update_alternate(
                layer=layer,
                procedure_id=_exists,
                new_alternate=f'{self.workspace.name}:{foi_table_name}'
            )

            set_geowebcache_invalidate_cache(f'{self.workspace.name}:{foi_table_name}')
            return layer
        raise RuntimeError(f"Resource {resource_id} cannot be harvested")

    def _create_layer(self, _resource_as_dict: dict, geonode_service) -> Layer:
        _ows_url = _resource_as_dict.pop("ows_url")
        _ = _resource_as_dict.pop("keywords") or []
        geonode_layer = Layer(
            owner=geonode_service.owner,
            remote_service=geonode_service,
            uuid=str(uuid4()),
            resource_type="sos_sensor",
            **_resource_as_dict,
        )
        srid = geonode_layer.srid
        bbox_polygon = geonode_layer.bbox_polygon
        geonode_layer.full_clean()
        geonode_layer.save(notify=True)
        # geonode_layer.keywords.add(*keywords)
        geonode_layer.set_default_permissions()
        # geonode_layer.extra_metadata.set()
        if bbox_polygon and srid:
            try:
                # Dealing with the BBOX: this is a trick to let GeoDjango storing original coordinates
                Layer.objects.filter(id=geonode_layer.id).update(
                    bbox_polygon=bbox_polygon, srid="EPSG:4326"
                )
                match = re.match(r"^(EPSG:)?(?P<srid>\d{4,6})$", str(srid))
                bbox_polygon.srid = int(match.group("srid")) if match else 4326
                Layer.objects.filter(id=geonode_layer.id).update(
                    ll_bbox_polygon=bbox_polygon, srid=srid
                )
            except Exception as e:
                logger.error(e)

            # Refresh from DB
            geonode_layer.refresh_from_db()
        self._create_ows_link(geonode_layer=geonode_layer, _url=_ows_url)
        return geonode_layer

    def _from_resource_to_layer(self, _resource):
        payload = {
            "name": _resource.id,
            "store": slugify(self.url)[:255],
            "storeType": "remoteStore",
            "workspace": "remoteWorkspace",
            "alternate": f"{self.workspace.name}:{self._generate_id(_resource.id)}",
            "title": _resource.title,
            "abstract": _resource.abstract,
            "srid": _resource.srs,
            "keywords": [_resource.title],
            "ows_url": _resource.id,
        }
        if _resource.bbox:
            payload["bbox_polygon"] = BBOXHelper.from_xy(
                [
                    _resource.bbox[0],
                    _resource.bbox[2],
                    _resource.bbox[1],
                    _resource.bbox[3],
                ]
            ).as_polygon()
        return payload

    def _service_provider(self, instance):
        _provider = self.parsed_service.sosProvider()
        _root = _provider.values[0]
        service_name = _root.find('.//ows:ProviderName', namespaces=namespaces)
        individual_name = _root.find('.//ows:IndividualName', namespaces=namespaces)

        ServiceProvider.objects.create(
            name=service_name.text if service_name is not None else None,
            site=_provider.site,
            individual_name=individual_name.text if individual_name is not None else None,
            position_name=_provider.position,
            phone=_provider.phone,
            delivery_point=_provider.address,
            city=_provider.city,
            administrative_area=_provider.region,
            postal_code=_provider.postcode,
            country=_provider.country,
            email=_provider.email,
            service=instance,
        )

    def _create_ows_link(self, geonode_layer: Layer, _url: str) -> None:
        Link.objects.get_or_create(
            resource=geonode_layer.resourcebase_ptr,
            url=_url,
            name="OGC:WMS",
            defaults={
                "extension": "html",
                "name": f"{geonode_layer.remote_service.type}: {geonode_layer.store} Service",
                "url": _url,
                "mime": "text/html",
                "link_type": f"{geonode_layer.remote_service.type}",
            },
        )

    def _create_obj(self, _id: str, name: str, descr: str) -> NamedTuple:
        SOSLayer = namedtuple("SosLayer", ["id", "title", "abstract"])
        return SOSLayer(_id, name, descr)

    def _generate_id(self, _id: str) -> str:
        return slugify(_id)

    def _get_procedure_list(self):
        return (
            self.parsed_service.getOperationByName("DescribeSensor")
            .parameters.get("procedure", {})
            .get("values", [])
        )

    def _get_procedure_detail(self, single_procedure):
        SOSProcedureDetail = namedtuple(
            "ProcedureDetail",
            [
                "id",
                "title",
                "abstract",
                "offerings",
                "feature_of_interest",
                "bbox",
                "srs",
                "extra",
                "sensor_responsible",
            ],
        )

        _xml = self._call_describe_sensor(single_procedure)
        # getting the metadata needed
        parser = DescribeSensorParser(
            _xml, sos_service=self.url, procedure_id=single_procedure
        )
        if not parser.is_valid():
            _xml = self._call_describe_sensor(
                single_procedure,
                description_format="http://www.opengis.net/sensorML/1.0.1"
            )

            parser = DescribeSensorParser(
                _xml, sos_service=self.url, procedure_id=single_procedure, version="v1"
            )
            assert parser.is_valid()

        return SOSProcedureDetail(
            id=parser.get_id(),
            title=parser.get_short_name(),
            abstract=parser.get_long_name(),
            offerings=parser.get_offerings(),
            feature_of_interest=parser.get_feature_of_interest(),
            bbox=parser.get_bbox(),
            srs=parser.get_srs(),
            extra=parser.get_extra_metadata(),
            sensor_responsible=parser.get_sensor_responsible()
        )

    def _call_describe_sensor(self, single_procedure, description_format="http://www.opengis.net/sensorml/2.0"):
        query_params = {
            "service": "SOS",
            "version": "2.0.0",
            "request": "DescribeSensor",
            "procedure": f"{single_procedure}",
            "procedureDescriptionFormat": description_format
        }

        parsed_url = urlparse(self.url)
        clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
        clean_url += '?' + urlencode(query_params)

        _xml = requests.get(clean_url).content
        return _xml

    def _set_extra_metadata(self, layer, _resource_detail):
        for mdata in _resource_detail.extra:
            new_m = ExtraMetadata.objects.create(
                resource=layer,
                metadata=mdata,
            )
            layer.metadata.add(new_m)

    def _set_feature_of_interest(self, layer, _resource_detail):
        name = f"resource_{layer.id}"
        foi_schema = ModelSchema.objects.create(name=name, db_name="datastore")
        dynamic_model = create_dynamic_model_instance(dynamic_model_schema=foi_schema)

        for data in _resource_detail.feature_of_interest:
            dynamic_model.objects.create(**{**data, **{"resource_id": layer.id}})

        return f'{django_settings.DYNAMIC_MODELS.get("USE_APP_LABEL")}_{name}'

    def _set_offerings(self, layer, _resource_detail):
        for data in _resource_detail.offerings:
            new_m = Offerings.objects.create(resource=layer, **data)
            layer.offerings_set.add(new_m)

    def _set_responsibles(self, layer, _resource_detail):
        for data in _resource_detail.sensor_responsible:
            new_m = SensorResponsible.objects.create(resource=layer, **data)
            layer.sensorresponsible_set.add(new_m)
    
    def _update_alternate(self, layer, procedure_id: str, new_alternate: str):
        '''
        This update is needed because we want to show into the minimap
        the FOI of the sensor. But we have the FOI table name AFTER the layer save
        So ones is created we need to update the alternate in the Layer, Harvest and Harvest job tables
        '''
        layer.alternate = new_alternate
        layer.save()
        from geonode.services.models import HarvestJob

        _job = HarvestJob.objects.get(resource_id=procedure_id)
        _job.resource_id=new_alternate
        _job.save()
        _job.refresh_from_db()

    def _publish_data_to_geoserver(self, foi_table_name=None):
        from geoserver.catalog import Catalog
        cat = Catalog(
            service_url=f"{settings.GEOSERVER_LOCATION}rest",
            username=settings.OGC_SERVER_DEFAULT_USER,
            password=settings.OGC_SERVER_DEFAULT_PASSWORD
        )
        store = cat.get_store(name=os.environ.get('GEONODE_GEODATABASE', 'geonode_data'), workspace=self.workspace)

        if not store:
            raise Exception(f"The store does not exists: {os.environ.get('GEONODE_GEODATABASE', 'geonode_data')}")

        try:
            cat.publish_featuretype(
                name=foi_table_name,
                store=store, 
                native_crs="EPSG:4326",
                srs="EPSG:4326",
                jdbc_virtual_table=foi_table_name
            )
        except Exception as e:
            if f"Resource named '{foi_table_name}' already exists in store:" in str(e):
                return
            raise e



class HandlerDescriptor:
    services_type = {
        "SOS": {"OWS": True, "handler": SosServiceHandler, "label": _("SOS 2.0 Services")}
    }
