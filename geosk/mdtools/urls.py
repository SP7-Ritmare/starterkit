from django.conf.urls.defaults import patterns, url
from django.views.generic import TemplateView

urlpatterns = [
    url(r'^api/getdata$', 'geosk.mdtools.views.get_data_api', name='mdtools_getdata'),
    # parse metadata
    url(r'^api/mdimport$', 'geosk.mdtools.api.mdimport', name='mdimport'),
 
   # proxy to RNDT   
    url(r'^rndt/$', TemplateView.as_view(template_name='mdtools/rndt.html'), name="rndt"),
    url(r'^rndt-1/$', TemplateView.as_view(template_name='mdtools/rndt-1.html'), name="rndt-1"),
    url(r'^rndt-simple/$', TemplateView.as_view(template_name='mdtools/rndt-simple.html'), name="rndt_simple"),
    url(r'^rndt/(?P<layername>[^/]*)/postMetadata$', 'geosk.mdtools.api.rndtproxy', name='rndtproxy'),
]


