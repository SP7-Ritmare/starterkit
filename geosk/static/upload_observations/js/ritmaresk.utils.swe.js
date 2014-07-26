/**
 *	ritmaresk.utils.swe.js
 *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 * 			paolo.tagliolato@gmail.com
 *
 *  version: 1.1 beta
 *
 *  
 *
 */


var ritmaresk=ritmaresk || {};
ritmaresk.utils=ritmaresk.utils || {};

ritmaresk.utils.swe=(function(){

	function composeSSF_SSP(foi_id,fname,foi_x,foi_y,srsName,sampledFeature){
		return composeFoiJson("Point",foi_id,fname,foi_x,foi_y,srsName,sampledFeature);
	}

	function composeFoiJson(foi_type,foi_id,fname,foi_x,foi_y,srsName,sampledFeature){
		var foi={
			"identifier":foi_id,
			"name":fname,
			"geometry":{
				"type": foi_type,
				"coordinates":[foi_x,foi_y],
				"crs": {
		            "type": "name",
		            "properties": {	                        
		        	    "srsName": srsName
		            }
		        }
		     },
		    "sampledFeature":sampledFeature,
		};
		return foi;
	}

	function sosGetFeatureOfInterestResponse_2_Json(getFoiUrl){
		var 
		    filenameXsl="xslt/getFOIJson.xsl";
		      // filenameXml="xslt/FOI_test.xml";
    
	    var xslt,
		    xsl,
		    xml,
		    output;
	    
	    xslt=ritmaresk.XsltTransformer.getInstance();
	    xsl=xslt.loadXMLDoc(filenameXsl);
	    xml=xslt.loadXMLDoc(getFoiUrl);
		    
	    //output=xslt.transform(xsl,xml,undefined);
	    output=xslt.transform(xsl,xml);//,{para1:"pippo",para2:"pluto"});
		return output;
	}

	/* (with XSLT) object sosResults2json(xmlDocument xmlDocumentSOSResponse)
	 * returns an object with a "response" variable which content depends on SOS response type:
	 *
	 *		ows:ExceptionReport 			 -> response={ExceptionReport:{code:"(some code)", text:"(exception text)"}}
	 *		sos:InsertResultTemplateResponse ->		    ={InsertResultTemplateResponse:{acceptedTemplate:"(resultTemplateId)"}}
	 * 		sos::InsertResultResponse 		 ->		    ={InsertResultResponse:""}
	 *
	 *	Note that an insertResultResponse with no further info represents a successful insertion (cf. OGC12-006, 11.1.2.2 requirement 87 - http://www.opengis.net/spec/SOS/2.0/req/resultInsertion/ir-response)
	 */
	function sosInsertionOperationsResponse2json(xmlDocument){
		var xsl,			
			filenameXsl="xslt/sosInsertionOperationsResponse2json.xsl",
			xslt=ritmaresk.XsltTransformer.getInstance();

		xsl=xslt.loadXMLDoc(filenameXsl);

		var xmlOut=xslt.transform(xsl, xmlDocument, undefined, undefined);

		stringJSON=(new XMLSerializer()).serializeToString(xmlOut);
		console.log(stringJSON);
		stringJSON=stringJSON.replace(/[\n\r\t\s]/g," ");
		console.log(stringJSON);
		return JSON.parse(stringJSON);
	}

	return {
		composeFoiJson_SSF_SSP:composeSSF_SSP,
		composeFoiJson:composeFoiJson,
		sosGetFeatureOfInterestResponse_2_Json:sosGetFeatureOfInterestResponse_2_Json,
		sosInsertionOperationsResponse2json:sosInsertionOperationsResponse2json
	};

})();