from django.apps import AppConfig as BaseAppConfig


class AppConfig(BaseAppConfig):
    name = 'geosk.mdtools'
    label = 'geosk_mdtools'

default_app_config = 'geosk.mdtools.AppConfig'
