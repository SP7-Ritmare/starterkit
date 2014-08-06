import sys
import os
import json
import requests
from lxml import etree
from urlparse import urlsplit

from owslib.namespaces import Namespaces
from owslib.util import nspath_eval

from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.safestring import mark_safe
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

from geosk.skregistration.views import get_key
from geonode.utils import http_client, _get_basic_auth_info, json_response
from geosk.osk.models import Sensor

namespaces = Namespaces().get_namespaces('ows110')

def lastediml(request):
    s = Sensor.objects.order_by('-id').all()[0]
    return HttpResponse(s.ediml, mimetype='application/xml')

def lastsensorml(request):
    s = Sensor.objects.order_by('-id').all()[0]
    return HttpResponse(s.sensorml, mimetype='application/xml')

class UploadView(TemplateView):
    template_name = 'osk/osk_upload.html'
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(UploadView, self).dispatch(*args, **kwargs)

@login_required
def sensormleditor(request):
    queryStringValues = {
        'template': 'SensorML2',
        'version': '2.00',
        'parameters': "{}"
        }    

    # fileid = layer.mdextension.fileid
    pars = {}

    
    js_pars = json.dumps(pars, cls=DjangoJSONEncoder)

    queryStringValues['parameters'] = json.dumps(pars, cls=DjangoJSONEncoder)
    
    js_queryStringValues = json.dumps(queryStringValues)
    return render_to_response(
        'osk/osk_registration.html',
        RequestContext(request, {
                'queryStringValues': mark_safe(js_queryStringValues)
                })
        )

def _get_register_sensor(xml):
    service = settings.RITMARE['MDSERVICE'] + 'sos/registerSensor'
    headers = {
        'api_key': get_key(), 
        'Content-Type': 'application/xml'
        }
    r = requests.post(service, data=xml,  headers=headers, verify=False)
    if r.status_code == 200:
        return r.text
    return None
    

def sensormlproxy(request):
    service = settings.RITMARE['MDSERVICE'] + 'postMetadata'
    headers = {
        'api_key': get_key(), 
        'Content-Type': 'application/xml'
        }

    r = requests.post(service, data=request.raw_post_data,  headers=headers, verify=False)
    if r.status_code == 200:
        sensorml = r.text

        # get fileid
        ediml = etree.fromstring(request.raw_post_data)
        fileid = ediml.find('fileId').text

        headers = {
            'Accept': 'application/xml',
            'Content-Type': 'application/xml',
            'Authorization': "%s" % settings.SOS_SERVER['default']['TRANSACTIONAL_AUTHORIZATION_TOKEN']
            }

        settings.SOS_SERVER['default']['LOCATION']
        sos_response = requests.post(
            settings.SOS_SERVER['default']['LOCATION'] + '/pox', 
            data=sensorml.encode('utf8'),  headers=headers, 
            verify=False
            )

        
        if sos_response.status_code == 200:
            tr = etree.fromstring(sos_response.content)
            if tr.tag == nspath_eval("ows110:ExceptionReport", namespaces):
                return json_response(exception=sos_response.text.encode('utf8'), status=500)

            # save sensorml & edi xml
            sensor = Sensor(fileid=fileid)
    
            sensor.sensorml = sensorml
            sensor.ediml = request.raw_post_data
            sensor.save()
            return json_response(body={'success':True,'redirect': reverse('osk_browse')})
        
        else:
            return json_response(exception=sos_response.text.encode('utf8'), status=500)

    return json_response(errors='Cannot create SensorML', 
                         status=500)

