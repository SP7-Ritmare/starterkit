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

PROXY_ALLOWED_HOSTS += ('spatialreference.org', 'nominatim.openstreetmap.org',)

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

# prevent signing up by default
ACCOUNT_OPEN_SIGNUP = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_EMAIL_CONFIRMATION_EMAIL = True
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_APPROVAL_REQUIRED = True

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

GEOIP_PATH = os.path.join(os.path.dirname(__file__), '..')

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
    '/gdpr/*'
)

MAP_BASELAYERS = [{
        "source": {"ptype": "gxp_olsource"},
        "type": "OpenLayers.Layer",
        "args": ["No background"],
        "name": "background",
        "visibility": False,
        "fixed": True,
        "group":"background"
    },
    {
        "source": {"ptype": "gxp_osmsource"},
        "type": "OpenLayers.Layer.OSM",
        "name": "mapnik",
        "visibility": True,
        "fixed": True,
        "group": "background"
    }]

if GEONODE_CLIENT_LAYER_PREVIEW_LIBRARY == 'geoext':
    GEONODE_CLIENT_HOOKSET = os.getenv('GEONODE_CLIENT_HOOKSET', 'geonode.client.hooksets.GeoExtHookSet')

    if 'geoexplorer' not in INSTALLED_APPS:
        INSTALLED_APPS += ('geoexplorer', )

    if GOOGLE_API_KEY:
        BASEMAP = {
            'source': {
                 'ptype': 'gxp_googlesource',
                 'apiKey': GOOGLE_API_KEY
            },
            'name': 'SATELLITE',
            'fixed': True,
            'visibility': False,
            'group': 'background'
        }
        MAP_BASELAYERS.append(BASEMAP)

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
