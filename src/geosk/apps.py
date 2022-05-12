import os
from django.apps import AppConfig as BaseAppConfig


def run_setup_hooks(*args, **kwargs):
    from django.conf import settings
    from .celeryapp import app as celeryapp

    LOCAL_ROOT = os.path.abspath(os.path.dirname(__file__))
    settings.TEMPLATES[0]["DIRS"].insert(0, os.path.join(LOCAL_ROOT, "templates"))

    if celeryapp not in settings.INSTALLED_APPS:
        settings.INSTALLED_APPS += (celeryapp,)


class AppConfig(BaseAppConfig):

    name = "geosk"
    label = "geosk"

    def ready(self):
        super().ready()
        run_setup_hooks()
