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
from typing import Tuple
from rest_framework.filters import SearchFilter
from django.db.models import Q
import ast

VIEW_FILTERS_MAPPING = {
    "sosservice": {
        "sos_url": "base_url__icontains",
        "sensor_title": "layer__title__icontains",
        "sensor_name": "layer__name__icontains",
        "observable_property": "layer__extrametadata__metadata__definition__icontains",
        "property_label": "layer__extrametadata__metadata__field_label__icontains",
    },
    "observable": {
        "sos_url": "resource__layer__remote_service__base_url__icontains",
        "sensor_title": "resource__title__icontains",
        "sensor_name": "resource__name__icontains",
        "observable_property": "metadata__definition__icontains",
        "property_label": "metadata__field_label__icontains",
    },
    "default": {
        "sos_url": "remote_service__base_url__icontains",
        "sensor_title": "title__icontains",
        "sensor_name": "name__icontains",
        "observable_property": "extrametadata__metadata__definition__icontains",
        "property_label": "extrametadata__metadata__field_label__icontains",
    }
}


class CustomSensorsFilter(SearchFilter):

    def filter_queryset(self, request, queryset, view):
        _filters = request.GET
        if not _filters:
            return queryset

        or_filters, and_filters = self.setup_orm_filters(view, _filters)
        return queryset.filter(or_filters, **and_filters)

    def setup_orm_filters(self, view, _filters) -> Tuple[Q, dict]:
        sos_url = _filters.pop("sos_url", None)
        title = _filters.pop("sensor_title", None)
        observable_property = _filters.pop("observable_property", None)
        sensor_name = _filters.pop("sensor_name", None)
        observable_property_label = _filters.pop("property_label", None)
        or_filters = Q()
        and_filters = {}
        _field_filters = VIEW_FILTERS_MAPPING.get(view.basename, VIEW_FILTERS_MAPPING.get('default'))

        if title and sensor_name and view.basename == 'sensors':
            or_filters |= Q(**{_field_filters.get('sensor_title'):title[0]})
            or_filters |= Q(**{_field_filters.get('sensor_name'):sensor_name[0]})
        else:
            if title:
                and_filters[_field_filters.get('sensor_title')] = title[0]
            if sensor_name:
                and_filters[_field_filters.get('sensor_name')] = sensor_name[0]

        if observable_property_label and view.basename == 'observable':
            and_filters[_field_filters.get('property_label')] = observable_property_label[0]

        if sos_url:
            and_filters[_field_filters.get('sos_url')] = sos_url[0]            
        if observable_property:
            and_filters[_field_filters.get('observable_property')] = observable_property[0]

        # generating the other filters dynamically
        for _key, _value in _filters.items():
            try:
                if _value.isnumeric():
                    and_filters[f"{_key}"] = ast.literal_eval(_value)
                else:
                    and_filters[f"{_key}__icontains"] = _value
            except Exception:
                raise
        return or_filters, and_filters
