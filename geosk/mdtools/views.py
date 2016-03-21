import os
import sys
import json
import logging
import pycsw
import subprocess
import re

from django.conf import settings
from django.http import HttpResponse
from django.forms import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict
from django.contrib.sites.models import Site

from geonode.layers.forms import LayerForm
from geonode.layers.models import Layer
from geonode.maps.forms import MapForm
from geonode.maps.models import Map

from geosk.mdtools.models import ServicesMetadata
from geosk import get_version as geosk_version
from geonode import get_version as geonode_version
from django import get_version as django_version
from django.db import connection


logger = logging.getLogger(__name__)

def get_data_api(request, format='json'):
    if request.method not in ('GET','POST'):
        return HttpResponse(status=405)

    rtype = request.REQUEST.get('rtype')
    id = request.REQUEST.get('id')

    if rtype == 'layer':
        r = Layer.objects.get(pk=id)
        exclude = LayerForm._meta.exclude
    elif rtype == 'map':
        r = Map.objects.get(pk=id)
        exclude = MapForm._meta.exclude

    exclude = exclude + ('owner', 'title', 'distribution_url', 'distribution_description')
    data = model_to_dict(r, exclude=exclude)

    #f=LayerForm(model_to_dict(l), prefix='layer')


    data['keywords'] = r.keyword_csv
    # data_prefix = {"layer-%s" % k: v for k, v in data.items()}

    results = {
        'data': data
        }
    return HttpResponse(json.dumps(results, cls=DjangoJSONEncoder), mimetype="application/json")

def get_ubuntu_release():
    try:
        version = subprocess.check_output(['lsb_release', '-sr'])
    except:
        version = ''
    return version.strip()

def get_postgres_version():
    c = connection.cursor()
    try:
        c.execute('show server_version')
        version = c.fetchone()[0]
    except:
        version = ''
    finally:
        c.close()
    return version

def get_postgis_version():
    c = connection.cursor()
    try:
        c.execute('SELECT PostGIS_version()')
        version = c.fetchone()[0]
    except:
        version = ''
    finally:
        c.close()
    return version

def get_java_version():
    try:
        version = subprocess.check_output(['java', '-version'], stderr=subprocess.STDOUT)
        pattern = '\"(\d+\.\d+).*\"'
        version = re.search(pattern, version).groups()[0]
    except:
        version = ''
    return version

def get_tomcat_version():
    try:
        out = subprocess.check_output(['ps', '-efww']).split("\n")
        reg_cat_home = re.compile('catalina.home=(\S*)')
        for o in out:
            if o.find('tomcat') >= 0:
                _find = reg_cat_home.search(o)
                if _find:
                    version = _get_tomcat_version(_find.groups()[0])
    except:
        version = ''
    return version

def _get_tomcat_version(catalina_home):
    cmd = os.path.join(catalina_home, 'bin', 'version.sh')
    out = subprocess.check_output(cmd).split("\n")
    for o in out:
        if o.find('Server number') >= 0:
            return o.split(':')[1]

def get_sos_version():
    try:
        with open('/var/lib/tomcat7/webapps/observations/version-info.txt') as f:
            out = f.readlines()
            for o in out:
                if o.find('version =') >= 0:
                    version = o.split('=')[1]
    except TypeError:
        version = ''
    return version.strip()

def whoami(request, format='json'):
    if ServicesMetadata.objects.count() == 1:
        services_metadata = ServicesMetadata.objects.all()[0]
        _md = model_to_dict(services_metadata)
        domain = Site.objects.get_current().domain
        _md['uri'] = 'http://%s' % domain
        _md['sk_domain_name'] = domain
        # TODO sistemare
        _md['endpoint_SOS_url'] = settings.SITEURL + 'observations/sos'
    else:
        _md = {
            'message': 'Missing metadata'
            }

    # software
    _md['software'] = {
        'ubuntu': get_ubuntu_release(),
        'java': get_java_version(),
        'tomcat': get_tomcat_version(),
        'postgresql': get_postgres_version(),
        'postgis': get_postgis_version(),
        'python': sys.version,
        'getit': geosk_version(),
        'geonode': geonode_version(),
        'pycsw': pycsw.__version__,
        'django': django_version(),
        'sos': get_sos_version()
    }


    return HttpResponse(json.dumps(_md, indent=2), mimetype="application/json")
