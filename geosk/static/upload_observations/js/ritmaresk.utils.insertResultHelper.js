
/**
 *  ritmaresk.utils.insertResultHelper
 *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *      paolo.tagliolato@gmail.com
 *
 *  version: 1.2 beta
 *
 *  
 *
 */
/*
 * requires: ritmaresk.dateUtil ritmaresk.XsltTransformer
 */

if (typeof jQuery === 'undefined') { throw new Error('ritmaresk.utils.insertResultHelper\'s JavaScript requires jQuery') }
if (typeof ritmaresk.DateUtil === 'undefined') { 
  throw new Error('ritmaresk.utils.insertResultHelper\'s JavaScript requires ritmaresk.DateUtil') 
}
if (typeof ritmaresk.XsltTransformer === 'undefined') { 
  throw new Error('ritmaresk.utils.insertResultHelper\'s JavaScript requires ritmaresk.XsltTransformer') 
}

var ritmaresk=ritmaresk || {};
ritmaresk.utils=ritmaresk.utils || {};

ritmaresk.utils.insertResultHelper=(function(){

  var ISO_datetime_validator_regexp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)?/;

  /**
   * input; an array of objects whose structure is defined in resultTemplate2Structure.xsl 
      which transforms a response to GetResultTemplate into an object {} being resultStructure an array of objects of this kind:
        {
          "fieldName":"<xsl:value-of select="./@name"/>",
          "fieldType":"<xsl:value-of select="name(./*[1])"/>",
          "fieldDefinition":"<xsl:value-of select="./*[1]/@definition"/>",
          "uom_code_value":"<xsl:value-of select=".//swe:uom/@code"/>",
          "uom_code_href":"<xsl:value-of select=".//swe:uom/@xlink:href"/>"
        }

   * the function returns an object containing structures consumed by handsontable.
        {
          resultStructure:{
    
          },
          columns:[]
        }
   *  object resultStructureFromParsedGetResultTemplate(object[] o)
   *
   */
  var dataSchemaFromResultTemplateStructure=function (o){    
    // NOTA BENE: sto settando 2 variabili globali resultStructure e colonne
    console.log("begin dataSchemaFromResultTemplateStructure")

    var dataSchema={};
    var colonne=[];
    var colinfo={};
    for(var i=0; i<o.length; i++){
      var f=o[i];

      dataSchema[f.fieldName]=null;

      // scelta validatori in base al campo
      if(f.fieldType==='swe:Quantity'){
        colonne[i]={data: f.fieldName, type: 'numeric', format:'0.000',language: 'en'}; 
        colinfo[f.fieldName]={type:'numeric'};     
      }
      else if (f.fieldType==='swe:Time') { 
        colonne[i]={data: f.fieldName, validator: ISO_datetime_validator_regexp, allowInvalid: true};
        colinfo[f.fieldName]={type:'timestamp'}; 
      }
      else{
        colonne[i]={data: f.fieldName};
        colinfo[f.fieldName]={type:'string'};
      }
    }
    return({dataSchema:dataSchema,columns:colonne,columnsExtraInfo:colinfo});
  }

  // ottiene un oggetto js con due proprietà: resultStructure (un array di oggetti, ognuno dei quali descrive uno dei campi della resultStructure del resultTemplate, resultEncoding):
  // xslt/resultTemplate2Structure.xsl
  // a partire da un resultTemplateXmlString
  // TODO: l'uso di resultTemplateId e' deprecato nella chiamata a resultTemplate2DataRecordStructure. Inutile...

  /*  (with XSLT) object resultTemplate2DataRecordStructure(xml resultTemplateXml)
   * 
   */
  var resultTemplate2DataRecordStructure=function(xml){

      var 
        filenameXsl="xslt/resultTemplate2Structure.xsl";
        // filenameXml="xslt/FOI_test.xml";
  
      var xslt,     // XsltTransformer object
        xsl,      // xslt stylesheet: transform sensorDescription into insertResultTemplate document
              // Document object: sensorDescription already loaded in sos object or describeSensor to get from sos kvp endpoint
        xmlOut, // Document object: insertResultTemplate, output of xslt transformation and output of the function
        stringJSON; // string: insertResultTemplate parsed to string; 

      xslt=ritmaresk.XsltTransformer.getInstance();
      xsl=xslt.loadXMLDoc(filenameXsl);

      xmlOut=xslt.transform(xsl, xml, undefined, undefined);
      
      stringJSON=(new XMLSerializer()).serializeToString(xmlOut);   

      console.warn("resultStructure output:")
      console.log(stringJSON);

      return JSON.parse(stringJSON);
  };


  function loadTableLegend(tableLegendHtmlElementSelector, o){  
    var legend=[];
    for(var i=0; i<o.length; i++){
      var f=o[i];

      
      var typ;
      var nome,tipo,uom;
      switch(f.fieldType){
        case 'swe:Quantity':
          //typ="Quantità";       
          typ="Quantity";
          //uomh=f.uom_code_href;
          break;
        case 'swe:Time':
          //typ="Data e ora";        
          typ="Date and Time";  
          break;
        default:
          typ=f.fieldType;          
      }

      
      nome='<a href="'+f.fieldDefinition + '" target="_blank">' + f.fieldName + '</a>';
      tipo=f.uom_code_href!=="" ? '(<a href="' + f.uom_code_href + '" target="_blank">' + typ + '</a>)' : '('+typ+')';
      //uom=f.uom_code_value!=="" ? 'unità di misura: ' + f.uom_code_value : '';
      uom=f.uom_code_value!=="" ? 'Unit of measure: ' + f.uom_code_value : '';


      legend.push([nome,tipo,uom].join(" "));    
    }

    console.warn(legend.join("<br/>"));
    //$(tableLegendHtmlElementSelector).html("<div class=\"panel-heading\"><h3 class=\"panel-title\">Legenda - Definizione dei campi</h3></div><div class=\"panel-body\">"+legend.join("<br/>")+"</div>");
    $(tableLegendHtmlElementSelector).html("<div class=\"panel-heading\"><h3 class=\"panel-title\">Legend - Fields definition</h3></div><div class=\"panel-body\">"+legend.join("<br/>")+"</div>");
  }
  // TODO: valutare la possibilita' di usare un callback (es after change o after validate 
  //       per abilitare il pulsante che invia i dati - in modo che non si possa mandare due volte al SOS lo stesso set di dati)
  function loadTable(tableHtmlElementSelector, dataSchema, columns, columnsExtraInfo){  
    console.warn(JSON.stringify(dataSchema));
    console.warn(JSON.stringify(columns));
    


    $(tableHtmlElementSelector).handsontable({
      //data: people,
      data: [],
      dataSchema: dataSchema,
      minSpareRows: 1,
      contextMenu: true,
      //manualColumnMove: true,//check this...still some issues in validation.
      beforeChange: function (changes, source) {      
        //console.log("table before change: ");
        //console.log(JSON.stringify(changes));
        var du=new ritmaresk.DateUtil();
        
        // changes[i][0] -< row num
        // changes[i][1] -< column name
        // changes[i][2] -< old value
        // changes[i][3] -< new value
        var errs="";
        for (var i = 0; i < changes.length; i++) {   
          var colname=changes[i][1],
              newVal=changes[i][3];
          var coltype=columnsExtraInfo[colname].type;
          
          switch(coltype){
            case 'numeric':
              // trasformazione numeri proposti con la virgola in numeri con il "."
              var snewVal=new String(newVal);
              if(snewVal.indexOf('.')==-1){            
                changes[i][3]=parseFloat(snewVal.replace(/,/g,'.'));
              }
              break;
            case 'timestamp':     
              // trasformazione timestamp in formato ISO
              var snewVal=new String(newVal);       
              if(!du.isIso(snewVal)){    
                var converted;
                try{
                  converted=du.convertStringToISO_noTZ(snewVal,"DD/MM/YY[YY] HH*mm[*ss]");
                  changes[i][3]=converted;
                }
                catch(err){
                  errs+="; "+err;
                }                        
              }
              break;
            //default: nothing
          }


          // trasformazione numeri proposti con la virgola in numeri con il "."
          /*
          if(isNumericColumn(columns,colname)){
            var snewVal=new String(newVal);
            if(snewVal.indexOf('.')==-1){            
              changes[i][3]=parseFloat(snewVal.replace(/,/g,'.'));
            }
          }
          if(false && isTimestampColumn(columns,colname)){

          }
          if(false){}*/
        }
        if(errs!==""){alert(errs);}
        
        return(true);
      },
      afterChange: function (changes, source) {
        if (source !== 'loadData') {
          console.log("table after change: "+JSON.stringify(changes));
        
          var d = this;
          console.log("triggering validate cells");
          d.validateChanges(changes, source, function (){d.render()});//REMARK: requires cnr modified version of handsontable
        }
      },
      
      colHeaders: Object.keys(dataSchema),
      columns: columns,
      contextMenu: ['row_above', 'row_below', 'remove_row', 'undo', 'redo'],
      colWidths: 155,
    });    

  }

  return {
    dataSchemaFromResultTemplateStructure:dataSchemaFromResultTemplateStructure,
    loadTableLegend:loadTableLegend,
    loadTable:loadTable,
    resultTemplate2DataRecordStructure:resultTemplate2DataRecordStructure

  };

})();