from __future__ import absolute_import

from django.conf.urls.defaults import patterns, url
from .views import WorkshopView

urlpatterns = patterns('geosk.demo.views',
                       url(r'^$', WorkshopView.as_view(), name="demo_index"),
                       url(r'^demodataset$', 'get_demodataset', name="demo_demodataset"),
)
