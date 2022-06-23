import os

from django.http import HttpResponse
from django.shortcuts import redirect, reverse

from lxml import etree

from . import models


def browse(request):
    return redirect(f"{reverse('layer_browse')}?resource_type=sos_sensor")


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
    except BaseException:  # XMLSyntaxError:
        xml = cap.describe_sensor(outputFormat='http://www.opengis.net/sensorML/1.0.1', procedure=sensor_id.encode(), raw=True)

    if output_format == 'text/xml':
        return HttpResponse(xml, content_type='application/xml')
    elif output_format == 'text/html':
        # r = requests.get(
        # 'http://sp7.irea.cnr.it/jboss/MDService/rest/sensor2html_v2.xsl?version=3.00'
        # 'http://www.get-it.it/objects/sensors/xslt/sensor2html_v2.xsl')
        # if r.status_code == 200:
        #    xslt = etree.fromstring(r.text.encode(
        #        'utf8'), etree.XMLParser(no_network=False))
        # else:
        xsl_file = os.path.join(
            os.path.dirname(__file__), 'sensor2html_v2.xsl')
        xslt = etree.parse(xsl_file)

        transform = etree.XSLT(xslt)
        dom = etree.fromstring(xml, etree.XMLParser(no_network=False))
        newdom = transform(dom)
        # return HttpResponse(etree.tostring(newdom, pretty_print=True))
        return HttpResponse(str(newdom))
