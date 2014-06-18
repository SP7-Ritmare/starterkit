# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2013 Stefano Menegon
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################
from datetime import datetime
# from rdflib import Graph, Literal, BNode, Namespace, RDF, URIRef
# from rdflib.namespace import  Namespace, DC, FOAF

from django.db import models
from django.forms import model_to_dict
from annoying.fields import AutoOneToOneField
from django.utils.translation import ugettext, ugettext_lazy as _

from geonode.base.models import ResourceBase, ResourceBaseManager, Link, \
    resourcebase_post_save, resourcebase_post_delete

from geonode.people.models import Profile, Role

from geonode.base.enumerations import ALL_LANGUAGES, \
    HIERARCHY_LEVELS, UPDATE_FREQUENCIES, \
    DEFAULT_SUPPLEMENTAL_INFORMATION, LINK_TYPES

from geonode.layers.models import Layer


def model_to_rdf(self):
    return ''

Layer.to_rdf = model_to_rdf

SCOPE_VALUES = (
    ('md_contact', _('Metadata responsible party')),
    ('citation_contact', _('Responsible party')),
    ('identification_contact', _('Point of contact')),
    ('distributor_contact', _('Distributor'))
    )


class ResponsiblePartyScope(models.Model):
    value = models.CharField(_('Scope'), max_length=100, choices=SCOPE_VALUES, unique=True)
    def __unicode__(self):
        return self.get_value_display()


class MultiContactRole(models.Model):
    resource = models.ForeignKey('MdExtension')
    contact  = models.ForeignKey(Profile)
    role     = models.ForeignKey(Role)
    scope    = models.ForeignKey(ResponsiblePartyScope)


class MdExtension(models.Model):
    resource     = AutoOneToOneField(ResourceBase, primary_key=True)
    elements_xml = models.TextField(null=True, blank=True)
    rndt_xml     = models.TextField(null=True, blank=True)
    fileid       = models.IntegerField(null=True, blank=True)

    md_language  = models.CharField(_('language'), max_length=3, choices=ALL_LANGUAGES, default='ita', help_text=_('language used for metadata'))
    md_date      = models.DateTimeField(_('metadata date'), default = datetime.now, help_text=_('metadata date'))

    contacts     = models.ManyToManyField(Profile, through='MultiContactRole')    
    

    @property
    def rndt_xml_clean(self):
        if self.rndt_xml and self.rndt_xml !='':
            return self.rndt_xml.replace('<?xml version="1.0" encoding="UTF-8"?>','')
        return None

@property
def completeness(self):
    # EXCLUDE = "bbox_x1, bbox_y0, bbox_y1, csw_typename, csw_schema, csw_mdsource, csw_insert_date, csw_type, csw_anytext, csw_wkt_geometry, metadata_uploaded, metadata_xml, thumbnail"
    # INCLUDE = ['title', 'abstract', 'date', 'date_type', 'keywords', 'language','category', 'supplemental_information','distribution_url','distribution_description','data_quality_statement']
    # count = 0
    # filled = 0
    # for f in ResourceBase._meta.fields:
    #     if f.name in INCLUDE:
    #         count += 1
    #         if getattr(self, f.name):
    #             filled += 1
    # for f in ResourceBase._meta.many_to_many:
    #     if f.name in INCLUDE:
    #         count += 1            
    #         if getattr(self, f.name).all().count() > 0:
    #             filled += 1
    # perc = int(100.0 * (float(filled) / float(count)))

    count = 100
    
    if self.mdextension.rndt_xml is not None:
        perc = 100
        filled = 100
    else:
        perc = 60
        filled = 60
    mdclass = 'danger'
    if perc > 75:
        mdclass = 'warning'
    if perc > 90:
        mdclass = 'success'
    return  {
        'count': count,
        'filled': filled,
        'perc': perc,
        'class': mdclass
        }


ResourceBase.completeness = completeness



class ServicesMetadata(models.Model):
    """Model for storing Metadata about services
       (CS-W, WMS, WFS, WCS)
    """
    node_name                      = models.CharField(_('node name'), max_length=200, help_text=_("shorter than the title: e.g. acronym. This field is required"), default="Starter Kit")
    node_title                     = models.CharField(_('node title'), max_length=200, help_text=_("This field is required"))
    node_abstract                  = models.TextField(_('node abastract'), null=True, blank=True)
    node_keywords                  = models.CharField(_('keywords'), max_length=200, null=True, blank=True)

    provider_name                  = models.CharField(_('organization name'), max_length=200, help_text=_("This field is required"))
    provider_url                   = models.URLField(_('provider url'), max_length=200, null=True, blank=True)
    contact_name                   = models.CharField(_('contact name'), max_length=200, help_text=_("This field is required"))
    contact_position               = models.CharField(_('contact position'), max_length=200, null=True, blank=True)
    contact_email                  = models.EmailField(_('contact email'), help_text=_("This field is required"))
    contact_url                    = models.URLField(_('contact url'), max_length=200, null=True, blank=True)
    contact_address                = models.CharField(_('contact address'), max_length=200, null=True, blank=True)
    contact_city                   = models.CharField(_('contact city'), max_length=200, null=True, blank=True)
    contact_stateprovince          = models.CharField(_('contact state or province'), max_length=200, null=True, blank=True)
    contact_postalcode             = models.CharField(_('contact postalcode'), max_length=200, null=True, blank=True)
    contact_country                = models.CharField(_('contact country'), max_length=200, null=True, blank=True)
    contact_phone                  = models.CharField(_('contact phone'), max_length=200, null=True, blank=True)
    contact_fax                    = models.CharField(_('contact fax'), max_length=200, null=True, blank=True)
    contact_hours                  = models.CharField(_('contact hours'), max_length=200, help_text="Hours of Service", null=True, blank=True)
    contact_instructions           = models.CharField(_('contact instructions'), max_length=200, help_text='During hours of service', null=True, blank=True)
    contact_role                   = models.CharField(_('contact role'), max_length=200, null=True, blank=True, default="pointOfContact")
    class Meta:
        verbose_name_plural = _("Services metadata")

    def __unicode__(self):
        return "%s - %s - %s" % (self.node_name, self.provider_name, self.contact_name)
