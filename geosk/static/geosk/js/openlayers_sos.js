/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/OWSCommon/v1.js
 */

/**
 * Class: OpenLayers.Format.OWSCommon.v1_1_0
 * Parser for OWS Common version 1.1.0.
 *
 * Inherits from:
 *  - <OpenLayers.Format.OWSCommon.v1>
 */
OpenLayers.Format.OWSCommon.v1_1_0 = OpenLayers.Class(OpenLayers.Format.OWSCommon.v1, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        ows: "http://www.opengis.net/ows/1.1",
        xlink: "http://www.w3.org/1999/xlink"
    },    
    
    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "ows": OpenLayers.Util.applyDefaults({
            "ExceptionReport": function(node, obj) {
                obj.exceptionReport = {
                    version: node.getAttribute('version'),
                    language: node.getAttribute('xml:lang'),
                    exceptions: []
                };
                this.readChildNodes(node, obj.exceptionReport);
            },
            "AllowedValues": function(node, parameter) {
                parameter.allowedValues = {};
                this.readChildNodes(node, parameter.allowedValues);
            },
            "AnyValue": function(node, parameter) {
                parameter.anyValue = true;
            },
            "DataType": function(node, parameter) {
                parameter.dataType = this.getChildValue(node);
            },
            "Range": function(node, allowedValues) {
                allowedValues.range = {};
                this.readChildNodes(node, allowedValues.range);
            },
            "MinimumValue": function(node, range) {
                range.minValue = this.getChildValue(node);
            },
            "MaximumValue": function(node, range) {
                range.maxValue = this.getChildValue(node);
            },
            "Identifier": function(node, obj) {
                obj.identifier = this.getChildValue(node);
            },
            "SupportedCRS": function(node, obj) {
                obj.supportedCRS = this.getChildValue(node);
            }
        }, OpenLayers.Format.OWSCommon.v1.prototype.readers["ows"])
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "ows": OpenLayers.Util.applyDefaults({
            "Range": function(range) {
                var node = this.createElementNSPlus("ows:Range", {
                    attributes: {
                        'ows:rangeClosure': range.closure
                    }
                });
                this.writeNode("ows:MinimumValue", range.minValue, node);
                this.writeNode("ows:MaximumValue", range.maxValue, node);
                return node;
            },
            "MinimumValue": function(minValue) {
                var node = this.createElementNSPlus("ows:MinimumValue", {
                    value: minValue
                });
                return node;
            },
            "MaximumValue": function(maxValue) {
                var node = this.createElementNSPlus("ows:MaximumValue", {
                    value: maxValue
                });
                return node;
            },
            "Value": function(value) {
                var node = this.createElementNSPlus("ows:Value", {
                    value: value
                });
                return node;
            }
        }, OpenLayers.Format.OWSCommon.v1.prototype.writers["ows"])
    },

    CLASS_NAME: "OpenLayers.Format.OWSCommon.v1_1_0"

});

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
 
/**
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Format/GML/v3.js
 */

/**
 * Class: OpenLayers.Format.SOSGetFeatureOfInterest
 * Read and write SOS GetFeatureOfInterest. This is used to get to
 * the location of the features (stations). The stations can have 1 or more
 * sensors.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.SOSGetFeatureOfInterest = OpenLayers.Class(
    OpenLayers.Format.XML, {
    
    /**
     * Constant: VERSION
     * {String} 1.0.0
     */
    VERSION: "1.0.0",

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        sos: "http://www.opengis.net/sos/1.0",
        gml: "http://www.opengis.net/gml",
        sa: "http://www.opengis.net/sampling/1.0",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: schemaLocation
     * {String} Schema location
     */
    schemaLocation: "http://www.opengis.net/sos/1.0 http://schemas.opengis.net/sos/1.0.0/sosAll.xsd",

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "sos",

    /**
     * Property: regExes
     * Compiled regular expressions for manipulating strings.
     */
    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        removeSpace: (/\s*/g),
        splitSpace: (/\s+/),
        trimComma: (/\s*,\s*/g)
    },
    
    /**
     * Constructor: OpenLayers.Format.SOSGetFeatureOfInterest
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Parse a GetFeatureOfInterest response and return an array of features
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Array(<OpenLayers.Feature.Vector>)} An array of features. 
     */
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }

        var info = {features: []};
        this.readNode(data, info);
       
        var features = [];
        for (var i=0, len=info.features.length; i<len; i++) {
            var container = info.features[i];
            // reproject features if needed
            if(this.internalProjection && this.externalProjection &&
                container.components[0]) {
                    container.components[0].transform(
                        this.externalProjection, this.internalProjection
                    );
            }             
            var feature = new OpenLayers.Feature.Vector(
                container.components[0], container.attributes);
            features.push(feature);
        }
        return features;
    },

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "sa": {
            "SamplingPoint": function(node, obj) {
                // sampling point can also be without a featureMember if 
                // there is only 1
                if (!obj.attributes) {
                    var feature = {attributes: {}};
                    obj.features.push(feature);
                    obj = feature;
                }
                obj.attributes.id = this.getAttributeNS(node, 
                    this.namespaces.gml, "id");
                this.readChildNodes(node, obj);
            },
            "position": function (node, obj) {
                this.readChildNodes(node, obj);
            }
        },
        "gml": OpenLayers.Util.applyDefaults({
            "FeatureCollection": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "featureMember": function(node, obj) {
                var feature = {attributes: {}};
                obj.features.push(feature);
                this.readChildNodes(node, feature);
            },
            "name": function(node, obj) {
		// 52north bug // check server
		if(obj.attributes.name){
		    obj.attributes.id = obj.attributes.name;
		    obj.attributes.name = this.getChildValue(node);
		} else {
                    obj.attributes.name = this.getChildValue(node);
		}
            },
            "pos": function(node, obj) {
                // we need to parse the srsName to get to the 
                // externalProjection, that's why we cannot use
                // GML v3 for this
                if (!this.externalProjection) {
                    this.externalProjection = new OpenLayers.Projection(
                        node.getAttribute("srsName"));
                }
             OpenLayers.Format.GML.v3.prototype.readers.gml.pos.apply(
                    this, [node, obj]);
            }
        }, OpenLayers.Format.GML.v3.prototype.readers.gml)
    },
    
    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "sos": {
            "GetFeatureOfInterest": function(options) {
                var node = this.createElementNSPlus("GetFeatureOfInterest", {
                    attributes: {
                        version: this.VERSION,
                        service: 'SOS',
                        "xsi:schemaLocation": this.schemaLocation
                    } 
                }); 
                for (var i=0, len=options.fois.length; i<len; i++) {
                    this.writeNode("FeatureOfInterestId", {foi: options.fois[i]}, node);
                }
                return node; 
            },
            "FeatureOfInterestId": function(options) {
                var node = this.createElementNSPlus("FeatureOfInterestId", {value: options.foi});
                return node;
            }
        }
    },

    CLASS_NAME: "OpenLayers.Format.SOSGetFeatureOfInterest" 

});

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML/VersionedOGC.js
 */
 
/**
 * Class: OpenLayers.Format.SOSCapabilities
 * Read SOS Capabilities.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML.VersionedOGC>
 */
OpenLayers.Format.SOSCapabilities = OpenLayers.Class(OpenLayers.Format.XML.VersionedOGC, {
    
    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0.0".
     */
    defaultVersion: "1.0.0",
    
    /**
     * Constructor: OpenLayers.Format.SOSCapabilities
     * Create a new parser for SOS Capabilities.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Read capabilities data from a string, and return information about
     * the service (offering and observedProperty mostly).
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Object} Info about the SOS
     */
    
    CLASS_NAME: "OpenLayers.Format.SOSCapabilities" 

});

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Format/SOSGetFeatureOfInterest.js
 */

/**
 * Class: OpenLayers.Format.SOSGetObservation
 * Read and write SOS GetObersation (to get the actual values from a sensor) 
 *     version 1.0.0
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
OpenLayers.Format.SOSGetObservation = OpenLayers.Class(OpenLayers.Format.XML, {
    
    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        ows: "http://www.opengis.net/ows",
        gml: "http://www.opengis.net/gml",
        sos: "http://www.opengis.net/sos/1.0",
        ogc: "http://www.opengis.net/ogc",
        om: "http://www.opengis.net/om/1.0",
        sa: "http://www.opengis.net/sampling/1.0",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance"
    },

    /**
     * Property: regExes
     * Compiled regular expressions for manipulating strings.
     */
    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        removeSpace: (/\s*/g),
        splitSpace: (/\s+/),
        trimComma: (/\s*,\s*/g)
    },

    /**
     * Constant: VERSION
     * {String} 1.0.0
     */
    VERSION: "1.0.0",

    /**
     * Property: schemaLocation
     * {String} Schema location
     */
    schemaLocation: "http://www.opengis.net/sos/1.0 http://schemas.opengis.net/sos/1.0.0/sosGetObservation.xsd",

    /**
     * Property: defaultPrefix
     */
    defaultPrefix: "sos",

    /**
     * Constructor: OpenLayers.Format.SOSGetObservation
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * Method: read
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Object} An object containing the measurements
     */
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }
        var info = {measurements: [], observations: []};
        this.readNode(data, info);
        return info;
    },

    /**
     * Method: write
     *
     * Parameters:
     * options - {Object} Optional object.
     *
     * Returns:
     * {String} An SOS GetObservation request XML string.
     */
    write: function(options) {
        var node = this.writeNode("sos:GetObservation", options);
        node.setAttribute("xmlns:om", this.namespaces.om);
        node.setAttribute("xmlns:ogc", this.namespaces.ogc);
        this.setAttributeNS(
            node, this.namespaces.xsi,
            "xsi:schemaLocation", this.schemaLocation
        );
        return OpenLayers.Format.XML.prototype.write.apply(this, [node]);
    }, 

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "om": {
            "ObservationCollection": function(node, obj) {
                obj.id = this.getAttributeNS(node, this.namespaces.gml, "id");
                this.readChildNodes(node, obj);
            },
            "member": function(node, observationCollection) {
                this.readChildNodes(node, observationCollection);
            },
            "Measurement": function(node, observationCollection) {
                var measurement = {};
                observationCollection.measurements.push(measurement);
                this.readChildNodes(node, measurement);
            },
            "Observation": function(node, observationCollection) {
                var observation = {};
                observationCollection.observations.push(observation);
                this.readChildNodes(node, observation);
            },
            "samplingTime": function(node, measurement) {
                var samplingTime = {};
                measurement.samplingTime = samplingTime;
                this.readChildNodes(node, samplingTime);
            },
            "observedProperty": function(node, measurement) {
                measurement.observedProperty = 
                    this.getAttributeNS(node, this.namespaces.xlink, "href");
                this.readChildNodes(node, measurement);
            },
            "procedure": function(node, measurement) {
                measurement.procedure = 
                    this.getAttributeNS(node, this.namespaces.xlink, "href");
                this.readChildNodes(node, measurement);
            },
            "featureOfInterest": function(node, observation) {
                var foi = {features: []};
                observation.fois = [];
                observation.fois.push(foi);
                this.readChildNodes(node, foi);
                // postprocessing to get actual features
                var features = [];
                for (var i=0, len=foi.features.length; i<len; i++) {
                    var feature = foi.features[i];
                    features.push(new OpenLayers.Feature.Vector(
                        feature.components[0], feature.attributes));
                }
                foi.features = features;
            },
            "result": function(node, measurement) {
                var result = {};
                measurement.result = result;
                if (this.getChildValue(node) !== '') {
                    result.value = this.getChildValue(node);
                    result.uom = node.getAttribute("uom");
                } else {
                    this.readChildNodes(node, result);
                }
            }
        },
        "sa": OpenLayers.Format.SOSGetFeatureOfInterest.prototype.readers.sa,
        "gml": OpenLayers.Util.applyDefaults({
            "TimeInstant": function(node, samplingTime) {
               var timeInstant = {};
                samplingTime.timeInstant = timeInstant;
                this.readChildNodes(node, timeInstant);
            },
            "timePosition": function(node, timeInstant) {
                timeInstant.timePosition = this.getChildValue(node);
            }
        }, OpenLayers.Format.SOSGetFeatureOfInterest.prototype.readers.gml)
    },

    /**
     * Property: writers
     * As a compliment to the readers property, this structure contains public
     *     writing functions grouped by namespace alias and named like the
     *     node names they produce.
     */
    writers: {
        "sos": {
            "GetObservation": function(options) {
                var node = this.createElementNSPlus("GetObservation", {
                    attributes: {
                        version: this.VERSION,
                        service: 'SOS'
                    } 
                }); 
                this.writeNode("offering", options, node);
                if (options.eventTime) {
                    this.writeNode("eventTime", options, node);
                }
                for (var procedure in options.procedures) {
                    this.writeNode("procedure", options.procedures[procedure], node);
                }
                for (var observedProperty in options.observedProperties) {
                    this.writeNode("observedProperty", options.observedProperties[observedProperty], node);
                }
                if (options.foi) {
                    this.writeNode("featureOfInterest", options.foi, node);
                }
                this.writeNode("responseFormat", options, node);
                if (options.resultModel) {
                    this.writeNode("resultModel", options, node);
                }
                if (options.responseMode) {
                    this.writeNode("responseMode", options, node);
                }
                return node; 
            },
            "featureOfInterest": function(foi) {
                var node = this.createElementNSPlus("featureOfInterest");
                this.writeNode("ObjectID", foi.objectId, node);
                return node;
            },
            "ObjectID": function(options) {
                return this.createElementNSPlus("ObjectID",
                    {value: options});
            },
            "responseFormat": function(options) {
                return this.createElementNSPlus("responseFormat", 
                    {value: options.responseFormat});
            },
            "procedure": function(procedure) {
                return this.createElementNSPlus("procedure", 
                    {value: procedure});
            },
            "offering": function(options) {
                return this.createElementNSPlus("offering", {value: 
                    options.offering});
            },
            "observedProperty": function(observedProperty) {
                return this.createElementNSPlus("observedProperty", 
                    {value: observedProperty});
            },
            "eventTime": function(options) {
                var node = this.createElementNSPlus("eventTime");
                if (options.eventTime === 'latest') {
                    this.writeNode("ogc:TM_Equals", options, node);
                }
                return node;
            },
            "resultModel": function(options) {
                return this.createElementNSPlus("resultModel", {value: 
                    options.resultModel});
            },
            "responseMode": function(options) {
                return this.createElementNSPlus("responseMode", {value: 
                    options.responseMode});
            }
        },
        "ogc": {
            "TM_Equals": function(options) {
                var node = this.createElementNSPlus("ogc:TM_Equals");
                this.writeNode("ogc:PropertyName", {property: 
                    "urn:ogc:data:time:iso8601"}, node);
                if (options.eventTime === 'latest') {
                    this.writeNode("gml:TimeInstant", {value: 'latest'}, node);
                }
                return node;
            },
            "PropertyName": function(options) {
                return this.createElementNSPlus("ogc:PropertyName", 
                    {value: options.property});
            }
        },
        "gml": {
            "TimeInstant": function(options) {
                var node = this.createElementNSPlus("gml:TimeInstant");
                this.writeNode("gml:timePosition", options, node);
                return node;
            },
            "timePosition": function(options) {
                var node = this.createElementNSPlus("gml:timePosition", 
                    {value: options.value});
                return node;
            }
        }
    },
    
    CLASS_NAME: "OpenLayers.Format.SOSGetObservation" 

});

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/SOSCapabilities.js
 * @requires OpenLayers/Format/OWSCommon/v1_1_0.js
 * @requires OpenLayers/Format/GML/v3.js
 */

/**
 * Class: OpenLayers.Format.SOSCapabilities.v1_0_0
 * Read SOS Capabilities version 1.0.0.
 * 
 * Inherits from:
 *  - <OpenLayers.Format.SOSCapabilities>
 */
OpenLayers.Format.SOSCapabilities.v1_0_0 = OpenLayers.Class(
    OpenLayers.Format.SOSCapabilities, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        ows: "http://www.opengis.net/ows/1.1",
        sos: "http://www.opengis.net/sos/1.0",
        gml: "http://www.opengis.net/gml",
        xlink: "http://www.w3.org/1999/xlink"
    },

    /**
     * Property: regExes
     * Compiled regular expressions for manipulating strings.
     */
    regExes: {
        trimSpace: (/^\s*|\s*$/g),
        removeSpace: (/\s*/g),
        splitSpace: (/\s+/),
        trimComma: (/\s*,\s*/g)
    },
    
    /**
     * Constructor: OpenLayers.Format.SOSCapabilities.v1_0_0
     * Create a new parser for SOS capabilities version 1.0.0. 
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
        this.options = options;
    },

    /**
     * APIMethod: read
     * Read capabilities data from a string, and return info about the SOS.
     * 
     * Parameters: 
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Object} Information about the SOS service.
     */
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        if(data && data.nodeType == 9) {
            data = data.documentElement;
        }
        var capabilities = {};
        this.readNode(data, capabilities);
        return capabilities;
    },

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "gml": OpenLayers.Util.applyDefaults({
            "name": function(node, obj) {
                obj.name = this.getChildValue(node);
            },
            "TimePeriod": function(node, obj) {
                obj.timePeriod = {};
                this.readChildNodes(node, obj.timePeriod);
            },
            "beginPosition": function(node, timePeriod) {
                timePeriod.beginPosition = this.getChildValue(node);
            },
            "endPosition": function(node, timePeriod) {
                timePeriod.endPosition = this.getChildValue(node);
            }
        }, OpenLayers.Format.GML.v3.prototype.readers["gml"]),
        "sos": {
            "Capabilities": function(node, obj) {
                this.readChildNodes(node, obj);
            },
            "Contents": function(node, obj) {
                obj.contents = {};
                this.readChildNodes(node, obj.contents);
            },
            "ObservationOfferingList": function(node, contents) {
                contents.offeringList = {};
                this.readChildNodes(node, contents.offeringList);
            },
            "ObservationOffering": function(node, offeringList) {
                var id = this.getAttributeNS(node, this.namespaces.gml, "id");
                offeringList[id] = {
                    procedures: [],
                    observedProperties: [],
                    featureOfInterestIds: [],
                    responseFormats: [],
                    resultModels: [],
                    responseModes: []
                };
                this.readChildNodes(node, offeringList[id]);
            },
            "time": function(node, offering) {
                offering.time = {};
                this.readChildNodes(node, offering.time);
            },
            "procedure": function(node, offering) {
                offering.procedures.push(this.getAttributeNS(node, 
                    this.namespaces.xlink, "href"));
            },
            "observedProperty": function(node, offering) {
                offering.observedProperties.push(this.getAttributeNS(node, 
                    this.namespaces.xlink, "href"));
            },
            "featureOfInterest": function(node, offering) {
                offering.featureOfInterestIds.push(this.getAttributeNS(node, 
                    this.namespaces.xlink, "href"));
            },
            "responseFormat": function(node, offering) {
                offering.responseFormats.push(this.getChildValue(node));
            },
            "resultModel": function(node, offering) {
                offering.resultModels.push(this.getChildValue(node));
            },
            "responseMode": function(node, offering) {
                offering.responseModes.push(this.getChildValue(node));
            }
        },
        "ows": OpenLayers.Format.OWSCommon.v1_1_0.prototype.readers["ows"]
    },    
    
    CLASS_NAME: "OpenLayers.Format.SOSCapabilities.v1_0_0" 

});

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Protocol.js
 */

/**
 * Function: OpenLayers.Protocol.SOS
 * Used to create a versioned SOS protocol.  Default version is 1.0.0.
 *
 * Returns:
 * {<OpenLayers.Protocol>} An SOS protocol for the given version.
 */
OpenLayers.Protocol.SOS = function(options) {
    options = OpenLayers.Util.applyDefaults(
        options, OpenLayers.Protocol.SOS.DEFAULTS
    );
    var cls = OpenLayers.Protocol.SOS["v"+options.version.replace(/\./g, "_")];
    if(!cls) {
        throw "Unsupported SOS version: " + options.version;
    }
    return new cls(options);
};

/**
 * Constant: OpenLayers.Protocol.SOS.DEFAULTS
 */
OpenLayers.Protocol.SOS.DEFAULTS = {
    "version": "1.0.0"
};

/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Protocol/SOS.js
 * @requires OpenLayers/Format/SOSGetFeatureOfInterest.js
 */

/**
 * Class: OpenLayers.Protocol.SOS.v1_0_0
 * An SOS v1.0.0 Protocol for vector layers.  Create a new instance with the
 *     <OpenLayers.Protocol.SOS.v1_0_0> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
 OpenLayers.Protocol.SOS.v1_0_0 = OpenLayers.Class(OpenLayers.Protocol, {

    /**
     * APIProperty: fois
     * {Array(String)} Array of features of interest (foi)
     */
    fois: null,

    /**
     * Property: formatOptions
     * {Object} Optional options for the format.  If a format is not provided,
     *     this property can be used to extend the default format options.
     */
    formatOptions: null,
   
    /**
     * Constructor: OpenLayers.Protocol.SOS
     * A class for giving layers an SOS protocol.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options properties:
     * url - {String} URL to send requests to (required).
     * fois - {Array} The features of interest (required).
     */
    initialize: function(options) {
        OpenLayers.Protocol.prototype.initialize.apply(this, [options]);
        if(!options.format) {
            this.format = new OpenLayers.Format.SOSGetFeatureOfInterest(
                this.formatOptions);
        }
    },
   
    /**
     * APIMethod: destroy
     * Clean up the protocol.
     */
    destroy: function() {
        if(this.options && !this.options.format) {
            this.format.destroy();
        }
        this.format = null;
        OpenLayers.Protocol.prototype.destroy.apply(this);
    },

    /**
     * APIMethod: read
     * Construct a request for reading new sensor positions. This is done by
     *     issuing one GetFeatureOfInterest request.
     */
    read: function(options) {
        options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.applyDefaults(options, this.options || {});
        var response = new OpenLayers.Protocol.Response({requestType: "read"});
        var format = this.format;
        var data = OpenLayers.Format.XML.prototype.write.apply(format,
            [format.writeNode("sos:GetFeatureOfInterest", {fois: this.fois})]
        );
        response.priv = OpenLayers.Request.POST({
            url: options.url,
            callback: this.createCallback(this.handleRead, response, options),
            data: data
        });
        return response;
    },
   
    /**
     * Method: handleRead
     * Deal with response from the read request.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass
     *     to the user callback.
     * options - {Object} The user options passed to the read call.
     */
    handleRead: function(response, options) {
        if(options.callback) {
            var request = response.priv;
            if(request.status >= 200 && request.status < 300) {
                // success
                response.features = this.parseFeatures(request);
                response.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                response.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, response);
        }
    },

    /**
     * Method: parseFeatures
     * Read HTTP response body and return features
     *
     * Parameters:
     * request - {XMLHttpRequest} The request object
     *
     * Returns:
     * {Array({<OpenLayers.Feature.Vector>})} Array of features
     */
    parseFeatures: function(request) {
        var doc = request.responseXML;
        if(!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        if(!doc || doc.length <= 0) {
            return null;
        }
        return this.format.read(doc);
    },

    CLASS_NAME: "OpenLayers.Protocol.SOS.v1_0_0"
});
