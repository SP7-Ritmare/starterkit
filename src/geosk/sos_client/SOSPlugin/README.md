# Customizations avaiable for the extension.

A configuration file has been included at

```cmd
src/geosk/templates/geonode_mapstore_client/_geonode_config.html
```

The following customizations can be made on the extension:

- IFrameSrs:
    This is the url to the fois applcation to be viewed in the modal iframe

- supportedOrigin:
    The `targetOrigin` used inside the `postMessage` (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin)

- modalTitle:
    This is the title of the FOIs modal which displays the iframe. By default, the title is 'Features Of Interest' (in the language selected). It can be changed to any suitable title, however, there would be no translations available for the customized title.

- basePath:
    The url for geoserver to be used in the FOIs modal's getFeatureInfo request. By default, it is assumed that geoserver is served on the same domain as your geonode instance. Therefore a relative url for geoserver is used. Howerver, in cases where geoserver is running on a different domain, the bathPath config may be changed to the required domain.


## Example Customization

This is an example to show new values provided to the extention config

```javascript
localConfig.plugins.map_view.push({ 
    "name": "SOSPlugin", // this must not be changed
    "cfg": {
        "iframeSrc": "https://example.com/fois-application", 
        "supportedOrigin": "https://example.com",
        "modalTitle": "Sample Title",
        "basePath": "https://example-geoserver-domain.com"
} });
localConfig.plugins.map_edit.push({
    "name": "SOSPlugin", // this must not be changed
    "cfg": {
        "iframeSrc": "https://example.com/fois-application", 
        "supportedOrigin": "http://localhost:5500", 
        "modalTitle": "Sample Title",
        "basePath": "https://example-geoserver-domain.com"
} });
```