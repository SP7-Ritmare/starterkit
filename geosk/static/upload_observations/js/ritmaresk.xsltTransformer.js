/**
 *  ritmaresk.xsltTransformer.js
 *  [singleton]
 *
 *  authors: Fabio Pavesi & Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *
 *      pavesi.f@irea.cnr.it
 *      paolo.tagliolato@gmail.com
 *
 *  version: 1 beta
 *
 *  requires: Jquery (for http requests)
 *  usage: ritmaresk.XsltTransformer.getInstance()
 *
 */
if (typeof jQuery === 'undefined') { throw new Error('ritmaresk.XsltTransformer\'s JavaScript requires jQuery') }

var ritmaresk=ritmaresk || {};

/* 
 *
 */
ritmaresk.XsltTransformer=( function () {

  var instance; //singleton

  function XsltTransformer(){
    self=this;

    var xhttp;
    if (window.ActiveXObject){
      xhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    else{
      xhttp = new XMLHttpRequest();
    }

    self.loadXMLDoc=function(filename){
      
      xhttp.open("GET", filename, false);
      try {xhttp.responseType = "msxml-document"} catch(err) {} // Helping IE11
      xhttp.send("");
      return xhttp.responseXML;
    };

    self.loadXMLDocFromString=function(xmlString){
      var xmlDoc,
          parser;

      console.warn("trying: loadXMLDocFromString...");

      if (window.DOMParser){
        parser=new DOMParser();
        xmlDoc=parser.parseFromString(xmlString,"text/xml");
      }
      else{ // Internet Explorer
        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async=false;
        xmlDoc.loadXML(xmlString);
      }

      console.warn("done: loadXMLDocFromString...");
      return(xmlDoc);

    };

    self.transform=function(xsl,xml,params, dataType){
      
      var resultDocument;
      if ( typeof dataType == 'undefined' ) {
        dataType = "json";
      }
      if ( window.ActiveXObject || xhttp.responseType == "msxml-document"){
        if(typeof jQuery!='undefined'){
            var url= "http://sp7.irea.cnr.it/jboss/MDService/rest/util/xslt";
            /*
            var qs="?xsl="+encodeURIComponent((new XMLSerializer()).serializeToString(xsl))+"&xml="+encodeURIComponent((new XMLSerializer()).serializeToString(xml)) ;
            if(params){
              qs+="&parameters="+encodeURIComponent(JSON.stringify(params));
            }
            */
            resultDocument = $.ajax({
              type:"get",
              url:url,
              async:false, 
              dataType: dataType,
              data:{
                xsl: (new XMLSerializer()).serializeToString(xsl),
                xml: (new XMLSerializer()).serializeToString(xml),
                parameters: params
              },
            }).responseText;
            resultDocument={textContent:JSON.stringify(JSON.parse(resultDocument))};
        }      
        else{
          console.warn("missing jquery");
        }

        //resultDocument = xml.transformNode(xsl);
        // TODO: valutare come fare la trasformazione con parametri con IE
        

      }
      // code for Chrome, Firefox, Opera, etc.
      else if (document.implementation && document.implementation.createDocument){
        var xsltProcessor = new XSLTProcessor();

        xsltProcessor.importStylesheet(xsl);

        if(params){
          for (var i = Object.keys(params).length - 1; i >= 0; i--) {
            console.log("'"+Object.keys(params)[i]+"' '"+params[Object.keys(params)[i]]+"'");
            xsltProcessor.setParameter(null,Object.keys(params)[i],params[Object.keys(params)[i]]);
          };
        }
        resultDocument = xsltProcessor.transformToFragment(xml, document);
        
      }
      return(resultDocument);
    };
  };
  
  return {
    getInstance:function(){
      if(!instance){
        instance=new XsltTransformer();
      }
      return instance;
      //return new XsltTransformer();
    }
  };

})();


