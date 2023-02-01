from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.utils.translation import gettext as _


from geonode.urls import urlpatterns
from geonode.api.urls import api as geonode_api


from geosk.osk.proxy import (
    ObservationsProxy,
    SparqlProxy,
    FusekiProxy,
    VocabsProxy,
    NercProxy,
    MetadataProxy,
    AdamassoftProxy)
from geosk.mdtools import api, views as mdtools_views
from geosk.api import SoSLayerResource

# Register custom API v1 for layers to include additional fields for sensors
geonode_api.register(SoSLayerResource())
urlpatterns.insert(
    0, url(r'', include(geonode_api.urls)),
)

url_already_injected = any(
    [
        'geonode_sos.sensors.urls' in x.urlconf_name.__name__
        for x in urlpatterns
        if hasattr(x, 'urlconf_name') and not isinstance(x.urlconf_name, list)
    ]
)

if not url_already_injected:
    urlpatterns.insert(
        0, url(r"^layers/", include("geosk.geonode_sos.sensors.layer_urls")),
    )
    urlpatterns.insert(
        1, url(r"^services/", include("geosk.geonode_sos.sensors.service_urls")),
    )
    urlpatterns.insert(
        2, url(r"^api/v2/", include("geosk.geonode_sos.api.urls")),
    )

geoskurlpatterns = [
    # whoami
    url(r'^whoami$',
        mdtools_views.whoami,
        name='whoami'),

    # override / extend GeoNode's URLS
    # url(r'^$', 'geonode.views.index', {'template': 'site_index.html'}, name='home'),
    url(r'^layers/(?P<layername>[^/]*)/metadata_advanced$',
        api.rndteditor,
        name="layer_metadata_advanced"),
    url(r'^layers/(?P<layername>[^/]*)/ediml$',
        api.ediml,
        name="layer_ediml"),
    url(r'^layers/(?P<layername>[^/]*)/rndt$',
        api.rndt,
        name="layer_rndt"),
    url(r'^layers/(?P<layername>[^/]*)/postMetadata$',
        api.rndtproxy,
        name='rndtproxy'),
    # RDF extension
    # url(r'^layers/(?P<layername>[^/]+)/rdf$', 'geosk.mdtools.views_rdf.rdf_layer_detail', kwargs={'rdf_format':'xml'}, name='mdtools_rdf_metadata'),
    # url(r'^layers/(?P<layername>[^/]+)/n3$', 'geosk.mdtools.views_rdf.rdf_layer_detail', kwargs={'rdf_format':'n3'}, name='mdtools_n3_metadata'),

    ###
    # additional pages within GeoNode
    ###
    url(
        r'^about_services/$',
        TemplateView.as_view(template_name='about_services.html'),
        name='about_services'
    ),
    url(
        r'^about_upload_layers/$',
        TemplateView.as_view(template_name='about_upload_layers.html'),
        name='about_upload_layers'
    ),
    url(
        r'^sk_license/$',
        TemplateView.as_view(template_name='sk_license.html'),
        name='sk_license'
    ),
    # credit
    url(r'^sk_credits/$',
        TemplateView.as_view(template_name='sk_credits.html'),
        name='sk_credits'
        ),

    ###
    # additional services within GeoNode
    ###
    # Sensors
    # observations
    url(r'^observations/(?P<url>.*)$',
        ObservationsProxy.as_view(),
        name='observations'
        ),
    url(r'^sparql/(?P<url>.*)$',
        SparqlProxy.as_view(),
        name='sparql'
        ),
    url(r'^fuseki/(?P<url>.*)$',
        FusekiProxy.as_view(),
        name='fuseki'
        ),
    url(r'^vocabs/(?P<url>.*)$',
        VocabsProxy.as_view(),
        name='vocabs'
        ),
    url(r'^nerc/(?P<url>.*)$',
        NercProxy.as_view(),
        name='nerc'
        ),
    url(r'^metadata/(?P<url>.*)$',
        MetadataProxy.as_view(),
        name='metadata'
        ),
    url(r'^adamassoft_proxy/(?P<url>.*)$',
        AdamassoftProxy.as_view(),
        name='adamassoft_proxy'
        ),

    # mdtools views
    url(r'^mdtools/',
        include('geosk.mdtools.urls')
        ),

    # skregistration views
    url(r'^skregistration/',
        include('geosk.skregistration.urls')
        ),

    # SOS Plugin Iframe view
    url(r'^sosclient/',
        include('geosk.sos_client.urls')
        ),

    url(r'^sensors/',
        include('geosk.osk.urls')
        ),
    # Demo data
    # Demo
    url(r'^demo/',
        include('geosk.demo.urls')
        ),
]

urlpatterns += geoskurlpatterns

urlpatterns = [
    url(
        r'^/?$',
        TemplateView.as_view(template_name='site_index.html'), name='home'
    ),
] + urlpatterns
