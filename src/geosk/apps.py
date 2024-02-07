import os
from django.apps import AppConfig as BaseAppConfig
from django.conf.urls import include, url

from geonode.api.urls import api as geonode_api
from geonode.api.resourcebase_api import LayerResource

class SoSLayerResource(LayerResource):
    def format_objects(self, objects):
        a = 1
        return super().format_objects(objects)

    def _dehydrate_links(self, bundle, link_types=None):
        a = 1
        super()._dehydrate_links( bundle, link_types)

#geonode_api.unregister("layers")
geonode_api.register(SoSLayerResource())

def run_setup_hooks(*args, **kwargs):
    from django.conf import settings
    from .celeryapp import app as celeryapp

    LOCAL_ROOT = os.path.abspath(os.path.dirname(__file__))
    settings.TEMPLATES[0]["DIRS"].insert(0, os.path.join(LOCAL_ROOT, "templates"))

    if celeryapp not in settings.INSTALLED_APPS:
        settings.INSTALLED_APPS += (celeryapp,)

    urlpatterns += [
        url(r"^", include("geonode_sos.api.urls")),
    ]
    url_already_injected = any(
        [
            'geonode_sos.sensors.urls' in x.urlconf_name.__name__
            for x in urlpatterns
            if hasattr(x, 'urlconf_name') and not isinstance(x.urlconf_name, list)
        ]
    )

    if not url_already_injected:
        urlpatterns.insert(
            0, url(r"^layers/", include("geonode_sos.sensors.layer_urls")),
        )
        urlpatterns.insert(
            1, url(r"^services/", include("geonode_sos.sensors.service_urls")),
        )

class AppConfig(BaseAppConfig):

    name = "geosk"
    label = "geosk"

    def ready(self):
        super(AppConfig, self).ready()
        run_setup_hooks()
