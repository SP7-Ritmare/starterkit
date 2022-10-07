# Configurations avaiable for the extension.

The following environmental variables can be configured:

- `SOS_CLIENT_IFRAME_SRC` (`IFrameSrs`):
    This is the url to the external applcation to be viewed in the modal iframe

- `SOS_CLIENT_IFRAME_SUPPORTED_ORIGIN` (`targetOrigin`):
    The `targetOrigin` used inside the `postMessage` (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin)

- `SOS_CLIENT_IFRAME_MODAL_TITLE` (`modalTitle`):
    This is the title of the FOIs modal which displays the iframe. By default, the title is 'Features Of Interest' (in the language selected). It can be changed to any suitable title, however, there would be no translations available for the customized title.

- `SOS_CLIENT_GEOSERVER_BASE_PATH` (`basePath`):
    The url for Geoserver to be used in the FOIs modal's getFeatureInfo request. By default, it is assumed that Geoserver is served on the same domain as your geonode instance. Therefore **GEOOSERVER_PUBLIC_LOCATION** is used. Howerver, in cases where Geoserver is running on a different domain, the bathPath config may be changed to the required domain.

These variables populate the `SOS_CLIENT_IFRAME_CONFIG` dictionary inside the `geosk` settings module. 
