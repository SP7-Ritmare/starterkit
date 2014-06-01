import os
import logging

from django.conf import settings
from django.contrib import admin
from django.core.files import locks

from geosk.mdtools.models import ServicesMetadata

class ServicesMetadataAdmin(admin.ModelAdmin):
    list_display = ('node_title', 'provider_name', 'provider_url')
    def save_model(self, request, obj, form, change):
        obj.save()
        post_save_nodeconfiguration(request, obj)

    def has_add_permission(self, request):
        return not ServicesMetadata.objects.exists()


admin.site.register(ServicesMetadata, ServicesMetadataAdmin)



from geosk.mdtools.geoserver_extra import Settings
from geonode.layers.models import Layer
def post_save_nodeconfiguration(request, instance):
    cat = Layer.objects.gs_catalog
    gs_settings = Settings(cat)
    contact = {"contact":
                   {"address": instance.contact_address,
                    "addressCity": instance.contact_city,
                    "addressCountry": instance.contact_country,
                    "addressPostalCode": instance.contact_postalcode,
                    "addressState": instance.contact_stateprovince,
                    "addressType": None,
                    "contactEmail": instance.contact_email,
                    "contactFacsimile": instance.contact_fax,
                    "contactOrganization": instance.provider_name,
                    "contactPerson": instance.contact_name,
                    "contactPosition": instance.contact_position,
                    "contactVoice": instance.contact_phone}
               }

    def get_service_json (instance, service):
        service_base = {service: {"enabled": True, # va lasciato altrimenti lo disabilita
                                  "name": "%s - %s " % (instance.node_name, service),
                                  "title": "%s - %s " % (instance.node_title, service),
                                  "maintainer": instance.provider_url,
                                  "abstrct": instance.node_abstract,
                                  "accessConstraints": None,  #TODO
                                  "fees": None, #TODO
                                  "keywords": {"string":["WFS","WMS","GEOSERVER"]}, #TODO
                                  "citeCompliant": False,
                                  "onlineResource":"http:\/\/geoserver.org" #TODO
                                  }}
        return service_base


    gs_settings.update_contact(contact)
    gs_settings.update_service('wms', get_service_json(instance, 'wms'))
    gs_settings.update_service('wfs', get_service_json(instance, 'wfs'))
    gs_settings.update_service('wcs', get_service_json(instance, 'wcs'))


    # save PYCSW settings
    try:
        PYCSW = get_pycsw_configuration(instance)
        pycsw_settings_string = 'PYCSW = %s' % str(PYCSW)
        settings_file = os.path.join(settings.LOCAL_ROOT, 'pycsw_settings.py')
        if os.path.isfile(settings_file):
            with open(settings_file, 'w') as f:
                locks.lock(f, locks.LOCK_EX)
                f.write(pycsw_settings_string)

                if 'mod_wsgi.process_group' in request.environ and \
                        request.environ.get('mod_wsgi.process_group', None) and \
                        'SCRIPT_FILENAME' in request.environ and \
                        int(request.environ.get('mod_wsgi.script_reloading', '0')):
                    try:
                        os.utime(request.environ.get('SCRIPT_FILENAME'), None)
                    except OSError:
                        pass
            pass

    except Exception, e:
        logging.error('Error when try to save pycsw settings')
        logging.error(str(e))


def get_pycsw_configuration(instance):
    PYCSW = {
        # pycsw configuration
        'CONFIGURATION': {
            'metadata:main': {
                'identification_title': "%s - Catalog " % (instance.node_title,),
                'identification_abstract': instance.node_abstract,
                'identification_keywords': 'sdi,catalogue,discovery,metadata,GeoNode', # TODO
                'identification_keywords_type': 'theme',
                'identification_fees': 'None', # TODO
                'identification_accessconstraints': 'None', # TODO
                'provider_name': instance.provider_name,
                'provider_url': settings.SITEURL,
                'contact_name': instance.contact_name,
                'contact_position': instance.contact_position,
                'contact_address': instance.contact_address,
                'contact_city': instance.contact_city,
                'contact_stateorprovince': instance.contact_stateprovince,
                'contact_postalcode': instance.contact_postalcode,
                'contact_country': instance.contact_country,
                'contact_phone': instance.contact_phone,
                'contact_fax': instance.contact_fax,
                'contact_email': instance.contact_email,
                'contact_url': instance.contact_url,
                'contact_hours': instance.contact_hours,
                'contact_instructions': instance.contact_instructions,
                'contact_role': instance.contact_role,
                },
            'metadata:inspire': {
                'enabled': 'true',
                'languages_supported': 'it,eng',
                'default_language': 'it',
                'date': 'YYYY-MM-DD',
                'gemet_keywords': 'Utility and governmental services',
                'conformity_service': 'notEvaluated',
                'contact_name': 'Organization Name',
                'contact_email': 'Email Address',
                'temp_extent': 'YYYY-MM-DD/YYYY-MM-DD',
                }
            }
        }
    return PYCSW



