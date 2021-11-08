from django.conf.urls import url
from django.views.generic import TemplateView

from . import (api, views)

urlpatterns = [
    url(r'^api/getdata$', views.get_data_api, name='mdtools_getdata'),
    # import metadata
    url(r'^api/importediml$', api.importediml, name='importediml'),
    url(r'^api/importrndt$', api.importrndt, name='importrndt'),
    url(r'^api/listediml$', api.listediml, name='listediml'),

    # proxy to RNDT
    url(r'^rndt/$', TemplateView.as_view(template_name='mdtools/rndt.html'), name="rndt"),
    url(r'^rndt-1/$', TemplateView.as_view(template_name='mdtools/rndt-1.html'), name="rndt-1"),
    url(r'^rndt-simple/$', TemplateView.as_view(template_name='mdtools/rndt-simple.html'), name="rndt_simple"),
    url(r'^rndt/(?P<layername>[^/]*)/postMetadata$', api.rndtproxy, name='rndtproxy'),
    # new API EdiProxy
    url(r'^ediproxy/(?P<layername>[^/]*)/importmd$', api.ediproxy_importmd, name='ediproxy_importmd'),
]
