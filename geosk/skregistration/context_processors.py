from geosk.skregistration.models import SkRegistration

def skregistration(request):
    return {
        'skregistration': SkRegistration.objects.get_current()
        }


