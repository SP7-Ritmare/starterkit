import requests
import simplejson
from datetime import datetime, timedelta

from geoserver.catalog import Catalog, logger
from geoserver.support import url
from django.utils import simplejson as json


class Settings(object):
    def __init__(self, catalog):
        self.catalog = catalog

    @property
    def contact_url(self):
        return url(self.catalog.service_url,
            ["settings", "contact.json"])

    def _get_contact(self):
        return self.catalog.get_json(self.contact_url)

    def update_contact(self, json):
        headers = { "Content-Type": "application/json" }
        self.catalog.http.request(
            self.contact_url, "PUT", simplejson.dumps(json), headers)

    def service_url(self, service):
        assert service in ('wms', 'wfs', 'wcs'), "Unknow service type"
        return url(self.catalog.service_url,
                   ['services', service, "settings.json"])

    def update_service(self, service, json):
        headers = { "Content-Type": "application/json" }
        self.catalog.http.request(
            self.service_url(service), "PUT", simplejson.dumps(json), headers)

    def get_service_config(self, service):
        response, content = self.catalog.http.request(
            self.service_url(service), "GET")
        if response.status == 200:
            return json.loads(content)        
        else:
            return None
