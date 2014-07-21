from django.conf import settings

def sk(request):
    return {
        'SOS_APP': getattr(settings, "SOS_APP", False),
        }


