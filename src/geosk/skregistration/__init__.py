from django.apps import AppConfig as BaseAppConfig


class AppConfig(BaseAppConfig):
    name = 'geosk.skregistration'
    label = 'geosk_skregistration'


default_app_config = 'geosk.skregistration.AppConfig'
