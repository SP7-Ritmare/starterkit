from django import template
from geonode import settings
from geonode.layers.models import Layer
from geonode.security.utils import get_visible_resources
from geonode.base.templatetags.base_tags import FACETS

register = template.Library()


@register.simple_tag
def get_sos_facet(facet, request):
    remote_count = facet.get('remote', 0)
    if remote_count > 0:
        sos_count = get_visible_resources(
            Layer.objects.filter(resource_type="sos_sensor"),
            request.user if request else None,
            admin_approval_required=settings.ADMIN_MODERATE_UPLOADS,
            unpublished_not_visible=settings.RESOURCE_PUBLISHING,
            private_groups_not_visibile=settings.GROUP_PRIVATE_RESOURCES)
        facet["sos_sensor"] = sos_count.count()
    return facet


@register.filter(is_safe=True)
def get_facet_title_with_sos(value):
    """Converts a facet_type into a human readable string"""
    if value in FACETS.keys():
        return FACETS[value]
    elif value == 'sos_sensor':
        return "SOS Sensor"
    return value