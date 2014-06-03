import os
from lxml import etree
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.conf import settings

from . import models
from . import utils


def browse(request):
    cat = models.Sensor.objects.sos_catalog
    cap = cat.get_capabilities()
    cap = utils.todict(cap)
    sensors = cat.get_sensors()


    cap['capabilities_url'] = cat.get_capabilities_url()
    return render_to_response('osk/osk_list.html',
                              RequestContext(request, {'cap': cap, 
                                                       'sensors': sensors
                                                       }))


def get_capabilities(request):
    cat = models.Sensor.objects.sos_catalog
    cap = cat.get_capabilities()
    xml = etree.tostring(cap._capabilities)
    response = HttpResponse(xml, content_type='application/xml')
    return response

def describe_sensor(request):
    sensor_id = request.GET.get('sensor_id', None)
    if sensor_id is None:
        return HttpResponse(status=404)

    cat = models.Sensor.objects.sos_catalog
    cap = cat.get_capabilities()
    xml = cap.describe_sensor(outputFormat='http://www.opengis.net/sensorML/1.0.1', procedure=sensor_id.encode(), raw=True)
    response = HttpResponse(xml, content_type='application/xml')
    return response
