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
import json
import re
from urllib.parse import unquote

from django.contrib.gis.geos import GEOSGeometry
from dynamic_rest.serializers import DynamicModelSerializer, DynamicEphemeralSerializer
from geonode.base.api.serializers import ResourceBaseToRepresentationSerializerMixin
from geonode.layers.api.serializers import StyleSerializer
from geonode.layers.models import Layer
from geonode.services.models import Service
from rest_framework import serializers
from dynamic_rest.fields.fields import DynamicRelationField


class SOSSensorSerializer(ResourceBaseToRepresentationSerializerMixin, DynamicModelSerializer):
    class Meta:
        model = Layer
        view_name = 'sensors-list'
        fields = (
            "pk",
            "title",
            "sensorId",
            "alternate",
            "thumbnail_url",
            "sensor_name",
            "ptype",
            "featureinfo_custom_template",
            "has_time",
            "perms",
            "sosUrl",
            "offeringsIDs",
            "observablePropertiesIDs",
            "default_style",
            "styles"
        )

    sensor_name = serializers.SerializerMethodField()
    sensorId = serializers.SerializerMethodField()
    sosUrl = serializers.SerializerMethodField()
    offeringsIDs = serializers.SerializerMethodField()
    observablePropertiesIDs = serializers.SerializerMethodField()

    default_style = DynamicRelationField(StyleSerializer, embed=True, many=False, read_only=True)
    styles = DynamicRelationField(StyleSerializer, embed=True, many=True, read_only=True)

    def get_sensor_name(self, obj):
        return unquote(obj.name)

    def get_sensorId(self, obj):
        return obj.supplemental_information

    def get_sosUrl(self, obj):
        return Service.objects.get(layer=obj).base_url

    def get_offeringsIDs(self, obj):
        return [x.value for x in obj.offerings_set.all()]

    def get_observablePropertiesIDs(self, obj):
        return [x.metadata.get("definition") for x in obj.extrametadata_set.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["perms"] = ["view_resourcebase"]
        return data

class SOSServiceSerializer(DynamicModelSerializer):
    class Meta:
        model = Service
        fields = ('id', 'title', 'online_resource')


class SOSObservablePropertiesSerializer(DynamicModelSerializer):
    class Meta:
        model = Layer
        fields = ('pk',)  
    
    def to_representation(self, instance):
        return {
            "id": instance.id,
            "sensor_name": instance.resource.layer.name,
            "definition": instance.metadata.get("definition"),
            "property_label": instance.metadata.get("field_label")
        }


class FeatureOfInterestSerializer(DynamicEphemeralSerializer):
    class Meta:
        fields = ("pk", "name")
    
    def to_representation(self, _foi):
        _foi_resource = Layer.objects.filter(id=_foi.resource_id)
        if not _foi_resource.exists():
            return
        _foi_resource = _foi_resource.get()
        return {
                "id": _foi.id,
                "identifier": _foi.identifier,
                "name": _foi.name,
                "sosUrl": _foi_resource.remote_service.base_url,
                "codespace": _foi.codespace,
                "feature_type": _foi.feature_type,
                "sampled_feature": _foi.sampled_feature,
                "geom": self._get_geojson(_foi),
                "procedure": {
                    "id": _foi.resource_id,
                    "offeringsIDs": _foi_resource.offerings_set.values_list('value', flat=True),
                    "observablePropertiesIDs": [
                        x.get("definition")
                        for x in _foi_resource.extrametadata_set.values_list('metadata', flat=True)
                    ],
                },
            }

    def _get_geojson(self, _foi):
        # getting the Geometry from the XML with regex. only the GML tags are needed
        _gml = re.match(r".*?(<gml:.*)</sams.*", _foi.shape_blob)
        return json.loads(GEOSGeometry.from_gml(_gml.groups()[0]).json)
