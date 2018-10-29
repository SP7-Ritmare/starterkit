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

PROXY_ALLOWED_HOSTS += ('nominatim.openstreetmap.org',)

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
MEDIA_ROOT = os.path.join(LOCAL_ROOT, "uploaded")

# Absolute path to the directory that holds static files like app media.
# Example: "/home/media/media.lawrence.com/apps/"
# STATIC_ROOT = os.path.join(LOCAL_ROOT, "static_root")

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
    #  'geosk.demo',
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
    'taggit_templatetags',
) + INSTALLED_APPS

# INSTALLED_APPS = (
#     # GeoSK
#     # 'geosk.rndt',
#     'geosk.demo',
#     'geosk.osk',
#     'geosk.mdtools',
#     'geosk.geoskbase',
#     'geosk.search',
#     'geosk.patches',
#     'geosk.skregistration',
#     'overextends', # https://github.com/stephenmcd/django-overextends
#     'rosetta',
#     'grappelli.dashboard',
#     'grappelli',

#     # Apps bundled with Django
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.sites',
#     'django.contrib.admin',
#     'django.contrib.sitemaps',
#     'django.contrib.staticfiles',
#     'django.contrib.messages',
#     'django.contrib.humanize',

#     # Third party apps
#     'analytical',

#     # Utility
#     'pagination',
#     'taggit',
#     'taggit_templatetags',
#     'south',
#     'friendlytagloader',
#     'geoexplorer',
#     'django_extensions',

#     # Theme
#     "pinax_theme_bootstrap_account",
#     "pinax_theme_bootstrap",
#     'django_forms_bootstrap',

#     # Social
#     'account',
#     'avatar',
#     'dialogos',
#     'agon_ratings',
#     'notification',
#     'announcements',
#     'actstream',
#     'user_messages',

#     # GeoNode internal apps
#     'geonode.people',
#     'geonode.base',
#     'geonode.layers',
#     'geonode.upload',
#     'geonode.maps',
#     'geonode.proxy',
#     'geonode.security',
#    # 'geonode.search',
#     'geonode.social',
#     'geonode.catalogue',
#     'geonode.documents',

# )

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
    'django.template.loaders.filesystem.Loader', 'django.template.loaders.app_directories.Loader']
# loaders.insert(0, 'apptemplates.Loader')
TEMPLATES[0]['OPTIONS']['loaders'] = loaders
TEMPLATES[0].pop('APP_DIRS', None)

CLIENT_RESULTS_LIMIT = 20
API_LIMIT_PER_PAGE = 1000
FREETEXT_KEYWORDS_READONLY = False
RESOURCE_PUBLISHING = False
ADMIN_MODERATE_UPLOADS = False
GROUP_PRIVATE_RESOURCES = False
GROUP_MANDATORY_RESOURCES = True
MODIFY_TOPICCATEGORY = True
USER_MESSAGES_ALLOW_MULTIPLE_RECIPIENTS = True
DISPLAY_WMS_LINKS = True

# prevent signing up by default
ACCOUNT_OPEN_SIGNUP = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_EMAIL_CONFIRMATION_EMAIL = True
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_APPROVAL_REQUIRED = True

SOCIALACCOUNT_ADAPTER = 'geonode.people.adapters.SocialAccountAdapter'

SOCIALACCOUNT_AUTO_SIGNUP = False

# Uncomment this to enable Linkedin and Facebook login
# INSTALLED_APPS += (
#     'allauth.socialaccount.providers.linkedin_oauth2',
#     'allauth.socialaccount.providers.facebook',
# )

SOCIALACCOUNT_PROVIDERS = {
    'linkedin_oauth2': {
        'SCOPE': [
            'r_emailaddress',
            'r_basicprofile',
        ],
        'PROFILE_FIELDS': [
            'emailAddress',
            'firstName',
            'headline',
            'id',
            'industry',
            'lastName',
            'pictureUrl',
            'positions',
            'publicProfileUrl',
            'location',
            'specialties',
            'summary',
        ]
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': [
            'email',
            'public_profile',
        ],
        'FIELDS': [
            'id',
            'email',
            'name',
            'first_name',
            'last_name',
            'verified',
            'locale',
            'timezone',
            'link',
            'gender',
        ]
    },
}

SOCIALACCOUNT_PROFILE_EXTRACTORS = {
    "facebook": "geonode.people.profileextractors.FacebookExtractor",
    "linkedin_oauth2": "geonode.people.profileextractors.LinkedInExtractor",
}

if os.getenv('DOCKER_ENV'):

    # Set geodatabase to datastore for OGC server
    if os.getenv('DEFAULT_BACKEND_DATASTORE'):
        GEODATABASE_URL = os.getenv('GEODATABASE_URL',
                                    'postgis://\
    geonode_data:geonode_data@localhost:5432/geonode_data')
        DATABASES[os.getenv('DEFAULT_BACKEND_DATASTORE')] = dj_database_url.parse(
            GEODATABASE_URL, conn_max_age=600
        )

    # Override OGC server config if docker is production
    OGC_SERVER = {
        'default': {
            'BACKEND': 'geonode.geoserver',
            'LOCATION': GEOSERVER_LOCATION,
            'LOGIN_ENDPOINT': 'j_spring_oauth2_geonode_login',
            'LOGOUT_ENDPOINT': 'j_spring_oauth2_geonode_logout',
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
            'GEOGIG_ENABLED': False,
            'WMST_ENABLED': False,
            'BACKEND_WRITE_ENABLED': True,
            'WPS_ENABLED': False,
            'LOG_FILE': '%s/geoserver/data/logs/geoserver.log'
            % os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir)),
            # Set to name of database in DATABASES dictionary to enable
            # 'datastore',
            'DATASTORE': os.getenv('DEFAULT_BACKEND_DATASTORE', ''),
            'PG_GEOGIG': False,
            # 'CACHE': ".cache"  # local cache file to for HTTP requests
            'TIMEOUT': 10  # number of seconds to allow for HTTP requests
        }
    }

# MAPs and Backgrounds

# Default preview library
LAYER_PREVIEW_LIBRARY = 'geoext'

# LAYER_PREVIEW_LIBRARY = 'leaflet'
LEAFLET_CONFIG = {
    'TILES': [
        # Find tiles at:
        # http://leaflet-extras.github.io/leaflet-providers/preview/

        # Map Quest
        ('Map Quest',
         'http://otile4.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
         'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> '
         '&mdash; Map data &copy; '
         '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'),
        # Stamen toner lite.
        # ('Watercolor',
        #  'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
        #  'Map tiles by <a href="http://stamen.com">Stamen Design</a>, \
        #  <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; \
        #  <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, \
        #  <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'),
        # ('Toner Lite',
        #  'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png',
        #  'Map tiles by <a href="http://stamen.com">Stamen Design</a>, \
        #  <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; \
        #  <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, \
        #  <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'),
    ],
    'PLUGINS': {
        'esri-leaflet': {
            'js': 'lib/js/esri-leaflet.js',
            'auto-include': True,
        },
        'leaflet-fullscreen': {
            'css': 'lib/css/leaflet.fullscreen.css',
            'js': 'lib/js/Leaflet.fullscreen.min.js',
            'auto-include': True,
        },
    },
    'SRID': 3857,
    'RESET_VIEW': False
}


# default map projection
# Note: If set to EPSG:4326, then only EPSG:4326 basemaps will work.
DEFAULT_MAP_CRS = "EPSG:3857"

# Where should newly created maps be focused?
DEFAULT_MAP_CENTER = (0, 0)

# How tightly zoomed should newly created maps be?
# 0 = entire world;
# maximum zoom is between 12 and 15 (for Google Maps, coverage varies by area)
DEFAULT_MAP_ZOOM = 0

ALT_OSM_BASEMAPS = os.environ.get('ALT_OSM_BASEMAPS', False)
CARTODB_BASEMAPS = os.environ.get('CARTODB_BASEMAPS', False)
STAMEN_BASEMAPS = os.environ.get('STAMEN_BASEMAPS', False)
THUNDERFOREST_BASEMAPS = os.environ.get('THUNDERFOREST_BASEMAPS', False)
MAPBOX_ACCESS_TOKEN = os.environ.get('MAPBOX_ACCESS_TOKEN', '')
BING_API_KEY = os.environ.get('BING_API_KEY', None)

MAP_BASELAYERS = [{
    "source": {"ptype": "gxp_olsource"},
    "type": "OpenLayers.Layer",
    "args": ["No background"],
    "name": "background",
    "visibility": False,
    "fixed": True,
    "group":"background"
}, {
    "source": {"ptype": "gxp_osmsource"},
    "type": "OpenLayers.Layer.OSM",
    "title": "OpenStreetMap",
    "name": "mapnik",
    "attribution": "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
    "visibility": True,
    "wrapDateLine": True,
    "fixed": True,
    "group": "background"
}]

'''
{
    "source": {"ptype": "gxp_olsource"},
    "type": "OpenLayers.Layer.XYZ",
    "title": "UNESCO",
    "args": ["UNESCO", "http://en.unesco.org/tiles/${z}/${x}/${y}.png"],
    "wrapDateLine": True,
    "name": "background",
    "attribution": "&copy; UNESCO",
    "visibility": False,
    "fixed": True,
    "group": "background"
}, {
    "source": {"ptype": "gxp_olsource"},
    "type": "OpenLayers.Layer.XYZ",
    "title": "UNESCO GEODATA",
    "args": ["UNESCO GEODATA", "http://en.unesco.org/tiles/geodata/${z}/${x}/${y}.png"],
    "name": "background",
    "attribution": "&copy; UNESCO",
    "visibility": False,
    "wrapDateLine": True,
    "fixed": True,
    "group": "background"
}, {
    "source": {"ptype": "gxp_olsource"},
    "type": "OpenLayers.Layer.XYZ",
    "title": "Humanitarian OpenStreetMap",
    "args": ["Humanitarian OpenStreetMap", "http://a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png"],
    "name": "background",
    "attribution": "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, Tiles courtesy of <a href='http://hot.openstreetmap.org/' target='_blank'>Humanitarian OpenStreetMap Team</a>",
    "visibility": False,
    "wrapDateLine": True,
    "fixed": True,
    "group": "background"
    # }, {
    #     "source": {"ptype": "gxp_olsource"},
    #     "type": "OpenLayers.Layer.XYZ",
    #     "title": "MapBox Satellite Streets",
    #     "args": ["MapBox Satellite Streets", "http://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/${z}/${x}/${y}?access_token="+MAPBOX_ACCESS_TOKEN],
    #     "name": "background",
    #     "attribution": "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <a href='https://www.mapbox.com/feedback/' target='_blank'>Improve this map</a>",
    #     "visibility": False,
    #     "wrapDateLine": True,
    #     "fixed": True,
    #     "group":"background"
    # }, {
    #     "source": {"ptype": "gxp_olsource"},
    #     "type": "OpenLayers.Layer.XYZ",
    #     "title": "MapBox Streets",
    #     "args": ["MapBox Streets", "http://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/${z}/${x}/${y}?access_token="+MAPBOX_ACCESS_TOKEN],
    #     "name": "background",
    #     "attribution": "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <a href='https://www.mapbox.com/feedback/' target='_blank'>Improve this map</a>",
    #     "visibility": False,
    #     "wrapDateLine": True,
    #     "fixed": True,
    #     "group":"background"
},
'''

if BING_API_KEY:
    BASEMAP = {
        'source': {
            'ptype': 'gxp_bingsource',
            'apiKey': BING_API_KEY
        },
        'name': 'AerialWithLabels',
        'fixed': True,
        'visibility': False,
        'group': 'background'
    }
    MAP_BASELAYERS.append(BASEMAP)

if 'geonode.geoserver' in INSTALLED_APPS:
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

# notification settings
NOTIFICATION_ENABLED = True

# notifications backends
_EMAIL_BACKEND = "pinax.notifications.backends.email.EmailBackend"
PINAX_NOTIFICATIONS_BACKENDS = [
    ("email", _EMAIL_BACKEND),
]

# Queue non-blocking notifications.
PINAX_NOTIFICATIONS_QUEUE_ALL = False
PINAX_NOTIFICATIONS_LOCK_WAIT_TIMEOUT = -1

# pinax.notifications
# or notification
NOTIFICATIONS_MODULE = 'pinax.notifications'

CORS_ORIGIN_ALLOW_ALL = True

MONITORING_ENABLED = True
# add following lines to your local settings to enable monitoring
if MONITORING_ENABLED:
    INSTALLED_APPS += ('geonode.contrib.monitoring',)
    MIDDLEWARE_CLASSES += ('geonode.contrib.monitoring.middleware.MonitoringMiddleware',)
    MONITORING_CONFIG = None
    if os.getenv('DOCKER_ENV'):
        MONITORING_HOST_NAME = 'geonode'
    else:
        MONITORING_HOST_NAME = 'localhost'
    MONITORING_SERVICE_NAME = 'local-geonode'

INSTALLED_APPS += ('geonode.contrib.ows_api',)

GEOIP_PATH = os.path.join(os.path.dirname(__file__), '..', 'GeoLiteCity.dat')

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
        'null': {
            'level': 'INFO',
            'class': 'django.utils.log.NullHandler',
        },
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
        'TRANSACTIONAL_AUTHORIZATION_TOKEN\
': SOS_TRANSACTIONAL_AUTHORIZATION_TOKEN,
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
