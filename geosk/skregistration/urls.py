from django.conf.urls.defaults import patterns, url
from django.views.generic import TemplateView

urlpatterns = [
    url(r'^registration$', 'geosk.skregistration.views.registration', name='skregistration_registration'),
    url(r'^register$', 'geosk.skregistration.views.register', name='skregistration_register'),
    url(r'^verify$', 'geosk.skregistration.views.verify', name='skregistration_verify'),
]
