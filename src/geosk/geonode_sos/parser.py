#########################################################################
#
# Copyright (C) 2022 OSGeo
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
import logging
import re
import xml.etree.ElementTree as ET
from typing import List, Optional
from urllib.parse import urlencode, urlparse
from geonode.base.bbox_utils import polygon_from_bbox
import requests
from django.contrib.gis.geos import GEOSGeometry
from owslib.namespaces import Namespaces
from osgeo import ogr, osr
logger = logging.getLogger(__name__)


class SOSParsingException(Exception):
    pass


def get_namespaces(version="v2"):
    n = Namespaces()
    ns = n.get_namespaces(["ogc", "om20", "sa", "sml", "swes", "xlink", "gml", "sams", "sf"])
    ns["gco"] = n.get_namespace("gco")
    ns["gmd"] = n.get_namespace("gmd")
    ns["ows"] = n.get_namespace("ows110")
    ns["sos"] = n.get_namespace("sos20")
    ns["swe"] = n.get_namespace("swe")
    ns["gml"] = "http://www.opengis.net/gml/3.2"
    if version == 'v2':
        ns["swe"] = n.get_namespace("swe20")
        ns["sml"] = "http://www.opengis.net/sensorml/2.0"
        ns["sams"] = "http://www.opengis.net/samplingSpatial/2.0"
        ns["sf"] = "http://www.opengis.net/sampling/2.0"
    return ns


namespaces = get_namespaces()


class DescribeSensorParser:
    """
    Parser to extract information from the DescribeSensor request of a SOS sensor
    input -> xml_content coming from the request
    """

    def __init__(
        self, xml_content: str, sos_service: str = None, procedure_id: str = None, version: str = "v2"
    ) -> None:
        self.gda = ET.fromstring(xml_content)
        self.sos_service = sos_service
        self.procedure_id = procedure_id
        self.ns = get_namespaces(version)
        self.version = version

    def is_valid(self):
        _exception = self.gda.find('.//ows:Exception', namespaces=namespaces)
        if _exception is not None:
            return False
        return True

    def get_id(self) -> str:
        identifiers_paths = [
            ".//sml:identifier/sml:Term[@definition='urn:ogc:def:identifier:OGC:uniqueID']//sml:value",
            ".//sml:identifier/sml:Term[@definition='urn:ogc:def:identifier:OGC:1.0:uniqueID']//sml:value",
            ".//gml:identifier[@codeSpace='uniqueID']",
            ".//sml:identifier[@name='uniqueID']//sml:value",
        ]
        startpath = self.gda.find(".//sml:IdentifierList", namespaces=self.ns)

        return self._extract_value(startpath, identifiers_paths)

    def get_short_name(self) -> str:
        title_paths = [
            "sml:identifier[@name='short name']//sml:value",
            ".//sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/shortName']//sml:value",
            ".//sml:identifier[@name='Short Name']//sml:value",
            ".//sml:identifier/sml:Term[@definition='urn:ogc:def:identifier:OGC:1.0:shortname']//sml:value",
            ".//sml:identifier/sml:Term[@definition='urn:ogc:def:identifier:OGC:1.0:shortName']//sml:value",
            ".//gml:name",
        ]
        startpath = self.gda.find("*//sml:IdentifierList", namespaces=self.ns)
        return self._extract_value(startpath, title_paths)

    def get_long_name(self) -> str:
        long_name_paths = [
            "sml:identifier[@name='long name']//sml:value",
            ".//sml:identifier/sml:Term[@definition='http://mmisw.org/ont/ioos/definition/longName']//sml:value",
            ".//sml:identifier[@name='Long Name']//sml:value",
            ".//sml:identifier/sml:Term[@definition='urn:ogc:def:identifier:OGC:1.0:longname']//sml:value",
            ".//sml:identifier/sml:Term[@definition='urn:ogc:def:identifier:OGC:1.0:longName']//sml:value",
            ".//gml:description",
        ]
        startpath = self.gda.find("*//sml:IdentifierList", namespaces=self.ns)
        return self._extract_value(startpath, long_name_paths)

    def get_offerings(self) -> Optional[List[dict]]:
        _path = (
            ".//sml:capabilities[@name='offerings']//sml:capability"
            if self.version == 'v2'
            else
            ".//sml:capabilities[@name='offerings']//swe:field"
        )
        offerings = self.gda.findall(_path, namespaces=self.ns)

        return [
            {
                "name": x.find("*//swe:label", namespaces=self.ns).text,
                "definition": x.find("swe:Text", namespaces=self.ns).attrib.get(
                    "definition"
                ),
                "value": x.find("*//swe:value", namespaces=self.ns).text,
            }
            for x in offerings
        ]

    def get_feature_of_interest(self) -> Optional[List[dict]]:
        query_params = {
            "service": "SOS",
            "version": "2.0.0",
            "request": "GetFeatureOfInterest",
            "procedure": f"{self.procedure_id}",
        }

        parsed_url = urlparse(self.sos_service)
        clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
        clean_url += "?" + urlencode(query_params)

        for _name, _value in self.ns.items():
            ET.register_namespace(_name, _value)

        feature_of_interest = ET.fromstring(
            requests.request("GET", clean_url).content
        )
        output = []
        for item in feature_of_interest.iterfind(
            ".//sams:SF_SpatialSamplingFeature", namespaces=self.ns
        ):
            name = item.find(".//gml:name", namespaces=self.ns)
            identifier = item.find(".//gml:identifier", namespaces=self.ns)
            _srs = item.find(".//gml:pos", namespaces=self.ns)
            description = item.find(".//gml:description", namespaces=self.ns)
            
            shape_blob = item.find(".//sams:shape", namespaces=self.ns)
            _srid = f'{_srs.attrib.get("srsName").split("/")[-3]}:{_srs.attrib.get("srsName").split("/")[-1]}'

            blob_as_string = ET.tostring(shape_blob).decode().replace("\n", "").replace("  ", "")

            # getting the Geometry from the XML with regex. only the GML tags are needed
            _gml = re.match(r".*?(<gml:.*)</sams.*", blob_as_string)

            foi_geometry = None
            if _gml is not None:
                # by defaul the coordinates are inverted, we need to flip them again
                _srid_as_int = int(_srs.attrib.get("srsName").split("/")[-1])

                source = osr.SpatialReference()
                source.ImportFromEPSG(_srid_as_int)
                
                target = osr.SpatialReference()
                target.ImportFromEPSG(_srid_as_int)

                target.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
                transform = osr.CoordinateTransformation(source, target)

                geometry = GEOSGeometry.from_gml(_gml.groups()[0])
                inverted = ogr.CreateGeometryFromWkt(geometry.wkt)
                inverted.Transform(transform)
                
                foi_geometry = polygon_from_bbox(GEOSGeometry.from_ewkt(inverted.ExportToWkt()).extent)
            else:
                logger.error(f"Geometry not found for {self.procedure_id}")

            try:
                output.append(
                    {
                        "name": name.text,
                        "identifier": None if identifier is None else identifier.text,
                        "codespace": name.attrib.get("codeSpace"),
                        "feature_type": item.find(
                            ".//sf:type", namespaces=self.ns
                        ).attrib.get("{http://www.w3.org/1999/xlink}href", None),
                        "feature_id": item.attrib.get(
                            "{http://www.opengis.net/gml/3.2}id"
                        ),
                        "sampled_feature": item.find(
                            ".//sf:sampledFeature", namespaces=self.ns
                        ).attrib.get("{http://www.w3.org/1999/xlink}href", None),
                        "geometry": foi_geometry,
                        "srs_name": _srid,
                        "description": description.text if description is not None else None,
                        "shape_blob": blob_as_string

                    }
                )
            except Exception as e:
                continue
        return output

    def get_bbox(self) -> str:
        observedBBOX = self.gda.findall(
            "*//sml:position//swe:coordinate//swe:value",
            namespaces=self.ns,
        )

        if observedBBOX:
            return (
                observedBBOX[1].text,
                observedBBOX[0].text,
                observedBBOX[1].text,
                observedBBOX[0].text,
            )
        return None

    def get_srs(self) -> str:
        srs = self.gda.find(
            ".//sml:position/swe:Vector[@referenceFrame]",
            namespaces=self.ns,
        )
        if srs is not None:
            return srs.attrib.get("referenceFrame")\
                .split("urn:ogc:def:crs:")[1]\
                .replace("::", ":")

        return "EPSG:4326"

    def get_extra_metadata(self) -> str:
        extra = []
        for output in self.gda.iterfind(
            ".//sml:OutputList/sml:output", namespaces=self.ns
        ):
            check = output.find(
                ".//swe:Quantity", namespaces=self.ns
            ) or output.find(".//swe:Time", namespaces=self.ns)
            if check is not None:
                extra.append(
                    {
                        "filter_header": "Observable Properties",
                        "field_name": "observable_property",
                        "field_label": output.attrib.get("name"),
                        "field_value": output.attrib.get("name"),
                        "definition": check.attrib.get("definition"),
                        "uom": check.find(
                            ".//swe:uom", namespaces=self.ns
                        ).attrib.get("code", ""),
                    }
                )
        return extra

    def get_sensor_responsible(self) -> str:
        extra = []
        for output in self.gda.iterfind(
            ".//sml:ContactList//sml:contact", namespaces=self.ns
        ):
            arcrole = output.attrib.get('{http://www.w3.org/1999/xlink}arcrole')
            extra.append(
                {
                    "name": self._extract_value(output, ['.//gmd:organisationName//gco:CharacterString']),
                    "phone": self._extract_value(output, ['.//gmd:voice//gco:CharacterString']),
                    "delivery_point": self._extract_value(output, ['.//gmd:deliveryPoint//gco:CharacterString']),
                    "city": self._extract_value(output, ['.//gmd:city//gco:CharacterString']),
                    "administrative_area": self._extract_value(output, ['.//gmd:administrativeArea//gco:CharacterString'], raise_exep=False),
                    "postal_code": self._extract_value(output, ['.//gmd:postalCode//gco:CharacterString'], raise_exep=False),
                    "country": self._extract_value(output, ['.//gmd:country//gco:CharacterString']),
                    "mail": self._extract_value(output, ['.//gmd:electronicMailAddress//gco:CharacterString']),
                    "online_resource": self._extract_value(output, ['.//gmd:onlineResource//gmd:URL//gco:CharacterString'], raise_exep=False),
                    "arcrole": arcrole,
                    "role": self._extract_value(output,[ ".//gmd:role//gmd:CI_RoleCode"], raise_exep=False),
                    "extracted_arcrole": arcrole.split("/")[-1]
                }
            )
        return extra

    def _extract_value(self, starting_path, search_path, raise_exep=True):
        for _id_path in search_path:
            _id = starting_path.find(_id_path, namespaces=self.ns)
            if _id is not None:
                return _id.text

        if not raise_exep:
            return None

        raise SOSParsingException(
            "No value found in path with the available identifiers path"
        )
