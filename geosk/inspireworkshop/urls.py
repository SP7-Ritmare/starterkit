from __future__ import absolute_import

from django.conf.urls.defaults import patterns, url
from .views import WorkshopView

urlpatterns = patterns('geosk.inspireworkshop.views',
                       url(r'^$', WorkshopView.as_view(), name="inspireworkshop_index"),
                       url(r'^demodataset$', 'get_demodataset', name="inspireworkshop_demodataset"),
)
