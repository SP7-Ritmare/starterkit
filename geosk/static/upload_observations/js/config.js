var baseurl_sp7="http://sp7.irea.cnr.it",
	app_name="sensors",
	uri_sk="sk.test.irea.cnr.it";


var endpoint = "http://geosk.ve.ismar.cnr.it/observations/sos";
var documentUrl = document.URL;
//alert(window.location.host);


var baseUrlSK="//"+window.location.host;
// TODO: per debug carico da file statico locale in percorso relativo... rivedere percorso ed eliminare
// baseUrlSK="test";
// console.warn("ripristinare config.js per la produzione: attualmente carica whoami da percorso relativo")


console.log("loading whoami from: "+ baseUrlSK+"/whoami");
var whoami=JSON.parse($.ajax({
    type:"get",
    url: baseUrlSK+"/whoami",
    async:false, 
    dataType: "application/json"
  }).responseText);

//uri_sk= (whoami.uriSK) ? whoami.uriSK : whoami.uri.replace(/http[s]*:\/\//, "");
sk_domain_name=(whoami.sk_domain_name) ? whoami.sk_domain_name : whoami.uri.replace(/http[s]*:\/\//, "");
endpoint=(whoami.endpoint_SOS_url) ? whoami.endpoint_SOS_url : "http://sp7.irea.cnr.it/tomcat/MareeVe/sos";

console.log("uriSK : "+ uri_sk);
console.log("sk_domain_name"+sk_domain_name);






