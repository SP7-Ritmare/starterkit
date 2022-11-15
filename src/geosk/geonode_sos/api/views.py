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
from dynamic_rest.viewsets import DynamicModelViewSet
from geonode.base.api.pagination import GeoNodeApiPagination
from geonode.base.models import ExtraMetadata
from geonode.layers.models import Layer
from geonode.services.models import Service
from geosk.geonode_sos.api.filters import CustomSensorsFilter
from django.http import HttpResponse
from geosk.geonode_sos.api.serializer import (
    FeatureOfInterestSerializer,
    SOSObservablePropertiesSerializer,
    SOSSensorSerializer,
    SOSServiceSerializer,
)
from rest_framework.response import Response
from dynamic_models.models import ModelSchema
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ParseError


class SOSSensorsViewSet(DynamicModelViewSet):
    filter_backends = [CustomSensorsFilter]
    queryset = Layer.objects.filter(resource_type="sos_sensor").order_by("id")
    serializer_class = SOSSensorSerializer
    pagination_class = GeoNodeApiPagination
    http_method_names = ["get"]

    @extend_schema(methods=["get"], description="Get the FOI for a specific Sensor.")
    @action(
        detail=True,
        methods=["get"],
        url_path="fois",
        pagination_class=GeoNodeApiPagination,
    )
    def fois(self, request, pk=None):
        _filters = request.data.copy()
        _qr_filters = self.request.query_params
        _filter = {}

        _fois = ModelSchema.objects.filter(name=f"resource_{pk}").first()

        paginator = GeoNodeApiPagination()
        paginator.page_size = request.GET.get("page_size", 10)

        if _fois is None:
            return HttpResponse(
                content="Selected sensor does not exists",
                status=404,
            )

        if _filters.get("id", None) or _qr_filters.get("id", None):
            _filter = {
                "id__in": _filters.pop("id", {})
                or list(_qr_filters.get("id", []).split(","))
            }

        result_page = paginator.paginate_queryset(
            _fois.as_model().objects.filter(**_filter).all().order_by("id"), request
        )
        serializer = FeatureOfInterestSerializer(result_page, embed=True, many=True)
        return paginator.get_paginated_response({"resources": serializer.data})


class SOSServicesViewSet(DynamicModelViewSet):
    filter_backends = [CustomSensorsFilter]
    queryset = Service.objects.filter(type="SOS").order_by("id")
    serializer_class = SOSServiceSerializer
    pagination_class = GeoNodeApiPagination
    http_method_names = ["get"]


class SOSObservablePropertyViewSet(DynamicModelViewSet):
    filter_backends = [CustomSensorsFilter]
    queryset = ExtraMetadata.objects.filter(
        resource__resource_type="sos_sensor"
    ).order_by("id")
    serializer_class = SOSObservablePropertiesSerializer
    pagination_class = GeoNodeApiPagination
    http_method_names = ["get"]


class FeatureOfInterestViewSet(DynamicModelViewSet):
    queryset = ModelSchema.objects.all().order_by("id")
    serializer_class = FeatureOfInterestSerializer
    pagination_class = GeoNodeApiPagination
    http_method_names = ["get"]

    def list(self, request, *args, **kwargs):
        '''
        We have to override the list method, otherwise
        the list of the feature will have None as a key
        '''
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(self._extract_data(serializer))

        serializer = self.get_serializer(queryset, many=True)
        return Response(self._extract_data(serializer))

    def _extract_data(self, serializer):
        if serializer.data.get(None):
            serializer.data["fois"] = serializer.data.pop(None)
        return serializer.data

    def get_queryset(self, queryset=None):
        """
        Since is a dynamic models, is easier to permform here the filtering
        instead of create a filter.
        The filters can be passed or via queryparams or via payload.
        The payload wins againt the queryparams
        example payload expected:
        {
            "id": [1,3,8,2],
            "sensor_id": [163]
        }
        """
        data = None
        _filters = self.request.data.copy()
        _qr_filters = self.request.query_params
        _filter = {}
        _model_schema = ModelSchema.objects

        sensor_filter = _filters.get("sensor_id[]", None) or _qr_filters.get("sensor_id[]", None)
        id_filter = _filters.get("id[]", None) or _qr_filters.get("id[]", None)
        
        if id_filter and sensor_filter:
            _id = id_filter.split(",")
            sensor = sensor_filter.split(",")
            if not len(_id) == len(sensor):
                raise ParseError(detail="Sensor_id and foi_id list must have the same length")

            for pair in zip(_id, sensor):
                for _model in _model_schema.filter(name=f"resource_{pair[1]}").iterator():
                    _model_instance = _model.as_model()
                    if _model_instance.objects.exists():
                        if not data:
                            data = _model_instance.objects.filter(id=pair[0])
                        else:
                            data = data.union(_model_instance.objects.filter(id=pair[0]))

            return data.order_by("id") if data else []

        elif sensor_filter:
            _resource_names = [
                f"resource_{_r}"
                for _r in _filters.get("sensor_id[]", [])
                or list(_qr_filters.get("sensor_id[]", []).split(","))
            ]
            _model_schema = _model_schema.filter(name__in=_resource_names)

        if id_filter:
            _filter = {
                "id__in": _filters.pop("id[]", {})
                or list(_qr_filters.get("id[]", []).split(","))
            }

        for _model in _model_schema.iterator():
            _model_instance = _model.as_model()
            if _model_instance.objects.exists():
                if not data:
                    data = _model_instance.objects.filter(**_filter).all()
                else:
                    data = data.union(_model_instance.objects.filter(**_filter).all())

        return data.order_by("id") if data else []
