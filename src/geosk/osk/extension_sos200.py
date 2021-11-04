import json

from urllib.parse import urlencode
from owslib.etree import etree
from owslib.namespaces import Namespaces
from owslib.util import openURL, testXMLValue, nspath_eval, xmltag_split, dict_union, extract_xml_list
from owslib.swe.sensor.sml import SensorML
from owslib import ows

from . import extension_sos_utils


def get_feature_of_interest_json(self,
                                 featureOfInterest=None,
                                 observedProperty=None,
                                 procedure=None,
                                 method='Post',
                                 **kwargs
                                 ):
    base_url = 'http://sp7.irea.cnr.it/tomcat/MareeVe/sos/json'
    request = {
        'service': 'SOS',
        'version': self.version,
        'request': 'GetFeatureOfInterest'
    }
    if featureOfInterest is not None:
        request['featureOfInterest'] = featureOfInterest

    if observedProperty is not None:
        request['observedProperty'] = observedProperty

    if procedure is not None:
        request['procedure'] = procedure

    if kwargs:
        for kw in kwargs:
            request[kw] = kwargs[kw]

    data = json.dumps(request)

    response = openURL(base_url, data, method, username=self.username, password=self.password).read()
    return json.loads(response)


def insert_observation_json(self,
                            time,
                            value,
                            offering=None,
                            procedure=None,
                            observedProperty=None,
                            featureOfInterest=None,
                            method='Post',
                            **kwargs):

    _foi = self.get_feature_of_interest_json(featureOfInterest=featureOfInterest,
                                             observedProperty=observedProperty,
                                             procedure=procedure
                                             )
    if len(_foi['featureOfInterest']) != 1:
        raise Exception("Foi not found")

    foi = _foi['featureOfInterest'][0]

    base_url = 'http://sp7.irea.cnr.it/tomcat/MareeVe/sos/json'
    request = {
        'service': 'SOS',
        'version': self.version,
        'request': 'InsertObservation',
        "offering": offering,
        "observation": {
            "identifier": {
                "value": "http://www.52north.org/test/observation/9",
                "codespace": "http://www.opengis.net/def/nil/OGC/0/unknown"
            },
            "type": "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement",
            "procedure": procedure,
            "observedProperty": observedProperty,
            "featureOfInterest": foi,
            "phenomenonTime": time,
            "resultTime": time,
            "result": {
                "uom": "test_unit_6",
                "value": value
            }
        }
    }

    if kwargs:
        for kw in kwargs:
            request[kw] = kwargs[kw]

    # return request

    data = json.dumps(request)

    # print data

    response = openURL(base_url, data, method, username=self.username, password=self.password).read()
    return response


def get_result_template(self,
                        offering=None,
                        observedProperty=None,
                        method='Post',
                        **kwargs):

    base_url = 'http://sp7.irea.cnr.it/tomcat/MareeVe/sos/json'
    request = {'service': 'SOS',
               'version': self.version,
               'request': 'GetResultTemplate'}
    request['offering'] = offering
    request['observedProperty'] = observedProperty

    if kwargs:
        for kw in kwargs:
            request[kw] = kwargs[kw]

    data = json.dumps(request)
    response = openURL(base_url, data, method, username=self.username, password=self.password).read()
    return response


def get_namespaces():
    n = Namespaces()
    ns = n.get_namespaces(["fes", "ogc", "om", "gml32", "sml", "swe20", "swes", "xlink"])
    ns["ows"] = n.get_namespace("ows110")
    ns["sos"] = n.get_namespace("sos20")
    return ns


namespaces = get_namespaces()


def describe_sensor(self, outputFormat=None,
                    procedure=None,
                    method='Get',
                    raw=False,
                    **kwargs):

    try:
        base_url = self.get_operation_by_name('DescribeSensor').methods[method]['url']
    except BaseException:
        base_url = self.url
    request = {'service': 'SOS', 'version': self.version, 'request': 'DescribeSensor'}

    # Required Fields
    assert isinstance(outputFormat, str)
    request['procedureDescriptionFormat'] = outputFormat

    assert isinstance(procedure, str)
    request['procedure'] = procedure

    # Optional Fields
    if kwargs:
        for kw in kwargs:
            request[kw] = kwargs[kw]

    data = urlencode(request)

    response = openURL(base_url, data, method, username=self.username, password=self.password).read()
    tr = etree.fromstring(response)

    if tr.tag == nspath_eval("ows:ExceptionReport", namespaces):
        raise ows.ExceptionReport(tr)

    if raw:
        return response
    else:
        return SosDescribeSensorResponse(tr, namespaces)


class SosDescribeSensorResponse:
    def __init__(self, element, nsmap=extension_sos_utils.nsmap):
        self._root = element
        element = element.find(f".//{nspath_eval('sml:SensorML', nsmap)}")
        self.sensor_ml = SensorML(element)
        if hasattr(self.sensor_ml, 'systems') and self.sensor_ml.systems:
            self.sensor = self.sensor_ml.systems[0]
            self.id = self.sensor.identifiers['uniqueID'].value
            self.name = self.sensor.identifiers['longName'].value

    def __str__(self):
        return f'Sensor id: {self.id}, name: {self.name}'


class DescribeSensorRequest:
    def __init__(self, procedure):
        self.procedure = procedure
        root = extension_sos_utils.SOSElement('DescribeSensor', nsmap=namespaces)
        attrs = {
            'service': 'SOS',
            'version': '1.0.0',
            'outputFormat': 'text/xml;subtype="sensorML/1.0.1"',
        }
        for k, v in attrs.items():
            root.attrib[k] = v

        p = extension_sos_utils.SOSElement('procedure', nsmap=namespaces)
        p.text = procedure
        root.append(p)
        self._doc = root

    def xml(self, pretty_print=False):
        return etree.tostring(self._doc)


def get_feature_of_interest(self,
                            foi=None,
                            method='Get',
                            **kwargs):

    try:
        base_url = self.get_operation_by_name('GetFeatureOfInterest').methods[method]['url']
    except BaseException:
        base_url = self.url
    request = {'service': 'SOS', 'version': self.version, 'request': 'GetFeatureOfInterest'}

    # Required Fields
    assert isinstance(foi, str)
    request['featureOfInterest'] = foi

    # Optional Fields
    if kwargs:
        for kw in kwargs:
            request[kw] = kwargs[kw]

    data = urlencode(request)

    response = openURL(base_url, data, method, username=self.username, password=self.password).read()
    tr = etree.fromstring(response)

    if tr.tag == nspath_eval("ows:ExceptionReport", namespaces):
        raise ows.ExceptionReport(tr)

    return tr


def get_observable_by_procedure(self, procedure):
    observable_properties = set()
    for item in self.offerings:
        if procedure in item.procedures:
            observable_properties.update(item.observed_properties)
    return list(observable_properties)


def get_namespaces_io():
    n = Namespaces()
    ns = n.get_namespaces(["ogc", "swes", "sml", "xlink", "xsi"])
    ns["ows"] = n.get_namespace("ows110")
    ns["sos"] = n.get_namespace("sos20")
    ns["gml"] = n.get_namespace("gml32")
    ns["om"] = n.get_namespace("om20")
    ns['swe'] = 'http://www.opengis.net/swe/2.0'
    ns["sams"] = "http://www.opengis.net/samplingSpatial/2.0"
    ns["sf"] = "http://www.opengis.net/sampling/2.0"
    return ns


namespaces_io = get_namespaces_io()


class SosInsertObservation:
    def __init__(self, obs_):
        self._obs = obs_

    def _getRootElement(self):
        root = extension_sos_utils.SOSElement('InsertObservation', nsmap=namespaces_io)
        attrs = {
            'service': self._obs['service'],
            'version': '2.0.0',
        }
        for k, v in attrs.items():
            root.attrib[k] = v
        return root

    def _getObservationElement(self):
        obs = extension_sos_utils.SOSElement(
            'observation', nsmap=namespaces_io)

        om_observation = extension_sos_utils.OMElement(
            'OM_Observation', nsmap=namespaces_io)
        om_observation.attrib[f"{'{%s}' % namespaces_io['gml']}id"] = "o1"

        om_type = extension_sos_utils.OMElement('type', nsmap=namespaces_io)
        om_type.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_SWEArrayObservation"

        procedureElement = extension_sos_utils.OMElement(
            'procedure', nsmap=namespaces_io)
        procedureElement.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = self._obs['sensor_id']

        observedPropertyElement = extension_sos_utils.OMElement(
            'observedProperty', nsmap=namespaces_io)
        observedPropertyElement.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = self._obs['observedProperty']

        foi = extension_sos_utils.OMElement(
            'featureOfInterest', nsmap=namespaces_io)
        foi.append(self._obs['foi'])

        om_observation.append(om_type)
        om_observation.append(self._getPhenomenonTimeElement())
        om_observation.append(self._getResultTimeElement())
        om_observation.append(procedureElement)
        om_observation.append(observedPropertyElement)
        om_observation.append(foi)
        om_observation.append(self._getResultElement())

        obs.append(om_observation)
        return obs

    def _getResultElement(self):
        result = extension_sos_utils.OMElement('result', nsmap=namespaces_io)
        result.attrib[f"{'{%s}' % namespaces_io['xsi']}type"] = 'swe:DataArrayPropertyType'

        array = extension_sos_utils.SWEElement(
            'DataArray', nsmap=namespaces_io)
        element_count = extension_sos_utils.SWEElement(
            'elementCount', nsmap=namespaces_io)
        count = extension_sos_utils.SWEElement('Count', nsmap=namespaces_io)
        value = extension_sos_utils.SWEElement('value', nsmap=namespaces_io)
        value.text = self._obs['count']

        element_type = extension_sos_utils.SWEElement(
            'elementType', nsmap=namespaces_io)
        element_type.attrib['name'] = 'defs'
        data_record = extension_sos_utils.SWEElement(
            'DataRecord', nsmap=namespaces_io)
        field = extension_sos_utils.SWEElement('field', nsmap=namespaces_io)
        field.attrib['name'] = 'phenomenonTime'
        time = extension_sos_utils.SWEElement('Time', nsmap=namespaces_io)
        time.attrib['definition'] = 'http://www.opengis.net/def/property/OGC/0/PhenomenonTime'
        uom = extension_sos_utils.SWEElement('uom', nsmap=namespaces_io)
        uom.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian'

        field2 = extension_sos_utils.SWEElement('field', nsmap=namespaces_io)
        field2.attrib['name'] = 'observable_property'
        quantity = extension_sos_utils.SWEElement(
            'Quantity', nsmap=namespaces_io)
        quantity.attrib['definition'] = 'http://www.52north.org/test/observableProperty/6'

        uom2 = extension_sos_utils.SWEElement('uom', nsmap=namespaces_io)
        uom2.attrib['code'] = 'test_unit_6'  # TODO: verificare

        encoding = extension_sos_utils.SWEElement(
            'encoding', nsmap=namespaces_io)
        text_encoding = extension_sos_utils.SWEElement(
            'TextEncoding', nsmap=namespaces_io)
        text_encoding.attrib['tokenSeparator'] = '#'
        text_encoding.attrib['blockSeparator'] = '@'

        values = extension_sos_utils.SWEElement('values', nsmap=namespaces_io)
        tokenSeparator = '#'
        blockSeparator = '@'
        first = True
        values.text = blockSeparator.join(tokenSeparator.join(str(b) for b in t) for t in self._obs['values'])
        # for v in self._obs['values']:
        #     if not first:
        #         values_text += 'blockSeparator'
        #         first = False
        #     print values_text
        #     values_text += tokenSeparator.join()

        count.append(value)
        element_count.append(count)

        time.append(uom)

        field.append(time)

        quantity.append(uom2)

        field2.append(quantity)

        data_record.append(field)
        data_record.append(field2)

        element_type.append(data_record)

        encoding.append(text_encoding)

        array.append(element_count)
        array.append(element_type)
        array.append(encoding)
        array.append(values)

        result.append(array)
        return result

    def _getPhenomenonTimeElement(self):
        st = extension_sos_utils.OMElement('phenomenonTime', nsmap=namespaces_io)
        tp = extension_sos_utils.GMLElement('TimePeriod', nsmap=namespaces_io)
        tp.attrib[f"{'{%s}' % namespaces_io['gml']}id"] = "phenomenonTime"

        begin = extension_sos_utils.GMLElement('beginPosition', nsmap=namespaces_io)
        begin.text = self._obs['begin']
        end = extension_sos_utils.GMLElement(
            'endPosition', nsmap=namespaces_io)
        end.text = self._obs['end']

        tp.append(begin)
        tp.append(end)
        st.append(tp)

        return st

    def _getResultTimeElement(self):
        rt = extension_sos_utils.OMElement('resultTime', nsmap=namespaces_io)
        ti = extension_sos_utils.GMLElement('TimeInstant', nsmap=namespaces_io)
        ti.attrib[f"{'{%s}' % namespaces_io['gml']}id"] = "resultTime"

        tp = extension_sos_utils.GMLElement(
            'timePosition', nsmap=namespaces_io)
        tp.text = self._obs['timePosition']

        ti.append(tp)

        rt.append(ti)

        return rt

    def xml(self):
        io_doc_tree = self._getRootElement()

        offering = extension_sos_utils.SOSElement(
            'offering', nsmap=namespaces_io)
        offering.text = self._obs['offering']

        io_doc_tree.append(offering)

        io_doc_tree.append(self._getObservationElement())

        # wmc_doc_tree.append(self._getLayerListElement())
        return etree.tostring(io_doc_tree, pretty_print=True)


def get_namespaces_io100():
    n = Namespaces()
    ns = n.get_namespaces(["ogc", "swes", "sml", "xlink", "xsi"])
    ns["ows"] = n.get_namespace("ows110")
    ns["sos"] = n.get_namespace("sos20")
    ns["gml"] = n.get_namespace("gml32")
    ns["om"] = n.get_namespace("om20")
    ns['swe'] = 'http://www.opengis.net/swe/2.0'
    ns["sams"] = "http://www.opengis.net/samplingSpatial/2.0"
    ns["sf"] = "http://www.opengis.net/sampling/2.0"
    return ns


namespaces_io100 = get_namespaces_io100()


class SosInsertObservation100:
    def __init__(self, obs_):
        self._obs = obs_

    def _getRootElement(self):
        root = extension_sos_utils.SOSElement('InsertObservation', nsmap=namespaces_io)
        attrs = {
            'service': self._obs['service'],
            'version': '2.0.0',
        }
        for k, v in attrs.items():
            root.attrib[k] = v
        return root

    def _getObservationElement(self):
        obs = extension_sos_utils.SOSElement(
            'observation', nsmap=namespaces_io)

        om_observation = extension_sos_utils.OMElement(
            'OM_Observation', nsmap=namespaces_io)
        om_observation.attrib[f"{'{%s}' % namespaces_io['gml']}id"] = "o1"

        om_type = extension_sos_utils.OMElement('type', nsmap=namespaces_io)
        om_type.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_SWEArrayObservation"

        procedureElement = extension_sos_utils.OMElement(
            'procedure', nsmap=namespaces_io)
        procedureElement.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = self._obs['sensor_id']

        observedPropertyElement = extension_sos_utils.OMElement(
            'observedProperty', nsmap=namespaces_io)
        observedPropertyElement.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = self._obs['observedProperty']

        foi = extension_sos_utils.OMElement(
            'featureOfInterest', nsmap=namespaces_io)
        foi.append(self._obs['foi'])

        om_observation.append(om_type)
        om_observation.append(self._getPhenomenonTimeElement())
        om_observation.append(self._getResultTimeElement())
        om_observation.append(procedureElement)
        om_observation.append(observedPropertyElement)
        om_observation.append(foi)
        om_observation.append(self._getResultElement())

        obs.append(om_observation)
        return obs

    def _getResultElement(self):
        result = extension_sos_utils.OMElement('result', nsmap=namespaces_io)
        result.attrib[f"{'{%s}' % namespaces_io['xsi']}type"] = 'swe:DataArrayPropertyType'

        array = extension_sos_utils.SWEElement('DataArray', nsmap=namespaces_io)
        element_count = extension_sos_utils.SWEElement('elementCount')
        count = extension_sos_utils.SWEElement('Count', nsmap=namespaces_io)
        value = extension_sos_utils.SWEElement('value', nsmap=namespaces_io)
        value.text = self._obs['count']

        element_type = extension_sos_utils.SWEElement('elementType', nsmap=namespaces_io)
        element_type.attrib['name'] = 'defs'
        data_record = extension_sos_utils.SWEElement('DataRecord', nsmap=namespaces_io)
        field = extension_sos_utils.SWEElement('field', nsmap=namespaces_io)
        field.attrib['name'] = 'phenomenonTime'
        time = extension_sos_utils.SWEElement('Time', nsmap=namespaces_io)
        time.attrib['definition'] = 'http://www.opengis.net/def/property/OGC/0/PhenomenonTime'
        uom = extension_sos_utils.SWEElement('uom', nsmap=namespaces_io)
        uom.attrib[f"{'{%s}' % namespaces_io['xlink']}href"] = 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian'

        field2 = extension_sos_utils.SWEElement('field', nsmap=namespaces_io)
        field2.attrib['name'] = 'observable_property'
        quantity = extension_sos_utils.SWEElement(
            'Quantity', nsmap=namespaces_io)
        quantity.attrib['definition'] = 'http://www.52north.org/test/observableProperty/6'

        uom2 = extension_sos_utils.SWEElement('uom', nsmap=namespaces_io)
        uom2.attrib['code'] = 'test_unit_6'  # TODO: verificare

        encoding = extension_sos_utils.SWEElement(
            'encoding', nsmap=namespaces_io)
        text_encoding = extension_sos_utils.SWEElement(
            'TextEncoding', nsmap=namespaces_io)
        text_encoding.attrib['tokenSeparator'] = '#'
        text_encoding.attrib['blockSeparator'] = '@'

        values = extension_sos_utils.SWEElement('values', nsmap=namespaces_io)
        tokenSeparator = '#'
        blockSeparator = '@'
        first = True
        values.text = blockSeparator.join(tokenSeparator.join(str(b) for b in t) for t in self._obs['values'])
        # for v in self._obs['values']:
        #     if not first:
        #         values_text += 'blockSeparator'
        #         first = False
        #     print values_text
        #     values_text += tokenSeparator.join()

        count.append(value)
        element_count.append(count)

        time.append(uom)

        field.append(time)

        quantity.append(uom2)

        field2.append(quantity)

        data_record.append(field)
        data_record.append(field2)

        element_type.append(data_record)

        encoding.append(text_encoding)

        array.append(element_count)
        array.append(element_type)
        array.append(encoding)
        array.append(values)

        result.append(array)
        return result

    def _getPhenomenonTimeElement(self):
        st = extension_sos_utils.OMElement('phenomenonTime', nsmap=namespaces_io)
        tp = extension_sos_utils.GMLElement('TimePeriod', nsmap=namespaces_io)
        tp.attrib[f"{'{%s}' % namespaces_io['gml']}id"] = "phenomenonTime"

        begin = extension_sos_utils.GMLElement(
            'beginPosition', nsmap=namespaces_io)
        begin.text = self._obs['begin']
        end = extension_sos_utils.GMLElement(
            'endPosition', nsmap=namespaces_io)
        end.text = self._obs['end']

        tp.append(begin)
        tp.append(end)
        st.append(tp)

        return st

    def _getResultTimeElement(self):
        rt = extension_sos_utils.OMElement('resultTime', nsmap=namespaces_io)
        ti = extension_sos_utils.GMLElement('TimeInstant', nsmap=namespaces_io)
        ti.attrib[f"{'{%s}' % namespaces_io['gml']}id"] = "resultTime"

        tp = extension_sos_utils.GMLElement(
            'timePosition', nsmap=namespaces_io)
        tp.text = self._obs['timePosition']

        ti.append(tp)

        rt.append(ti)

        return rt

    def xml(self):
        io_doc_tree = self._getRootElement()

        offering = extension_sos_utils.SOSElement(
            'offering', nsmap=namespaces_io)
        offering.text = self._obs['offering']

        io_doc_tree.append(offering)

        io_doc_tree.append(self._getObservationElement())

        # wmc_doc_tree.append(self._getLayerListElement())
        return etree.tostring(io_doc_tree, pretty_print=True)
