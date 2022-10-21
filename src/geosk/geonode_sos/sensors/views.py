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
from collections import namedtuple
from django.conf import settings
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from geonode.layers.views import _resolve_layer, layer_detail as geonode_layer_detail, \
    _PERMISSION_MSG_VIEW, PermissionDenied, HttpResponse, Http404, _, Service, Layer
from django.contrib.auth.decorators import login_required
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from geonode.services import enumerations
from geonode.services.views import harvest_resources_handle_get, harvest_resources_handle_post

from geosk.geonode_sos.parser import DescribeSensorParser
from geosk.geonode_sos.sos_handler import call_describe_sensor



def layer_detail(request, layername, template='layers/layer_detail.html'):
    if layername:
        try:
            layer = _resolve_layer(
                request,
                layername,
                'base.view_resourcebase',
                _PERMISSION_MSG_VIEW)
        except PermissionDenied:
            return HttpResponse(_("Not allowed"), status=403)
        except Exception:
            raise Http404(_("Not found"))
        if not layer:
            raise Http404(_("Not found"))

        if layer.resource_type == 'sos_sensor':
            return geonode_layer_detail(request, layername, template='layers/sensor_detail.html')

    return geonode_layer_detail(request, layername)


@login_required
def harvest_resources(request, service_id):

    service = get_object_or_404(Service, pk=service_id)
    try:
        handler = request.session[service.service_url]
    except KeyError:  # handler is not saved on the session, recreate it
        return redirect(
            reverse("rescan_service", kwargs={"service_id": service.id})
        )
    if request.method == "GET":
        if service.type == 'SOS':
            return overwrite_harvest_resources_handle_get(request, service, handler)
        return harvest_resources_handle_get(request, service, handler)
    elif request.method == "POST":
        return harvest_resources_handle_post(request, service, handler)


def enrich_sensor_with_name(value, service_url):
    SOSLayer = namedtuple("SosLayer", ["id", "title", "abstract"])
    _xml = call_describe_sensor(service_url, value.id)
    # getting the metadata needed
    parser = DescribeSensorParser(
        _xml, sos_service=service_url, procedure_id=value
    )
    return SOSLayer(value.id, parser.get_short_name() , parser.get_long_name())


def overwrite_harvest_resources_handle_get(request, service, handler):
    available_resources = handler.get_resources()
    is_sync = getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False)
    errored_state = False
    from geonode.security.views import _perms_info_json

    _ = _perms_info_json(service)

    perms_list = list(
        service.get_self_resource().get_user_perms(request.user)
        .union(service.get_user_perms(request.user))
    )
    already_harvested = Layer.objects.values_list("supplemental_information", flat=True)\
        .filter(resource_type="sos_sensor", remote_service=service, remote_service__harvestjob__status=enumerations.PROCESSED)\
        .distinct()

    if available_resources:
        not_yet_harvested = [
            r for r in available_resources if str(r.id) not in already_harvested]
        not_yet_harvested.sort(key=lambda resource: resource.id)
    else:
        not_yet_harvested = ['Cannot parse any resource at this time!']
        errored_state = True
    paginator = Paginator(
        not_yet_harvested, getattr(settings, "CLIENT_RESULTS_LIMIT", 100))
    page = request.GET.get('page')
    try:
        harvestable_resources = paginator.page(page)
    except PageNotAnInteger:
        harvestable_resources = paginator.page(1)
    except EmptyPage:
        harvestable_resources = paginator.page(paginator.num_pages)

    filter_row = [{}, {"id": 'id-filter', "data_key": "id"},
                  {"id": 'name-filter', "data_key": "title"},]

    _service_url = [service.service_url]*len(harvestable_resources.object_list)

    resource_to_render = list(map(enrich_sensor_with_name, harvestable_resources.object_list, _service_url))

    result = render(
        request,
        "services/service_resources_harvest.html",
        {
            "service_handler": handler,
            "service": service,
            "importable": not_yet_harvested,
            "all_resources": resource_to_render,
            "resources": harvestable_resources,
            "requested": request.GET.getlist("resource_list"),
            "is_sync": is_sync,
            "errored_state": errored_state,
            "can_add_resources": request.user.has_perm('base.add_resourcebase'),
            "filter_row": filter_row,
            "permissions_list": perms_list

        }
    )
    return result