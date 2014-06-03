from django.db import models
from django.conf import settings
from . import sos

class SensorManager(models.Manager):
    def __init__(self):
        models.Manager.__init__(self)
        url = settings.SOS_SERVER['default']['KVP_LOCATION']
        version = settings.SOS_SERVER['default']['VERSION']
        self.sos_catalog = sos.Catalog(url, version=version)

class Sensor(models.Model):
    objects      = SensorManager()
    ediml        = models.TextField(null=True, blank=True)
    sensorml     = models.TextField(null=True, blank=True)
    
