# -*- coding: utf-8 -*-
import os
import geonode

# Setting debug to true makes Django serve static media and
# present pretty error pages.
DEBUG = TEMPLATE_DEBUG = False

# Set to True to load non-minified versions of (static) client dependencies
# Requires to set-up Node and tools that are required for static development
# otherwise it will raise errors for the missing non-minified dependencies
DEBUG_STATIC = False

SITENAME = 'GET-IT Demo'
SITEURL = "http://demo1.get-it.it/"

# For more information on available settings please consult the Django docs at
# https://docs.djangoproject.com/en/dev/ref/settings
ALLOWED_HOSTS=["demo1.get-it.it", "localhost"]

# Database connections
DATABASE_ENGINE = 'postgresql_psycopg2'
DATABASE_NAME = 'geonode'
DATABASE_USER = 'geonode'
DATABASE_PASSWORD = 'changeme'
DATABASE_HOST = 'localhost'
DATABASE_PORT = '5432'

DATA_DATABASE_NAME = 'geonode-data'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': DATABASE_NAME,
        'USER': DATABASE_USER,
        'PASSWORD': DATABASE_PASSWORD,
        'HOST': DATABASE_HOST,
        'PORT': DATABASE_PORT,
    },
    'datastore': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': DATA_DATABASE_NAME,
        'USER': DATABASE_USER,
        'PASSWORD': DATABASE_PASSWORD,
        'HOST': DATABASE_HOST,
        'PORT': DATABASE_PORT,
    },
    'sensors': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/var/lib/tomcat7/webapps/observations/configuration.db',
        }

}

GEOSERVER_URL = SITEURL + 'geoserver/'

SOS_URL = SITEURL + 'observations/sos'

SOS_SERVER = {
  'default' : {
    'LOCATION' : 'http://localhost:8080/observations/sos',
    'PUBLIC_LOCATION' : SOS_URL,
    'KVP_LOCATION': SOS_URL + '/kvp',
    'POX_LOCATION': SOS_URL + '/pox',
    'VERSION': '2.0.0',
    'TRANSACTIONAL_AUTHORIZATION_TOKEN': '1GDVIqiAuR6jFJ2Agq',
    'USER' : None,
    'PASSWORD' : None,
    }
  }

# OGC (WMS/WFS/WCS) Server Settings
OGC_SERVER = {
    'default' : {
        'BACKEND' : 'geonode.geoserver',
        'LOCATION' : 'http://localhost:8080/geoserver/',
        'PUBLIC_LOCATION' : GEOSERVER_URL,
        'USER' : 'admin',
        'PASSWORD' : 'geoserver',
        'MAPFISH_PRINT_ENABLED' : True,
        'PRINTNG_ENABLED' : True,
        'GEONODE_SECURITY_ENABLED' : True,
        'GEOGIT_ENABLED' : False,
        'WMST_ENABLED' : False,
        'BACKEND_WRITE_ENABLED': True,
        'WPS_ENABLED' : True,
        # Set to name of database in DATABASES dictionary to enable
        'DATASTORE': 'datastore',
    }
}

LANGUAGE_CODE = 'en'

MEDIA_ROOT = '/var/www/starterkit/uploaded'
STATIC_ROOT = '/var/www/starterkit/static/'

# secret key used in hashing, should be a long, unique string for each
# site.  See http://docs.djangoproject.com/en/1.2/ref/settings/#secret-key
SECRET_KEY = 'changeme'


CATALOGUE = {
    'default': {
        # The underlying CSW backend
        # ("pycsw_http", "pycsw_local", "geonetwork", "deegree")
        'ENGINE': 'geonode.catalogue.backends.pycsw_local',
        # The FULLY QUALIFIED base url to the CSW instance for this GeoNode
        'URL': '%scatalogue/csw' % SITEURL,
    }
}

# A Google Maps API key is needed for the 3D Google Earth view of maps
# See http://code.google.com/apis/maps/signup.html
GOOGLE_API_KEY = ''

GEONODE_ROOT = os.path.dirname(geonode.__file__)

TEMPLATE_DIRS = (
    '/etc/starterkit/templates',
    os.path.join(GEONODE_ROOT, 'templates'),
)

# Additional directories which hold static files
STATICFILES_DIRS = [
    '/etc/starterkit/media',
    os.path.join(GEONODE_ROOT, 'static'),
]

MAP_BASELAYERS = [
    {
        "source": {
            "ptype": "gxp_wmscsource",
            "url": GEOSERVER_URL + "wms",
            "restUrl": "/gs/rest"
        }
    }, {
        "source": {"ptype": "gxp_olsource"},
        "type":"OpenLayers.Layer",
        "args":["No background"],
        "visibility": False,
        "fixed": True,
        "group":"background"
    }, {
        "source": {
            "ptype": "gxp_arcrestsource",
            "url": "http://maratlas.discomap.eea.europa.eu/arcgis/rest/services/Maratlas/Bathymetry4/MapServer"
        },
        "name": "High resolution bathymetry (Europe)",
        "layerid": "0",
        "group":"background"
    }, {
        "source": {
            "ptype": "gxp_wmscsource",
            "url":"http://geo.vliz.be/geoserver/MarineRegions/wms?Request=getCapabilities",
            "title": "Flanders Marine Institute (VLIZ)"
        }
    }, {
        "source": {"ptype":"gxp_googlesource"},
        "group":"background",
        "name":"SATELLITE",
        "visibility": False,
        "fixed": True,
    }, {
        "source": {"ptype":"gxp_googlesource"},
        "group":"background",
        "name":"HYBRID",
        "visibility": False,
        "fixed": True,
    }, {
        "source": {"ptype":"gxp_googlesource"},
        "group":"background",
        "name":"TERRAIN",
        "visibility": False,
        "fixed": True,
    }, {
        "source": {"ptype":"gxp_googlesource"},
        "group":"background",
        "name":"ROADMAP",
        "visibility": False,
        "fixed": True
    }, {
        "source": {"ptype": "gxp_olsource"},
        "type":"OpenLayers.Layer.OSM",
        "args":["OpenStreetMap"],
        "visibility": False,
        "fixed": True,
        "group":"background"
    }, {
        "source": {"ptype": "gxp_mapquestsource"},
        "name":"osm",
        "group":"background",
        "visibility": True
    }, {
        "source": {"ptype": "gxp_mapquestsource"},
        "name":"naip",
        "group":"background",
        "visibility": False
    }, {
        "source": {"ptype": "gxp_bingsource"},
        "name": "AerialWithLabels",
        "fixed": True,
        "visibility": False,
        "group":"background"
    },{
        "source": {"ptype": "gxp_mapboxsource"},
    },
]

try:
    from pycsw_settings import *
except (ImportError, NameError):
    pass

# Uncomment the following to receive emails whenever there are errors in GET-IT#
ADMINS = (
    ('Help SK', 'help.skritmare@irea.cnr.it'),
)

DEFAULT_FROM_EMAIL = 'help.skritmare@irea.cnr.it'
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Uncomment the following to use a Gmail account as the email backend
# EMAIL_USE_TLS = True
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_HOST_USER = 'youremail@gmail.com'
# EMAIL_HOST_PASSWORD = 'yourpassword'
# EMAIL_PORT = 587
