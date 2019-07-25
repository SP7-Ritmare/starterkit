from __future__ import absolute_import

from django.conf.urls import url
from .api import UploadView
from . import api, views


urlpatterns = [
    # osk
    url(r'^$', views.browse, name="osk_browse"),
    url(r'^registration$', api.sensormleditor, name="osk_registration"),
    url(r'^upload$', UploadView.as_view(), name="osk_upload"),
    url(r'^deletesensor$', api.deletesensor, name="osk_deletesensor"),
    # url(r'^sensorml$', TemplateView.as_view(template_name='osk/sensorml.html'), name="osk_sensorml"),
    # sensors
    url(r'^sensor/cap/$', views.get_capabilities, name="get_capabilities"),
    url(r'^sensor/ds/$', views.describe_sensor, name="osk_describe_sensor"),
    # edi
    url(r'^postMetadata$',
        api.sensormlproxy, name='sensormlproxy'),
    url(r'^lastediml$',
        api.lastediml, name='lastediml'),
    url(r'^lastsensorml$',
        api.lastsensorml, name='lastsensorml'),
    # new API EdiProxy
    url(r'^ediproxy/importmd$', api.ediproxy_importmd, name='osk_ediproxy_importmd'),
]
