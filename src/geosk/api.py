import logging

from django.conf import settings
from django.utils.translation import gettext as _
from django.forms.models import model_to_dict

from tastypie.constants import ALL

from geonode.groups.models import GroupProfile
from geonode.api.resourcebase_api import LayerResource

from geosk.geonode_sos import utils

logger = logging.getLogger(__name__)

#REST API override for layers to include additional fields required for sensors
class SoSLayerResource(LayerResource):
    def format_objects(self, objects):
        """
        Formats the object.
        """
        formatted_objects = []
        for obj in objects:
            # convert the object to a dict using the standard values.
            # includes other values
            values = self.VALUES + [
                'alternate',
                'name',
                'resource_type'
            ]
            formatted_obj = model_to_dict(obj, fields=values)
            username = obj.owner.get_username()
            full_name = (obj.owner.get_full_name() or username)
            formatted_obj['owner__username'] = username
            formatted_obj['owner_name'] = full_name
            if obj.category:
                formatted_obj['category__gn_description'] = _(obj.category.gn_description)
            if obj.group:
                formatted_obj['group'] = obj.group
                try:
                    formatted_obj['group_name'] = GroupProfile.objects.get(slug=obj.group.name)
                except GroupProfile.DoesNotExist:
                    formatted_obj['group_name'] = obj.group

            formatted_obj['keywords'] = [k.name for k in obj.keywords.all()] if obj.keywords else []
            formatted_obj['regions'] = [r.name for r in obj.regions.all()] if obj.regions else []

            # provide style information
            bundle = self.build_bundle(obj=obj)
            formatted_obj['default_style'] = self.default_style.dehydrate(
                bundle, for_list=True)

            # Add resource uri
            formatted_obj['resource_uri'] = self.get_resource_uri(bundle)

            formatted_obj['links'] = self.dehydrate_ogc_links(bundle)

            if 'site_url' not in formatted_obj or len(formatted_obj['site_url']) == 0:
                formatted_obj['site_url'] = settings.SITEURL

            # Probe Remote Services
            formatted_obj['store_type'] = 'dataset'
            formatted_obj['online'] = True
            if hasattr(obj, 'storeType'):
                formatted_obj['store_type'] = obj.storeType
                if obj.storeType == 'remoteStore' and hasattr(obj, 'remote_service'):
                    if obj.remote_service:
                        formatted_obj['online'] = (obj.remote_service.probe == 200)
                    else:
                        formatted_obj['online'] = False

            formatted_obj['gtype'] = self.dehydrate_gtype(bundle)

            # replace thumbnail_url with curated_thumbs
            if hasattr(obj, 'curatedthumbnail'):
                try:
                    if hasattr(obj.curatedthumbnail.img_thumbnail, 'url'):
                        formatted_obj['thumbnail_url'] = obj.curatedthumbnail.thumbnail_url
                except Exception as e:
                    logger.exception(e)

            formatted_obj['processed'] = obj.instance_is_processed
            
            # Custom fields for sensors
            formatted_obj['raw_supplemental_information'] = obj.raw_supplemental_information
            formatted_obj['is_local_sensor'] = utils.is_local_senor(obj) if obj.resource_type == "sos_sensor" else False
            
            # put the object on the response stack
            formatted_objects.append(formatted_obj)
        return formatted_objects
