from owslib.namespaces import Namespaces
from owslib.etree import etree
from owslib.util import openURL, testXMLValue, nspath_eval, xmltag_split, dict_union, extract_xml_list

nsmap = Namespaces().get_namespaces()

def SOSElement(tag, nsmap=nsmap):
    t = etree.QName(nsmap['sos'], tag)
    return etree.Element(t, nsmap=nsmap)

def OMElement(tag, nsmap=nsmap):
    t = etree.QName(nsmap['om'], tag)
    return etree.Element(t, nsmap=nsmap)


def SWEElement(tag, nsmap=nsmap):
    t = etree.QName(nsmap['swe'], tag)
    return etree.Element(t, nsmap=nsmap)


def GMLElement(tag, nsmap=nsmap):
    t = etree.QName(nsmap['gml'], tag)
    return etree.Element(t, nsmap=nsmap)


