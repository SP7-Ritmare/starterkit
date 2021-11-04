from django.apps import AppConfig as BaseAppConfig


class AppConfig(BaseAppConfig):
    name = 'geosk.geoskbase'
    label = 'geosk_geoskbase'


default_app_config = 'geosk.geoskbase.AppConfig'
