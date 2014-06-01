from django.conf import settings
from django.conf.urls import patterns, url
from django.views.generic import TemplateView

from geonode.urls import *

urlpatterns = patterns('',

    # override / extend GeoNode's URLS
    url(r'^$', 'geonode.views.index', {'template': 'site_index.html'}, name='home'),
    url(r'^layers/(?P<layername>[^/]*)/metadata$',
        'geosk.mdtools.api.rndteditor',
        name="layer_metadata"),
    url(r'^layers/(?P<layername>[^/]*)/postMetadata$',
        'geosk.mdtools.api.rndtproxy', name='rndtproxy'),
    # RDF extension
    # url(r'^layers/(?P<layername>[^/]+)/rdf$', 'geosk.mdtools.views_rdf.rdf_layer_detail', kwargs={'rdf_format':'xml'}, name='mdtools_rdf_metadata'),
    # url(r'^layers/(?P<layername>[^/]+)/n3$', 'geosk.mdtools.views_rdf.rdf_layer_detail', kwargs={'rdf_format':'n3'}, name='mdtools_n3_metadata'),


    # additional pages
    url(r'^about_services/$', TemplateView.as_view(template_name='about_services.html'), name='about_services'),

    # mdtools views
    (r'^mdtools/', include('geosk.mdtools.urls')),

    # skregistration views
    (r'^skregistration/', include('geosk.skregistration.urls')),

    # OSK views
    (r'^osk/', include('geosk.osk.urls')),

    (r'^grappelli/', include('grappelli.urls')), # grappelli URLS                       
 ) + urlpatterns

if 'rosetta' in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
        url(r'^rosetta/', include('rosetta.urls')),
    )
