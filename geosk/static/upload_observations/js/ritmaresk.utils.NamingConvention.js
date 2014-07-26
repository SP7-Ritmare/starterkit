/*
 *  ritmaresk.utils.NamingConvention.js
 *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *      paolo.tagliolato@gmail.com
 *
 *  version: 1.1 beta
 *
 */

var ritmaresk=ritmaresk || {};
ritmaresk.utils=ritmaresk.utils || {};

ritmaresk.utils.namingConvention=(function(){

	var xslt=ritmaresk.XsltTransformer.getInstance();

	var crsUri2Epsg=function(crs_uri){
		var regExp=/http:.*\/def\/crs\/EPSG\/0\/(\d+)/;
		var match = regExp.exec(crs_uri);
		var epsg="EPSG:"
		if(match){
			epsg+=match[1];
		}
		else{
			epsg+="unknown";
		}
		
		return epsg;
	};

	// constructor
	var IdComposer=function(baseurl_sp7,app_name,uri_sk){

	 	var baseurl_sp7=baseurl_sp7,
		 	app_name=app_name,
		 	uri_sk=uri_sk;	//N.B. questi sono presenti se si carica config.js
	 


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
			this.composeResultTemplateID=function(procedure, foi, observedProperty){
			 	var observedProperty=undefined;
			 	var epsg="EPSG:unknown";
			 	var coords="";

			 	if(foi.geometry.crs && (foi.geometry.crs.properties.name || foi.geometry.crs.properties.srsName)){
			 		if(foi.geometry.crs.properties.name){
			 			epsg=foi.geometry.crs.properties.name;
			 		}
			 		else if(foi.geometry.crs.properties.srsName){
			 			epsg=crsUri2Epsg(foi.geometry.crs.properties.srsName);
			 		}		 		
			 	}

			 	if(foi.geometry.crs && foi.geometry.coordinates){
			 		coords=foi.geometry.coordinates.join("/");
			 	}

			 	var id=[procedure,"template","observedProperty","compound","foi","SSF","SP",epsg,coords].join("/");
			 	// TODO: test
			 	//console.warn("function composeResultTemplateID to be implemented");
			 	return(id);
			};

			this.composeObservedPropertiesCompoundId=function(procedureId){
				var id=[procedureId,"observedProperty","compound"].join("/");
				return(id);
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
			 *		<xsl:value-of select="$baseurl_sp7"/><xsl:value-of select="$app_name"/>/<xsl:value-of select="$uri_sk"/>/foi/SSF/SP/<xsl:value-of select="$srs"/>/<xsl:value-of select="$spatial_sampling_point_x"/>/<xsl:value-of select="$spatial_sampling_point_y"/></xsl:variable>
			 *
			 *  (SP7 naming convention) 
			 */
			this.composeFoiID_SSF_SP=function(srs_uri, spatial_sampling_point_x, spatial_sampling_point_y){
			 	var epsg=crsUri2Epsg(srs_uri);		
			 	//console.warn("epsg: "+epsg); 	
			 	var id=[baseurl_sp7,app_name,sk_domain_name,"foi","SSF","SP",epsg,spatial_sampling_point_x,spatial_sampling_point_y].join("/")
			 	// TODO: test
			 	//console.warn("function composeResultTemplateID to be implemented");
			 	return(id);
			};

			// TODO: completare
			this.composeFoiID=function(foiType, params){
				if( foiType==='SpatialSamplingFeature.SamplingPoint' &&
					params.srs_uri && params.spatial_sampling_point_x && params.spatial_sampling_point_y
				){
					return(composeFoiID_SSF_SP(params.srs_uri,params.spatial_sampling_point_x,params.spatial_sampling_point_y));
				}
				else{
					console.warn("this foi type is not supported or params not corrected. Please check composeFoiID implementation.");
					return undefined;
				}
			};
	 };

	
	

	// private
	var sensor2ResultTemplate = function(procedureId, foi, xmlSensorDescription) {

	    //var xml = creaInsertResultTemplate(procedureId, foi);//ottiene l'xml per il post a pox/insertResultTemolate

	    var 
	      filenameXsl="xslt/sensor2ResultTemplate.xsl";
	      // filenameXml="xslt/FOI_test.xml";

	    var 			// XsltTransformer object
		    xsl,			// xslt stylesheet: transform sensorDescription into insertResultTemplate document		    			
		    xmlRTemplate,	// Document object: insertResultTemplate, output of xslt transformation   
		    stringResultTemplate; // string: insertResultTemplate parsed to string; output of the function
	    
	    
	    xsl=xslt.loadXMLDoc(filenameXsl);
	    
	    var params = {
			// TODO: sostituire l'endpoint con il VERO URI dello SK
			SK_DOMAIN_NAME: sk_domain_name,//endpoint.replace(/http[s]*:\/\//, ""),
			SPATIAL_SAMPLING_POINT_X: foi.geometry.coordinates[0],
			SPATIAL_SAMPLING_POINT_Y: foi.geometry.coordinates[1],
			SRS_NAME: foi.geometry.crs.properties.srsName,
			SAMPLED_FEATURE_URL: foi.sampledFeature,
			FOI_NAME: foi.name
	    };
	    if(foi.identifier){
	    	params.EXISTING_FOI_ID=foi.identifier;
	    }
	    
	    xmlRTemplate=xslt.transform(xsl, xmlSensorDescription, params);
	    
	    var stringResultTemplate=(new XMLSerializer()).serializeToString(xmlRTemplate);


	    //return(xmlRTemplate);

	    return(stringResultTemplate);
	};

	return { 
		IdComposer:IdComposer,
		xmlProducer:{
			sensor2ResultTemplate:sensor2ResultTemplate
		}
	};





})();