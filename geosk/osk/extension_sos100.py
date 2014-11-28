import cgi
from urllib import urlencode
from owslib.util import openURL, testXMLValue, nspath_eval, xmltag_split, dict_union, extract_xml_list

def get_observable_by_procedure(self, procedure):
    observable_properties = set([])
    for item in self.offerings:
        if procedure in item.procedures:
            observable_properties.update(item.observed_properties)
    return list(observable_properties)


def capabilities_url(self, service_url):
    """
        Return a capabilities url
    """
    qs = []
    if service_url.find('?') != -1:
        qs = cgi.parse_qsl(service_url.split('?')[1])

    params = [x[0] for x in qs]

    if 'service' not in params:
        qs.append(('service', 'SOS'))
    if 'request' not in params:
        qs.append(('request', 'GetCapabilities'))
    # if 'version' not in params:
    #    qs.append(('version', self.version))

    urlqs = urlencode(tuple(qs))
    return service_url.split('?')[0] + '?' + urlqs



def describe_sensor(self, outputFormat=None,
                          procedure=None,
                          method='Post',
                          raw=False,
                          **kwargs):

    try:
        base_url = self.get_operation_by_name('DescribeSensor').methods[method]['url']        
    except:
        base_url = self.url
    
    ds = DescribeSensorRequest(procedure)
    data = ds.xml()

    response = openURL(base_url, data, method, username=self.username, password=self.password).read()
    # BUG nel server SOS Ve ISMAR
    # response.replace('sml:system', 'sml:System')
    tr = etree.fromstring(response)

    if tr.tag == nspath_eval("ows:ExceptionReport", namespaces):
        raise ows.ExceptionReport(tr)

    if raw:
        return response
    else:
        return SosDescribeSensorResponse(tr)


from owslib.namespaces import Namespaces
namespaces = Namespaces().get_namespaces()
from owslib.swe.sensor.sml import SensorML

from extension_sos_utils import *

class SosDescribeSensorResponse(object):
    def __init__(self, element, nsmap=nsmap):
        self._root = element
        # self.procedure_description_format = testXMLValue(self._root.find(nspath_eval('swes:procedureDescriptionFormat', nsmap)))
        # sensor_ml = SensorML(self._root.find(nspath_eval('sml:SensorML', nsmap)))
        self.sensor_ml = SensorML(element)
        if hasattr(self.sensor_ml, 'systems') and self.sensor_ml.systems:
            self.sensor = self.sensor_ml.systems[0]
            self.id = self.sensor.identifiers['uniqueID'].value
            self.name = self.sensor.identifiers['longName'].value

    def __str__(self):
        return 'Sensor id: %s, name: %s' % (self.id, self.name)


class DescribeSensorRequest:
    def __init__(self, procedure):
        self.procedure = procedure
        root = SOSElement('DescribeSensor', nsmap=namespaces)
        attrs = {
            'service' : 'SOS',
            'version' : '1.0.0',
            'outputFormat': 'text/xml;subtype="sensorML/1.0.1"',
            }
        for k, v in attrs.items():
            root.attrib[k] = v

        p = SOSElement('procedure', nsmap=namespaces)
        p.text = procedure
        root.append(p)
        self._doc = root

    def xml(self, pretty_print = False):
        return etree.tostring(self._doc)

        
        
# def get_namespaces():
#     n = Namespaces()
#     ns = n.get_namespaces(["ogc","sml","gml","sos","swe","xlink"])
#     ns["ows"] = n.get_namespace("ows110")
#     return ns
# namespaces = get_namespaces()


# <?xml version="1.0" encoding="UTF-8"?>
# <DescribeSensor version="1.0.0" service="SOS"
#   xmlns="http://www.opengis.net/sos/1.0"
#   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
#   xsi:schemaLocation="http://www.opengis.net/sos/1.0
#   http://schemas.opengis.net/sos/1.0.0/sosDescribeSensor.xsd"
#   outputFormat="text/xml;subtype=&quot;sensorML/1.0.1&quot;">
  
#   <procedure>urn:ogc:object:feature:Sensor:IFGI:ifgi-sensor-1</procedure>
  
# </DescribeSensor>
