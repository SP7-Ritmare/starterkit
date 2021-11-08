import json
from datetime import datetime, timedelta

import requests

from geoserver.catalog import Catalog, logger
from geoserver.support import build_url


class Settings:
    def __init__(self, catalog):
        self.catalog = catalog

    @property
    def contact_url(self):
        return build_url(self.catalog.service_url,
                         ["settings", "contact.json"])

    def _get_contact(self):
        return self.catalog.get_json(self.contact_url)

    def update_contact(self, json_data):
        headers = {"Content-Type": "application/json"}
        self.catalog.http_request(
            self.contact_url, method="PUT", data=json.dumps(json_data), headers=headers)

    def service_url(self, service):
        assert service in ('wms', 'wfs', 'wcs'), "Unknow service type"
        return build_url(self.catalog.service_url,
                         ['services', service, "settings.json"])

    def update_service(self, service, json_data):
        headers = {"Content-Type": "application/json"}
        self.catalog.http_request(
            self.service_url(service), method="PUT", data=json.dumps(json_data), headers=headers)

    def get_service_config(self, service):
        response = self.catalog.http_request(
            self.service_url(service), method="GET")
        if response.status_code == 200:
            return json.loads(response.content)
        else:
            return None
