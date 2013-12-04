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
from django.db import models

from geonode.base.models import ResourceBase, ResourceBaseManager, Link, \
    resourcebase_post_save, resourcebase_post_delete

EXCLUDE = "bbox_x1, bbox_y0, bbox_y1, csw_typename, csw_schema, csw_mdsource, csw_insert_date, csw_type, csw_anytext, csw_wkt_geometry, metadata_uploaded, metadata_xml, thumbnail"

@property
def completeness(self):
    count = 0
    filled = 0
    for f in ResourceBase._meta.fields:
        if f.name not in EXCLUDE:
            count += 1
            if getattr(self, f.name):
                filled += 1
    for f in ResourceBase._meta.many_to_many:
        if f.name not in EXCLUDE:
            count += 1            
            if getattr(self, f.name).all().count() > 0:
                filled += 1
            
    perc = int(100.0 * (float(filled) / float(count)))
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



# class MetadataTemplate(ResourceBase):
#     """
#     MetadataTemplate (inherits ResourceBase fields)
#     """


#     def __str__(self):
#         return "%s Layer" % self.typename.encode('utf-8')


#     @property
#     def class_name(self):
#         return self.__class__.__name__
