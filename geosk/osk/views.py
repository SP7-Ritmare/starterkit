import os

import requests

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render_to_response
from geosk import settings as geosk_settings
from lxml import etree

from . import models, utils


def browse(request):
    cat = models.Sensor.objects.sos_catalog
    cap = cat.get_capabilities()
    cap = utils.todict(cap)
    sensors = cat.get_sensors(full=True)

    cap['capabilities_url'] = cat.get_capabilities_url()
    cap['public_capabilities_url'] = geosk_settings.SOS_PUBLIC_CAPABILITIES_URL
    return render_to_response('osk/osk_list.html',
                              {'cap': cap,
                               'sensors': sensors
                              })


def get_capabilities(request):
    cat = models.Sensor.objects.sos_catalog
    cap = cat.get_capabilities()
    xml = etree.tostring(cap._capabilities)
    response = HttpResponse(xml, content_type='application/xml')
    return response


def describe_sensor(request):
    formats = ['text/xml', 'text/html']
    sensor_id = request.GET.get('sensor_id', None)
    output_format = request.GET.get('format', 'text/xml')
    if sensor_id is None or output_format not in formats:
        return HttpResponse(status=404)

    cat = models.Sensor.objects.sos_catalog
    cap = cat.get_capabilities()
    # Fix error if XML is  sensorml 1.0.1
    try:
        xml = cap.describe_sensor(outputFormat='http://www.opengis.net/sensorml/2.0', procedure=sensor_id.encode(), raw=True)
    except: #XMLSyntaxError:
        xml = cap.describe_sensor(outputFormat='http://www.opengis.net/sensorML/1.0.1', procedure=sensor_id.encode(), raw=True)

    if output_format == 'text/xml':
        return HttpResponse(xml, content_type='application/xml')
    elif output_format == 'text/html':
        r = requests.get(
            'http://sp7.irea.cnr.it/jboss/MDService/rest/sensor2html_v2.xsl?version=3.00')
        if r.status_code == 200:
            xslt = etree.fromstring(r.text.encode(
                'utf8'), etree.XMLParser(no_network=False))
        else:
            xsl_file = os.path.join(
                os.path.dirname(__file__), 'sensor2html_v2.xsl')
            xslt = etree.parse(xsl_file)

        transform = etree.XSLT(xslt)
        dom = etree.fromstring(xml, etree.XMLParser(no_network=False))
        newdom = transform(dom)
        # return HttpResponse(etree.tostring(newdom, pretty_print=True))
        return HttpResponse(str(newdom))
