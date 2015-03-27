from django.conf import settings
from mdtools.models import ServicesMetadata


def sk(request):
    return {
        'SERVICES_METADATA': ServicesMetadata.objects.get_current(),
        'SOS_APP': getattr(settings, "SOS_APP", False),
        'SOS_URL': getattr(settings, "SOS_URL", False),
        }
