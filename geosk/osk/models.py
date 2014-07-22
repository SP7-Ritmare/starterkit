from django.db import models
from django.conf import settings
from . import sos

class SensorManager(models.Manager):
    def __init__(self):
        models.Manager.__init__(self)
        self._sos_catalog = None

    @property
    def sos_catalog(self):
        if self._sos_catalog is None:
            url = settings.SOS_SERVER['default']['KVP_LOCATION']
            version = settings.SOS_SERVER['default']['VERSION']
            self._sos_catalog = sos.Catalog(url, version=version)
        return self._sos_catalog

class Sensor(models.Model):
    objects      = SensorManager()
    ediml        = models.TextField(null=True, blank=True)
    sensorml     = models.TextField(null=True, blank=True)
    fileid       = models.IntegerField(null=True, blank=True)    
    class Meta:
        permissions = ( 
            ( "admin_sos", "Can admin SOS" ),
            ( "read_sos", "Can retrieve data from SOS" ),
            )

# using sensors database
class StringSettings(models.Model):
    value = models.TextField(blank=True) # This field type is a guess.
    identifier = models.TextField(primary_key=True, unique=True) # This field type is a guess.
    class Meta:
        db_table = 'string_settings'
        managed = False


class UriSettings(models.Model):
    value = models.TextField(blank=True) # This field type is a guess.
    identifier = models.TextField(primary_key=True, unique=True) # This field type is a guess.
    class Meta:
        db_table = 'uri_settings'
        managed = False
