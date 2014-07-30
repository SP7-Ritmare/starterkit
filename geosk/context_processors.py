from django.conf import settings

def sk(request):
    return {
        'SOS_APP': getattr(settings, "SOS_APP", False),
        'SOS_URL': getattr(settings, "SOS_URL", False),
        }


