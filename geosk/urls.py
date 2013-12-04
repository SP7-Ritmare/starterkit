from django.conf.urls import patterns, url

from geonode.urls import *

urlpatterns = patterns('',

    # Static pages
    url(r'^$', 'geonode.views.index', {'template': 'site_index.html'}, name='home'),
    url(r'^mdtools/api/getdata$', 'geosk.mdtools.views.get_data_api', name='mdtools_getdata'),
 ) + urlpatterns
