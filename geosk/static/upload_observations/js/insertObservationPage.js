/*
 *  @author Paolo Tagliolato & Fabio Pavesi - CNR IREA in Milano - www.irea.cnr.it
 * 			paolo.tagliolato@gmail.com
 *			pavesi.f@irea.cnr.it
 *
 *  [version: 1.2 beta (insertResultPage) - Temporarily abandoned]
 *  @version 1.3 beta (insertObservationPage)
 *
 *  @requires Jquery (for http requests and html page manipulation)
 *	@requires ritmaresk.xsltTransformer.js
 *	@requires ritmaresk.SOS.js
 *	@requires ritmaresk.dateUtil.js
 *  @requires ritmaresk.utils
 *	@requires ritmaresk.utils.swe.js
 *	@requires ritmaresk.utils.NamingConvention.js
 *	@requires ritmaresk.utils.insertResultHelper.js
 *  @requires prettyprint
 *  @requires gettext
 *
 */
/**
 * spinner
 * @type {{lines: number, length: number, width: number, radius: number, corners: number, rotate: number, direction: number, color: string, speed: number, trail: number, shadow: boolean, hwaccel: boolean, className: string, zIndex: number, top: string, left: string}}
 */

//var ritmaresk=ritmaresk || {};
//ritmaresk.sosupload={};

var spinner = null;
var spinner_div = 0;

var gettext = gettext || function (msg) {
        return msg;
    };
/**
 * @description executed at the end of callbacks
 * @param sCallback
 */
function receivedResponse(sCallback) {

    console.log("... received response");
    //alert("executed:"+arguments.callee.caller.name);
    spinner.stop(spinner_div);
}

function waitingResponse() {
    console.log("waiting response...");
    //if(spinner && spinner.spin)
    if (spinner == null) {
        var opts = {
            lines: 13, // The number of lines to draw
            length: 20, // The length of each line
            width: 10, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };
        spinner = new Spinner(opts).spin(spinner_div);
    } else {
        spinner.spin(spinner_div);
    }
}

//
var currentFoi = undefined, //added 20141006
    currentFois = [],
    currentProcedure = undefined;

/**
 * @description will contain resultStructure, resultEncoding, offerings (ids of offerings for currentProcedure)
 * @type {{}}
 * @todo change this var name.
 * @todo update documentation: this is a ritmaresk.utils.insertResultHelper.ResultStructure
 */
var currentDataRecordStructure = {};

/**
 * @type {ritmaresk.SOS}
 */
var sos;
/*
 var messaggi={
 it:{observationInserted:"Observations inserted",},
 en:{observationInserted:"Dati osservativi correttamente inseriti",},
 }
 */

var
    /**
     * @deprecated
     * @type function
     */
    composeResultTemplateID,
    /**
     * @deprecated
     * @type function
     */
    composeObservedPropertiesCompoundId,
    /**
     * @description reference to
     * @type function
     */
    composeFoiID_SSF_SP,
//aliasing fx
    sosInsertionOperationsResponse2json = ritmaresk.utils.swe.sosInsertionOperationsResponse2json;

var debugOn=false;
/**
 *
 * @type {{printFois: printFois, printDescription: printDescription, printXml: printXml, printJson: printJson, printString: printString}}
 */
var prettyprinter = {
    /**
     *
     * @param currentProcedure
     */
    printFois: function (currentProcedure) {
        if(debugOn){
            sos.kvp.getFeatureOfInterestByProcedure(currentProcedure, function (xml_data) {
                prettyprinter.printXml(xml_data, "#foi_xml");
            });

            sos.json.getFeatureOfInterestByProcedure(currentProcedure, function (json) {
                prettyprinter.printJson(json, "#foi_json");
            });
        }
    },
    printDescription: function (currentProcedure) {
        if(debugOn) {
            sos.getSensorDescription(currentProcedure, function (sensorDescription_json) {
                prettyprinter.printJson(sensorDescription_json.procedureDescription.description, "#sensordescription");
            });

            sos.kvp.describeSensor(currentProcedure, function (xml_data) {
                prettyprinter.printXml(xml_data, "#sensordescription_xml");
            });
        }
    },
    /**
     * @requires jQuery
     * @param xmlData
     * @param containerId
     */
    printXml: function (xmlData, containerId) {
        if(debugOn) {
            var xmlString = (new XMLSerializer()).serializeToString(xmlData);
            $(containerId)
                .removeClass("prettyprinted")
                .text(xmlString);
            prettyPrint();
        }
    },
    /**
     * @requires jQuery
     * @param jsonData
     * @param containerId
     * @param expand
     */
    printJson: function (jsonData, containerId, expand) {
        if(debugOn) {
            if (typeof expand === 'undefined') {
                expand = 3;
            }
            $(containerId)
                .removeClass("prettyprinted")
                .text(JSON.stringify(jsonData, undefined, expand));
            prettyPrint();
        }
    },
    /**
     * @requires jQuery
     * @param string
     * @param containerId
     */
    printString: function (string, containerId) {
        if(debugOn) {
            $(containerId)
                .removeClass("prettyprinted")
                .text(string);
            prettyPrint();
        }
    }
};


/**
 * @description returns the index position of the feature of interest within the array currentFois
 * @param {string} uri the uniform resource identifier of the feature of interest
 * @returns number Index of feature of interest within currentFois array. Returns undefined if not found
 */
function lookupFOI(uri) {
    for (var i = 0; i < currentFois.length; i++) {
        if (currentFois[i].identifier == uri) {
            /*return currentFois[i];*/
            return i;
        }
    }
    return undefined;
}


/**
 * @description the method obtains the feature of interest for the given procedure.
 *
 * @param {string} procedure id of the procedure/sensor currently selected by the user
 * @returns {Object[]}
 *
 {identifier:string, name:string, geometry: {type: string, coordinates: number[], crs: {type: string, properties:*}}
"name":"<xsl:value-of select="gml:name"/>",
"geometry":{
                           <xsl:choose>
                               <xsl:when test="sf:type/@xlink:href='http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint'">
 "type": "Point",
 "coordinates": [
 <xsl:value-of select="translate(sams:shape/gml:Point/gml:pos,' ',',')"/>
 ],
 "crs":{
					            	"type":"name",
					            	"properties":{
					            		<!-- TODO: fare in modo che in assenza di /www.opengis.net/def/crs/EPSG/0/ si comporti adeguatamente -->
					            		<xsl:if test="contains(sams:shape/gml:Point/gml:pos/@srsName,'/def/crs/EPSG/0/')">
 "name":"<xsl:value-of select="concat('EPSG:',substring-after(sams:shape/gml:Point/gml:pos/@srsName,'/def/crs/EPSG/0/'))"/>",
 </xsl:if>
 "srsName":"<xsl:value-of select="sams:shape/gml:Point/gml:pos/@srsName"/>"
 }
 }
 </xsl:when>
 </xsl:choose>

 },
 "sampledFeature":"<xsl:value-of select="sf:sampledFeature/@xlink:href"/>"
 */
function retrieveAllFeaturesOfInterestOfProcedure(procedure) {
    var fois2Json = ritmaresk.utils.swe.sosGetFeatureOfInterestResponse_2_Json;

    var output = fois2Json(sos.kvp.urlGetFeatureOfInterestByProcedure(procedure));

    console.log(output);

    prettyprinter.printJson(JSON.parse(output.textContent), "#foi_json_new", 4);

    var result = JSON.parse(output.textContent);
    //currentFois = result.featureOfInterest;
    return result.featureOfInterest;
}


/* @description callback functions, aware of [#capabilities #sensordescription #sensorid #sensordescription_xml #foi_xml #foi_json]
 *								#select_foi #new_foi #foiSelect #procedures
 *
 *
 * @type {{loadedCapabilities: loadedCapabilities, selectmenuchange_describeSensor: selectmenuchange_describeSensor, after_sosInsertObservation: after_sosInsertObservation}}
 */
var callback = {
    //TODO: consider in future to list the the offerings instead of the procedures (one procedure may have several offerings, the sw currently considers just the first (default?) offering associated with the procedure
    /**
     * @callback loadedCapabilities
     * @requires jQuery
     * @param cap
     */
    loadedCapabilities: function loadedCapabilities(cap) {
        prettyprinter.printJson(cap, "#capabilities");

        var allowedProcedures = Object.keys(sos.sensors),
            options = [];
        for (var i = allowedProcedures.length - 1; i >= 0; i--) {
            options.push("<option value='" + allowedProcedures[i] + "'>" + allowedProcedures[i] + "</option>");
        }
        var pp=$("#procedures");
        pp
            .append(options.join(""))
            .on("change", callback.selectmenuchange_describeSensor)
            .val([]);

        var procId = ritmaresk.utils.getQueryStringParameterByName("procedureId");

        if (procId && procId != null && procId != "" && allowedProcedures.indexOf(procId) >= 0) {
            //$("#procedures")
            pp.val(procId).change();
            console.warn("#procedures val:" +
                //$("#procedures")
                pp.val());
        }
        receivedResponse("loadedCapabilities");
        //if(procId && procId!=="" && ){}
    },

    /**
     * @callback selectmenuchange_describeSensor
     * @description Loads the Feature of interest table (Fois list obtained from SOS for the selected procedure)
     * @param event
     * @param ui
     * @requires jQuery
     */
    selectmenuchange_describeSensor: function selectmenuchange_describeSensor(event, ui) {
        waitingResponse();
        console.log(this);
        currentProcedure = $(this).val(); //ID of the current procedure chosen by the user

        $("#sensorid").html(currentProcedure);

        prettyprinter.printDescription(currentProcedure);


        setCurrentDataRecordStructure();
        console.log("proceed to compose input table");
        prepareInputTable(currentDataRecordStructure.resultStructure);

        currentFois = retrieveAllFeaturesOfInterestOfProcedure(currentProcedure);
        chooseFOI(null);


        //var formNewFOI= $("#new_foi").detach();
        var new_foi_tr = $("#featureOfInterest_new").detach();
        var foi_tbody = $("#foi_tbody");
        var options = [];
        /*
         <th>Name</th>
         <th>X coord.</th>
         <th>Y coord.</th>
         <th>SRS</th>
         <th>Sampled Feature</th>
         <th>Use</th>
         */

        function foi2htmlTr(foi,i){
            var name = ( foi.name != "" ? foi.name : foi.identifier );

            var tr= "<tr id=\"featureOfInterest_" + i + "\"><td class=\"e_foi_name\">" + name + "</td><td <td class=\"e_foi_x\">" + coordx +
            "</td><td class=\"e_foi_y\">" + coordy + "</td><td class=\"e_foi_srs\">" + foi.geometry.crs.properties.srsName +
            "</td><td class=\"e_foi_sf\"><div><a target=\"_blank\" href=\""+
                foi.sampledFeature+
                //foi.sampledFeature.replace((/&amp;/g,"%26"))+
                "\">" + foi.sampledFeature + "</a></div>" +
                "</td><td><button class='btn btn-primary' onclick=\"chooseFOI('" + foi.identifier + "');\">Use</button>" + "</td></tr>";

            console.warn("remove me --- "+tr);
            return tr;
        }

        // TODO: verificare se BUG risolto.
        // 		 caso che sembra risolto:
        //       Esempio seleziono procedure puntaSaluteCanalGrande (2 foi)
        //		 poi seleziono procedure coreSampler (ha foi ma sono linestring: il json contiene una serie di "" dove xslt non ha selezionato elementi xml) => la tabella con le foi non viene aggiornata.

        //console.log("aggiorno FOI: inizio");
        var minx = 0, maxx = 0, miny = 0, maxy = 0;
        for (var i = 0; currentFois && i < currentFois.length; i++) {
            //var name = ( currentFois[i].name != "" ? currentFois[i].name : currentFois[i].identifier );

            if (Object.keys(currentFois[i].geometry).length > 0) { //possibile soluzione bug
                var coordx = ( currentFois[i].geometry.coordinates ? currentFois[i].geometry.coordinates[0] : "");
                var coordy = ( currentFois[i].geometry.coordinates ? currentFois[i].geometry.coordinates[1] : "");

                options.push(foi2htmlTr(currentFois[i]));
                /*
                options.push("<tr id=\"featureOfInterest_" + i + "\"><td class=\"e_foi_name\">" + name + "</td><td <td class=\"e_foi_x\">" + coordx +
                "</td><td class=\"e_foi_y\">" + coordy + "</td><td class=\"e_foi_srs\">" + currentFois[i].geometry.crs.properties.srsName +
                "</td><td class=\"e_foi_sf\"><div><a href=\""+currentFois[i].sampledFeature+"\">" + currentFois[i].sampledFeature + "</a></div></td><td><button class='btn btn-primary' onclick=\"chooseFOI('" + currentFois[i].identifier + "');\">Use</button>" + "</td></tr>");
                */
                //compute map bounds and add them as a variable to currentFois
                minx = minx > coordx ? coordx : minx;
                minx = miny > coordy ? coordx : miny;
                maxx = minx < coordx ? coordx : maxx;
                maxy = maxy < coordy ? coordy : maxy;
            }
        }
        currentFois.bounds = [
            [minx, miny],
            [maxx, maxy]
        ];


        // #new_foi is the form
        // flush the table and replace with just the new foi form...
        //console.log(formNewFOI);

        //$("#new_foi").parent().html(trNewFOI);//quando cambia la procedure devo svuotare il tbody e ripristinare la riga della nuova foi.
        // ...then prepend the rows for the existing fois
        //$("#new_foi").parent().
        foi_tbody.html(new_foi_tr);
        foi_tbody.prepend(options.join(""));
        //$("#new_foi").parent().prepend(options.join(""));

        prettyprinter.printFois(currentProcedure);

        $('#wiztabs a[href!="#procedureSelect"]').show();

        //$("a[href='#foiSelect']").trigger("click");
        $('#wiztabs a[href="#foiSelect"]').tab('show');

        //refreshGeoJsonLayer();
        receivedResponse("selectmenuchange_describeSensor");

    },

    /**
     * @callback after_sosInsertObservation
     * @description if something went wrong notify the user. If the operation completed successfully clear the "handsontable"
     * @param responseXmlDocument
     * @requires jQuery
     * @deprecated
     */
    after_sosInsertObservation: function after_sosInsertObservation(responseXmlDocument) {
        var res = sosInsertionOperationsResponse2json(responseXmlDocument);
        if (res && res.response) {

            res = res.response;

            if (res.ExceptionReport) {
                notifyUser(gettext("Exception inserting results into SOS endpoint: ") + res.ExceptionReport.text);
                console.exception("Results not inserted");
            }

            else {
                console.log("result inserted");
                notifyUser(gettext("Observations inserted"));
                //TODO: move table cleaning into multiple promises handler
                $("#insertResultTable").handsontable('getInstance').loadData([]);//empty table
                $("#resultTime").val("");
            }
        }
        receivedResponse("after_sosInsertObservation");
    }

};


/**
 *  @description user chooses "use" on new foi:
 *   read & check user input
 *   compose foi id from user input
 *   call chooseFoi
 *  @requires jQuery
 */
function newFoi() {
    console.log("new foi for: " + currentProcedure);

    var foi_id,
        fname = $("#foi_name").val(),
        foi_x = $("#foi_x").val(),
        foi_y = $("#foi_y").val(),
        fsrs = $("#foi_srs").val(),
        fsf = $("#foi_sf").val();

    console.warn("srs: " + fsrs);

    if (fname && foi_x && foi_y && fsrs && fsf) {

        foi_id = composeFoiID_SSF_SP(fsrs, foi_x, foi_y);

        console.warn("validation not implemented yet");
        // TODO: check mandatories.
        /*
         var missing=[];
         if(!fname || fname===""){missing.push("name");}
         if(!fx || fx==="" || typeof fx != "numeric"){missing.push("x coord");}
         if(!fx || fx===""){missing.push("");}
         */

        /*
         var foi={
         "identifier":foi_id,
         "name":fname,
         "geometry":{
         "type": "Point",
         "coordinates":[foi_x,foi_y],
         "crs": {
         "type": "name",
         "properties": {
         "srsName": fsrs
         }
         }
         },
         "sampledFeature":fsf,
         };
         */

        var foi = ritmaresk.utils.swe.composeFoiJson_SSF_SSP(foi_id, fname, foi_x, foi_y, fsrs, fsf);
        foi.isNew = true;

        console.log(JSON.stringify(foi, 2));

        chooseFOI(foi.identifier, foi);
    }
    else {
        notifyUser(gettext("To create a new feature of interest you must fill in all the fields"));

    }
}


/**
 *    @description user action: user chooses "use" (existing or new foi)
 *    check if template exists for current procedure and chosen foi
 *    if not: compose the xml for executing insertResultTemplate on sos endpoint.
 *      Then call prepareInputTable
 *
 * @param foiUri
 * @param newfoi
 */
function chooseFOI(/** {String} */foiUri, /** {Object} */newfoi) {
    waitingResponse();
    $("#foi_tbody>tr").removeClass("selected");

    console.warn("Choose foi(" + foiUri + "," + JSON.stringify(newfoi) + ")");
    if (foiUri) {
        var foiNum = (newfoi) ? null : lookupFOI(foiUri);
        var foi = (newfoi) ? newfoi : currentFois[foiNum];


        //setCurrentFoi(foi);
        currentFoi = foi;

        if (!currentFoi.isNew) $("#featureOfInterest_" + foiNum).addClass("selected");
        else $("#featureOfInterest_new").addClass("selected");

        // go to the third panel
        $("a[href='#resultInsert']").trigger("click");
    }
    else {
        //setCurrentFoi(null);
        currentFoi = null;
    }
    /*setCurrentDataRecordStructure();
     //setTemplate(foi);

     console.log("proceed to compose input table");
     prepareInputTable(currentDataRecordStructure.resultStructure);*/
    receivedResponse("chooseFOI");
}


/**
 * @description returns, as an XMLDocument object, the SensorDescription associated to the requested procedureId
 * @param procedureId
 * @returns {Object}
 */
function getXmlDoc_SensorDescription(procedureId) {
    //var xmlRTemplate;
    var xslt = ritmaresk.XsltTransformer.getInstance();
    var xml;// Document object: sensorDescription already loaded in sos object or describeSensor to get from sos kvp endpoint

    if (sos.sensors[procedureId] && sos.sensors[procedureId].procedureDescription && sos.sensors[procedureId].procedureDescription.description) {
        xml = xslt.loadXMLDocFromString(sos.sensors[procedureId].procedureDescription.description);
    }
    // else load it directly from sos.kvp endpoint
    else {
        xml = xslt.loadXMLDoc(sos.kvp.urlDescribeSensor(procedureId));
    }

    return xml;
}


/**
 * @description sets the value of the global variable currentDataRecordStructure: array of objects of this kind:
 *
 *
 * {
 *        resultStructure:{fieldName,fieldType,fieldDefinition,uom_code_value,uom_code_href},
 *        columns:[]
 * }
 *
 */
function /**{void}*/setCurrentDataRecordStructure() {

    //{resultStructure:[{fieldName,fieldType,fieldDefinition,uom_code_value,uom_code_href}],resultEncoding:{textEncoding:{tokenSeparator, blockSeparator}}}
    function getDataRecordStructure(procedureId) {
        //var xslt = ritmaresk.XsltTransformer.getInstance();
        var xml = getXmlDoc_SensorDescription(procedureId);// Document object: sensorDescription already loaded in sos object or describeSensor to get from sos kvp endpoint
        return ritmaresk.utils.insertResultHelper.sensorDescription2DataRecordStructure(xml);
    }

    currentDataRecordStructure = getDataRecordStructure(currentProcedure);
}

/**
 * @requires jQuery
 * @param dataRecordStructure
 */
function prepareInputTable(dataRecordStructure) {
    dataRecordStructure = dataRecordStructure || currentDataRecordStructure.resultStructure;
    var btnInsertResult=$("button[name='insertResult']");
    btnInsertResult.off("click");

    var afterChangeFx = function () {
        console.log("afterChangeFx");
        var dateinfo = ritmaresk.utils.insertResultHelper.getDateColumnsInfo("#insertResultTable");
        console.log(dateinfo);
        if (dateinfo.phenomenonTime) {
            var resultTime = dateinfo.phenomenonTime.minmaxdate[1];
            $("#resultTime").val(resultTime);
        }
    };

    $("#resultTime").val("");

    var ds = ritmaresk.utils.insertResultHelper.dataSchemaFromDataRecordStructure(dataRecordStructure);

    ritmaresk.utils.insertResultHelper.loadTableLegend("#insertResultTableLegend", dataRecordStructure);
    ritmaresk.utils.insertResultHelper.loadTable("#insertResultTable", ds.dataSchema, ds.columns, ds.columnsExtraInfo, afterChangeFx);

    // enable insertObservation (actually named insertResult) button
    btnInsertResult.on("click", function () {
        performInsertObservationWorkflow();
    });

    $("button[name='resetTable']").on("click", function () {
        prepareInputTable();
    });

}


function performInsertObservationWorkflow() {
    //performInsertObservationWorkflow_DataArray();
    performInsertSplittedObservationsWorkflow();
}
/**
 * @deprecated old version: prepare a dataArray with all the observedProperty and post a single insertObservation to the sos.
 * @param resultTime
 */
function performInsertObservationWorkflow_DataArray(resultTime) {
    var dateinfo = ritmaresk.utils.insertResultHelper.getDateColumnsInfo("#insertResultTable");

    /**
     * @description dump user input in the format for SOS.
     * @deprecated
     * @requires JQuery
     * @returns {{values: String, elementCount: Number}}
     */
    function composeResultValuesAndInfoFromHandsontable() {
        //TODO: rendere indipendente il codice dall'id dell'elemento con handsontable
        var userDataArray = $("#insertResultTable").data('handsontable').getData();

        //var tbl = $("#insertResultTable").data('handsontable');


        var record_separator = "@",
            field_separator = "#",
            results = [],
            resultsString;

        if (currentDataRecordStructure.resultEncoding && currentDataRecordStructure.resultEncoding.textEncoding) {
            field_separator = currentDataRecordStructure.resultEncoding.textEncoding.tokenSeparator;
            record_separator = currentDataRecordStructure.resultEncoding.textEncoding.blockSeparator;
        }

        if (userDataArray && userDataArray.length > 0) {

            for (var i = 0; i < userDataArray.length; i++) {
                var record = [];
                var current = userDataArray[i];
                var k = Object.keys(current);
                var atLeastOne = false;

                for (var j = 0; j < k.length; j++) {
                    if (current[k[j]]) {
                        atLeastOne = true;
                    }
                    record.push(current[k[j]]);
                    //console.log([k[j]),current[k[j]]].join(" : "));
                }

                if (atLeastOne) {
                    results.push(record.join(field_separator));
                }
            }
            resultsString = results.join(record_separator);
        }

        console.log(resultsString);
        return ({
            values: resultsString,
            elementCount: results.length
        });
    }

    var insertObservation = function (phenomenonTimeMin, phenomenonTimeMax, resultTime, procedureId, observedPropertyId, foi, elementCount, values, resultEncoding) {

        var sk_dns = sk_domain_name;

        //var xmlRTemplate;
        //var xslt = ritmaresk.XsltTransformer.getInstance();
        var xml = getXmlDoc_SensorDescription(procedureId);// Document object: sensorDescription already loaded in sos object or describeSensor to get from sos kvp endpoint

        var xmlStringInsertObservation = ritmaresk.utils.namingConvention.xmlProducer.sensor2InsertObservation(
            phenomenonTimeMin, phenomenonTimeMax,
            resultTime, foi, elementCount,
            values, resultEncoding,
            sk_dns, xml);

        console.log(xmlStringInsertObservation);
        prettyprinter.printString(xmlStringInsertObservation, "#insertResultTemplate");

        sos.pox.insertObservation(xmlStringInsertObservation, callback.after_sosInsertObservation);

    };

    if (dateinfo.phenomenonTime) {

        resultTime = resultTime || dateinfo.phenomenonTime.minmaxdate[1];

        var rr = composeResultValuesAndInfoFromHandsontable();

        insertObservation(
            dateinfo.phenomenonTime.minmaxdate[0], dateinfo.phenomenonTime.minmaxdate[1],
            resultTime,//if specified ... ???
            currentProcedure,
            composeObservedPropertiesCompoundId(currentProcedure),// TODO: modificare!!
            currentFoi, // lascio che la logica e la scelta tra foi.isNew o meno la faccia il metodo sottostante...
            rr.elementCount,
            rr.values,
            currentDataRecordStructure.resultEncoding
        );

    }
}

/**
 * @requires jQuery
 */
function performInsertSplittedObservationsWorkflow() {
    if (!currentFoi) {
        notifyUser(gettext("Please select a location first."));
        $('#wiztabs a[href="#foiSelect"]').tab('show');
        return;
    }

    // TODO: completare
    /**
     * @description compose an Array of intermediate xml document (sp7 namespace, root element sp7:InsertObservation).
     * The obtained xml string is the one to be processed by sp7InsertObservations2MultipleInsertObservationSplitArray.xsl
     * With the optional parameter splitIntoMultipleDocs two arrays of resp. string and xmlDocuments are returned (for SOS v.1 getObservation compatibility issue)
     * @requires jQuery
     * @param splitIntoMultipleDocs
     * @returns {{xmldocstring_array: Array, xmldoc_array: Array, observedProperty_array: Array, tableHeader_array: Array, tableColIndex_array: Array}}
     * @todo agire qui in modo da evitare di considerare colonne che in handsontable risultino disabilitate
     */
    function composeSp7InsertObservationXmlDocFromHandsontable(/*boolean*/ splitIntoMultipleDocs) {

        console.log("PROMEMORIA: finire l'implementazione!");
        //TODO: rendere indipendente il codice dall'id dell'elemento con handsontable
        //TODO: possible refactoring: put this method in ritmaresk.utils.NamingConvention (or in insertResulthelper!!!)

        var offering = currentDataRecordStructure.offerings[0];
        var procedure = currentProcedure;

        var record_separator = "@",
            field_separator = "#";

        if (currentDataRecordStructure.resultEncoding && currentDataRecordStructure.resultEncoding.textEncoding) {
            field_separator = currentDataRecordStructure.resultEncoding.textEncoding.tokenSeparator;
            record_separator = currentDataRecordStructure.resultEncoding.textEncoding.blockSeparator;
        }

        var tbl = $("#insertResultTable").data('handsontable');

        var positionOfPhenomenonTimeColumn = tbl.getColHeader().indexOf("phenomenonTime");
        var phenomenonTimeColumn = tbl.getDataAtCol(positionOfPhenomenonTimeColumn);//array of time instants

        //TODO: if necessary, put the logic for intercepting coincident timestamps here: add millesecs in order to distinguish among different records
        /*
         var last, changed, pcount=0;
         last=phenomenonTimeColumn[0];
         for(var rr =1; rr< phenomenonTimeColumn.length; rr++){
         if(last===phenomenonTimeColumn[rr]){

         phenomenonTimeColumn[rr]=changed+("%3d",pcount);

         }
         else{
         last=phenomenonTimeColumn[rr];
         }

         }
         */

        var tablecolumn, header;
        var vcount, vals, curResStruct, sp7FieldArray = [];//count number of values for single property
        var observedProperties = [], tableHeaders = [], tableColIndexes = [];//additional Info to pass to result
        var docstr_array = [], xml = [], xslt = ritmaresk.XsltTransformer.getInstance();
        var docstr;
        var isreadonly;

        //map each column into an sp7Field
        //TODO: ignorare le colonne disabilitate (sono già andate a buon fine!)
        for (var col = 0, l = currentDataRecordStructure.resultStructure.length; col < l; col++) {
            vcount = 0;
            vals = [];
            curResStruct = currentDataRecordStructure.resultStructure[col];
            if (tbl.ritmareskColumnsExtraInfo &&
                tbl.ritmareskColumnsExtraInfo.columns &&
                tbl.ritmareskColumnsExtraInfo.columns[col] &&
                tbl.ritmareskColumnsExtraInfo.columns[col].readOnly) {
                isreadonly = true;
            }
            else isreadonly = false;

            if (col !== positionOfPhenomenonTimeColumn && !isreadonly) {

                tablecolumn = tbl.getDataAtCol(col);//array of values for the current column
                header = tbl.getColHeader(col);
                console.log(curResStruct.fieldType);
                if (header !== curResStruct.fieldName) {
                    throw("ERROR: table and data record structure do not coincide. dbg: insertObservationPage composeSp7InsertObservationXmlDocFromHandsontable()");
                }
                for (var row = 0, l2 = tablecolumn.length; row < l2; row++) {
                    if (tablecolumn[row]) {
                        vcount++;
                        vals.push(phenomenonTimeColumn[row] + field_separator + tablecolumn[row])
                    }
                }

                sp7FieldArray.push(new ritmaresk.utils.namingConvention.xmlProducer.Sp7Field(curResStruct.fieldName, curResStruct.fieldType, curResStruct.fieldDefinition, curResStruct.uom_code_value, vcount, vals.join(record_separator)));
                observedProperties.push(curResStruct.fieldDefinition);
                tableHeaders.push(header);//I need this to handle failures later
                tableColIndexes.push(col);
                //direct insert in docstr, xml
                if (splitIntoMultipleDocs) {
                    docstr=ritmaresk.utils.namingConvention.xmlProducer.toSp7XMLInsertObservations(offering, procedure, sp7FieldArray);
                    docstr_array.push(docstr);
                    xml.push(xslt.loadXMLDocFromString(docstr));
                    sp7FieldArray = [];//empty the array
                }
            }
        }

        if (!splitIntoMultipleDocs) {
            docstr_array.push(ritmaresk.utils.namingConvention.xmlProducer.toSp7XMLInsertObservations(offering, procedure, sp7FieldArray));
            xml.push(xslt.loadXMLDocFromString(docstr_array));
        }
        return ({
            xmldocstring_array: docstr_array,
            xmldoc_array: xml,
            observedProperty_array: observedProperties,
            tableHeader_array: tableHeaders,
            tableColIndex_array: tableColIndexes
        });

    }

//*/


    /**
     *
     * @param phenomenonTimeMin
     * @param phenomenonTimeMax
     * @param resultTime
     * @param foi
     * @param resultEncoding
     * @param {boolean} oneRequestForEachObservedProperty
     */
    function insertSplittedObservations(phenomenonTimeMin, phenomenonTimeMax, resultTime, foi, resultEncoding, oneRequestForEachObservedProperty) {

        var sk_dns = sk_domain_name;

        //obtain intermediate sp7:InsertObservations xml document array

        //sos v2.0.0
        //var sp7InsertObservations = composeSp7InsertObservationXmlDocFromHandsontable();

        //sos v1.0.0 compatible
        var sp7InsertObservations = composeSp7InsertObservationXmlDocFromHandsontable(oneRequestForEachObservedProperty);

        /**
         * If the jqXHR is resolved (HTTP:200), but the SOS returned some other ows:Exception, add it to
         * jqXHR.additionalInfo.exceptionReport
         * @param data
         * @param status
         * @param {jQuery.jqXHR} jqXHR
         * @note this is for single sos requests
         */
        function trackOwsException(data, status, jqXHR) {
            ritmaresk.utils.debugArgs(arguments, "insertObservationPage.js - 876 - trackOwsException");
            var res = sosInsertionOperationsResponse2json(data);
            if (res && res.response) {

                res = res.response;

                if (res.ExceptionReport) {
                    jqXHR.additionalInfo.exceptionReport = gettext("Exception inserting results for ") + jqXHR.additionalInfo.tableHeader + gettext(" into SOS endpoint: ") + res.ExceptionReport.text;
                    //notifyUser(gettext("Exception inserting results into SOS endpoint: ") + res.ExceptionReport.text);
                    console.exception("Results not inserted for column: " + jqXHR.additionalInfo.tableColIndex);
                    jqXHR.additionalInfo.state = "failed";
                }

                else {
                    jqXHR.additionalInfo.state = "inserted";
                    console.log("results inserted for " + jqXHR.additionalInfo.tableHeader + " column: " + jqXHR.additionalInfo.tableColIndex);
                }
            }
        }

        //obtain parameters for xslt sp7InsertObservations2MultipleInsertObservationSplitArray.xsl

        //transform each xml doc sp7:InsertObservations into xml string sos:InsertObservation

        var promises = [], promise;
        for (var i = 0, l = sp7InsertObservations.xmldoc_array.length; i < l; i++) {

            var sXmlSosInsertObservation = ritmaresk.utils.namingConvention.xmlProducer.sp7InsertObservations2InsertMultipleObservationsSplitArray(
                phenomenonTimeMin, phenomenonTimeMax, resultTime, foi, resultEncoding, sk_dns, sp7InsertObservations.xmldoc_array[i]
            );

            console.log(sXmlSosInsertObservation);
            //console.log("TODO: please decomment post to sos.pox");
            // TODO: check the behaviour of multiple calls to the callback
            //sos.pox.insertObservation(sXmlSosInsertObservation, callback.after_sosInsertObservation);

            promise = sos.pox.insertObservation(sXmlSosInsertObservation);//this is a promise!


            promise.additionalInfo = {
                observedProperty: sp7InsertObservations.observedProperty_array[i],
                tableHeader: sp7InsertObservations.tableHeader_array[i],
                tableColIndex: sp7InsertObservations.tableColIndex_array[i],
                state: "pending"
                //exceptionReport will be possibly added by trackOwsException
            };

            // when the promise is fulfilled (not failed for http errors) store possible sos exceptions in jqXHR.additionalInfo
            promise.done(trackOwsException);

            promises.push(promise);
        }


        /*
         function some_failure(jqXHR, textStatus, errorThrown) {
         //console.warn("some failed: jqXHR");
         //console.debug(JSON.stringify(jqXHR.myInfo, false, 3));

         ritmaresk.utils.debugArgs(arguments, "--> some sos promise failed:");
         console.log(" ------ ");
         console.warn(" (resolved and rejected) requests list (myInfo):");
         console.log(jqXHR.resolved.map(function (d){return d.jqXHR.additionalInfo}));
         console.log(jqXHR.rejected.map(function (d){return d.jqXHR.additionalInfo}));
         }

         function all_success(jqXHR) {
         ritmaresk.utils.debugArgs(arguments, "--> all Promises fulfilled:");
         console.log(" ----- ");
         console.warn(" (resolved and rejected) requests list (myInfo):");
         console.log(jqXHR.resolved.map(function (d){return d.jqXHR.additionalInfo}));
         console.log(jqXHR.rejected.map(function (d){return d.jqXHR.additionalInfo}));
         }
         */

        //TODO: proseguire da qui
        /**
         *
         * @param {jQuery.jqXHR} jqXHR which contains additionalInfo object: {observedProperty, tableHeader, tableColIndex}
         */
        function anyway(jqXHR) {
            // valutare se agire su handsontable
            // si potrebbe marcare ogni colonna con "completato" o "pending"
            // andrebbe allora modificato il codice che invia le osservazioni: dovrebbe considerare unicamente
            //  quelle colonne ancora "pending" (o "failed")
            //  le colonne completate dovrebbero essere disabilitate per l'edititing.
            //  andrebbe infine cancellata tutta la tabella se le colonne fossero tutte completate, o su richiesta
            //  esplicita dell'utente (tramite un bottone, direi).
            //
            //Arrays
            var resolved = jqXHR.resolved, rejected = jqXHR.rejected;
            ritmaresk.utils.debugArgs(arguments, "--> insertObservationPage.js - 919 - anyway");
            console.log(" ----- ");
            console.warn(" (resolved and rejected) requests list (myInfo):");
            console.log(jqXHR.resolved.map(function (d) {
                return d.jqXHR.additionalInfo
            }));
            console.log(jqXHR.rejected.map(function (d) {
                return d.jqXHR.additionalInfo
            }));
            var exceptions = [];
            var successes = [];
            var cols2Clear = [];

            resolved.map(function (d) {

                if (d.jqXHR.additionalInfo.state === "failed") {
                    exceptions.push(d.jqXHR.additionalInfo.exceptionReport);
                }
                //if ok clean the table column!
                else {
                    successes.push(d.jqXHR.additionalInfo.tableHeader);
                    console.log("clean table column " + d.jqXHR.additionalInfo.tableColIndex + " (" + d.jqXHR.additionalInfo.tableHeader + ") for successful observation insertion:");
                    cols2Clear.push(d.jqXHR.additionalInfo.tableColIndex);
                }
            });
            var all_ok = rejected.length === 0 && exceptions.length === 0;


            if (all_ok) {
                ritmaresk.utils.insertResultHelper.resetTableData("#insertResultTable");
                notifyUser(gettext("Observations inserted"));
            }
            else {
                rejected.map(function (d) {
                    //TODO: the same for rejected
                    exceptions.push(d.errorThrown);
                });

                var msg = gettext("Some exception occurred inserting results into SOS endpoint.") + "\n";
                //msg+="<ul><li>"+exceptions.join("</li><li>")+"</li></ul>";
                msg += " - " + exceptions.join("\n - ");
                msg +=
                    successes.length === 0 ? "" : gettext("Only the following columns were successfully inserted:") +
                    "<br/> " + successes.join("</br> ");
                msg += gettext("Please correct the errors, if possible, and retry, or reset the table.");


                ritmaresk.utils.insertResultHelper.disableTableColumns("#insertResultTable", cols2Clear);
                notifyUser(msg);
            }


            // TODO: pulire le colonne dei dati inviati correttamente ma attenzione (non eliminarle oppure ordinare gli indici e partire con l'eliminazione da quelli più alti in modo che non si eliminino colonne sbagliate!)
            console.warn("dovrei eleiminare le seguenti colonne:" + cols2Clear);
            console.warn("alcune colonne non sono state inserite:\n" + exceptions);
        }


        ritmaresk.utils.whenAll(promises).always(anyway);//.fail(some_failure);
        //ritmaresk.utils.whenAll(promises).done(all_success).fail(some_failure);
        //$.when.apply($, promises).done(all_success).fail(some_failure);

        //TODO: Evaluate if the namingConvention module is appropriate for hosting the method

    }

    var dateinfo = ritmaresk.utils.insertResultHelper.getDateColumnsInfo("#insertResultTable");
    var resultTime;

    if (dateinfo.phenomenonTime) {
        console.log("phenomenonTimePeriod: ");
        console.log(dateinfo.phenomenonTime);

        resultTime = $("#resultTime").val() || dateinfo.phenomenonTime.minmaxdate[1];
        console.log("resultTime  : " + resultTime);

        insertSplittedObservations(
            dateinfo.phenomenonTime.minmaxdate[0], dateinfo.phenomenonTime.minmaxdate[1],
            resultTime,//if specified ...
            currentFoi,
            currentDataRecordStructure.resultEncoding,
            true
        );
    }
    else throw("ERROR: the required parameter phenomenonTime was not found");
}


// TODO: modificare per esempio in un messaggio in un pannellino apposito
function notifyUser(msg) {
    alert(msg);
}

var console = console || {};

/*
 var notifyDeveloper=console1.log || function (msg,method){
 msg+=" [line:"+arguments.callee.caller+"]";
 //alert(msg);
 if (method === "warn" && console.warn) console.warn(msg);
 else if (method === "exception" && console.exception) console.exception(msg);
 else if(console.log) console.log(msg);
 };
 */

var map, currentFoisGeoJsonLayer;//, newFoiGeoJsonLayer;

function currentFois2GeoJson() {
    var coll = [];
    // REMARK: it is assumed at the moment a CRS with lat-lon order of coordinates: in geoJson the order must be reversed
    for (var i = 0; currentFois && i < currentFois.length; i++) {
        var f = {
            "type": "Feature",
            "properties": {
                "identifier": currentFois[i].identifier,
                "name": currentFois[i].name
            },
            "geometry": {
                "type": currentFois[i].geometry.type,
                "coordinates": [currentFois[i].geometry.coordinates[1], currentFois[i].geometry.coordinates[0]]
            },
            "crs": currentFois[i].geometry.crs
        };

        coll.push(f);
        //var o=geojLayer.addData(f);
        //console.log(JSON.stringify(f));
    }
    console.log(JSON.stringify(coll));
    var res = {"type": "FeatureCollection", "features": coll};
    console.log(JSON.stringify(res));
    return res;
}

function refreshGeoJsonLayer() {
    //45.42106/12.34355
    console.log("begin refresh");

    currentFoisGeoJsonLayer.clearLayers();
    currentFoisGeoJsonLayer.addData(currentFois2GeoJson());

    console.warn("currentFois.length:" + currentFois.length);

    if (currentFois.length > 0) {

        map.fitBounds(currentFoisGeoJsonLayer.getBounds(), {maxZoom: 15});
        // NOTE: added maxZoom in order to prevent a visualization without a base layer)
    }
    else {
        map.setView([41.8401, 12.5332], 5);
    }

    console.log("finished refresh");

    //
    if(!map.newfoimarker && currentFoi && currentFoi.isNew){
        map.newfoimarker = L.marker(currentFoi.geometry.coordinates.map(Number), {icon: L.icon({
            iconUrl:'css/images/marker-icon-green-2x.png',
            iconSize:    [25, 41],
            iconAnchor:  [12, 41],
            popupAnchor: [1, -34],
            shadowSize:  [41, 41]
        })});
        map.newfoimarker.addTo(map);
    }

    //let the layer appear!
    $('#currentFoisGeoJsonLayerLabel').click();


}


/** @global
 *
 * @param {Object} latlng
 */
function setCoordsForNewFoi(latlng) {
    console.log(JSON.stringify(latlng));
    $("#foi_x").val(latlng.lat);//TODO: lat is y !!!
    $("#foi_y").val(latlng.lng);

    if (map.newfoimarker) {
        map.newfoimarker.setLatLng(latlng).update();
    }
    else {
        //map.newfoimarker = L.marker(latln,);//,, icon: L.divIcon({className: 'leaflet-div-icon'}
        map.newfoimarker = L.marker(latlng, {icon: L.icon({
            iconUrl:'css/images/marker-icon-green-2x.png',
            iconSize:    [25, 41],
            iconAnchor:  [12, 41],
            popupAnchor: [1, -34],
            shadowSize:  [41, 41]
        })});
        map.newfoimarker.addTo(map);
    }


    map.closePopup();
}

/** @global */
function setSampledFeatureForNewFoi(sfURI) {

    $("#foi_sf").val(sfURI);
    map.closePopup();
}

/**
 *
 */
function loadMap() {

    console.log("loading map");

    var baseLayers = {}, overlayMaps = {};

    // utility function
    function latlng2string(latlng) {
        return "(lat: " + latlng.lat + ", lon: " + latlng.lng + ")"
    }
    function currentFoiPopupHtml(feature){
       console.warn(JSON.stringify(feature));
       return "<h4>"+feature.properties.name+"</h4>"
           +"lat: "+feature.geometry.coordinates[1]+ "</br>"
           +"lon: "+feature.geometry.coordinates[0]+ "</br>"
        +"<button class='btn btn-primary' onclick='chooseFOI(\"" + feature.properties.identifier + "\");'>"
        + gettext("Use")
           //+gettext("Use this Feature of Interest")
           + "</button>";
        //+ "</br>"
        //+ latlng2string(L.GeoJSON.coordsToLatLng(feature.geometry.coordinates));
    }
    function clickOnMapPopupHtml(latlng){
        return "<button class='btn btn-link' onclick='setCoordsForNewFoi(" + JSON.stringify(latlng) + ")'>"
            + gettext("Set this as the sampling position<br/> for the new feature") + "</button>" +
            "<br/>" + latlng2string(latlng);
    }

    // --- Init (clear and initialize map) ----
    if (map) {
        console.log("removing map");
        map.remove();
        map = undefined;
        //overlayMaps={};//TODO:se overlayMaps viene spostato in map.
    }
    map = map || L.map('map');

    // --- base OSM map ---
    baseLayers["OpenStreetMap"] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    ).addTo(map);


    // --- load WMS layers ---
    ritmaresk.utils.swe.wmsGetLayersWFS_NameTitleType(geoserveruri).forEach(function (l) {
            overlayMaps[l.title] = addWmsLayer(geoserveruri, l.name, map);
        });

    // popup with link to set the FoI coordinates (EPSG:4326)
    map.on('contextmenu', function onMapClick(e) {
        L.popup()
            .setLatLng(e.latlng)
            .setContent(clickOnMapPopupHtml(e.latlng))
            .openOn(map);
    });

    // --- init leaflet control (overlay selection) ---
    var lcontrol = L.control.layers(baseLayers, overlayMaps).addTo(map);

    // --- load existing FoI (geoJSON layer)
    currentFoisGeoJsonLayer = L.geoJson();
    currentFoisGeoJsonLayer.options = {
        style: function (feature) {
            return {color: "blue"};
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(currentFoiPopupHtml(feature)).openPopup();
        }
    };

    lcontrol.addOverlay(
        currentFoisGeoJsonLayer,
        "<div id='currentFoisGeoJsonLayerLabel' style='display: inline-block;vertical-align:middle;color:blue;'>"+
        gettext("Available Features of Interest<br/>for the current procedure")+
        "</div>"
    );

    // testing Leaflet control locate
    L.control.locate().addTo(map);

    refreshGeoJsonLayer();
}


/**
 * //TODO: fare prova con wms (betterWms supporta getfeatureinfo) per scelta SampledFeature
 * @param {string} url wms endpoint
 * @param {string} layerName as returned wms capabilities
 * @param {Leaflet.map} map
 * @returns {*}
 */
function addWmsLayer(url, layerName, map) {
    console.log("loading wms");

    // load betterWms for handling getFeatureInfo
    var sampledFeatureWmsLayer = L.tileLayer.betterWms(url, {
        layers: layerName,
        transparent: true,
        format: 'image/png',
        info_format: 'application/json'
    });

    /**
     * returns an HTML string with (max) the first 7 wfs attributes-values of the feature
     * @param feature
     * @returns {string}
     */
    function summaryOfFeatureProperties(feature) {
        //globalFeatureDebug = feature;
        //ritmaresk.utils.debugArgs(arguments, "summaryOfFeatureProperties");
        //{Object} properties
        var res = "<ul>";
        //for(var k in Object.keys(feature.properties)){
        var propKeys=Object.keys(feature.properties);
        propKeys.slice(0,7).forEach(function (k) {
            //do not report null values
            if (feature.properties[k]) {
                //res+="<tr><td>"+k+"</td>:</tr>"+
                res += "<li><b>" + k + "</b>:" + feature.properties[k] + "</li>";
            }
        });
        if(propKeys.length>7){
            res+="<li>(...)</li>"
        }
        res += "</ul>";
        return res;
    }

    /**
     * @todo check if fids in geonode layers are actually UIDs. This is a precondition for obtaining URIs (see http://gis.stackexchange.com/questions/23006/allow-geoserver-wfs-request-by-featureid)
     * @param feature
     * @param typeName
     * @returns {geoserveruri|*}
     */
    function localWfsGetFeatureURI(feature, typeName) {
        if (typeName) return url + "?" +
            "service=WFS&version=1.0.0&request=GetFeature&typeName=" + typeName + "&FeatureId=" + feature.id + "&srsName=epsg:4326";
        else return url + "?" +
            "service=WFS&version=1.0.0&request=GetFeature&FeatureId=" + feature.id + "&srsName=epsg:4326";
    }

    //override showGetFeatureInfo
    //map.
    sampledFeatureWmsLayer.showGetFeatureInfo = function (err, latlng, content) {
        if (content.features.length === 0)return;
        if (err) {
            console.log("error" + err);
            return;
        } // do nothing if there's an error

        var popupHtml = "<table>";
        content.features.map(function (feature) {
            popupHtml += "<tr><button class='btn btn-link' onclick='setSampledFeatureForNewFoi(\"" + localWfsGetFeatureURI(feature) + "\")' title='" + feature.id + "'>"
            + gettext("Use this as the sampled feature") + "</button>" +
            "</td></tr><tr><td>" + summaryOfFeatureProperties(feature) + "</td></tr>";
        });
        popupHtml += "</table>";

        L.popup({maxWidth: 800})
            .setLatLng(latlng)
            .setContent(popupHtml)
            .openOn(map);
    };


    //map.
    //sampledFeatureWmsLayer.addTo(map);
    return sampledFeatureWmsLayer;
    //console.log("loaded wms");
    // esempio

    // ----- REQUEST:
    //test-sk.irea.cnr.it/geoserver/ows?REQUEST=GetFeatureInfo&SERVICE=WMS&SRS=EPSG%3A4326&STYLES=&TRANSPARENT=true&VERSION=1.1.1&FORMAT=image%2Fpng&BBOX=12.84627914428711%2C45.17485220699916%2C12.869153022766113%2C45.18090248201926&HEIGHT=400&WIDTH=1066&LAYERS=geonode%3Aretepozzi_ve&QUERY_LAYERS=geonode%3Aretepozzi_ve&INFO_FORMAT=application/json&X=512&Y=333
    // test-sk.irea.cnr.it/geoserver/ows?
    // REQUEST=GetFeatureInfo&
    // SERVICE=WMS&
    // SRS=EPSG%3A4326& // questo, nella risposta di geoserver, non modifica l'SRS restituito che è comunque quello di default del layer. Bisogna interrogare il wfs con getFeatureInfo per avere la trasformazione nel SRS desiderato (cfr sotto)
    // STYLES=&TRANSPARENT=true&
    // VERSION=1.1.1&
    // FORMAT=image%2Fpng&
    // BBOX=12.84627914428711%2C45.17485220699916%2C12.869153022766113%2C45.18090248201926&
    // HEIGHT=400&
    // WIDTH=1066&
    // LAYERS=geonode%3Aretepozzi_ve&
    // QUERY_LAYERS=geonode%3Aretepozzi_ve&
    // INFO_FORMAT=application/json&
    // X=512&
    // Y=333

    // ----- RESPONSE:
    /*
     res = {
     "type": "FeatureCollection",
     "features": [{
     "type": "Feature",
     "id": "retepozzi_ve.127",
     "geometry": {"type": "Point", "coordinates": [2351643.2591450326, 5004736.695655307]},
     "geometry_name": "the_geom",
     "properties": {
     "cat": null,
     "Cod_pozzo": "da buttare",
     "OBJECTID": 3333,
     "Comune": "mare alto",
     "Localita": null,
     "Indirizzo": null,
     "Acquifero": "4",
     "Profondita": null,
     "Proprietar": null,
     "Anno_perfo": null,
     "Posizione": null,
     "Tipo_regis": null,
     "Diametro": null,
     "label": null,
     "foto_url": null
     }
     }],
     "crs": {"type": "EPSG", "properties": {"code": "3004"}}
     }
     */

    // ----- application/vnd.ogc.gml
    // ----- REQUEST:
    //test-sk.irea.cnr.it/geoserver/ows?REQUEST=GetFeatureInfo&SERVICE=WMS&SRS=EPSG%3A4326&STYLES=&TRANSPARENT=true&VERSION=1.1.1&FORMAT=image%2Fpng&BBOX=12.84627914428711%2C45.17485220699916%2C12.869153022766113%2C45.18090248201926&HEIGHT=400&WIDTH=1066&LAYERS=geonode%3Aretepozzi_ve&QUERY_LAYERS=geonode%3Aretepozzi_ve&INFO_FORMAT=application/vnd.ogc.gml&X=512&Y=333
    // ...
    // INFO_FORMAT=application/json&
    // ...

    // ----- RESPONSE:
    /*
     <wfs:FeatureCollection xsi:schemaLocation="http://www.geonode.org/ http://test-sk.irea.cnr.it:80/geoserver/wfs?service=WFS&version=1.0.0&request=DescribeFeatureType&typeName=geonode%3Aretepozzi_ve http://www.opengis.net/wfs http://test-sk.irea.cnr.it:80/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd"><gml:boundedBy><gml:null>unknown</gml:null></gml:boundedBy><gml:featureMember><geonode:retepozzi_ve fid="retepozzi_ve.127"><geonode:the_geom><gml:Point srsName="http://www.opengis.net/gml/srs/epsg.xml#3004"><gml:coordinates decimal="." cs="," ts=" ">2351643.25914503,5004736.69565531</gml:coordinates></gml:Point></geonode:the_geom><geonode:Cod_pozzo>da buttare</geonode:Cod_pozzo><geonode:OBJECTID>3333</geonode:OBJECTID><geonode:Comune>mare alto</geonode:Comune><geonode:Acquifero>4</geonode:Acquifero></geonode:retepozzi_ve></gml:featureMember></wfs:FeatureCollection>
     * */
}


$(document).ready(function () {
    spinner_div = $('#spinner').get(0);
    waitingResponse();

    //namingUtils=new NamingConvention(baseurl_sp7,app_name,sk_domain_name); //TODO: ...preparing refactory...
    if (ritmaresk.utils.getQueryStringParameterByName("debug") == "on") {
        debugOn=true;
        $(".debugInvisible").removeClass("debugInvisible");
    }
    else{

    }
    sos = new ritmaresk.Sos(endpoint);
    $("#sosEndpoint").text(endpoint);

    var idcomp = new ritmaresk.utils.namingConvention.IdComposer(baseurl_sp7, app_name, uri_sk, sk_domain_name);


    composeResultTemplateID = idcomp.composeResultTemplateID;
    composeObservedPropertiesCompoundId = idcomp.composeObservedPropertiesCompoundId;
    composeFoiID_SSF_SP = idcomp.composeFoiID_SSF_SP;
    //$("#procedures").selectmenu();
    sos.GetCapabilities(callback.loadedCapabilities);

    //TODO: remove this
    //loadWmsCapabilities("http://geo.vliz.be/geoserver/MarineRegions/wms");

    $('#wiztabs a').click(function (e) {
        e.preventDefault();
        if (!currentProcedure) {
            // TODO: fare in modo che non si possa lasciare la prima scheda....
            notifyUser(gettext("Please select one procedure first"));
            console.warn(gettext("Please select one procedure first"));
        }
        else {
            $(this).tab('show');
            console.log("showing this");
        }
    });


    $('a[data-toggle="tab"][href="#foiSelect"]').on('shown.bs.tab', function (e) {
        loadMap();
    });

    $('.gettext').text(function (e) {
        return gettext($(this).text());
    });

    $(".tip")
        .attr("data-content", function () {
            return $(this).text();
        })
        .attr("data-original-title", function () {
            return gettext($(this).attr('data-original-title'))
        })
        .attr("data-content", function () {
            return gettext($(this).attr('data-content'))
        })
        .html('<i class="glyphicon glyphicon-question-sign" aria-hidden="true"></i>')
        .popover({trigger: 'hover'});


    $('#wiztabs a[href!="#procedureSelect"]').hide();

});



