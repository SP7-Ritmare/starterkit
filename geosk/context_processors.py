from django.conf import settings

def sk(request):
    return {
        'SOS_ENABLED': getattr(settings, "SOS_ENABLED", False),
        }


