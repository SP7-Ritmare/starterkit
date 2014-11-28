from datetime import datetime, timedelta
import cgi
from urllib import urlencode
from xml.etree.ElementTree import XML

from django.conf import settings

from . import utils

# override method to SOS 52North compatibility (remove version)

from owslib.sos import SensorObservationService


# extend SOS 1.0.0
from . import extension_sos100
from owslib.swe.observation.sos100 import SosCapabilitiesReader
from owslib.swe.observation.sos100 import SensorObservationService_1_0_0
SosCapabilitiesReader.capabilities_url = extension_sos100.capabilities_url
SensorObservationService_1_0_0.get_observable_by_procedure = extension_sos100.get_observable_by_procedure
SensorObservationService_1_0_0.describe_sensor = extension_sos100.describe_sensor

# extend SOS 2.0.0
from . import extension_sos200
from owslib.swe.observation.sos200 import SensorObservationService_2_0_0
SensorObservationService_2_0_0.describe_sensor = extension_sos200.describe_sensor
SensorObservationService_2_0_0.get_feature_of_interest = extension_sos200.get_feature_of_interest
SensorObservationService_2_0_0.get_observable_by_procedure = extension_sos200.get_observable_by_procedure
SensorObservationService_2_0_0.get_result_template = extension_sos200.get_result_template
SensorObservationService_2_0_0.get_feature_of_interest_json = extension_sos200.get_feature_of_interest_json
SensorObservationService_2_0_0.insert_observation_json = extension_sos200.insert_observation_json



class Catalog(object):
    def __init__(self, service_url, username="observations", password="observations", version='2.0.0'):
        self.service_url = service_url
        self.username = username
        self.password = password
        self._cache = dict()
        self.version = version 

    def get_capabilities_url(self):
        return extension_sos100.capabilities_url(None, self.service_url)

    def get_capabilities(self):
        cap = self.get_cache('capabilities')
        if not cap:
            self.sos_service = SensorObservationService(self.service_url, version=self.version)
            cap = self.set_cache('capabilities', self.sos_service)
        return cap

    def get_sensors(self, full=False):
        sensors = self.get_cache('sensors')
        if sensors:
            return sensors

        sensors = []
        cap = self.get_capabilities()
        get_observation = cap.get_operation_by_name('GetObservation')
        describe_sensor = cap.get_operation_by_name('DescribeSensor')
        sensor_ids = describe_sensor.parameters['procedure']['values']
        for sensor_id in sensor_ids:
            ds = {}
            ds["id"] = sensor_id
            ds["name"] = sensor_id
            ds["observable_properties"] = cap.get_observable_by_procedure(sensor_id)
            if full:
                ds['describe_sensor'] = cap.describe_sensor(outputFormat='http://www.opengis.net/sensorML/1.0.1', procedure=sensor_id)
            sensors.append(ds)

        return self.set_cache('sensors', sensors)

    def get_cache(self, uri, timeout=15):
        cached_response = self._cache.get(uri)
        if cached_response is not None and datetime.now() - cached_response[0] < timedelta(seconds=timeout):
            return cached_response[1]
        return None

    def set_cache(self, uri, content):
        self._cache[uri] = (datetime.now(), content)
        return content

