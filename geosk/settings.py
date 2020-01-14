# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2014 Starter Kit Development Team
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
# Django settings for the GeoNode project.
import ast
import os

# Load more settings from a file called local_settings.py if it exists
try:
    from geosk.local_settings import *
#    from geonode.local_settings import *
except ImportError:
    from geonode.settings import *

#
# General Django development settings
#
PROJECT_NAME = 'geosk'
SITENAME = 'StarterKit'
SITEURL = os.getenv('SITEURL', "http://geosk.ve.ismar.cnr.it/")

# Defines the directory that contains the settings file as the LOCAL_ROOT
# It is used for relative settings elsewhere.
LOCAL_ROOT = os.path.abspath(os.path.dirname(__file__))

WSGI_APPLICATION = "{}.wsgi.application".format(PROJECT_NAME)

if os.getenv('DOCKER_ENV'):
    ALLOWED_HOSTS = ast.literal_eval(os.getenv('ALLOWED_HOSTS'))
else:
    ALLOWED_HOSTS = ['localhost', ] if os.getenv('ALLOWED_HOSTS') is None \
        else re.split(r' *[,|:|;] *', os.getenv('ALLOWED_HOSTS'))

PROXY_ALLOWED_HOSTS += ('spatialreference.org', 'nominatim.openstreetmap.org', 'dev.openlayers.org')

# Internal Proxy URLs
REVERSE_PROXY_SOS = 'http://localhost:8080/observations/'
REVERSE_PROXY_SPARQL = 'http://sparql.get-it.it/'
REVERSE_PROXY_FUSEKI = 'http://fuseki1.get-it.it/'
REVERSE_PROXY_VOCABS = 'http://vocabs.ceh.ac.uk/'
REVERSE_PROXY_NERC = 'http://vocab.nerc.ac.uk/'
REVERSE_PROXY_METADATA = 'http://edi.get-it.it/'
REVERSE_PROXY_ADAMASOFT = 'http://sdi.adamassoft.it/proxy/'

# AUTH_IP_WHITELIST property limits access to users/groups REST endpoints
# to only whitelisted IP addresses.
#
# Empty list means 'allow all'
#
# If you need to limit 'api' REST calls to only some specific IPs
# fill the list like below:
#
# AUTH_IP_WHITELIST = ['192.168.1.158', '192.168.1.159']
AUTH_IP_WHITELIST = []

MANAGERS = ADMINS = os.getenv('ADMINS', [])
TIME_ZONE = os.getenv('TIME_ZONE', "America/Chicago")
USE_TZ = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(LOCAL_ROOT, "uploaded"))

# Absolute path to the directory that holds static files like app media.
# Example: "/home/media/media.lawrence.com/apps/"
STATIC_ROOT = os.getenv('STATIC_ROOT', os.path.join(LOCAL_ROOT, "static_root"))

# Additional directories which hold static files
STATICFILES_DIRS = [os.path.join(LOCAL_ROOT, "static")] + STATICFILES_DIRS

# Note that Django automatically includes the "templates" dir in all the
# INSTALLED_APPS, se there is no need to add maps/templates or admin/templates
# TEMPLATE_DIRS = (
#     os.path.join(LOCAL_ROOT, "templates"),
# ) + TEMPLATE_DIRS

# INSTALLED_APPS += (PROJECT_NAME,)

INSTALLED_APPS = (
    # GeoSK
    # 'geosk.rndt',
    # 'geosk.demo',
    # 'geosk',
    'geosk.osk',
    'geosk.mdtools',
    'geosk.geoskbase',
    #  'geosk.search',
    #  'geosk.patches',
    'geosk.skregistration',
    'overextends',  # https://github.com/stephenmcd/django-overextends
    'rosetta',
    'grappelli.dashboard',
    'grappelli',
    'analytical',
    'taggit_templatetags2',
) + INSTALLED_APPS

# Location of url mappings
ROOT_URLCONF = os.getenv('ROOT_URLCONF', '{}.urls'.format(PROJECT_NAME))

MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(LOCAL_ROOT, "uploaded"))

STATIC_ROOT = os.getenv('STATIC_ROOT',
                        os.path.join(LOCAL_ROOT, "static_root")
                        )

# Location of locale files
LOCALE_PATHS = (
    os.path.join(LOCAL_ROOT, 'locale'),
) + LOCALE_PATHS

TEMPLATES[0]['DIRS'].insert(0, os.path.join(LOCAL_ROOT, "templates"))

loaders = TEMPLATES[0]['OPTIONS'].get('loaders') or [
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
]
builtins = ['overextends.templatetags.overextends_tags',]

TEMPLATES[0]['OPTIONS']['loaders'] = loaders
TEMPLATES[0]['OPTIONS']['builtins'] = builtins
TEMPLATES[0].pop('APP_DIRS', None)

# Login and logout urls override
LOGIN_URL = os.getenv('LOGIN_URL', '{}account/login/'.format(SITEURL))
LOGOUT_URL = os.getenv('LOGOUT_URL', '{}account/logout/'.format(SITEURL))

ACCOUNT_LOGIN_REDIRECT_URL = os.getenv('LOGIN_REDIRECT_URL', SITEURL)
ACCOUNT_LOGOUT_REDIRECT_URL = os.getenv('LOGOUT_REDIRECT_URL', SITEURL)

# security settings
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
X_FRAME_OPTIONS = 'ALLOW-FROM %s' % SITEURL
SECURE_CONTENT_TYPE_NOSNIFF = False
SECURE_BROWSER_XSS_FILTER = False
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

if os.getenv('DOCKER_ENV'):

    # Set geodatabase to datastore for OGC server
    if os.getenv('DEFAULT_BACKEND_DATASTORE'):
        GEODATABASE_URL = os.getenv('GEODATABASE_URL',
                                    'postgis://\
    geonode_data:geonode_data@localhost:5432/geonode_data')
        DATABASES[os.getenv('DEFAULT_BACKEND_DATASTORE')] = dj_database_url.parse(
            GEODATABASE_URL, conn_max_age=5
        )
        if 'OPTIONS' not in DATABASES[os.getenv('DEFAULT_BACKEND_DATASTORE')]:
            DATABASES[os.getenv('DEFAULT_BACKEND_DATASTORE')]['OPTIONS'] = {}
        DATABASES[os.getenv('DEFAULT_BACKEND_DATASTORE')]['CONN_TOUT'] = 5
        DATABASES[os.getenv('DEFAULT_BACKEND_DATASTORE')]['OPTIONS'] = {
            'connect_timeout': 5,
        }

    if 'CONN_MAX_AGE' in DATABASES['default']:
        DATABASES['default']['CONN_MAX_AGE'] = 5

    if 'CONN_TOUT' in DATABASES['default']:
        DATABASES['default']['CONN_TOUT'] = 5

    if 'OPTIONS' not in DATABASES['default']:
        DATABASES['default']['OPTIONS'] = {}

    DATABASES['default']['OPTIONS'].update({
        'connect_timeout': 5,
    })

    # Override OGC server config if docker is production
    OGC_SERVER = {
        'default': {
            'BACKEND': 'geonode.geoserver',
            'LOCATION': GEOSERVER_LOCATION,
            'LOGIN_ENDPOINT': 'j_spring_oauth2_geonode_login',
            'LOGOUT_ENDPOINT': 'j_spring_oauth2_geonode_logout',
            'WEB_UI_LOCATION': GEOSERVER_WEB_UI_LOCATION,
            # PUBLIC_LOCATION needs to be kept like this because in dev mode
            # the proxy won't work and the integration tests will fail
            # the entire block has to be overridden in the local_settings
            'PUBLIC_LOCATION': GEOSERVER_PUBLIC_LOCATION,
            'USER': OGC_SERVER_DEFAULT_USER,
            'PASSWORD': OGC_SERVER_DEFAULT_PASSWORD,
            'MAPFISH_PRINT_ENABLED': True,
            'PRINT_NG_ENABLED': True,
            'GEONODE_SECURITY_ENABLED': True,
            'GEOFENCE_SECURITY_ENABLED': GEOFENCE_SECURITY_ENABLED,
            'WMST_ENABLED': False,
            'BACKEND_WRITE_ENABLED': True,
            'WPS_ENABLED': False,
            'LOG_FILE': '%s/geoserver/data/logs/geoserver.log'
            % os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir)),
            # Set to name of database in DATABASES dictionary to enable
            # 'datastore',
            'DATASTORE': os.getenv('DEFAULT_BACKEND_DATASTORE', ''),
            # 'CACHE': ".cache"  # local cache file to for HTTP requests
            'TIMEOUT': int(os.getenv('OGC_REQUEST_TIMEOUT', '5')),
            'MAX_RETRIES': int(os.getenv('OGC_REQUEST_MAX_RETRIES', '5')),
            'BACKOFF_FACTOR': float(os.getenv('OGC_REQUEST_BACKOFF_FACTOR', '0.3')),
            'POOL_MAXSIZE': int(os.getenv('OGC_REQUEST_POOL_MAXSIZE', '10')),
            'POOL_CONNECTIONS': int(os.getenv('OGC_REQUEST_POOL_CONNECTIONS', '10')),
        }
    }

# add following lines to your local settings to enable monitoring
if MONITORING_ENABLED:
    if os.getenv('DOCKER_ENV'):
        MONITORING_HOST_NAME = os.getenv("MONITORING_HOST_NAME", 'geonode')
    else:
        MONITORING_HOST_NAME = os.getenv("MONITORING_HOST_NAME", 'localhost')
		
GEOIP_PATH = os.getenv('GEOIP_PATH', os.path.join(PROJECT_ROOT, 'GeoIPCities.dat'))

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d '
                      '%(thread)d %(message)s'
        },
        'simple': {
            'format': '%(message)s',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'mail_admins': {
            'level': 'INFO', 'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    "loggers": {
        "django": {
            "handlers": ["console"], "level": "INFO", },
        "geonode": {
            "handlers": ["console"], "level": "INFO", },
        "gsconfig.catalog": {
            "handlers": ["console"], "level": "INFO", },
        "owslib": {
            "handlers": ["console"], "level": "INFO", },
        "pycsw": {
            "handlers": ["console"], "level": "INFO", },
        "mapstore2_adapter": {
            "handlers": ["console"], "level": "DEBUG", },
        "geosk": {
            "handlers": ["console"], "level": "DEBUG", },
    },
}


LANGUAGES = (
    ('en', 'English'),
    ('it', 'Italiano'),
)

METADATA_DEFAULT_VALUES = {
    'category': 'environment',
    'language': 'ita',
    'regions': ['ITA']
}

DEFAULT_TOPICCATEGORY = METADATA_DEFAULT_VALUES['category']

# rosetta
ROSETTA_WSGI_AUTO_RELOAD = True
# ROSETTA_EXCLUDED_APPLICATIONS = ('geonode',)

# grappelli
GRAPPELLI_ADMIN_TITLE = "Home - Starter Kit"
GRAPPELLI_INDEX_DASHBOARD = 'geosk.dashboard.CustomIndexDashboard'

# add skregistration context processor
TEMPLATES[0]['OPTIONS']['context_processors'].append('geosk.context_processors.sk')
TEMPLATES[0]['OPTIONS']['context_processors'].append('geosk.skregistration.context_processors.skregistration')

# PYCSW override from env file
if os.getenv('DOCKER_ENV', ""):
    try:
        PYCSW = ast.literal_eval(
            os.getenv("PYCSW")
        )
    except ValueError as e:
        pass

# RITMARE services
RITMARE = {
    # postMetadata, auth/register, auth/verify
    'MDSERVICE': 'https://sp7.irea.cnr.it/jboss/MDService/rest/'
}


# SOS
SOS_LOCATION = os.getenv(
    'SOS_LOCATION', 'http://localhost:8080/observations/sos'
)
SOS_TRANSACTIONAL_AUTHORIZATION_TOKEN = os.getenv(
    'SOS_TRANSACTIONAL_AUTHORIZATION_TOKEN',
    'changeme'
)
SOS_APP = True
SOS_PUBLIC_ACCESS = True  # to read data
SOS_PUBLIC_URL = SITEURL + 'observations/sos'
SOS_PRIVATE_URL = SOS_LOCATION

SOS_SERVER = {
    'default': {
        'LOCATION': SOS_PRIVATE_URL,
        'PUBLIC_LOCATION': SOS_PUBLIC_URL,
        'KVP_LOCATION': SOS_PRIVATE_URL + '/kvp',
        'POX_LOCATION': SOS_PRIVATE_URL + '/pox',
        'VERSION': '2.0.0',
        'TRANSACTIONAL_AUTHORIZATION_TOKEN': SOS_TRANSACTIONAL_AUTHORIZATION_TOKEN,
        'USER': None,
        'PASSWORD': None,
    }
}

SOS_PUBLIC_CAPABILITIES_URL = SOS_PUBLIC_URL + \
    '/kvp?service=SOS&request=GetCapabilities'

THEME_ACCOUNT_CONTACT_EMAIL = 'help.skritmare@irea.cnr.it'
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True
REGISTRATION_OPEN = False
PROXY_ALLOWED_HOSTS = ("*",)

# Set default analytical
PIWIK_DOMAIN_PATH = 'monitor.get-it.it/piwik'

# MIDDLEWARE_CLASSES += ('geosk.middleware.LoginRequiredMiddleware',)

#LOGIN_EXEMPT_URLS = [
#    'gdpr/'
#]

# Add additional paths (as regular expressions) that don't require
# authentication.
# - authorized exempt urls needed for oauth when GeoNode is set to lockdown
AUTH_EXEMPT_URLS = (
    #r'^/?$',
    '/o/*',
    '/gs/*',
    '/account/*',
    '/static/*',
    '/api/o/*',
    '/api/roles',
    '/api/adminRole',
    '/api/users',
    '/api/layers',
    '/monitoring',
    '/gdpr/*'
)

# -- START Client Hooksets Setup

# GeoNode javascript client configuration

# default map projection
# Note: If set to EPSG:4326, then only EPSG:4326 basemaps will work.
DEFAULT_MAP_CRS = os.environ.get('DEFAULT_MAP_CRS', "EPSG:3857")

DEFAULT_LAYER_FORMAT = os.environ.get('DEFAULT_LAYER_FORMAT', "image/png8")

# Where should newly created maps be focused?
DEFAULT_MAP_CENTER = (os.environ.get('DEFAULT_MAP_CENTER_X', 0),
                      os.environ.get('DEFAULT_MAP_CENTER_Y', 0))

# How tightly zoomed should newly created maps be?
# 0 = entire world;
# maximum zoom is between 12 and 15 (for Google Maps, coverage varies by area)
DEFAULT_MAP_ZOOM = int(os.environ.get('DEFAULT_MAP_ZOOM', 3))

MAPBOX_ACCESS_TOKEN = os.environ.get('MAPBOX_ACCESS_TOKEN', None)
BING_API_KEY = os.environ.get('BING_API_KEY', None)
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', None)

GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY = os.getenv(
    'GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY', 'mapstore')

MAP_BASELAYERS = [{}]

"""
To enable the GeoExt based Client:
1. pip install django-geoexplorer==4.0.42
2. add 'geoexplorer' to INSTALLED_APPS
3. enable those:
"""
# GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY = 'geoext'  # DEPRECATED use HOOKSET instead
if GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY == 'geoext':
    GEONODE_CLIENT_HOOKSET = os.getenv(
        'GEONODE_CLIENT_HOOKSET', 'geonode.client.hooksets.GeoExtHookSet')

    if 'geoexplorer' not in INSTALLED_APPS:
        INSTALLED_APPS += ('geoexplorer', )

    MAP_BASELAYERS += [{
            "source": {"ptype": "gxp_olsource"},
            "type": "OpenLayers.Layer",
            "args": ["No background"],
            "name": "background",
            "visibility": False,
            "fixed": True,
            "group": "background"
        },
        {
            "source": {"ptype": "gxp_osmsource"},
            "type": "OpenLayers.Layer.OSM",
            "name": "mapnik",
            "visibility": True,
            "fixed": True,
            "group": "background"
        }]

    # MAP_BASELAYERS += [
    # {
    #     "source": {"ptype": "gxp_olsource"},
    #     "type": "OpenLayers.Layer.XYZ",
    #     "title": "TEST TILE",
    #     "args": ["TEST_TILE", "http://test_tiles/tiles/${z}/${x}/${y}.png"],
    #     "name": "background",
    #     "attribution": "&copy; TEST TILE",
    #     "visibility": False,
    #     "fixed": True,
    #     "group":"background"
    # }]

    if BING_API_KEY:
        BASEMAP = {
            'source': {
                'ptype': 'gxp_bingsource',
                'apiKey': BING_API_KEY
            },
            'name': 'AerialWithLabels',
            'fixed': True,
            'visibility': True,
            'group': 'background'
        }
        MAP_BASELAYERS.append(BASEMAP)

    if GOOGLE_API_KEY:
        BASEMAP = {
            'source': {
                'ptype': 'gxp_googlesource',
                'apiKey': GOOGLE_API_KEY
            },
            'name': 'SATELLITE',
            'fixed': True,
            'visibility': True,
            'group': 'background'
        }
        MAP_BASELAYERS.append(BASEMAP)

    if USE_GEOSERVER:
        LOCAL_GEOSERVER = {
            "source": {
                "ptype": "gxp_wmscsource",
                "url": OGC_SERVER['default']['PUBLIC_LOCATION'] + "wms",
                "restUrl": "/gs/rest"
            }
        }
        baselayers = MAP_BASELAYERS
        MAP_BASELAYERS = [LOCAL_GEOSERVER]
        MAP_BASELAYERS.extend(baselayers)

"""
To enable the REACT based Client:
1. pip install pip install django-geonode-client==1.0.9
2. enable those:
"""

if GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY == 'react':
    GEONODE_CLIENT_HOOKSET = os.getenv(
        'GEONODE_CLIENT_HOOKSET', 'geonode.client.hooksets.ReactHookSet')
    if 'geonode-client' not in INSTALLED_APPS:
        INSTALLED_APPS += ('geonode-client', )

"""
To enable the Leaflet based Client:
1. enable those:
"""
if GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY == 'leaflet':
    GEONODE_CLIENT_HOOKSET = os.getenv(
        'GEONODE_CLIENT_HOOKSET', 'geonode.client.hooksets.LeafletHookSet')

    CORS_ORIGIN_WHITELIST = (
        HOSTNAME
    )

LEAFLET_CONFIG = {
    'TILES': [
        # Find tiles at:
        # http://leaflet-extras.github.io/leaflet-providers/preview/

        # Stamen toner lite.
        ('Watercolor',
            'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, \
            <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> \
            &mdash; Map data &copy; \
            <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, \
            <a href="http://creativecommons.org/licenses/by-sa/2.0/"> \
            CC-BY-SA</a>'),
        ('Toner Lite',
            'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png',
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, \
            <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> \
            &mdash; Map data &copy; \
            <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, \
            <a href="http://creativecommons.org/licenses/by-sa/2.0/"> \
            CC-BY-SA</a>'),
    ],
    'PLUGINS': {
        'esri-leaflet': {
            'js': 'lib/js/leaflet.js',
            'auto-include': True,
        },
        'leaflet-fullscreen': {
            'css': 'lib/css/leaflet.fullscreen.css',
            'js': 'lib/js/Leaflet.fullscreen.min.js',
            'auto-include': True,
        },
        'leaflet-opacity': {
            'css': 'lib/css/L.Control.Opacity.css',
            'js': 'lib/js/L.Control.Opacity.js',
            'auto-include': True,
        },
        'leaflet-navbar': {
            'css': 'lib/css/Leaflet.NavBar.css',
            'js': 'lib/js/index.js',
            'auto-include': True,
        },
        'leaflet-measure': {
            'css': 'lib/css/leaflet-measure.css',
            'js': 'lib/js/leaflet-measure.js',
            'auto-include': True,
        },
    },
    'SRID': 3857,
    'RESET_VIEW': False
}

if not DEBUG_STATIC:
    # if not DEBUG_STATIC, use minified css and js
    LEAFLET_CONFIG['PLUGINS'] = {
        'leaflet-plugins': {
            'js': 'lib/js/leaflet-plugins.min.js',
            'css': 'lib/css/leaflet-plugins.min.css',
            'auto-include': True,
        }
    }

"""
To enable the MapStore2 REACT based Client:
1. pip install pip install django-geonode-mapstore-client==1.0
2. enable those:
"""
if GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY == 'mapstore':
    GEONODE_CLIENT_HOOKSET = os.getenv(
        'GEONODE_CLIENT_HOOKSET', 'geonode_mapstore_client.hooksets.MapStoreHookSet')

    if 'geonode_mapstore_client' not in INSTALLED_APPS:
        INSTALLED_APPS += (
            'mapstore2_adapter',
            'geonode_mapstore_client',)

    # This must be set to True in case you run the client in DEBUG mode with `npm run start`
    MAPSTORE_DEBUG = False

    def get_geonode_catalogue_service():
        if PYCSW:
            pycsw_config = PYCSW["CONFIGURATION"]
            if pycsw_config:
                    pycsw_catalogue = {
                        ("%s" % pycsw_config['metadata:main']['identification_title']): {
                            "url": CATALOGUE['default']['URL'],
                            "type": "csw",
                            "title": pycsw_config['metadata:main']['identification_title'],
                            "autoload": True
                        }
                    }
                    return pycsw_catalogue
        return None

    GEONODE_CATALOGUE_SERVICE = get_geonode_catalogue_service()

    MAPSTORE_CATALOGUE_SERVICES = {
        "Demo WMS Service": {
            "url": "https://demo.geo-solutions.it/geoserver/wms",
            "type": "wms",
            "title": "Demo WMS Service",
            "autoload": False
        },
        "Demo WMTS Service": {
            "url": "https://demo.geo-solutions.it/geoserver/gwc/service/wmts",
            "type": "wmts",
            "title": "Demo WMTS Service",
            "autoload": False
        }
    }

    MAPSTORE_CATALOGUE_SELECTED_SERVICE = "Demo WMS Service"

    if GEONODE_CATALOGUE_SERVICE:
        MAPSTORE_CATALOGUE_SERVICES[GEONODE_CATALOGUE_SERVICE.keys(
        )[0]] = GEONODE_CATALOGUE_SERVICE[GEONODE_CATALOGUE_SERVICE.keys()[0]]
        MAPSTORE_CATALOGUE_SELECTED_SERVICE = GEONODE_CATALOGUE_SERVICE.keys()[
            0]

    DEFAULT_MS2_BACKGROUNDS = [
        {
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "source": "osm",
            "group": "background",
            "visibility": True
        },
        {
            "type": "tileprovider",
            "title": "OpenTopoMap",
            "provider": "OpenTopoMap",
            "name": "OpenTopoMap",
            "source": "OpenTopoMap",
            "group": "background",
            "visibility": False
        },
        {
            "type": "tileprovider",
            "title": "Stamen Watercolor",
            "provider": "Stamen.Watercolor",
            "name": "Stamen.Watercolor",
            "source": "Stamen",
            "group": "background",
            "thumbURL": "https://stamen-tiles-c.a.ssl.fastly.net/watercolor/0/0/0.jpg",
            "visibility": False
        },
        {
            "type": "tileprovider",
            "title": "Stamen Terrain",
            "provider": "Stamen.Terrain",
            "name": "Stamen.Terrain",
            "source": "Stamen",
            "group": "background",
            "thumbURL": "https://stamen-tiles-d.a.ssl.fastly.net/terrain/0/0/0.png",
            "visibility": False
        },
        {
            "type": "tileprovider",
            "title": "Stamen Toner",
            "provider": "Stamen.Toner",
            "name": "Stamen.Toner",
            "source": "Stamen",
            "group": "background",
            "thumbURL": "https://stamen-tiles-d.a.ssl.fastly.net/toner/0/0/0.png",
            "visibility": False
        }
    ]

    if BING_API_KEY:
        BING_BASEMAPS = [
            {
                "type": "bing",
                "title": "Bing Aerial",
                "name": "AerialWithLabels",
                "source": "bing",
                "group": "background",
                "apiKey": "{{apiKey}}",
                "visibility": True
            },
            {
                "type": "bing",
                "title": "Bing RoadOnDemand",
                "name": "RoadOnDemand",
                "source": "bing",
                "group": "background",
                "apiKey": "{{apiKey}}",
                "thumbURL": "%sstatic/mapstorestyle/img/bing_road_on_demand.png" % SITEURL,
                "visibility": False
            },
            {
                "type": "bing",
                "title": "Bing AerialWithLabelsOnDemand",
                "name": "AerialWithLabelsOnDemand",
                "source": "bing",
                "group": "background",
                "apiKey": "{{apiKey}}",
                "thumbURL": "%sstatic/mapstorestyle/img/bing_aerial_w_labels.png" % SITEURL,
                "visibility": False
            },
            {
                "type": "bing",
                "title": "Bing CanvasDark",
                "name": "CanvasDark",
                "source": "bing",
                "group": "background",
                "apiKey": "{{apiKey}}",
                "thumbURL": "%sstatic/mapstorestyle/img/bing_canvas_dark.png" % SITEURL,
                "visibility": False
            },
            {
                "type": "osm",
                "title": "Open Street Map",
                "name": "mapnik",
                "source": "osm",
                "group": "background",
                "visibility": False
            }
        ]
        MAPSTORE_BASELAYERS = BING_BASEMAPS
    else:
        MAPSTORE_BASELAYERS = DEFAULT_MS2_BACKGROUNDS

    if MAPBOX_ACCESS_TOKEN:
        MAPBOX_BASEMAPS = {
            "type": "tileprovider",
            "title": "MapBox streets-v11",
            "provider": "MapBoxStyle",
            "name": "MapBox streets-v11",
            "accessToken": "%s" % MAPBOX_ACCESS_TOKEN,
            "source": "streets-v11",
            "thumbURL": "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/6/33/23?access_token=%s" % MAPBOX_ACCESS_TOKEN,
            "group": "background",
            "visibility": False if BING_API_KEY else True
        }
        MAPSTORE_BASELAYERS = MAPSTORE_BASELAYERS + [MAPBOX_BASEMAPS, ]

    MAPSTORE_BASELAYERS += [
        {
            "type": "wms",
            "title": "Sentinel-2 cloudless - https://s2maps.eu",
            "format": "image/jpeg",
            "id": "s2cloudless",
            "name": "s2cloudless:s2cloudless",
            "url": "https://maps.geo-solutions.it/geoserver/wms",
            "group": "background",
            "thumbURL": "%sstatic/mapstorestyle/img/s2cloudless-s2cloudless.png" % SITEURL,
            "visibility": False
        },
        {
            "source": "ol",
            "group": "background",
            "id": "none",
            "name": "empty",
            "title": "Empty Background",
            "type": "empty",
            "visibility": False,
            "args": ["Empty Background", {"visibility": False}]
        }
    ]

# -- END Client Hooksets Setup
