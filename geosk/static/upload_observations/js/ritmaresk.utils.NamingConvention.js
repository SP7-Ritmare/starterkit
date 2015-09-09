/*
 *  ritmaresk.utils.NamingConvention.js
 *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *      paolo.tagliolato@gmail.com
 *
 *  version: 1.2 beta
 *
 * changes from v 1.1 beta
 *  - changed composeResultTemplateID: observedProperty passed as argument is used as part of the id. If undef: uses compound as usual
 */

var ritmaresk = ritmaresk || {};
ritmaresk.utils = ritmaresk.utils || {};

/**
 * @namespace
 * @todo consider the following refactoring: move xmlProducer to ritmaresk.utils.swe
 */
ritmaresk.utils.namingConvention = (function () {

    //var sk_domain_name = sk_domain_name || "unknown_domain_name";//this must be done once whoami is loaded

    var xslt = ritmaresk.XsltTransformer.getInstance();

    var crsUri2Epsg = function (crs_uri) {
        var regExp = /http:.*\/def\/crs\/EPSG\/0\/(\d+)/;
        var match = regExp.exec(crs_uri);
        var epsg = "EPSG:";
        if (match) {
            epsg += match[1];
        }
        else {
            epsg += "unknown";
        }

        return epsg;
    };


    /**
     *
     * @param baseurl_sp7
     * @param app_name
     * @param uri_sk
     * @param sk_domain_name
     * @constructor
     */
    var IdComposer = function (baseurl_sp7, app_name, uri_sk, sk_domain_name) {

        var baseurl_sp7 = baseurl_sp7,
            app_name = app_name,
            uri_sk = uri_sk,	//N.B. questi sono presenti se si carica config.js
            sk_domain_name = sk_domain_name || "unknown_domain_name";//this must be done once whoami is loaded.


        /**
         *  function composeResultTemplateID(procedure, foi, observedProperty)
         *
         *  construct template ID given procedure, foi, observedProperty
         *  (SP7 naming convention)
         *
         */
        // TODO: perfezionare il passaggio dei parametri prevedendo
        // 	  1. spatial sampling features di altro tipo oltre a  sampling point
        //		  2. observedProperty non solo "compound"
        //  osservo che l'ID che questa funzione deve ritornare,
        //  deve coincidere con quello che viene creato dal foglio di stile xslt sensor2ResultTemplate.xsl
        // richiamato nella funzione creaInsertResultTemplate.
        // Sarebbe appropriato ci fosse un foglio di stile xslt deputato alla composizione dell'id
        // (diciamo: sensor2ResultTemplateID):
        // bisognerebbe fare in modo che fosse richiamato da una parte dalla funzione JS qui sotto,
        // dall'altra che fosse utilizzato in sensor2ResultTemplate.xsl importandolo
        /*
         <!-- TODO: valutare se modificare questo in una cosa tipo:
         PROCEDURE_ID/template?featureofinterest=<Escape(FOI_ID)>
         dove Escape(FOI_ID) contiene il foi_id url_escaped.
         ********************************************************** -->
         */
        /**
         *
         * @param procedure
         * @param foi
         * @param observedProperty
         * @returns {string}
         */
        this.composeResultTemplateID = function (procedure, foi, observedProperty) {

            var observedProperty = observedProperty || "compound";
            var epsg = "EPSG:unknown";
            var coords = "";

            if (foi.geometry.crs && (foi.geometry.crs.properties.name || foi.geometry.crs.properties.srsName)) {
                if (foi.geometry.crs.properties.name) {
                    epsg = foi.geometry.crs.properties.name;
                }
                else if (foi.geometry.crs.properties.srsName) {
                    epsg = crsUri2Epsg(foi.geometry.crs.properties.srsName);
                }
            }

            if (foi.geometry.crs && foi.geometry.coordinates) {
                coords = foi.geometry.coordinates.join("/");
            }

            var id = [procedure, "template", "observedProperty", observedProperty, "foi", "SSF", "SP", epsg, coords].join("/");
            // TODO: test
            //console.warn("function composeResultTemplateID to be implemented");
            return (id);
        };

        /**
         *
         * @param procedureId
         * @returns {string}
         */
        this.composeObservedPropertiesCompoundId = function (procedureId) {
            var id = [procedureId, "observedProperty", "compound"].join("/");
            return (id);
        };


        /**
         *  compose the ID (according to sp7 naming conventions)
         *  for a new feature of interest
         *  (of type SpatialSamplingFeature_SamplingPoint)
         *  given:
         *  baseurl_sp7, app_name, uri_sk, (from config.js)
         *  srs (url), spatial_sampling_point_x, spatial_sampling_point_y
         *
         *  emulate xslt:
         *    <xsl:variable name="foi_id">
         *        <xsl:value-of select="$baseurl_sp7"/><xsl:value-of select="$app_name"/>/<xsl:value-of select="$uri_sk"/>/foi/SSF/SP/<xsl:value-of select="$srs"/>/<xsl:value-of select="$spatial_sampling_point_x"/>/<xsl:value-of select="$spatial_sampling_point_y"/></xsl:variable>
         *
         *  (SP7 naming convention)
         */
        this.composeFoiID_SSF_SP = function (srs_uri, spatial_sampling_point_x, spatial_sampling_point_y) {
            if (!spatial_sampling_point_x || !spatial_sampling_point_y)throw("Exception: sampling point must be defined to compose its id");
            var epsg = crsUri2Epsg(srs_uri);
            //console.warn("epsg: "+epsg);
            var id = [baseurl_sp7, app_name, sk_domain_name, "foi", "SSF", "SP", epsg, spatial_sampling_point_x, spatial_sampling_point_y].join("/");
            // TODO: test
            //console.warn("function composeResultTemplateID to be implemented");
            return (id);
        };

        // TODO: completare
        /**
         *
         * @param foiType
         * @param params
         * @returns {*}
         */
        this.composeFoiID = function (foiType, params) {
            if (foiType === 'SpatialSamplingFeature.SamplingPoint' &&
                params.srs_uri && params.spatial_sampling_point_x && params.spatial_sampling_point_y
            ) {
                return (composeFoiID_SSF_SP(params.srs_uri, params.spatial_sampling_point_x, params.spatial_sampling_point_y));
            }
            else {
                console.warn("this foi type is not supported or params are not corrected. Please check composeFoiID implementation.");
                return undefined;
            }
        };
    };


    // string sensor2ResultTemplate(string procedureId, string foi, string xmlSensorDescription)
    var sensor2ResultTemplate = function (procedureId, foi, xmlSensorDescription) {

        //var xml = creaInsertResultTemplate(procedureId, foi);//ottiene l'xml per il post a pox/insertResultTemolate

        var
            filenameXsl = "xslt/sensor2ResultTemplate.xsl";
        // filenameXml="xslt/FOI_test.xml";

        var 			// XsltTransformer object
            xsl,			// xslt stylesheet: transform sensorDescription into insertResultTemplate document
            xmlRTemplate,	// Document object: insertResultTemplate, output of xslt transformation
            stringResultTemplate, // string: insertResultTemplate parsed to string; output of the function
            sk_domain_name = sk_domain_name || "unknown_domain_name";

        xsl = xslt.loadXMLDoc(filenameXsl);

        var params = {
            // TODO: sostituire l'endpoint con il VERO URI dello SK
            SK_DOMAIN_NAME: sk_domain_name,//endpoint.replace(/http[s]*:\/\//, ""),
            SPATIAL_SAMPLING_POINT_X: foi.geometry.coordinates[0],
            SPATIAL_SAMPLING_POINT_Y: foi.geometry.coordinates[1],
            SRS_NAME: foi.geometry.crs.properties.srsName,
            SAMPLED_FEATURE_URL: foi.sampledFeature,
            FOI_NAME: foi.name
        };
        if (foi.identifier) {
            params.EXISTING_FOI_ID = foi.identifier;
        }

        xmlRTemplate = xslt.transform(xsl, xmlSensorDescription, params);

        stringResultTemplate = (new XMLSerializer()).serializeToString(xmlRTemplate);


        //return(xmlRTemplate);

        return (stringResultTemplate);
    };

    // string sensor2ResultTemplate(string procedureId, string foi, string xmlSensorDescription)
    /**
     *
     * @param phenomenonTimeMin
     * @param phenomenonTimeMax
     * @param resultTime
     * @param foi
     * @param elementCount
     * @param values
     * @param resultEncoding
     * @param sk_dns
     * @param xmlSensorDescription
     * @returns {string}
     */
    function sensor2InsertObservation(phenomenonTimeMin, phenomenonTimeMax, resultTime, foi, elementCount, values, resultEncoding, sk_dns, xmlSensorDescription) {

        //var xml = creaInsertResultTemplate(procedureId, foi);//ottiene l'xml per il post a pox/insertResultTemolate

        var
            filenameXsl = "xslt/sensor2InsertObservation.xsl",
            xslt = ritmaresk.XsltTransformer.getInstance();
        // filenameXml="xslt/FOI_test.xml";

        var 			// XsltTransformer object
            xsl,			// xslt stylesheet: transform sensorDescription into insertResultTemplate document
            xmlRTemplate,	// Document object: insertResultTemplate, output of xslt transformation
            stringInsertObservation; // string: insertResultTemplate parsed to string; output of the function


        xsl = xslt.loadXMLDoc(filenameXsl);

        var params = {
            // TODO: sostituire l'endpoint con il VERO URI dello SK
            SK_DOMAIN_NAME: sk_dns,//endpoint.replace(/http[s]*:\/\//, ""),
            SPATIAL_SAMPLING_POINT_X: foi.geometry.coordinates[0],
            SPATIAL_SAMPLING_POINT_Y: foi.geometry.coordinates[1],
            SRS_NAME: foi.geometry.crs.properties.srsName,
            SAMPLED_FEATURE_URL: foi.sampledFeature,
            FOI_NAME: foi.name,
            PHENOMENON_TIME_BEGIN: phenomenonTimeMin,
            PHENOMENON_TIME_END: phenomenonTimeMax,
            RESULT_TIME_TIME_POSITION_ISO: resultTime,
            RESULT_ENCODING_TOKEN_SEP: resultEncoding.textEncoding.tokenSeparator,
            RESULT_ENCODING_BLOCK_SEP: resultEncoding.textEncoding.blockSeparator,
            ELEMENT_COUNT: elementCount,
            VALUES: values
        };
        if (foi.isNew) {//foi.identifier){
            params.EXISTING_FOI_ID = foi.identifier;
        }

        xmlRTemplate = xslt.transform(xsl, xmlSensorDescription, params);

        stringInsertObservation = (new XMLSerializer()).serializeToString(xmlRTemplate);

        //return(xmlRTemplate);

        return (stringInsertObservation);
    }

    /**
     *
     * @param phenomenonTimeMin
     * @param phenomenonTimeMax
     * @param resultTime
     * @param foi
     * @param resultEncoding
     * @param sk_dns
     * @param xmlSp7InsertObservations
     * @returns {string}
     */
    function sp7InsertObservations2InsertMultipleObservationsSplitArray(phenomenonTimeMin, phenomenonTimeMax, resultTime, foi, resultEncoding, sk_dns, /*xmlDocument*/ xmlSp7InsertObservations) {
        var
            filenameXsl = "xslt/sp7InsertObservations2MultipleInsertObservationSplitArray.xsl",
            xslt = ritmaresk.XsltTransformer.getInstance();
        // filenameXml="xslt/FOI_test.xml";

        var 			// XsltTransformer object
            xsl,			// xslt stylesheet: transform sensorDescription into insertResultTemplate document
            xmlRTemplate,	// Document object: insertResultTemplate, output of xslt transformation
            stringInsertObservation; // string: insertResultTemplate parsed to string; output of the function


        xsl = xslt.loadXMLDoc(filenameXsl);
        //workaround...intercept xslt issue for querystring "&" sep
        var sampledFeature_workaround=foi.sampledFeature;//.replace(/&/g,"%_%26_%");
        /* @todo check this change: I removed the workaround. XSLT will transform the ampersand. This way the browser should be able to properly interpret the urlencoding.
        OGC Documentation uses the same encoding in xml (but uses also ather possibile encodings). Anyway: the ampersand is not */
        var params = {
            // TODO: sostituire l'endpoint con il VERO URI dello SK
            SK_DOMAIN_NAME: sk_dns,//endpoint.replace(/http[s]*:\/\//, ""),
            SPATIAL_SAMPLING_POINT_X: foi.geometry.coordinates[0],
            SPATIAL_SAMPLING_POINT_Y: foi.geometry.coordinates[1],
            SRS_NAME: foi.geometry.crs.properties.srsName,
            SAMPLED_FEATURE_URL: sampledFeature_workaround,
            FOI_NAME: foi.name,
            PHENOMENON_TIME_BEGIN: phenomenonTimeMin,
            PHENOMENON_TIME_END: phenomenonTimeMax,
            RESULT_TIME_TIME_POSITION_ISO: resultTime,
            RESULT_ENCODING_TOKEN_SEP: resultEncoding.textEncoding.tokenSeparator,
            RESULT_ENCODING_BLOCK_SEP: resultEncoding.textEncoding.blockSeparator
        };
        console.warn("***  check me!!!! I caused an error for not existing FOIs ****");
        //TODO: valutare la correzione di QUESTO METODO: sembra che non passi sempre existingfoiid anche quando la FOI è nuova!!!! old version: if(foi.isNew) ... mancava solo il not?

        if (!foi.isNew) {
            params.EXISTING_FOI_ID = foi.identifier;
        }

        console.warn((new XMLSerializer()).serializeToString(xmlSp7InsertObservations));
        xmlRTemplate = xslt.transform(xsl, xmlSp7InsertObservations, params);

        stringInsertObservation = (new XMLSerializer()).serializeToString(xmlRTemplate);

        //return(xmlRTemplate);

        return (stringInsertObservation);//.replace(sampledFeature_workaround,foi.sampledFeature));

    }

    /**
     * @constructor Sp7Field
     * @throws "The specified type is not supported" if type is not supported
     *
     * @param {string} name
     * @param {string} type one of "swe:quantity", "swe:time"
     * @param {string} definition this is the URI that will be used for specifying the observed property
     * @param {string} uom_code
     * @param {number} vcount
     * @param {string} values
     * @todo refactor this constructor: it should be part of the namingConvention namespace, not within xmlProducer
     */
    var Sp7Field = function (name, type, definition, uom_code, vcount, values) {
        var self = this;
        var supportedtypes = {
            "swe:Quantity": true,
            "swe:Time": true
        };

        if (supportedtypes[type]) {

            self.name = name;
            self.type = type;
            self.definition = definition;
            self.uom_code = uom_code;
            self.values = values;
            self.vcount = vcount;
            self.toXMLString = function (/*{string}*/ values) {
                var out = '<sp7:field name="' + self.name + '" type="' + self.type + '" definition="' + self.definition + '" uom_code="' + self.uom_code + '">';
                out += '<sp7:values count="' + self.vcount + '">' + self.values + '</sp7:values>';
                out += "</sp7:field>";
                return out;
            };
            /*
             <sp7:P_array xmlns:sp7="http://sp7.irea.cnr.it/sp7">
             <sp7:field name="TemperatureOfTheWaterColumn" type="swe:Quantity" definition="http://vocab.nerc.ac.uk/collection/P02/current/TEMP/" uom_code="degC">
             <sp7:values>
             </sp7:values>
             </sp7:field>
             <sp7:field name="SeaLevel" type="swe:Quantity" definition="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/" uom_code="m">
             <sp7:values>2007-11-23T10:00:00@0.5#2007-11-23T11:00:00@0.1#2007-11-23T12:00:00@0.2#2007-11-23T13:00:00@0.3#2007-11-23T14:00:00@0.4#2007-11-23T15:00:00@0.1
             </sp7:values>
             </sp7:field>
             <sp7:field name="notInThisProcedure" type="swe:Quantity" definition="http://vocab.nerc.ac.uk/collection/P02/current/FAKE/" uom_code="m">
             <sp7:values>2007-11-23T10:00:00@0.5#2007-11-23T11:00:00@0.1#2007-11-23T12:00:00@0.2#2007-11-23T13:00:00@0.3#2007-11-23T14:00:00@0.4#2007-11-23T15:00:00@0.1
             </sp7:values>
             </sp7:field>
             </sp7:P_array>
             */
        }
        else throw("The specified type is not supported");
    };


    /**
     *
     * @param offering
     * @param procedure
     * @param {Sp7Field[]} sp7FieldArray
     * @returns {string}
     */
    var toSp7XMLInsertObservations = function (offering, procedure, sp7FieldArray) {
        /**
         * @function
         * @returns {string} xmlString
         * @param {Sp7Field[]} sp7FieldArray
         * @returns {string} &lt;sp7:P_array&gt;sp7Field.toXMLString()&lt;/sp7:P_array&gt;
         */
        var toSp7XmlString = function (sp7FieldArray) {
            var s = "";
            for (var i = 0; i < sp7FieldArray.length; i++) {
                s += sp7FieldArray[i].toXMLString();
            }
            return '<sp7:P_array>' + s + '</sp7:P_array>';
        };

        var docstr = '<sp7:insertObservations xmlns:sp7="http://sp7.irea.cnr.it/sp7"><sp7:offering>' + offering + '</sp7:offering>';
        docstr += '<sp7:procedure_ID>' + procedure + '</sp7:procedure_ID>';
        docstr += toSp7XmlString(sp7FieldArray);
        docstr += '</sp7:insertObservations>';
        return docstr;
    };

    return {
        IdComposer: IdComposer,
        xmlProducer: {
            sensor2ResultTemplate: sensor2ResultTemplate,
            sensor2InsertObservation: sensor2InsertObservation,
            sp7InsertObservations2InsertMultipleObservationsSplitArray: sp7InsertObservations2InsertMultipleObservationsSplitArray,
            Sp7Field: Sp7Field,
            toSp7XMLInsertObservations: toSp7XMLInsertObservations
        }
    };

})();