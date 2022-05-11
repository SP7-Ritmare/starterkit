from django.apps import AppConfig as BaseAppConfig


class AppConfig(BaseAppConfig):
    name = 'geosk.geonode_sos'
    label = 'geosk_geonode_sos'


default_app_config = 'geosk.geonode_sos.AppConfig'
