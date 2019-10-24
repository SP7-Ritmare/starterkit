/**
 *    ritmaresk.SOS.js
 *
 *  author: paolo tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *            paolo.tagliolato@gmail.com
 *
 *  version: 1.1.2 beta
 *
 *    minor changes:
 *        -setCapabilities method: added check to avoid TypeError when no procedure exists
 *        -added return value (Deferred) to pox methods
 *        -added all arguments (xmlData,status,jqXHR) to pox method callback invocation
 *
 *  requires: jQuery (ajax requests)
 *
 *
 */

if (typeof jQuery === 'undefined') {
    throw new Error('ritmaresk.SOS\'s JavaScript requires jQuery')
}

var ritmaresk = ritmaresk || {};


ritmaresk.Sos = (function () {	//sk sos endpoint url example = http://sk.sp7.irea.cnr.it/observations/sos
    /**
     *
     * @param endpointUrl
     * @constructor
     * @namespace ritmaresk
     */
    var Sos = function (endpointUrl) {

        var self = this; //alias for "this": self is the Sos object ever.

        var SK_SOS_PATH = "/observations/sos";

        var endpointKvp = endpointUrl + '/kvp',
            endpointJson = endpointUrl + '/json',
            endpointPox = endpointUrl + '/pox';


        // INIT SOS OBJECT

        self.info = "sos 2.0.0 client, developed by: irea.cnr.it, licence: LGPL";
        self.url = endpointUrl;
        //self.kvp = {url:endpointKvp,method:"get"};
        //self.json= {url:endpointJson,method:"post"};
        //self.urlXsltTransformService = "http://sp7.irea.cnr.it/jboss/MDService/rest/util/xsltByUrls";
        self.sensors = {};

        /**
         * @description sos kvp binding
         * @type {{url: string, method: string, urlGetResultTemplate: urlGetResultTemplate, urlDescribeSensor: urlDescribeSensor, urlGetCapabilities: urlGetCapabilities, urlGetFeatureOfInterestByProcedure: urlGetFeatureOfInterestByProcedure, describeSensor: describeSensor, getFeatureOfInterestByProcedure: getFeatureOfInterestByProcedure, getFeatureOfInterestByProcedure_synchronous: getFeatureOfInterestByProcedure_synchronous}}
         */
        self.kvp = {
            url: endpointKvp,
            method: "get",
            urlGetResultTemplate: function (offeringId, observedPropertyId) {
                return ( composeGet({
                    "request": "GetResultTemplate",
                    "offering": offeringId,
                    "observedProperty": observedPropertyId,
                    "version": "2.0.0"
                })    );
            },
            urlDescribeSensor: function (procedureId) {
                //return( composeGet({"request":"DescribeSensor","procedure":procedure,"procedureDescriptionFormat":"http%3A%2F%2Fwww.opengis.net%2FsensorML%2F1.0.1","version":"2.0.0"}) );
                return ( composeGet({
                    "request": "DescribeSensor",
                    "procedure": procedureId,
                    "procedureDescriptionFormat": "http://www.opengis.net/sensorML/1.0.1",
                    "version": "2.0.0"
                }) );
            },
            urlGetCapabilities: function () {
                return (    composeGet({"request": "GetCapabilities", "AcceptVersions": "2.0.0"})    );
            },
            urlGetFeatureOfInterestByProcedure: function (procedureId) {
                var postData = {
                    "service": "SOS",
                    "version": "2.0.0",
                    "request": "GetFeatureOfInterest",
                    "procedure": procedureId
                };
                return (    composeGet(postData)    );
            },
            describeSensor: function (procedureId, fx_loaded) {
                $.get(
                    self.kvp.urlDescribeSensor(procedureId),
                    function (xml) {
                        //debug(xml);
                        //setSensor(json,procedure);
                        if (fx_loaded && (typeof fx_loaded == "function")) {
                            fx_loaded(xml);
                        }
                    }
                );
            },
            getFeatureOfInterestByProcedure: function (procedureId, fx_loaded) {
                //var postData={"service":"SOS","version":"2.0.0","request":"GetFeatureOfInterest","procedure":procedure};
                //var requrl=composeGet(postData);
                $.get(
                    //requrl,
                    self.kvp.urlGetFeatureOfInterestByProcedure(procedureId),
                    function (xml) {
                        //debug(JSON.stringify(json));
                        //setSensor(json,procedure);
                        if (fx_loaded && (typeof fx_loaded == "function")) {
                            fx_loaded(xml);
                        }
                    }
                );
            },
            getFeatureOfInterestByProcedure_synchronous: function (procedureId) {
                var postData = {
                    "service": "SOS",
                    "version": "2.0.0",
                    "request": "GetFeatureOfInterest",
                    "procedure": procedureId
                };
                var requrl = composeGet(postData);
                var resultDocument = $.ajax({
                    url: requrl,
                    type: "get",
                    async: false,
                    dataType: "xml",
                    data: postData
                }).responseText;

                return resultDocument;
            }
        };


        /**
         * @description sos json binding
         * @type {{url: string, method: string, describeSensor: describeSensor, getFeatureOfInterestByProcedure: getFeatureOfInterestByProcedure}}
         */
        self.json = {
            url: endpointJson,
            method: "post",
            describeSensor: function (procedureId, fx_loaded) {
                var postData = {
                    "service": "SOS",
                    "version": "2.0.0",
                    "request": "DescribeSensor",
                    "procedure": procedureId,
                    "procedureDescriptionFormat": "http://www.opengis.net/sensorML/1.0.1"
                };
                $.post(
                    endpointJson, JSON.stringify(postData),
                    function (json) {
                        //debug(JSON.stringify(json));
                        setSensor(json, procedureId);
                        if (fx_loaded && (typeof fx_loaded == "function")) {
                            fx_loaded(json);
                        }
                    }
                );
            },
            getFeatureOfInterestByProcedure: function (procedureId, fx_loaded) {
                var postData = {
                    "service": "SOS",
                    "version": "2.0.0",
                    "request": "GetFeatureOfInterest",
                    "procedure": procedureId
                };
                $.post(
                    endpointJson, JSON.stringify(postData),
                    function (json) {
                        //debug(JSON.stringify(json));
                        //setSensor(json,procedure);
                        if (fx_loaded && (typeof fx_loaded == "function")) {
                            fx_loaded(json);
                        }
                    }
                );
            }
        };

        /**
         * @description sos pox binding
         * @type {{url: string, method: string, insertResultTemplate: insertResultTemplate, insertResult: insertResult, insertObservation: insertObservation, postData: postData}}
         */
        self.pox = {
            url: endpointPox,
            method: "post",
            /*getCapabilities:function(callback){
             var postData={ "request": "GetCapabilities", "service": "SOS", "sections":
             ["OperationsMetadata", "Contents"]};
             $.post(
             endpointPox,postData,
             function(xml){
             debug(xml);
             if(callback && (typeof callback=="function")){callback(xml);}
             }
             );
             },*/

            /*	void insertResultTemplate(string proposedTemplate, callback)
             *		proposedTemplate: xml insertResultTemplate instance
             *		Remark: async callback called passing response from sos as xmlDocument (not string)
             */
            insertResultTemplate: function (proposedTemplate, callback) {
                //var postData={"service":"SOS",version:"2.0.0","request":"InsertResultTemplate","proposedTemplate":proposedTemplate};
                return self.pox.postData(proposedTemplate, callback, true);

            },

            insertResult: function (resultTemplateId, resultValues, callback) {
                console.log("entering sos.insertresult with values " + resultValues);
                var xmlStringInsertResult = '<?xml version="1.0" encoding="UTF-8"?><sos:InsertResult service="SOS" version="2.0.0" xmlns:sos="http://www.opengis.net/sos/2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd"><sos:template>' + resultTemplateId + '</sos:template><sos:resultValues>' + resultValues + '</sos:resultValues></sos:InsertResult>';
                console.log(xmlStringInsertResult);
                return self.pox.postData(xmlStringInsertResult, callback, true);

            },

            /**
             *
             * @param xmlStringInsertObservation
             * @param callback
             * @returns {*}
             */
            insertObservation: function (xmlStringInsertObservation, callback) {
                return self.pox.postData(xmlStringInsertObservation, callback, true);
            },


            /**
             *
             * @param data
             * @param {function ({},{string},{jqXHR})} callback a callback for the success of ajax call. Please use the return value for other callbacks
             * @param {bool} refreshCapabilities
             * @returns {jQuery.Deferred}
             *///({}, {string}, {jQuery.jqXHR})
            postData: function (data, callback, refreshCapabilities) {
                return $.ajax({
                    type: "post",
                    url: endpointPox,
                    data: data,
                    success: function (xmlData, status, jqXHR) {
                        debug(xmlData);
                        if (callback && (typeof callback == "function")) {
                            callback(xmlData, status, jqXHR);
                        }
                        if (refreshCapabilities) {
                            self.GetCapabilities();
                        }
                    },
                    contentType: "text/xml"

                });
            }

        };

        /**
         * @description utility method: shortcut for console.debug
         * @param msg
         */
        var debug = function (msg) {
            if (console) {
                console.debug(msg);
            }
        };

        var composeGet = function (params) {

            var url = endpointKvp + "?";
            var coda = "service=SOS";
            var paramsKeyArray = Object.keys(params);

            for (var i = paramsKeyArray.length - 1; i >= 0; i--) {
                coda = coda + "&" + paramsKeyArray[i] + "=" + encodeURIComponent(params[paramsKeyArray[i]]);
            }

            return (url + coda);
        };


        // CALLBACK
        var setCapabilities = function (capabilities) {
            //NOTA BENE il contesto di esecuzione di questo metodo a runtime è window ...
            //	uso quindi l'alias self di this perché l'interpretaione di this a runtime non sovrascriva il significato:
            //	io voglio impostare una propietà di questo oggetto Sos.

            self.capabilities = capabilities;
            var procedures = self.capabilities["operationMetadata"]["operations"]["DescribeSensor"]["parameters"]["procedure"]["allowedValues"];
            if (procedures) {
                for (var i = procedures.length - 1; i >= 0; i--) {
                    self.sensors[procedures[i]] = null;
                }
            }
            self.operationNames = Object.keys(self.capabilities["operationMetadata"]["operations"]);

            //self.performOperation=performOperation;
        };

        // used as CALLBACK
        var setSensor = function (sensorDescription, procedure) {
            self.sensors[procedure] = sensorDescription;
        };

        // getter
        var getSensor = function (procedure) {
            if (self.sensors[procedure]) {
                return (self.sensors[procedure]);
            }
            else {
                return (null);
            }
        };

        /*
         self.operation=function(operationName){
         if(self.capabilities){
         operation=self.capabilities["operationMetadata"]["operations"][operationName];
         return(operation);
         }
         else{
         debug("capabilities not loaded");
         }
         //operation["parameters"][paramname]["allowedValues"];
         //operation["dcp"]
         };
         */

        // var performOperation=function(method,operationName,params){
        // 	if(self.capabilities){

        // 	}
        // 	else{
        // 		debug("capabilities not loaded");
        // 	}
        // };

        /**
         * @description performs a "sos:getCapabilities" request on the SOS endpoint. Persists the obtained capabilities in the .capabilities variable
         * @param fx_loadedCapabilities
         * @constructor
         */
        self.GetCapabilities = function (fx_loadedCapabilities) {

            var postData = {
                "request": "GetCapabilities", "service": "SOS", "sections": ["OperationsMetadata", "Contents"]
            };

            /*
             var postData={ "request": "GetCapabilities", "service": "SOS", "sections":
             ["ServiceIdentification", "ServiceProvider", "OperationsMetadata", "FilterCapabilities", "Contents"]};
             */

            $.post(
                endpointJson, JSON.stringify(postData),
                function (json) {
                    setCapabilities(json);

                    if (fx_loadedCapabilities && (typeof fx_loadedCapabilities == "function")) {
                        fx_loadedCapabilities(json);
                    }
                }
            )
        };

        /* function getSensorDescription(procedure,callback)
         * [async]
         *
         */
        /**
         * @description asynchronous call to getSensorDescription operation (by procedure id)
         * @param procedure identifier of the procedure
         * @param callback if the obtained description is not null, callback(sensorDescription) is invoked
         */
        self.getSensorDescription = function (procedure, callback) {
            var description = getSensor(procedure);
            if (description != null) {
                if (callback && (typeof callback == "function")) {
                    callback(description);
                }
            }
            else {
                self.json.describeSensor(procedure, callback);
            }
        };

        /* function getOfferingIdByProcedureId(procedureId)
         * [sync]
         * description: lookup utility which searches in the capabilities document
         *              the offering containing the given procedureId
         * returns: (string) - the identifier of the offering if present,
         *           null otherwise
         */
        self.getOfferingIdByProcedureId = function (procedureId) {
            console.log(self.capabilities.contents.length);

            for (var i = 0; i < self.capabilities.contents.length; i++) {
                for (var j = 0; j < self.capabilities.contents[i].procedure.length; j++) {
                    if (self.capabilities.contents[i].procedure[j] === procedureId) {
                        return (self.capabilities.contents[i].identifier);
                    }
                }
            }
            return (null);
        };
        /**
         *  perform DescribeSensor on sos endpoint with json binding
         *  the private callback setSensor sets the sos.sensors["procedure"]=retrieved data.
         */

    };

    return Sos;
})();

/*
 { //old

 var request=function(m,url,paramsKeyArray){
 this.httpMethod=m;

 if(paramsKeyArray){
 this.url=function (paramsValueArray){
 if(paramsValueArray.length!=paramsKeyArray.length){
 throw "Exception: expected values for the keys: (" + paramsKeyArray.join(",") + ") Found a different number of values."
 }
 else{
 var coda="";
 for (var i = paramsKeyArray.length - 1; i >= 0; i--) {
 coda=coda+"&"+paramsKeyArray[i]+"="+paramsValueArray[i];
 };
 return(url+coda);
 }
 };
 }
 else{
 this.url=url;
 }
 //this.params=params; //mi aspetto kvp...
 };



 this.endpointUrl=endpointUrl;
 this.getCapabilities=new request("get",kvp+'?service=SOS&request=GetCapabilities&AcceptVersions=2.0.0');

 var DescribeSensor=new request("get",kvp+'?service=SOS&request=DescribeSensor&procedureDescriptionFormat=http%3A%2F%2Fwww.opengis.net%2FsensorML%2F1.0.1',["procedure"]);
 this.DescribeSensor=function (procedure){return(DescribeSensor.url([procedure])); };

 var getResultTemplate=new request("get",kvp+'?service=SOS&request=GetResultTemplate',["offering","observedProperty"]);
 this.getResultTemplate=function (offering, observedProperty){ return(getResultTemplate.url([offering,observedProperty])); };
 //this.request={};
 //this.request.getCapabilities=this.kvp+'?service=SOS&request=GetCapabilities&AcceptVersions=2.0.0';

 }
 */
// test
/*
 var sos=new Sos("http://sp7.irea.cnr.it/tomcat/MareeVe/sos");
 sos.loadGetCapabilities(function (){console.debug(JSON.stringify(capabilities))});
 sos.describeSensor(sos.operation("DescribeSensor").allowedValues[1]);
 */
/*
 console.debug(sos.urlGetResultTemplate("myoff","myprop"));
 */

// example usage

/*
 sos.urlGetCapabilities();
 var offering="offering:http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande/observations",
 observedProperty="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/",
 procedure="http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande";

 sos.urlGetResultTemplate(offering,observedProperty);
 sos.urlDescribeSensor(procedure);
 */

/*

 ---
 // describe sensor
 http://sp7.irea.cnr.it/tomcat/MareeVe/sos/kvp?service=SOS&version=2.0.0&request=DescribeSensor&procedure=http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande&procedureDescriptionFormat=http%3A%2F%2Fwww.opengis.net%2FsensorML%2F1.0.1
 http://sp7.irea.cnr.it/tomcat/MareeVe/sos/kvp?service=SOS&version=2.0.0&procedureDescriptionFormat=http%3A%2F%2Fwww.opengis.net%2FsensorML%2F1.0.1&procedure=http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande2&request=DescribeSensor

 // getResultTemplate
 http://sp7.irea.cnr.it/tomcat/MareeVe/sos/kvp?service=SOS&version=2.0.0&request=GetResultTemplate&offering=http%3A%2F%2Fwww.52north.org%2Ftest%2Foffering%2F9&observedProperty=http%3A%2F%2Fwww.52north.org%2Ftest%2FobservableProperty%2F9_3

 // getCapabilities
 http://sp7.irea.cnr.it/tomcat/MareeVe/sos/kvp?service=SOS&version=2.0.0&request=GetCapabilities


 // esempio chiamata servizio xslt con parametri
 http://adamassoft.it/jbossTest/MDService/rest/util/xsltByUrls?xml=http://adamassoft.it/corte/prova.xml&xsl=http://adamassoft.it/corte/prova.xsl&parameters=%7b%22pippo%22:%20%22due%22%7d
 */


/*
 http://10.0.0.7:8080/MareeVe/sos/kvp?
 service=SOS
 &version=2.0.0
 &request=GetResultTemplate
 &offering=offering:http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande/observations
 &observedProperty=http://vocab.nerc.ac.uk/collection/P02/current/ASLV/

 xsltproc ResultStructure_From_GetResultTemplate_json.xsl "http://10.0.0.7:8080/MareeVe/sos/kvp?service=SOS&version=2.0.0&request=GetResultTemplate&offering=offering:http://sp7.irea.cnr.it/procedure/PuntaSaluteCanalGrande/observations&observedProperty=http://vocab.nerc.ac.uk/collection/P02/current/ASLV/"

 */

