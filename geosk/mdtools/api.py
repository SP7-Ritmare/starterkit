# coding=utf-8
import sys
import json
import requests
import re
import datetime
from lxml import etree
from email.utils import parseaddr
from owslib.iso import MD_Metadata, CI_ResponsibleParty, util, namespaces
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.core.serializers.json import DjangoJSONEncoder
from django.core.urlresolvers import reverse
from django.utils.safestring import mark_safe

from geonode.base.models import SpatialRepresentationType, TopicCategory
from geonode.layers.metadata import set_metadata, sniff_date
from geonode.layers.models import Layer
from geonode.layers.views import _resolve_layer, _PERMISSION_MSG_METADATA, layer_detail
from geonode.utils import http_client, _get_basic_auth_info, json_response
from geonode.people.enumerations import ROLE_VALUES
from geonode.people.models import Profile, Role
from geonode.base.enumerations import ALL_LANGUAGES, \
    HIERARCHY_LEVELS, UPDATE_FREQUENCIES, \
    DEFAULT_SUPPLEMENTAL_INFORMATION, LINK_TYPES

from geosk.skregistration.views import get_key

from geosk.mdtools.forms import UploadMetadataFileForm
from geosk.mdtools.models import ResponsiblePartyScope, MultiContactRole, SCOPE_VALUES

EDI_MAP_SPATIALREPRESENTATIONTYPE = {
    'dataStore': 'http://www.rndt.gov.it/codelists/MD_SpatialRepresentationTypeCode/items/001',
    'coverageStore': 'http://www.rndt.gov.it/codelists/MD_SpatialRepresentationTypeCode/items/002',
}


def get_datetype(ita):
    DATETYPE = {
        'creation': 'creazione',
        'publication': 'pubblicazione',
        'revision': 'revisione'
        }
    for neutral, dt in DATETYPE.iteritems():
        if dt.lower() == ita.lower() or neutral.lower() == ita.lower():
            return neutral
    return None

def get_topic_category(ita):
    TOPIC_CATEGORY = {
        'inlandWaters': 'Acque interne',
        'oceans': 'Acque marine - Oceani',
        'farming': 'Agricoltura',
        'environment': 'Ambiente',
        'biota': 'Biota',
        'climatologyMeteorologyAtmosphere': 'Climatologia - Meteorologia - Atmosfera',
        'boundaries': 'Confini',
        'economy': 'Economia',
        'elevation': 'Elevazione',
        'geoscientificInformation': 'Informazioni geoscientifiche',
        'intelligenceMilitary': 'Settore militare',
        'location': 'Localizzazione',
        'imageryBaseMapsEarthCover': 'Mappe di base - Immagini - Copertura terrestre',
        'planningCadastre': 'Pianificazione - Catasto',
        'health': 'Salute',
        'utilitiesCommunication': u'Servizi di pubblica utilità - Comunicazione',
        'society': u'Società',
        'structure': 'Strutture',
        'transportation': 'Trasporti'
        }
    for neutral, tc in TOPIC_CATEGORY.iteritems():
        if tc.lower() == ita.lower() or neutral.lower() == ita.lower():
            return neutral
    return None

def rndteditor(request, layername):
    layer = _resolve_layer(request, layername, 'layers.change_layer', _PERMISSION_MSG_METADATA)

    queryStringValues = {
        'template': 'RNDT',
        'version': '2.00',
        'parameters': "{}"
        }    

    fileid = layer.mdextension.fileid
    pars = {}
    if fileid is not None:
        queryStringValues['edit'] = fileid
        pars = {
            'uid': layer.uuid,
            'westlon': layer.bbox_x0,
            'eastlon': layer.bbox_x1,
            'southlat': layer.bbox_y0,
            'northlat': layer.bbox_y1,
            'referencesystem': layer.srid.split(':')[1],
        }

    else:
        pars = {
            'uid': layer.uuid,
            # inserire data_md
            'title': layer.title,
            # 'data_md': layer.date.date().isoformat(), # layer.mdextension.md_date.date().isoformat(),
            'date': datetime.date.today().isoformat(), # layer.date.date().isoformat(),
            # 'tipo_di_data': layer.date_type,
            'abstract': layer.abstract,
            'spatialrepresentationtype': (EDI_MAP_SPATIALREPRESENTATIONTYPE).get(layer.storeType),
            'westlon': layer.bbox_x0,
            'eastlon': layer.bbox_x1,
            'southlat': layer.bbox_y0,
            'northlat': layer.bbox_y1,
            'resource': '%s%s' % (settings.SITEURL[:-1], layer.get_absolute_url()),
            'referencesystem': layer.srid.split(':')[1],
            }

    
    js_pars = json.dumps(pars, cls=DjangoJSONEncoder)

    queryStringValues['parameters'] = json.dumps(pars, cls=DjangoJSONEncoder)
    
    js_queryStringValues = json.dumps(queryStringValues)
    return render_to_response(
        'mdtools/rndt.html',
        RequestContext(request, {
                'layername': layername,
                'queryStringValues': mark_safe(js_queryStringValues)
                })
        )
    
def rndtproxy(request, layername):
    layer = _resolve_layer(request, layername, 'layers.change_layer', _PERMISSION_MSG_METADATA)

    service = settings.RITMARE['MDSERVICE'] + 'postMetadata'

    headers = {'api_key': get_key(),
               'Content-Type': 'application/xml',
               }

    r = requests.post(service, data=request.raw_post_data,  headers=headers, verify=False)
    if r.status_code == 200:
        rndt = r.text.encode('utf8')
        # extract fileid
        ediml = etree.fromstring(request.raw_post_data)
        fileid = ediml.find('fileId').text

        # new fileid must be equal to the old one
        if layer.mdextension.fileid is not None:
            if int(layer.mdextension.fileid) != int(fileid):
                return json_response(errors='New fileid (%s) is different from the old one (%s)' % (fileid, layer.mdextension.fileid), 
                                     status=500)
        else:
            layer.mdextension.fileid = fileid
    else:
        return json_response(errors='Cannot create RNDT', 
                             status=500)

    try:
        vals, keywords = rndt2dict(etree.fromstring(rndt))
        errors = _post_validate(vals)
        if len(errors) > 0:
            return json_response(exception=errors, status=500)
        _mdimport(layer, vals, keywords, rndt)
    except Exception as e:
        return json_response(exception=e, status=500)
        
    # save rndt & edi xml
    layer.mdextension.md_language = vals['md_language']
    layer.mdextension.md_date = vals['md_date'] if vals['md_date'] is not None else layer.date 
    layer.mdextension.rndt_xml = rndt
    layer.mdextension.elements_xml = request.raw_post_data
    layer.mdextension.save()
    return json_response(body={'success':True,'redirect': reverse('layer_detail', args=(layer.typename,))})
    # return HttpResponseRedirect()


def _post_validate(vals):
    errors = []
    # check required fields
    # required = [f.name for f in Layer._meta.fields if not f.blank]
    # required = ['uuid', 'title', 'date', 'date_type', 'language', 'supplemental_information']
    required = ['uuid', 'title', 'date', 'date_type', 'language']
    for r in required:
        if r not in vals.keys():
            errors.append(r)
    return errors
    

def mdimport(request, template='mdtools/upload_metadata.html'):
    if request.method == 'POST':
        form = UploadMetadataFileForm(request.POST, request.FILES)
        if form.is_valid():
            # response_data = set_metadata(request.FILES['file'].read())
            # return HttpResponse(json.dumps(response_data, 
            #                                sort_keys=True,
            #                                indent=4, 
            #                                separators=(',', ': '),
            #                                cls=DjangoJSONEncoder), 
            #                     content_type="application/json")
            layerid = form.cleaned_data['layerid']
            layer = Layer.objects.get(pk=layerid)

            xml = request.FILES['file'].read()
            # response_data = _parse_metadata(xml)
            vals, keywords = rndt2dict(etree.fromstring(xml))
            response_data = _mdimport(layer, vals, keywords, xml)
            
            return HttpResponse(json.dumps(response_data, 
                                           default=lambda o: o.__dict__, 
                                           sort_keys=True,
                                           indent=4, 
                                           separators=(',', ': '),
                                           cls=DjangoJSONEncoder), 
                                content_type="application/json")

    else:
        form = UploadMetadataFileForm()
    return render_to_response(template,
                              RequestContext(request, {'form': form}))



def _parse_metadata(xml):
    try:
        exml = etree.fromstring(xml)
    except ValueError:
        return None
    mdata = MD_Metadata(exml)
    # rimuovo xml
    mdata.xml = None
    return mdata

def _mdimport(layer, vals, keywords, xml):
    # print >>sys.stderr, 'VALS', vals
    # set taggit keywords
    layer.keywords.clear()
    layer.keywords.add(*keywords)

    # set model properties
    for (key, value) in vals.items():
        # print >>sys.stderr, key, unicode(value).encode('utf8')
        # EDI_Metadata e MD_Metadata non riesco a leggerlo, inoltre EDI può averlo multiplo mentre GeoNode no
        if key == 'spatial_representation_type':
            value = SpatialRepresentationType(identifier=value)
        elif key == 'topic_category':
            key = 'category'
            value = TopicCategory.objects.get(identifier=get_topic_category(value.encode('utf8')))
        elif key == 'supplemental_information' and value is None:
            value = ' '
        elif key in ['md_contact', 'citation_contact', 'identification_contact', 'distributor_contact']:
            _set_contact_role_scope(key, value, layer.mdextension)
        setattr(layer, key, value)

    layer.save()
    return layer

def _set_contact_role_scope(scope, contacts, resource):
    scope = _get_or_create_scope(scope)
    MultiContactRole.objects.filter(resource=resource, scope=scope).delete()
    for c in contacts:
        profile = _get_or_create_profile(c)
        if profile is not None:
            role = _get_or_create_role(c)
            MultiContactRole.objects.create(resource=resource,
                                            contact=profile,
                                            role=role,
                                            scope=scope)

def _get_or_create_scope(_scope):
    scopes = dict(SCOPE_VALUES)
    scope, is_created = ResponsiblePartyScope.objects.get_or_create(value=_scope)
    return scope

def _get_or_create_role(contact, default='pointOfContact'):
    _role = contact['role']
    roles = dict(ROLE_VALUES)
    if roles.get(_role) is None:
        _role = default
    role, is_created = Role.objects.get_or_create(value=_role)
    return role

def _get_or_create_profile(contact):
    _name = contact['name']
    _email = parseaddr(contact['email'])[1] # removing the mailto: prefix
    if _email is None or _email.strip() == '':
        return None
    #guess name
    if _name is None or _name.strip() == '':
        contact['name'] = _guess_name(_email)
    # some cleaning
    fields = Profile._meta.get_all_field_names()
    _defaults= {k:v for k, v in contact.items() if k in fields}
    del(_defaults['email']) # 
    # create profile
    profile, is_created = Profile.objects.get_or_create(defaults=_defaults, email=_email)
    return profile

split_email_regexp = re.compile(r'[ .-_]')
def _guess_name(email):
    parts = []
    _email = email.split('@')[0]
    for s in re.split(split_email_regexp, _email):
        s = s.strip()
        if s:
            if len(s)>1:
                parts.append(s.capitalize())
            else:
                parts.append(s.capitalize()+'.')
    name = ' '.join(parts)
    if len(name) > 1:
        return name
    else:
        return email

# extend MD_Metadata
class EDI_Metadata(MD_Metadata):
    def __init__(self, md):
        super( EDI_Metadata, self ).__init__(md)
        # get additional elements
        self.identification.cited = []
        for i in md.findall(util.nspath_eval('gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:citedResponsibleParty/gmd:CI_ResponsibleParty', namespaces)):
            o = CI_ResponsibleParty(i)
            self.identification.cited.append(o)

def rndt2dict(exml):
    """generate dict of properties from EDI_Metadata (INSPIRE - RNDT)"""

    vals = {}
    keywords = []

    mdata = EDI_Metadata(exml)

    # metadata 
    vals['uuid'] = mdata.identifier
    vals['md_language'] = mdata.languagecode
    vals['md_date'] = sniff_date(mdata.datestamp) if mdata.datestamp is not None else None

    vals['spatial_representation_type'] = mdata.hierarchy

    if hasattr(mdata, 'identification'):
        # 
        if len(mdata.identification.date) > 0:
            vals['date'] = sniff_date(mdata.identification.date[0].date) if mdata.identification.date[0].date is not None else None
            vals['date_type'] = get_datetype(mdata.identification.date[0].type) if mdata.identification.date[0].type is not None else None

        # ci sono problemi nei nella mappatura dei codici delle lingue es. grc e gree per il greco
        if len(mdata.identification.resourcelanguage) > 0:
            vals['language'] = mdata.identification.resourcelanguage[0]

        vals['title'] = mdata.identification.title
        vals['abstract'] = mdata.identification.abstract
        vals['purpose'] = mdata.identification.purpose
        vals['supplemental_information'] = mdata.identification.supplementalinformation if mdata.identification.supplementalinformation is not None else DEFAULT_SUPPLEMENTAL_INFORMATION

        # vals['temporal_extent_start'] = \
        #     mdata.identification.temporalextent_start
        # vals['temporal_extent_end'] = \
        #     mdata.identification.temporalextent_end

        if len(mdata.identification.topiccategory) > 0:
            vals['topic_category'] = get_topic_category(mdata.identification.topiccategory[0])
            vals['topic_category_orig'] = mdata.identification.topiccategory[0]

        if (hasattr(mdata.identification, 'keywords') and
        len(mdata.identification.keywords) > 0):
            for k in mdata.identification.keywords:
                if None not in k['keywords']:
                    keywords.extend(k['keywords'])

        if len(mdata.identification.securityconstraints) > 0:
            vals['constraints_use'] = \
                mdata.identification.securityconstraints[0]
        if len(mdata.identification.otherconstraints) > 0:
            vals['constraints_other'] = \
                mdata.identification.otherconstraints[0]

        vals['purpose'] = mdata.identification.purpose

        citation_contact = []
        for c in mdata.identification.cited:
            c = c.__dict__
            if c['onlineresource'] is not None:
                c['onlineresource'] = c['onlineresource'].__dict__
            citation_contact.append(c)
        vals['citation_contact'] = citation_contact
                
        md_contact = []
        for c in mdata.contact:
            c = c.__dict__
            if c['onlineresource'] is not None:
                c['onlineresource'] = c['onlineresource'].__dict__
            md_contact.append(c)
        vals['md_contact'] = md_contact

        identification_contact = []
        for c in mdata.identification.contact:
            c = c.__dict__
            if c['onlineresource'] is not None:
                c['onlineresource'] = c['onlineresource'].__dict__
            identification_contact.append(c)
        vals['identification_contact'] = identification_contact

        distributor_contact = []
        for d in mdata.distribution.distributor:
            c = d.contact
            c = c.__dict__
            if c['onlineresource'] is not None:
                c['onlineresource'] = c['onlineresource'].__dict__
            distributor_contact.append(c)
        vals['distributor_contact'] = distributor_contact


    if mdata.dataquality is not None:
        vals['data_quality_statement'] = mdata.dataquality.lineage

    return [vals, keywords]
