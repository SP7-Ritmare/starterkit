.. _setProxy:


===================
Set Proxy in GET-IT
===================

The proxy is set to activate a server application, already configured within 
`GET-IT <https://docs.geonode.org/en/master/basic/settings/#proxy-allowed-hosts>`,
that acts as an intermediary for requests from client seeking resources from resources from external servers.
In particular proxy in GET-IT allows to make request from the EDI metadata client to the semantic resource distribution servers.

For set the proxy must to follow this steps:
1. import different proxy within `geosk\urls.py`
2. create classes within `geosk.osk.proxy.py` module
3. add base_url in `geosk.settings.py`
