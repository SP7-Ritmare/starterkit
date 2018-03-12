from django.conf import settings
from mdtools.models import ServicesMetadata


def sk(request):
    return {
        'SERVICES_METADATA': ServicesMetadata.objects.get_current(),
        'SOS_APP': getattr(settings, "SOS_APP", False),
        'SOS_URL': getattr(settings, "SOS_PUBLIC_URL", False),
        'SOS_CAPABILITIES_URL': getattr(settings, "SOS_PUBLIC_CAPABILITIES_URL", False),
        }
