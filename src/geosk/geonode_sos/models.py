#########################################################################
#
# Copyright (C) 2022 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

from django.db import models
from django.utils.translation import ugettext as _
from dynamic_models.models import FieldSchema, ModelSchema
from geonode.layers.models import Layer
from django.conf import settings as django_settings
from geonode.services.serviceprocessors.base import (
    get_geoserver_cascading_workspace,
)
from geonode.geoserver.signals import geoserver_delete
import logging

logger = logging.getLogger(__name__)


CONTACT_TYPES = [
    ("manufacturerName", "manufacturerName"),
    ("owner", "owner"),
    ("pointOfContact", "pointOfContact"),
]


class Offerings(models.Model):

    name = models.CharField(max_length=255, null=True)
    definition = models.CharField(max_length=2000, null=True)
    value = models.CharField(max_length=2000, null=True)

    resource = models.ForeignKey(
        Layer, null=False, blank=False, on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = _("Offering")
        verbose_name_plural = _("Offerings")

    def __str__(self):
        return self.name


class ServiceProvider(models.Model):

    name = models.CharField(max_length=255, null=True)
    site = models.CharField(max_length=2000, null=True)
    individual_name = models.CharField(max_length=2000, null=True)
    position_name = models.CharField(max_length=255, null=True)
    phone = models.CharField(max_length=255, null=True)
    delivery_point = models.CharField(max_length=255, null=True)
    city = models.CharField(max_length=255, null=True)
    administrative_area = models.CharField(max_length=255, null=True)
    postal_code = models.CharField(max_length=255, null=True)
    country = models.CharField(max_length=255, null=True)
    email = models.CharField(max_length=255, null=True)

    service = models.ForeignKey(
        "services.Service", null=False, blank=False, on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = _("Service Provider")
        verbose_name_plural = _("Service Provider")

    def __str__(self):
        return self.name


class SensorResponsible(models.Model):
    name = models.CharField(max_length=255, null=True)
    phone = models.CharField(max_length=255, null=True)
    delivery_point = models.CharField(max_length=255, null=True)
    city = models.CharField(max_length=255, null=True)
    administrative_area = models.CharField(max_length=255, null=True)
    postal_code = models.CharField(max_length=255, null=True)
    country = models.CharField(max_length=255, null=True)
    mail = models.CharField(max_length=255, null=True)
    online_resource = models.CharField(max_length=2000, null=True)
    arcrole = models.CharField(max_length=2000, null=True)
    role = models.CharField(max_length=255, null=True)
    extracted_arcrole = models.CharField(
        max_length=255, null=True, choices=CONTACT_TYPES
    )

    resource = models.ForeignKey(
        Layer, null=False, blank=False, on_delete=models.CASCADE
    )


def create_dynamic_model_instance(dynamic_model_schema):
    fields = [
        {"name": "name", "class_name": "django.db.models.CharField", "null": False},
        {"name": "identifier", "class_name": "django.db.models.CharField", "null": True},
        {"name": "codespace", "class_name": "django.db.models.CharField", "null": True},
        {"name": "feature_type", "class_name": "django.db.models.CharField", "null": True},
        {"name": "feature_id", "class_name": "django.db.models.CharField", "null": True},
        {"name": "sampled_feature", "class_name": "django.db.models.CharField", "null": True},
        {"name": "geometry", "class_name": "django.contrib.gis.db.models.PolygonField", "null": False},
        {"name": "srs_name", "class_name": "django.db.models.CharField", "null": True},
        {"name": "description", "class_name": "django.db.models.TextField", "null": True},
        {"name": "shape_blob", "class_name": "django.db.models.TextField", "null": False},
        {"name": "resource_id", "class_name": "django.db.models.IntegerField", "null": False},
    ]

    for field in fields:
        _kwargs = {"null": field['null']}
        if field['class_name'].endswith('CharField'):
            _kwargs = {**_kwargs, **{"max_length": 255}}
        FieldSchema.objects.create(
            name=field['name'],
            class_name=field['class_name'],
            model_schema=dynamic_model_schema,
            kwargs=_kwargs
        )

    return dynamic_model_schema.as_model()


def delete_dynamic_model(instance, sender, **kwargs):
    '''
    Delete the FOI related to a single Sensor
    '''
    try:
        ModelSchema.objects.filter(name=f"resource_{instance.id}").delete()
        FieldSchema.objects.filter(name=f"resource_{instance.id}").delete()

        workspace = get_geoserver_cascading_workspace(create=False)
        geoserver_delete(f'{workspace.name}:{django_settings.DYNAMIC_MODELS.get("USE_APP_LABEL")}_resource_{instance.id}')
        # Removing Field Schema
    except Exception as e:
        logger.error(f"Error during deletion of Dynamic Model schema: {e.args[0]}")


models.signals.post_delete.connect(delete_dynamic_model, sender=Layer)