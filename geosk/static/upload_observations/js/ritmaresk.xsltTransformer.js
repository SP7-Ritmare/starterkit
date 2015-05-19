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
if (typeof jQuery === 'undefined') {
    throw new Error('ritmaresk.XsltTransformer\'s JavaScript requires jQuery')
}

var ritmaresk = ritmaresk || {};

/* 
 *
 */
ritmaresk.XsltTransformer = (function () {

    /**
     *
     */
    var /**XsltTransformer*/ instance; //singleton

    /**
     *
     * @constructor
     */
    function XsltTransformer() {
        self = this;

        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        }
        else // code for IE5 and IE6
        {
            try {
                xhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }catch(err){

                try {
                    xhttp = new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch(err2){console.warn("exception initialising ritmaresk.xsltTransformer:"+err2);}
            }
        }



        /**
         *
         * @param {String} urlOrPath
         * @param {boolean} async perform an async request (default=false)
         * @param {boolean} overrideMimeTypeToXml force application/xml mimeType on the response
         * @returns {HTMLDocument}
         */
        self.loadXMLDoc = function (/**String*/urlOrPath, async, overrideMimeTypeToXml) {
            async=async||false;
            /*
            xhttp.open("GET", filename, false);
            try {
                xhttp.responseType = "msxml-document";
            } catch (err) {
            } // Helping IE11
            xhttp.send("");
            return xhttp.responseXML;
            */
            console.log("loadingXMLDoc: "+urlOrPath);
            xhttp.open("GET", urlOrPath, async);
            //xhttp.setRequestHeader ("Accept", "text/xml");
            if(overrideMimeTypeToXml)xhttp.overrideMimeType("application/xml; charset=UTF-8");
            xhttp.send();
            return xhttp.responseXML;
        };

        /**
         *
         * @returns {HTMLDocument}
         */
        self.loadXMLDocFromString = function (/**String*/xmlString) {

            var xmlDoc,
                parser;

            console.warn("trying: loadXMLDocFromString...");

            if (window.DOMParser) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlString, "text/xml");
            }
            else { // Internet Explorer
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);
            }

            console.warn("done: loadXMLDocFromString...");
            return(xmlDoc);
        };

        self.transform = function (xsl, xml, params, dataType) {

            var resultDocument;
            if (typeof dataType == 'undefined') {
                dataType = "json";
            }
            // IE...
            if (window.ActiveXObject) {//|| xhttp.responseType == "msxml-document"){
                console.log("ritmaresk.xslttransformer activexobject or msxml document detected");
                if (typeof jQuery !== 'undefined') {
                    var url = "http://sp7.irea.cnr.it/jboss/MDService/rest/util/xslt";
                    //var url= "http://adamassoft.it/jbossTest/MDService/rest/util/xslt";

                    /*
                     var qs="?xsl="+encodeURIComponent((new XMLSerializer()).serializeToString(xsl))+"&xml="+encodeURIComponent((new XMLSerializer()).serializeToString(xml)) ;
                     if(params){
                     qs+="&parameters="+encodeURIComponent(JSON.stringify(params));
                     }
                     */
                    resultDocument = $.ajax({
                        type: "get",
                        url: url,
                        async: false,
                        dataType: dataType,
                        data: {
                            xsl: (new XMLSerializer()).serializeToString(xsl),
                            xml: (new XMLSerializer()).serializeToString(xml),
                            parameters: params
                        }
                    }).responseText;
                    resultDocument = {textContent: JSON.stringify(JSON.parse(resultDocument))};
                }
                else {
                    console.warn("missing jquery");
                }

                //resultDocument = xml.transformNode(xsl);
                // TODO: valutare come fare la trasformazione con parametri con IE


            }
            // code for Chrome, Firefox, Opera, etc.
            else if (document.implementation && document.implementation.createDocument) {
                var xsltProcessor = new XSLTProcessor();

                console.warn("Preparing for the following XSLT transform");

                xsltProcessor.importStylesheet(xsl);
                var strSaxon = "saxon -s:file.xml -xsl:stylesheet.xsl";

                if (params) {
                    for (var i = Object.keys(params).length - 1; i >= 0; i--) {
                        strSaxon += " " + Object.keys(params)[i] + "='" + params[Object.keys(params)[i]] + "'";
                        console.log("'" + Object.keys(params)[i] + "'='" + params[Object.keys(params)[i]] + "'");
                        xsltProcessor.setParameter(null, Object.keys(params)[i], params[Object.keys(params)[i]]);
                    }


                }

                console.log(strSaxon);
                console.warn("where 'file.xml' content is:");
                console.log((new XMLSerializer()).serializeToString(xml));
                console.warn("where 'stylesheet.xml' content is:");
                console.log((new XMLSerializer()).serializeToString(xsl));

                resultDocument = xsltProcessor.transformToFragment(xml, document);

            }
            return(resultDocument);
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = new XsltTransformer();
            }
            return instance;
            //return new XsltTransformer();
        }
    };

})();


