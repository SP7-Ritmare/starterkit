from __future__ import absolute_import

from django.conf.urls.defaults import patterns, url

from .api import UploadView

urlpatterns = patterns(
    '',
    # osk
    url(r'^$', 'geosk.osk.views.browse', name="osk_browse"),                   
    url(r'^registration$', 'geosk.osk.api.sensormleditor', name="osk_registration"),                   
    url(r'^upload$', UploadView.as_view(), name="osk_upload"),                   
    # url(r'^sensorml$', TemplateView.as_view(template_name='osk/sensorml.html'), name="osk_sensorml"),                   
    # sensors
    url(r'^sensor/cap/$', 'geosk.osk.views.get_capabilities', name="get_capabilities"),                   
    url(r'^sensor/ds/$', 'geosk.osk.views.describe_sensor', name="osk_describe_sensor"),
    # edi
    url(r'^postMetadata$',
        'geosk.osk.api.sensormlproxy', name='sensormlproxy'),
    url(r'^lastediml$',
        'geosk.osk.api.lastediml', name='lastediml'),
    url(r'^lastsensorml$',
        'geosk.osk.api.lastsensorml', name='lastsensorml'),

)
