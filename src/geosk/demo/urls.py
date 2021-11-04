from django.conf.urls import url

from .views import WorkshopView, get_demodataset

urlpatterns = [
    url(r'^$',
        WorkshopView.as_view(), name="demo_index"),
    url(r'^demodataset$',
        get_demodataset, name="demo_demodataset"),
]
