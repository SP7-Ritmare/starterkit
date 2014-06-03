from django.conf.urls.defaults import patterns, url
from django.views.generic import TemplateView

urlpatterns = patterns(
    'geosk.osk.views',
    # osk
    url(r'^$', 'browse', name="osk_browse"),                   
    url(r'^registration$', TemplateView.as_view(template_name='osk/osk_registration.html'), name="osk_registration"),                   
    url(r'^upload$', TemplateView.as_view(template_name='osk/osk_upload.html'), name="osk_upload"),                   
    # sensors
    url(r'^sensor/cap/$', 'get_capabilities', name="get_capabilities"),                   
    url(r'^sensor/ds/$', 'describe_sensor', name="osk_describe_sensor"),                   
)
