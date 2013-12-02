from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.db.models import signals
from django.conf import settings

from geonode.base.models import ResourceBase, Region, TopicCategory, ALL_LANGUAGES
from geonode.layers.models import Layer
from geonode.maps.models import Map
from geonode.documents.models import Document

def set_default_regions(instance, sender, **kwargs):
    for region in settings.METADATA_DEFAULT_VALUES['regions']:        
        instance.regions.add(Region.objects.get(code = region))

if 'language' in settings.METADATA_DEFAULT_VALUES:
    ResourceBase._meta.get_field('language').default = settings.METADATA_DEFAULT_VALUES['language']
if 'regions' in settings.METADATA_DEFAULT_VALUES:
    signals.post_save.connect(set_default_regions, sender=Layer)
    signals.post_save.connect(set_default_regions, sender=Map)
    signals.post_save.connect(set_default_regions, sender=Document)
