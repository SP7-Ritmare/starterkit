/**
 *    ritmaresk.utils.swe.js
 *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *            paolo.tagliolato@gmail.com
 *
 *  version: 1.1 beta
 *
 *
 *
 */


/**
 * @namespace
 * @todo consider the following refactoring: move itmaresk.utils.namingConvention.xmlProducer here (and create jsonProducer for json related functions)
 */
ritmaresk.utils.swe = (function () {

    function composeSSF_SSP(foi_id, fname, foi_x, foi_y, srsName, sampledFeature) {
        return composeFoiJson("Point", foi_id, fname, foi_x, foi_y, srsName, sampledFeature);
    }

    function composeFoiJson(foi_type, foi_id, fname, foi_x, foi_y, srsName, sampledFeature) {
        return foi = {
            "identifier": foi_id,
            "name": fname,
            "geometry": {
                "type": foi_type,
                "coordinates": [foi_x, foi_y],
                "crs": {
                    "type": "name",
                    "properties": {
                        "srsName": srsName
                    }
                }
            },
            "sampledFeature": sampledFeature
        };
    }

    /**
     * @todo change the name: sosGetFeatureOfInterest2Json
     * @param {string} getFoiUrl kvp url of the sos:getFeatureOfInterest request
     * @returns {object} featuresOfInterest a json representation of the features returned by the SOS (kvp binding), analogous to 52N json endpoint, but extended with the SRS
     */
    function sosGetFeatureOfInterestResponse_2_Json(getFoiUrl) {
        var
            filenameXsl = "xslt/getFOIJson.xsl";
        // filenameXml="xslt/FOI_test.xml";

        var xslt,
            xsl,
            xml,
            output;

        xslt = ritmaresk.XsltTransformer.getInstance();
        xsl = xslt.loadXMLDoc(filenameXsl);
        xml = xslt.loadXMLDoc(getFoiUrl);

        //output=xslt.transform(xsl,xml,undefined);
        output = xslt.transform(xsl, xml);//,{para1:"pippo",para2:"pluto"});
        //alert(output.textContent);
        return output;
    }

    /**
     * @param xmlDocument
     * @returns {Object} an object with a "response" property which content depends on SOS response type:
     *
     *        ows:ExceptionReport             -> response={ExceptionReport:{code:"(some code)", text:"(exception text)"}}
     *        sos:InsertResultTemplateResponse ->            ={InsertResultTemplateResponse:{acceptedTemplate:"(resultTemplateId)"}}
     *        sos::InsertResultResponse         ->            ={InsertResultResponse:""}
     *
     *    Note that an insertResultResponse with no further info represents a successful insertion (cf. OGC12-006, 11.1.2.2 requirement 87 - http://www.opengis.net/spec/SOS/2.0/req/resultInsertion/ir-response)
     *
     *
     *
     * @requires ritmaresk.XsltTransformer
     */
    function sosInsertionOperationsResponse2json(xmlDocument) {
        var xsl,
            filenameXsl = "xslt/sosInsertionOperationsResponse2json.xsl",
            xslt = ritmaresk.XsltTransformer.getInstance();

        xsl = xslt.loadXMLDoc(filenameXsl);

        var xmlOut = xslt.transform(xsl, xmlDocument, undefined, undefined);

        stringJSON = (new XMLSerializer()).serializeToString(xmlOut);
        console.log(stringJSON);
        stringJSON = stringJSON.replace(/[\n\r\t\s]/g, " ");
        console.log(stringJSON);
        return JSON.parse(stringJSON);
    }


    /**
     * Obtain from calls to GetCapabilities and DescribeLayer
     * an Array of objects {name, title, type (generally "WFS" or "WCS")}
     * of all the layers in the wms service.
     *
     * @param {String} wmsUrl wms endpoint url
     * @param {boolean} onlyWFS flag to obtain only layers of type="WFS"
     * @returns {Array<{name:{String}, title:{String}, type:{String}}>}
     */
    function wmsGetLayers_NameTitleType(wmsUrl,onlyWFS) {

        var xslt = ritmaresk.XsltTransformer.getInstance();

        var capDoc = xslt.loadXMLDoc(wmsUrl + "?SERVICE=WMS&REQUEST=GetCapabilities&TILED=true&VERSION=1.1.1",false,true);

        //console.log(capDoc.innerHTML);
        var layers = capDoc.getElementsByTagName("Layer")[0].getElementsByTagName("Layer");
        var oLNT = {},//dictionary layerName:layerTitle
            layersNameTitle = [];


        for (var i = 0; i < layers.length; i++) {
            oLNT[layers[i].getElementsByTagName("Name")[0].innerHTML] =
                layers[i].getElementsByTagName("Title")[0].innerHTML;
        }

        var wfsLayers =
            wmsDescribeLayerResponse2json(Object.keys(oLNT), wmsUrl).layers;

        console.log(wfsLayers);
        wfsLayers.forEach(function (l) {
            if (onlyWFS && l.type === 'WFS')layersNameTitle.push({name: l.name, title: oLNT[l.name], type: l.type});
        });
        //var layersList = layersNameTitle;
        return layersNameTitle;
        //return capDoc;
    }

    /**
     * Obtain from calls to GetCapabilities and DescribeLayer
     * an Array of objects {name, title, type}
     * of the "WFS" layers in the wms service.
     *
     * @param wmsUrl
     * @returns {Array.<{name: {String}, title: {String}, type: {String}}>}
     */
    function wmsGetLayersWFS_NameTitleType(wmsUrl){
        return wmsGetLayers_NameTitleType(wmsUrl,true);
    }

    /**
     *
     * @param {string[]} layerNames an array with wms layer names
     * @param {string} wmsUrl the wms endpoint url
     * @returns {Array<{name:{string},type:{string}}>}
     */
    function wmsDescribeLayerResponse2json(layerNames,wmsUrl) {
        var geturl=wmsUrl+"?SERVICE=WMS";
        var params={"VERSION":"1.1.1","LAYERS":layerNames.join(","),
            "REQUEST":"DescribeLayer"};

        var paramsKeyArray=Object.keys(params);

        for (var i = paramsKeyArray.length - 1; i >= 0; i--) {
            geturl+="&"+paramsKeyArray[i]+"="+encodeURIComponent( params[paramsKeyArray[i]] );
        }
        console.warn("describeLayer request: "+geturl);
        return url2Json(geturl,'xslt/wmsDescribeLayerResponse2Json.xsl')

    }

    /**
     * @private
     * @param xmlUrl
     * @param xsltUrl
     * @returns {*}
     */
    function url2Json(xmlUrl,xsltUrl){

        var xslt,
            xsl,
            xml,
            stringJSON;

        xslt = ritmaresk.XsltTransformer.getInstance();
        xsl = xslt.loadXMLDoc(xsltUrl);
        xml = xslt.loadXMLDoc(xmlUrl);

        //output=xslt.transform(xsl,xml,undefined);

        stringJSON=(new XMLSerializer()).serializeToString(xslt.transform(xsl, xml));
        console.log(stringJSON);
        return JSON.parse(stringJSON);
    }



    return {
        composeFoiJson_SSF_SSP: composeSSF_SSP,
        composeFoiJson: composeFoiJson,
        sosGetFeatureOfInterestResponse_2_Json: sosGetFeatureOfInterestResponse_2_Json,
        sosInsertionOperationsResponse2json: sosInsertionOperationsResponse2json,
        wmsDescribeLayerResponse2json:wmsDescribeLayerResponse2json,
        wmsGetLayersWFS_NameTitleType:wmsGetLayersWFS_NameTitleType,
        wmsGetLayers_NameTitleType:wmsGetLayers_NameTitleType
    };

})();