from django.conf import settings

LOCAL_SENSOR_KEYWORD = "local"

def is_local_senor(resource):
    found = (resource.resource_type == 'sos_sensor') and any(resource.keywords.filter(name=LOCAL_SENSOR_KEYWORD))
    return found