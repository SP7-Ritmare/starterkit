# coding=utf-8
import sys
import json
from lxml import etree
from owslib.iso import MD_Metadata
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.core.serializers.json import DjangoJSONEncoder
from django.core.urlresolvers import reverse
from django.utils.safestring import mark_safe
from httplib import HTTPConnection,HTTPSConnection
from urlparse import urlsplit
import httplib2

from geonode.base.models import SpatialRepresentationType, TopicCategory
from geonode.layers.metadata import set_metadata
from geonode.layers.models import Layer
from geonode.layers.views import _resolve_layer, _PERMISSION_MSG_METADATA, layer_detail
from geonode.utils import http_client, _get_basic_auth_info, json_response

from .forms import UploadMetadataFileForm

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
        }

    else:
        pars = {
            'uid': layer.uuid,
            # inserire data_md
            'title': layer.title,
            'data_md': layer.mdextension.md_date.date().isoformat(),
            'data': layer.date,
            'tipo_di_data': layer.date_type,
            'abstract': layer.abstract,
            'spatialrepresentationtype': ({
                    "dataStore" : "vector",
                    "coverageStore": "grid",
                    }).get(layer.storeType),
            'westlon': layer.bbox_x0,
            'eastlon': layer.bbox_x1,
            'southlat': layer.bbox_y0,
            'northlat': layer.bbox_y1,
            'resource': '%s%s' % (settings.SITEURL[:-1], layer.get_absolute_url()),
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
    
from geosk.skregistration.views import get_key

def rndtproxy(request, layername):
    layer = _resolve_layer(request, layername, 'layers.change_layer', _PERMISSION_MSG_METADATA)

    service = settings.RITMARE['MDSERVICE'] + 'postMetadata'

    url = urlsplit(service)

    locator = url.path
    if url.query != "":
        locator += '?' + url.query
    if url.fragment != "":
        locator += '#' + url.fragment

    headers = {'api_key': get_key()}
    if request.method in ("POST", "PUT") and "CONTENT_TYPE" in request.META:
        headers["Content-Type"] = request.META["CONTENT_TYPE"]

    if url.scheme =='https':
        conn = HTTPSConnection(url.hostname, url.port)
    else:
        conn = HTTPConnection(url.hostname, url.port)
    conn.request(request.method, locator, request.raw_post_data, headers)
    result = conn.getresponse()
    rndt = result.read()
    # print >> sys.stderr, 'START'
    # print >> sys.stderr, rndt
    # print >> sys.stderr, 'END'
    # response = HttpResponse(
    #         rndt,
    #         status=result.status,
    #         content_type=result.getheader("Content-Type", "text/plain")
    #         )
    # return response

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
    
    try:
        vals, keywords = rndt2dict(etree.fromstring(rndt))
        errors = _post_validate(vals)
        if len(errors) > 0:
            return json_response(exception=errors, status=500)
        _mdimport(layer, vals, keywords, rndt)
    except Exception as e:
        return json_response(exception=e, status=500)
        
    # save rndt & edi xml
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
        if key == 'spatial_representation_type':
            value = SpatialRepresentationType(identifier=value)
        elif key == 'topic_category':
            key = 'category'
            value = TopicCategory.objects.get(identifier=get_topic_category(value.encode('utf8')))
        elif key == 'supplemental_information' and value is None:
            value = ' '
        setattr(layer, key, value)


    layer.save()
    return layer


# def test():
#     filename = '/home/menegon/geosk/geosk/mdtools/tmp/esempio_edi_rndt.xml'
#     f = open(filename, 'r')
#     xml = f.read()
#     return etree.fromstring(xml)
    

from geonode.layers.metadata import sniff_date

def rndt2dict(exml):
    """generate dict of properties from gmd:MD_Metadata (INSPIRE - RNDT)"""

    vals = {}
    keywords = []

    mdata = MD_Metadata(exml)

    # metadata 
    vals['uuid'] = mdata.identifier
    vals['md_language'] = mdata.languagecode
    vals['md_date'] = sniff_date(mdata.datestamp)

    vals['spatial_representation_type'] = mdata.hierarchy

    if hasattr(mdata, 'identification'):
        # 
        if len(mdata.identification.date) > 0:
            vals['date'] = sniff_date(mdata.identification.date[0].date)
            vals['date_type'] = get_datetype(mdata.identification.date[0].type)

        # ci sono problemi nei nella mappatura dei codici delle lingue es. grc e gree per il greco
        if len(mdata.identification.resourcelanguage) > 0:
            vals['language'] = mdata.identification.resourcelanguage[0]

        vals['title'] = mdata.identification.title
        vals['abstract'] = mdata.identification.abstract
        vals['purpose'] = mdata.identification.purpose
        if mdata.identification.supplementalinformation is not None:
            vals['supplemental_information'] = \
                mdata.identification.supplementalinformation

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

    if mdata.dataquality is not None:
        vals['data_quality_statement'] = mdata.dataquality.lineage

    return [vals, keywords]
