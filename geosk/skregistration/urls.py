from django.conf.urls import url
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    url(r'^registration$', views.registration, name='skregistration_registration'),
    url(r'^register$', views.register, name='skregistration_register'),
    url(r'^verify$', views.verify, name='skregistration_verify'),
]
