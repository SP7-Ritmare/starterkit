/*
 *  author: Paolo Tagliolato & Fabio Pavesi - CNR IREA in Milano - www.irea.cnr.it
 * 			paolo.tagliolato@gmail.com
 *			pavesi.f@irea.cnr.it
 *
 *  version: 1.2 beta
 *
 *  requires: Jquery (for http requests)
 *	ritmaresk.xsltTransformer.js	
 *	ritmaresk.SOS.js
 *	ritmaresk.dateUtil.js
 *	ritmaresk.utils.swe.js
 *	ritmaresk.utils.NamingConvention.js
 *	ritmaresk.utils.insertResultHelper.js
 *
 */

var currentFois = [];
var currentProcedure = undefined;
var currentTemplate={};
//var currentResultStructure={};

var sos;
/*
var messaggi={
	it:{observationInserted:"Observations inserted",},
	en:{observationInserted:"Dati osservativi correttamente inseriti",},						
}
*/

var 
	composeResultTemplateID,
	composeObservedPropertiesCompoundId,
	composeFoiID_SSF_SP,
	//aliasing fx
	sosInsertionOperationsResponse2json=ritmaresk.utils.swe.sosInsertionOperationsResponse2json;



		//var namingUtils;//TODO: ...preparing refactory...
			//sensorDescription; //TODO: usato solo in callback.setDescription che imposta per il debug un div... valutare se toglierlo

		// TODO: sostituire l'endpoint con il VERO URI dello SK
		
		var lookupFOI = function(uri) {
		    for ( var i = 0; i < currentFois.length; i++ ) {
				if ( currentFois[i].identifier == uri ) {
				    return currentFois[i];
				}
		    }
		    return undefined;
		};
		

		var cercaFOI = function(procedure) {
			var fois2Json=ritmaresk.utils.swe.sosGetFeatureOfInterestResponse_2_Json;

			var output=fois2Json( sos.kvp.urlGetFeatureOfInterestByProcedure(procedure) );
		    console.log(output);
		    /*
		    $(".container").resizable();
		    $("#xsl").removeClass("prettyprinted")
				    .text((new XMLSerializer()).serializeToString(xsl));				
		    prettyPrint();
		    $("#xml").removeClass("prettyprinted")
				    .text((new XMLSerializer()).serializeToString(xml));				
		    prettyPrint();
		    $("#output").removeClass("prettyprinted")
				    .text(JSON.stringify(JSON.parse(output.textContent), undefined, 4));
		    prettyPrint();
		    */
		    $("#foi_json_new").removeClass("prettyprinted")
				    .text(JSON.stringify(JSON.parse(output.textContent), undefined, 4));
		    var result = JSON.parse(output.textContent);
		    currentFois = result.featureOfInterest;
		    return result;
		};
		
		/* callback functions, aware of [#capabilities #sensordescription #sensorid #sensordescription_xml #foi_xml #foi_json]
		 *								#select_foi #new_foi #foiSelect #procedures 
		 *
		 */
		var callback={
			loadedCapabilities:function(cap){		
				$("#capabilities").removeClass("prettyprinted")
					.text(JSON.stringify(cap,undefined,1));
				prettyPrint();
				
						
				var allowedProcedures=Object.keys(sos.sensors),
					options = [];			 
				for (var i = allowedProcedures.length - 1; i >= 0; i--) {
					options.push("<option value='" + allowedProcedures[i] + "'>" + allowedProcedures[i] + "</option>");				
				};
				$("#procedures")
					.append(options.join(""))
					.on( "change", callback.selectmenuchange_describeSensor)
					.val([]);


				
				var procId=getQueryStringParameterByName("procedureId");


				if(procId && procId!=null && procId!="" && allowedProcedures.indexOf(procId)>=0){
					$("#procedures").val(procId).change();
					console.warn("#procedures val:"+$("#procedures").val());

				}
				//if(procId && procId!=="" && ){}
			},

			setDescription:function(data){
				var	sensorDescription=data;
				$("#sensordescription").removeClass("prettyprinted")
					.text(sensorDescription.procedureDescription.description);				
				prettyPrint();
			},

			// Loads the Feature of interest table (Fois list obtained from SOS for the selected procedure)
			selectmenuchange_describeSensor:function( event, ui ) {
				console.log(this);
				currentProcedure = $(this).val();

				$("#sensorid").html(currentProcedure);				
				
				sos.getSensorDescription(currentProcedure,callback.setDescription);


				//chiamo anche DescribeSensor da kvp e ottengo un XMLDocument.
				// attualmente lo serializzo e lo mostro in div.
				sos.kvp.describeSensor(currentProcedure,function(xml_data){
					var xmlString = (new XMLSerializer()).serializeToString(xml_data);
					$("#sensordescription_xml")
						.removeClass("prettyprinted")
						.text(xmlString);	
					prettyPrint();			
				});
				
				var leFOI = cercaFOI(currentProcedure);
				if ( leFOI ) {
				    leFOI = leFOI.featureOfInterest;
				}
				var listaFOI = $("#select_foi");
				//var formNewFOI= $("#new_foi").detach();
				var new_foi_tr=$("#new_foi_tr").detach();
				var foi_tbody=$("#foi_tbody");
				var options = [];
				/*
					<th>Name</th>
					<th>X coord.</th>
					<th>Y coord.</th>
					<th>SRS</th>
					<th>Sampled Feature</th>
					<th>Use</th>
				*/	

				// TODO: verificare se BUG risolto. 
				// 		 caso che sembra risolto:
				//       Esempio seleziono procedure puntaSaluteCanalGrande (2 foi)
				//		 poi seleziono procedure coreSampler (ha foi ma sono linestring: il json contiene una serie di "" dove xslt non ha selezionato elementi xml) => la tabella con le foi non viene aggiornata.
				
				//console.log("aggiorno FOI: inizio");
				for ( var i = 0; leFOI && i < leFOI.length; i++ ) {
				    var name = ( leFOI[i].name != "" ? leFOI[i].name : leFOI[i].identifier );

				    if(Object.keys(leFOI[i].geometry).length>0){ //possibile soluzione bug
					    var coordx=( leFOI[i].geometry.coordinates ? leFOI[i].geometry.coordinates[0] : "");
					    var coordy=( leFOI[i].geometry.coordinates ? leFOI[i].geometry.coordinates[1] : "");
					    
					    options.push("<tr><td>" + name + "</td><td>" + coordx +
							 "</td><td>" + coordy  + "</td><td>" + leFOI[i].geometry.crs.properties.srsName +
							 "</td><td>" + leFOI[i].sampledFeature + "</td><td><button class='btn btn-primary' onclick=\"chooseFOI('" + leFOI[i].identifier + "');\">Use</button>" + "</td></tr>");	
					}
				}
					
				// #new_foi is the form
				// flush the table and replace with just the new foi form...
				//console.log(formNewFOI);
				
				//$("#new_foi").parent().html(trNewFOI);//quando cambia la procedure devo svuotare il tbody e ripristinare la riga della nuova foi.
				// ...then prepend the rows for the existing fois
				//$("#new_foi").parent().
				foi_tbody.html(new_foi_tr);
				foi_tbody.prepend(options.join(""));
				//$("#new_foi").parent().prepend(options.join(""));
				
				sos.kvp.getFeatureOfInterestByProcedure(currentProcedure,function(xml_data){
					var xmlString = (new XMLSerializer()).serializeToString(xml_data);

					$("#foi_xml")
						.removeClass("prettyprinted")
						.text(xmlString);	
					prettyPrint();			
				});

				sos.json.getFeatureOfInterestByProcedure(currentProcedure,function(json){
					//$("#foi_json")
						//.removeClass("prettyprint").removeClass("lang-json")
					//	.removeClass("prettyprinted");

					$("#foi_json")
						.removeClass("prettyprinted")
						.text(JSON.stringify(json,undefined,3));
					prettyPrint();
				});

				$("a[href='#foiSelect']").trigger("click");
			},
			
			/* if something went wrong notify the user. If the operation completed successfully clear the handsontable  */
			after_sosInsertResult:function(responseXmlDocument){
				var res=sosInsertionOperationsResponse2json(responseXmlDocument);
				if(res && res.response){

					res=res.response;

					if(res.ExceptionReport){
						notifyUser("Exception inserting results into SOS endpoint: "+res.ExceptionReport.text);		
						console.exception("Results not inserted");			
					}

					else{
						var warnMsg;
						console.log("result inserted");
						//notifyUser("Dati osservativi correttamente inseriti");
						notifyUser("Observations inserted");
						$("#insertResultTable").handsontable('getInstance').loadData([]);//empty table
					}
				}
			},

			/* if the insert result operation completed: insert result, else just notify the user */
			after_sosInsertResultTemplate:function(responseXmlDocument){
				console.log(responseXmlDocument);				
				var res=sosInsertionOperationsResponse2json(responseXmlDocument);
				if(res && res.response){
					res=res.response;
					if(res.ExceptionReport){
						notifyUser("Exception inserting result template to SOS endpoint: "+res.ExceptionReport.text);
						console.exception("Template not inserted");
					}
					else if(res.InsertResultTemplateResponse && res.InsertResultTemplateResponse.acceptedTemplate){
						var warnMsg;
						console.log("template inserted");
						if(currentTemplate.id!==res.InsertResultTemplateResponse.acceptedTemplate){	
							userMsg	= "We tried to insert a resultTemplateID with id: "+currentTemplate.id+" but the SOS server assigned a different id: "+res.InsertResultTemplateResponse.acceptedTemplate +". It is ok for the current operation but it should be reported to the developers of this beta version.";				
							
							console.warn("proposed template id: "+currentTemplate.id);	

							currentTemplate.id=res.InsertResultTemplateResponse.acceptedTemplate;
							notifyUser(userMsg);								
						}
						console.log("accepted template id: "+res.InsertResultTemplateResponse.acceptedTemplate)
						currentTemplate.isnew=false;
						insertResult();						
					}
				}
			}
		};

		/* TODO: provare questa soluzione:
		 *		quando utente sceglie un pulsante nella tabella delle foi:
		 		0. si calcola composeResultTemplateID(currentProcedure, foi) -> id del template corrispondente secondo la naming convention SP7. Questo va tenuto da qualche parte (vedi sotto). Farei anche in modo che quando lo si setta nell'oggetto globale currentTemplate, gli altri campi si annullino.
				1. se la foi è new o se utente ha scelto foi per cui non esiste template (codice per questo check già implementato in chooseFOI) currentTemplate.isnew=true. Si usa la fx composeResultTemplate che restituisce l'xml dell' InsertResultTemplate.
				2. se il template esiste già si esegue sul sos una getResultTemplate e se ne restituisce l'xml.
		 		
			IL CHIAMANTE che ottiene tale xml lo MEMORIZZA in una variabile globale (oggetto)
		
					var currentTemplate={id=templateid,xml:xml,isnew:true|false} 
		
				dove isnew dipende dal fatto che si sia seguito il punto 1. o 2.
		
		 		nel tab successivo con "spreadsheet" per inserimento osservazioni
				si da in pasto all'xslt che parsa result structure l'xml memorizzato nella variabile globale.
		
				Solo nel momento in cui l'utente preme click sul "salva i dati osservativi"
				si fa come segue:
					se currentTemplate.isnew===true 
						si esegue in modo ASINCRONO sul sos la insertResultTemplate
						nella callback si comanda la insertResult(templateID) sul SOS. 
						si modifica infine currentTemplate.isnew=false
					se currentTemplate.isnew===false
						si procede con insertResult(templateID)		
		
		*/

		
		
		

		

		
		
		/**
		 *  user chooses "use" on new foi:
		 *   read & check user input 
		 *   compose foi id from user input
		 *   call chooseFoi
		 */
		var newFoi = function() {
		    console.log("new foi for: "+currentProcedure);

		    var foi_id,
		    	fname = $("#foi_name").val(), 
		    	foi_x = $("#foi_x").val(), 
		    	foi_y = $("#foi_y").val(), 
		    	fsrs = $("#foi_srs").val(),
		    	fsf = $("#foi_sf").val();

		    console.warn("srs: "+fsrs);
		    foi_id=composeFoiID_SSF_SP(fsrs,foi_x,foi_y);

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

		    var foi=ritmaresk.utils.swe.composeFoiJson_SSF_SSP(foi_id,fname,foi_x,foi_y,fsrs,fsf);

		    console.log(JSON.stringify(foi,2));

		    chooseFOI(foi.identifier,foi);  
		};
		

		/**
		 *	user action: user chooses "use" (existing or new foi)
		 *    check if is template exists for current procedure and chosen foi
		 *    if not: compose the xml for executing insertResultTemplate on sos endpoint.
		 *	  Then call prepareInputTable 
		 */
		var chooseFOI = function(foiUri,newfoi) {
			console.warn("Choose foi("+foiUri+","+JSON.stringify(newfoi)+")")
		    var foi = (newfoi)?newfoi:lookupFOI(foiUri);
		    setTemplate(foi);
		        
		    console.log("proceed to compose input table");
		    prepareInputTable();
		};


		var setTemplate=function(foi){

			function resultTemplate2DataRecordStructure(resultTemplateId,resultTemplateXmlString){
				// new template.
				var xmlIn;
				var xslt=ritmaresk.XsltTransformer.getInstance();
				if(resultTemplateXmlString){
					xmlIn=xslt.loadXMLDocFromString(resultTemplateXmlString);
				}
				// should be an existing template: try to load it(s result structure) directly from sos.kvp endpoint
				else{
					xmlIn=xslt.loadXMLDoc(
					  sos.kvp.urlGetResultTemplate(
					    sos.getOfferingIdByProcedureId(currentProcedure),
					    composeObservedPropertiesCompoundId(currentProcedure)
					  )
					);
				}
				return ritmaresk.utils.insertResultHelper.resultTemplate2DataRecordStructure(xmlIn);
			};

			function composeResultTemplate(procedureId, foi){
				var xmlRTemplate;
				var xslt=ritmaresk.XsltTransformer.getInstance();
				var xml;// Document object: sensorDescription already loaded in sos object or describeSensor to get from sos kvp endpoint

				if(sos.sensors[procedureId] && sos.sensors[procedureId].procedureDescription && sos.sensors[procedureId].procedureDescription.description){
			    	xml=xslt.loadXMLDocFromString(sos.sensors[procedureId].procedureDescription.description);
			    }
			    // else load it directly from sos.kvp endpoint
			    else{
			    	xml=xslt.loadXMLDoc(sos.kvp.urlDescribeSensor(procedureId));
			    }
			    xmlRTemplate=ritmaresk.utils.namingConvention.xmlProducer.sensor2ResultTemplate(procedureId, foi, xml);

			    $("#insertResultTemplate")
			    	.removeClass("prettyprinted")
			    	.text(xmlRTemplate);
			    prettyPrint();
				return xmlRTemplate;
			}

			/*  void setCurrentTemplate(string id, bool isnew, string xmlStringPreparedTemplate)
			 *
			 */
			function setCurrentTemplate(id,isnew,xmlStringPreparedTemplate){
				currentTemplate={}; // reset

			    currentTemplate.id = id;
			    currentTemplate.isnew = isnew;

			    if(xmlStringPreparedTemplate){  

			    	currentTemplate.xmlString = xmlStringPreparedTemplate;
			    	// TODO: l'uso di id e' deprecato nella chiamata a resultTemplate2DataRecordStructure. Inutile...
			    	var o=resultTemplate2DataRecordStructure(id,xmlStringPreparedTemplate);

			    	currentTemplate.resultStructure=o.resultStructure;
			    	currentTemplate.resultEncoding=o.resultEncoding;
			    }
			    else{		    	
			    	// TODO: l'uso di id e' deprecato nella chiamata a resultTemplate2DataRecordStructure. Inutile...
			    	var o=resultTemplate2DataRecordStructure(id);

			    	currentTemplate.resultStructure=o.resultStructure;
			    	currentTemplate.resultEncoding=o.resultEncoding;
			    }

			    //eseguo xslt sul template in modo da ottenere resultStructure che serve per la preparazione della tabella di insert
			};
		    // NOTA BENE: il seguente e' necessario soltanto se il result template per la coppia (procedure,foi)
		    // non e' ancora presente nel sos.
		    // Per valutarlo dobbiamo considerare la NOSTRA convenzione 
		    // con cui assegnamo gli ID ai template.
		    //
		    // Bisogna matchare l'id che risulta da procedure e foi
		    // con l'elenco degli id di resultTemplate presenti nel sos:
		    // 
		    //     sos.capabilities.operationMetadata.operations.InsertResult.parameters.template.allowedValues
		    //
		    // var observedProperty="observedProperty/compound"
		    var idToMatch=composeResultTemplateID(currentProcedure, foi);
		    

		    // TODO: commentare console.log?
		    console.log("the id of the resultTemplate should be: "+idToMatch);
			
			var templateExists=false; 

			// TODO: aggiungere try catch ?
		    if(sos.capabilities.operationMetadata.operations.InsertResult && sos.capabilities.operationMetadata.operations.InsertResult.parameters.template.allowedValues){
		    	var existingTemplates=sos.capabilities.operationMetadata.operations.InsertResult.parameters.template.allowedValues;
		    	templateExists=(existingTemplates.indexOf(idToMatch)>=0);		    	
		    }

		    if(!templateExists){
		    	console.log("resultTemplate with id "+idToMatch+" does not exists in sos: it will be created during insertResult");
		    	var rt=	composeResultTemplate(currentProcedure, foi);
		    	// set current template: store also the "insertResultTemplate" xml.
		    	setCurrentTemplate(idToMatch,true,rt);			    
		    }
		    else{
		    	console.log("resultTemplate with id "+idToMatch+" already exists in sos endpoint");
		    	// set current template: there is only an id : the resultTemplate already exists in sos endpoint
		    	setCurrentTemplate(idToMatch,false,undefined);			    
		    }		
		};
		

		/*	void prepareInputTable() - uses globals currentTemplate, requires utils.insertResult.js
		 *
		 */
		var prepareInputTable=function(){
			//console.log("carico result structure... ");
			
			var o=currentTemplate.resultStructure;
			var rs=ritmaresk.utils.insertResultHelper.dataSchemaFromResultTemplateStructure(o);

			ritmaresk.utils.insertResultHelper.loadTableLegend("#insertResultTableLegend",o);

			//console.log("caricata result structure: "+rs);

    		ritmaresk.utils.insertResultHelper.loadTable("#insertResultTable",rs.dataSchema,rs.columns,rs.columnsExtraInfo);
    		
    		// TODO: valutare se usare one invece di on (enable insertResult Button onclick only once)
    		// enable insertResult button
    		$("button[name='insertResult']").on("click",function(){
    			performInsertResultWorkflow();
    			//
    		});

    		// go to the third panel
    		$("a[href='#resultInsert']").trigger("click");
		};

		/* * * * * * * * * * * * * * *
		 *	insert result workflow
		 * * * * * * * * * * * * * * *
		 *
		 */

		
		

		var insertResult=function(){
			console.warn("insertResult line 722");
			var resVal=composeResultValuesFromHandsontable();
			console.log(resVal);
			sos.pox.insertResult(currentTemplate.id,resVal, callback.after_sosInsertResult);
		};

		var insertResultTemplate=function(){
			console.log(currentTemplate.xmlString);
			sos.pox.insertResultTemplate(currentTemplate.xmlString, callback.after_sosInsertResultTemplate);
		};



		var performInsertResultWorkflow=function(){			
			// first of all:
			// double check template with this id does not exists in sos (eg. foi not already inserted....)	
			console.warn("performInsertResultWorkflow, cur temp:" + currentTemplate.id);
			var alltemplates=sos.capabilities.operationMetadata.operations.InsertResult.parameters.template.allowedValues;

   		        currentTemplate.isnew=!(alltemplates && alltemplates.indexOf(currentTemplate.id)>=0);

			// 1. if currentTemplate isnew : insertResultTemplate
			// with this callback:
			//		-- --
			// 		check response. 
			//		If something wrong tell the user and stop.
			// 		If ok: set currentTemplate.isnew=false
			//		and perform an insertResult operation passing composeResultValuesFromHandsontable()
			//		with this callback 
			//			--(callback.after_sosInsertResult)--:
			//			check response and inform the user. 
			//			If ok clear handsontable
			//--------------

			if(currentTemplate.isnew){

				insertResultTemplate();
			}

			// 2. if currentTemplate is not new: execute callback.after_sosInsertResultTemplate
			else{
				console.log("insert result to sos");
				insertResult();
			}		

			

		}

		/*	string composeResultValuesFromHandsontable()
		 *	  dump user input in the format for SOS. requires jquery.
		 */
		var composeResultValuesFromHandsontable=function(){
			//TODO: rendere indipendente il codice dall'id dell'elemento con handsontable
			var userDataArray=$("#insertResultTable").data('handsontable').getData();

			var record_separator="@",
				field_separator="#",
				results=[],
				resultsString;

			if(currentTemplate.resultEncoding && currentTemplate.resultEncoding.textEncoding){				
				field_separator=currentTemplate.resultEncoding.textEncoding.tokenSeparator;
				record_separator=currentTemplate.resultEncoding.textEncoding.blockSeparator;
			}

			if(userDataArray && userDataArray.length>0){
				
				for (var i = 0; i < userDataArray.length; i++) {
					var record=[];
					var current=userDataArray[i];
					var k=Object.keys(current);
					// TODO: valutare uso di var o=JSON.parse(currentTemplate.resultStructure);
					// in modo da recuperare i dati ordinati rispetto a quello che il sos si attende.
					// TODO 2: abilitare il riordinamento delle colonne nel client
					var atLeastOne=false;
					for (var j = 0; j < k.length; j++) {
						if(current[k[j]]){
							atLeastOne=true;
						}
						record.push(current[k[j]]);
						//console.log([k[j],current[k[j]]].join(" : "));
					};
					if(atLeastOne){
						results.push(record.join(field_separator));
					}
				}
				resultsString=results.join(record_separator);
			}

			console.log(resultsString);
			return resultsString;
		}
		
		// TODO: modificare per esempio in un messaggio in un pannellino apposito
		var notifyUser=function(msg){
			alert(msg);
		}


		$(document).ready(function () {


			/*$("#new_foi").submit(function(event){
				event.preventDefault();
				newFoi();
			});*/
			//namingUtils=new NamingConvention(baseurl_sp7,app_name,sk_domain_name); //TODO: ...preparing refactory...
			if(getQueryStringParameterByName("debug")=="on"){
				$(".debugInvisible").removeClass("debugInvisible");
			}
			sos=new ritmaresk.Sos(endpoint);

			var idcomp=new ritmaresk.utils.namingConvention.IdComposer(baseurl_sp7,app_name,uri_sk);			
			

			composeResultTemplateID=idcomp.composeResultTemplateID;
			composeObservedPropertiesCompoundId=idcomp.composeObservedPropertiesCompoundId;		
		 	composeFoiID_SSF_SP=idcomp.composeFoiID_SSF_SP;
			//$("#procedures").selectmenu();
			sos.GetCapabilities(callback.loadedCapabilities);		
		});

		function getQueryStringParameterByName(name) {
		    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		        results = regex.exec(location.search);
		    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

		