from django.apps import AppConfig as BaseAppConfig


class AppConfig(BaseAppConfig):
    name = 'geosk.osk'
    label = 'geosk_osk'


default_app_config = 'geosk.osk.AppConfig'
