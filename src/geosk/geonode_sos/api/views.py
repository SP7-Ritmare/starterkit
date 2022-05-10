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
from geosk.geonode_sos.api.serializer import (FeatureOfInterestSerializer,
                                        SOSObservablePropertiesSerializer,
                                        SOSSensorSerializer,
                                        SOSServiceSerializer)
from dynamic_models.models import ModelSchema
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema


class SOSSensorsViewSet(DynamicModelViewSet):
    filter_backends = [CustomSensorsFilter]
    queryset = Layer.objects.filter(resource_type="sos_sensor").order_by("id")
    serializer_class = SOSSensorSerializer
    pagination_class = GeoNodeApiPagination
    http_method_names = ["get"]


    @extend_schema(methods=['get'], description="Get the FOI for a specific Sensor.")
    @action(detail=True, methods=['get'], url_path='fois', pagination_class=GeoNodeApiPagination)
    def fois(self, request, pk=None):
        _fois = ModelSchema.objects.filter(name=f"resource_{pk}").first()
        paginator = GeoNodeApiPagination()
        paginator.page_size = request.GET.get('page_size', 10)
        result_page = paginator.paginate_queryset(_fois.as_model().objects.all().order_by('id'), request)
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
    queryset = ExtraMetadata.objects.filter(resource__resource_type="sos_sensor").order_by('id')
    serializer_class = SOSObservablePropertiesSerializer
    pagination_class = GeoNodeApiPagination
    http_method_names = ["get"]
