import os
import logging

from django.conf import settings
from django.contrib import admin
from django.core.files import locks
from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib.sites.models import Site

from geosk.mdtools.models import ServicesMetadata

from geosk.osk.models import StringSettings, UriSettings

class ServicesMetadataAdmin(admin.ModelAdmin):
    list_display = ('node_title', 'provider_name', 'provider_url')
    fieldsets = (
        (None, {
                'fields': (('node_name', 'node_title'), 'node_abstract', 'node_keywords')
                }
         ),
        (_('Provider'), {
                'fields': (('provider_name', 'provider_url'),)
                }
         ),
        (_('Contact'), {
                'fields': (
                    ('contact_name', 'contact_position'),
                    ('contact_email', 'contact_url'),
                    ('contact_address',),
                    ('contact_city', 'contact_stateprovince',), 
                    ('contact_postalcode', 'contact_country'),
                    ('contact_phone', 'contact_fax',),
                    ('contact_hours', 'contact_instructions',),
                    )
                }
         ),
        )
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
        # get current values
        service_base = gs_settings.get_service_config(service)
        # service_base = {service: {"enabled": True, # va lasciato altrimenti lo disabilita
        #                           "name": "%s - %s " % (instance.node_name, service),
        #                           "title": "%s - %s " % (instance.node_title, service),
        #                           "maintainer": instance.provider_url if instance.provider_url is not None else settings.SITEURL,
        #                           "abstract": instance.node_abstract is instance.node_abstract is not None else '-',
        #                           "accessConstraints": None,  #TODO
        #                           "fees": None, #TODO
        #                           "keywords": {"string":["WFS","WMS","GEOSERVER"]}, #TODO
        #                           "citeCompliant": False,
        #                           "onlineResource": settings.SITEURL,
        #                           }}
        service_base[service]['name']     = "%s - %s " % (instance.node_name, service)
        service_base[service]['title']    = "%s - %s " % (instance.node_title, service)
        service_base[service]['maintainer']    = instance.provider_url if instance.provider_url is not None and instance.provider_url else settings.SITEURL
        service_base[service]['abstrct'] =  instance.node_abstract if instance.node_abstract is not None else '-'
        service_base[service]['onlineResource'] = settings.SITEURL
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

    # save observations settings
    set_sensors_configuration(instance)


def getval(val, default='None'):
    if val is None or not val:
        return default
    return val

def get_pycsw_configuration(instance):
    PYCSW = {
        # pycsw configuration
        'CONFIGURATION': {
            'metadata:main': {
                'identification_title': "%s - Catalog " % (instance.node_title,),
                'identification_abstract': getval(instance.node_abstract),
                'identification_keywords': 'sdi,catalogue,discovery,metadata,GeoNode', # TODO
                'identification_keywords_type': 'theme',
                'identification_fees': 'None', # TODO
                'identification_accessconstraints': 'None', # TODO
                'provider_name': getval(instance.provider_name),
                'provider_url': settings.SITEURL,
                'contact_name': getval(instance.contact_name),
                'contact_position': getval(instance.contact_position),
                'contact_address': getval(instance.contact_address),
                'contact_city': getval(instance.contact_city),
                'contact_stateorprovince': getval(instance.contact_stateprovince),
                'contact_postalcode': getval(instance.contact_postalcode),
                'contact_country': getval(instance.contact_country),
                'contact_phone': getval(instance.contact_phone),
                'contact_fax': getval(instance.contact_fax),
                'contact_email': getval(instance.contact_email),
                'contact_url': getval(instance.contact_url),
                'contact_hours': getval(instance.contact_hours),
                'contact_instructions': getval(instance.contact_instructions),
                'contact_role': getval(instance.contact_role),
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


def set_sensors_configuration(instance):
    configuration_strings = {
        'serviceProvider.name': getval(instance.provider_name),
        'serviceProvider.phone': getval(instance.contact_phone),
        'serviceProvider.individualName': getval(instance.contact_name),
        'serviceProvider.positionName': getval(instance.contact_position),
        'serviceProvider.email': getval( instance.contact_email),
        'serviceProvider.address': getval(instance.contact_address),
        'serviceProvider.postalCode': getval( instance.contact_postalcode),
        'serviceProvider.city': getval(instance.contact_city),
        'serviceProvider.state': getval(instance.contact_stateprovince),
        'serviceProvider.country': getval(instance.contact_country),
        'serviceIdentification.title': getval(instance.node_title),
        'serviceIdentification.abstract': getval(instance.node_abstract),
        'serviceIdentification.accessConstraints': 'None', # TODO
        'serviceIdentification.fees': 'None', # TODO
        'serviceIdentification.serviceType': 'OGC:SOS',
        #
        'misc.defaultOfferingPrefix': 'offering:',
        'misc.defaultProcedurePrefix': "http://sp7.irea.cnr.it/sensors/%s/procedure/" % Site.objects.get_current().domain,
        'misc.defaultObservablePropertyPrefix':  "http://sp7.irea.cnr.it/sensors/%s/observableProperty/" % Site.objects.get_current().domain,
        'misc.defaultFeaturePrefix':  "http://sp7.irea.cnr.it/sensors/%s/foi/" % Site.objects.get_current().domain,
        }

    configuration_uri = {
        'serviceProvider.site' : instance.contact_url,
        'service.sosUrl' : settings.SOS_URL,
        }

    for k,v in configuration_strings.iteritems():
        el = StringSettings.objects.using('sensors').get(identifier=k)
        el.value = getval(v)
        el.save()

    for k,v in configuration_uri.iteritems():
        el = UriSettings.objects.using('sensors').get(identifier=k)
        el.value = getval(v)
        el.save()
