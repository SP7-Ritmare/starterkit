String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};
var userUri = "http://ritmare.it/rdfdata/project#AlessandroOggioniIREA";
var virtuosoUrl = "http://sp7.irea.cnr.it:8890/sparql";
var currentLanguage = "it";
var cloneSuffix = "_XritX";

function Observation() {
    this.observerCollection = [];
    this.registerObserver = function (observer) {
        this.observerCollection.push(observer);
        console.log("registering " + observer);
    }
    this.unregisterObserver = function (observer) {
        console.log("unregistering " + observer);
        var index = this.observerCollection.indexOf(observer);
        if (index > -1) {
            this.observerCollection.splice(index, 1);
        } else {
            console.log("observer " + observer + " not found");
        }
        console.log("" + this.observerCollection.length + " observers left");
        if (this.observerCollection.length == 1) {
            console.log("il bastardo ?????????????????? " + this.observerCollection[0]);
        }
        if (this.observerCollection.length == 0) {
            this.callback();
        }
    }
    this.callback = function () {};
}

var duplicateElement = function (element) {};

var addElement = function (element) {
    for (i = 0; i < elements.length; i++) {
        if (elements[i].id == element.id) {
            return;
        }
    }
    elements.push(element);
};
var defaultPostErrorCallback = function () {
    var newWindow2 = window.open("data:text/xml," + encodeURIComponent(arguments.responseText), "_blank");
    console.log('Failed ' + JSON.stringify(arguments));
};

var defaultPostSuccessCallback = function (msg) {
    // $( "#debug" ).html( htmlEncode(msg) );
    console.log("Ricevuto: " + xmlToString(msg));
    var xmlString = xmlToString(msg);
    if (xmlString.indexOf("sml:SensorML") >= 0) {
        $.ajax({
            type: "POST",
            url: "sos/registerSensor",
            contentType: "application/xml",
            processData: true,
            data: (xmlString),
            success: function (msg) {
                // $( "#debug" ).html( htmlEncode(msg) );
                console.log("Ricevuto: " + xmlToString(msg));
                var xmlString = xmlToString(msg);
                var newWindow = window.open("data:text/xml," + encodeURIComponent(xmlString), "_blank");
                $.ajax({
                    type: "POST",
                    url: "http://sp7.irea.cnr.it/sigosos/SOS32/sos",
                    contentType: "application/xml",
                    processData: true,
                    data: (xmlString),
                    success: function (msg) {
                        // $( "#debug" ).html( htmlEncode(msg) );
                        console.log("Ricevuto: " + xmlToString(msg));
                        var xmlString = xmlToString(msg);
                        var newWindow = window.open("data:text/xml," + encodeURIComponent(xmlString), "_blank");
                        /*
                                                                        		newWindow.document.open();
                                                                        		newWindow.document.write(xmlToString(msg));
                                                                        		newWindow.document.close();
                                                                        		*/
                    },
                    error: function () {
                        var newWindow2 = window.open("data:text/xml," + encodeURIComponent(arguments.responseText), "_blank");
                        console.log('Failed ' + JSON.stringify(arguments));
                    }
                });
                /*
                                                			newWindow.document.open();
                                                			newWindow.document.write(xmlToString(msg));
                                                			newWindow.document.close();
                                                			*/
            },
            error: function () {
                var newWindow2 = window.open("data:text/xml," + encodeURIComponent(arguments.responseText), "_blank");
                console.log('Failed ' + JSON.stringify(arguments));
            }
        });
    } else {
        var newWindow = window.open("data:text/xml," + encodeURIComponent(xmlString), "_blank");
    }
    /*
						newWindow.document.open();
						newWindow.document.write(xmlToString(msg));
						newWindow.document.close();
						*/
};
var observation = new Observation();
var firstLoad = true;

function clone(obj) {
    if (obj == null || typeof (obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function setAutocompletions() {
    var acs = $('input[datatype="autoCompletion"]');
    acs.each(function () {
        var textbox = $(this);
        var query = textbox.attr('query');
        var labels;
        var id = $(this).attr("id");
        console.log('setto l\'evento');
        textbox.keyup(function () {
            console.log('length: ' + $(this).val().length);
            if ($(this).val().length <= 0) {
                $('#' + id + '_uri').val('');
            }
            console.log('autocomp1 ' + $(this).val());
            query = $(this).attr('query');
            query = replaceAll(query, '$search_param', $(this).val());
            console.log('launch query: ' + query);
            labels = new Array();
            $.getJSON(virtuosoUrl, {
                query: query,
                format: 'application/sparql-results+json',
                save: 'display',
                fname: undefined
            }, function (data) {
                dati = data.results.bindings;
                console.log('autocomp2: ' + JSON.stringify(data));
                for (i = 0; i < dati.length; i++) {
                    labels.push({
                        value: dati[i].c.value,
                        label: (dati[i].a ? dati[i].a.value : dati[i].l.value),
                        urn: (dati[i].urn ? dati[i].urn.value : "")
                    });
                    console.log('a ' + i + ' - ' + (dati[i].a ? dati[i].a.value : dati[i].l.value));
                }
                $('#' + id).autocomplete({
                    source: labels,
                    select: function (event, ui) {
                        $('#' + id).val(ui.item.label);
                        $('#' + id + '_uri').val(ui.item.value);
                        $('#' + id + '_urn').val(ui.item.urn);
                        return false;
                    }
                });
            });
        });
    });
}

// $user_uri
function lookupLanguage(code) {
    console.log("searching for " + code);
    for (i = 0; i < iso639.length; i++) {
        // console.log(iso639[i][1]);
        if (iso639[i][1] == code) {
            return iso639[i][3];
        }
    }
    return "en";
}

function translateHelpTexts() {
    var labels = $("a[data-toggle='popover']");
    labels.each(function () {
        var labelFor = $(this).attr("for");
        var arrayName;

        console.log("help for " + labelFor);

        if (labelFor) {
            arrayName = eval(labelFor + "_help");
            console.log("array is " + arrayName);

            if ($.isArray(arrayName) && arrayName.length > 1) {
                console.log("it is an array");
                var translationFound = false;
                for (i = 0; !translationFound && i < arrayName.length; i++) {
                    if (arrayName[i].lang == currentLanguage) {
                        $(this).attr("data-content", arrayName[i].label);
                        // console.log($(this).data('popover').tip().find("popover-content"));
                        $(this).data('popover', null).popover({
                            title: '',
                            content: arrayName[i].label,
                            placement: 'right',
                            trigger: 'manual'
                        });
                        // $(this).popover({html:true,placement:'right',title:$(this).attr("data-original-title"),content:arrayName[i].label}).popover('hide');
                        /*
									alert($(this).data('popover').tip().find('.popover-content').html());
*/
                        translationFound = true;
                    }
                }
            }
        }
    });
    $('a[data-toggle=popover]').popover();
}

function translateLabels() {
    var labels = $("label[for],h2[for],span[for]");
    labels.each(function () {
        var labelFor = $(this).attr("for");
        var arrayName;

        console.log("label for " + labelFor);

        if (labelFor) {
            arrayName = eval(labelFor + "_labels");
            console.log("array is " + arrayName);

            if ($.isArray(arrayName) && arrayName.length > 1) {
                console.log("it is an array");
                var translationFound = false;
                for (i = 0; !translationFound && i < arrayName.length; i++) {
                    if (arrayName[i].lang == currentLanguage) {
                        $(this).html(arrayName[i].label);
                        $("button[duplicates='" + labelFor + "']").html(" + " + arrayName[i].label);
                        translationFound = true;
                    }
                }
            }
        }
    });
}

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function xmlToString(xmlData) {

    var xmlString;
    //IE
    if (window.ActiveXObject) {
        xmlString = xmlData.xml;
    }
    // code for Mozilla, Firefox, Opera, etc.
    else {
        xmlString = (new XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
}

function replaceAll(str, find, replace) {
    var re;
    var retVal;

    retVal = str.replace(find, replace);
    for (i = 0; i < 100; i++) {
        retVal = retVal.replace(find, replace);
    }
    console.log("retVal: " + retVal);
    return retVal;
}

function createXml() {
    var xml = '<?xml version="1.0"?><root/>';
    var doc = jQuery.parseXML(xml);


    return doc;
}

function querystring(key) {
    if (typeof queryStringValues != 'undefined') {
        if (typeof queryStringValues[key] != 'undefined') {
            return queryStringValues[key];
        }
    }
    var re = new RegExp('(?:\\?|&)' + key + '=(.*?)(?=&|$)', 'gi');
    var r = [],
        m;
    while ((m = re.exec(document.location.search)) != null)
        r.push(m[1]);
    return r;
}

function feedSelect(select, theArray) {
    var selectedValue = select.val();
    select.empty();
    for (i = 0; i < theArray.length; i++) {
        var optionRecord = theArray[i];
        select.append("<option " + (optionRecord.language_neutral == "" ? "" : " language_neutral='" + optionRecord.language_neutral) + "' value='" + optionRecord.code + "'>" + optionRecord.text + "</option>");

    }
    if (selectedValue) {
        select.val(selectedValue);
    } else {
        select.val([]);
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

var cbfunc = function (results) {
    $("#results").val(JSON.stringify(results));
};
var getSparqlQuery = function (uri) {
    var sparql;
    sparql = "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> " +
        "PREFIX dct:<http://purl.org/dc/terms/> " +
        "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
        "PREFIX skos:<http://www.w3.org/2004/02/skos/core#> " +

    "SELECT DISTINCT <" + uri + "> AS ?uri ?c ?l ?a ?z " +
        "WHERE { " +
        "	{ " +
        "	  ?c rdf:type skos:Concept. " +
        "	  ?c skos:inScheme <" + uri + ">. " +
        "	  OPTIONAL { " +
        "	      ?c skos:prefLabel ?l. " +
        '	      FILTER ( LANG(?l) = "en" ) ' +
        "	  } " +
        "	} " +

    "	OPTIONAL { " +
        "	    ?c skos:prefLabel ?z. " +
        '	    FILTER ( LANG(?z) = "zxx" ) ' +
        "	} " +
        "	OPTIONAL { " +
        "	    ?c skos:prefLabel ?a. " +
        '	    FILTER ( LANG(?a) = "' + currentLanguage + '" ) ' +
        "	} " +
        "	" +
        "} " +
        "ORDER BY ASC(?a) ASC(?l)";
    console.log(sparql);
    return sparql;
};

var addSelectOption = function (select, optionRecord) {
    var alreadyThere = false;
    $("select[lookup='" + select + "'] > option").each(function () {
        // console.log("confronto " + $(this).val() + " con " + optionRecord.code + " -> " + ($(this).val() == optionRecord.code));
        if ($(this).val() == optionRecord.code) {
            // console.log("" + select + " contiene gi?? " + optionRecord.text);
            // alreadyThere = true;
            $(this).remove();
        }
    });
    if (!alreadyThere) {
        op = $("select[lookup='" + select + "']").append("<option " + (optionRecord.language_neutral == "" ? "" : " language_neutral='" + optionRecord.language_neutral) + "' value='" + optionRecord.code + "'>" + optionRecord.text + "</option>");
    }
    // console.log("aggiungo " + optionRecord.text + " a " + select);
    // op.prop("selected", false);
};
var addQuerySelectOption = function (select, optionRecord) {
    var alreadyThere = false;
    $("select[hook='" + select + "'] > option").each(function () {
        // console.log("guardo " + select);
        if ($(this).val() == optionRecord.code) {
            // console.log("" + select + " contiene gi?? " + optionRecord.text);
            alreadyThere = true;
        }
    });
    // console.log("aggiungo " + optionRecord.text + " a " + select);
    // op.prop("selected", false);
    if (!alreadyThere) {
        op = $("select[hook='" + select + "']").append("<option value='" + optionRecord.code + "'>" + optionRecord.text + "</option>");
    }
};
var lookups = new Array();
var queryLookups = new Array();
var queryBasedLookups = function () {
    var selects = $("select[query]");
    // alert(selects.length);
    for (i = 0; i < selects.length; i++) {
        var select = $(selects[i]);
        var query = select.attr("query");

        query = query.replace("$user_uri", userUri);

        $.getJSON(virtuosoUrl, {
            query: query,
            format: "application/sparql-results+json",
            save: "display",
            fname: undefined
        }, function (data) {
            // dati = JSON.parse(data);
            id = JSON.stringify(data);
            // $("#debug").append(id);
            dati = data.results.bindings;
            if (dati.length > 0) {
                id = dati[0].id.value;
                // console.log("success " + uri);
            } else {
                return;
            }

            /*
                                        for ( i = 0; i < queryLookups.length; i++ ) {
                                            if ( queryLookups.id == id ) {
                                                return;
                                            }
                                        }
                                        */
            theArray = new Array();
            for (i = 0; i < dati.length; i++) {
                $("#results").append("<p><b>" + dati[i].code.value + "</b>" + dati[i].label.value + "</p>");
                record = {
                    code: dati[i].code.value,
                    text: dati[i].label.value
                };
                theArray.push(record);
                // console.log("adding " + record.text);
            }
            queryLookups.push({
                id: id,
                data: theArray
            });

            var selects = $("select[hook]");
            // alert(selects.length);

            for (j = 0; j < selects.length; j++) {
                var select = $(selects[j]);
                // select.empty();
                var uri = select.attr("hook");
                // console.log("candidate: " + uri + " " + queryLookups.length);
                for (k = 0; k < queryLookups.length; k++) {
                    // console.log("comparing " + uri + " to " + queryLookups[k].id);
                    if (queryLookups[k].id == uri) {
                        // $(select).append("<option name='" + record.code + "'>" + record.text + "</option>");
                        // console.log("found " + uri);
                        // console.log(" -> " + lookups[k].data);
                        for (m = 0; m < queryLookups[k].data.length; m++) {
                            // console.log(" -> " + queryLookups[k].data[m].code + " - " + queryLookups[k].data[m].text);
                            addQuerySelectOption(uri, queryLookups[k].data[m]);
                        }
                        break;
                    }
                }
                // console.log("mandatory: " + select.attr("mandatory"));
                // console.log("querystring(context): " + querystring("context"));
                // console.log("default value: '" + select.attr("defaultValue") +"'");
                if (select.attr("defaultValue") != "") {
                    select.val(select.attr("defaultValue"));
                } else if (select.attr("mandatory") == "forAll" || select.attr("mandatory") == querystring("context")) {
                    console.log("set default to first option");
                    select.eq(0).prop('selected', true);
                } else {
                    select.val([]);
                }

            }

            $("#results").append("<p><b>" + uri + "</b></p>");
            $("#results").append(JSON.stringify(dati));
            // alert( "Load was performed." );
        });
    }
}
var uriCallback = function () {
    allDone = true;
    console.log("observation callback " + firstLoad);
    if (firstLoad) {
        firstLoad = false;
        uriBasedLookups();
        translateLabels();
        translateHelpTexts();
    }
};
var uriBasedLookups = function () {
    var selects = $("select[lookup]");
    var allDone = false;
    observation.callback = uriCallback;

    // alert(selects.length);
    for (i = 0; i < selects.length; i++) {
        var select = $(selects[i]);
        var uri = select.attr("lookup");

        sparqlUrl = getSparqlQuery(uri);
        observation.registerObserver(uri);
        $.getJSON(virtuosoUrl, {
            query: sparqlUrl,
            format: "application/sparql-results+json",
            save: "display",
            fname: undefined
        }, function (data) {
            // dati = JSON.parse(data);
            uri = JSON.stringify(data);
            dati = data.results.bindings;
            if (dati.length > 0) {
                uri = dati[0].uri.value;
                // console.log("success " + uri);
            } else {
                return;
            }
            observation.unregisterObserver(uri);
            /*
                                    for ( i = 0; i < lookups.length; i++ ) {
                                        if ( lookups.uri == uri ) {
                                            return;
                                        }
                                    }
                                    */
            theArray = new Array();
            for (i = 0; i < dati.length; i++) {
                $("#results").append("<p><b>" + dati[i].c.value + "</b>" + (!dati[i].a ? (dati[i].l ? dati[i].l.value : dati[i].z.value) : dati[i].a.value) + "</p>");
                record = {
                    code: dati[i].c.value,
                    text: (!dati[i].a ? (dati[i].l ? dati[i].l.value : dati[i].z.value) : dati[i].a.value),
                    language_neutral: (!dati[i].z ? "" : dati[i].z.value)
                };
                theArray.push(record);
                // console.log("adding " + record.text);
            }
            lookups.push({
                uri: uri,
                data: theArray
            });

            var selects = $("select[lookup='" + uri + "']");
            // alert(selects.length);

            for (j = 0; j < selects.length; j++) {
                var select = $(selects[j]);
                var backupValue = select.val();
                /*
					var backupValue = select.val();
					// console.log("select " + select.attr("id") + " -> " + select.val());
                                        // select.empty();
                                        var uri = select.attr("lookup");
                                        // console.log("candidate: " + uri + " " + lookups.length);
                                        for ( k = 0; k < lookups.length; k++ ) {
                                            // console.log("comparing " + uri + " to " + lookups[k].uri);
                                            if ( lookups[k].uri == uri ) {
                                                // $(select).append("<option name='" + record.code + "'>" + record.text + "</option>");
                                                // console.log("found " + uri);
                                                // console.log(" -> " + lookups[k].data);
                                                for ( m = 0; m < lookups[k].data.length; m++ ) {
                                                    // console.log(" -> " + lookups[k].data[m]);
                                                    addSelectOption(uri, lookups[k].data[m]);
                                                }
                                                break;
                                            }
                                        }
                                        // console.log("default value: " + select.attr("defaultValue"));
                                        if ( select.attr("defaultValue") != undefined ) {
                                            select.val(select.attr("defaultValue"));
                                        } else if ( select.attr("mandatory") == "forAll" || select.attr("mandatory") == querystring("context") ) {
                                               console.log("set default to first option");
                                               select.eq(0).prop('selected', true);
                                        } else {
                                            select.val([]);
                                        }
					if ( backupValue ) {
						select.val(backupValue);
					}
*/

                var which = select.attr("lookup");
                var values = null;
                for (k = 0; k < lookups.length; k++) {
                    if (lookups[k].uri == which) {
                        values = lookups[k].data;
                    }
                }
                feedSelect(select, values);
                // console.log("default value: " + select.attr("defaultValue"));
                // console.log("backup value: " + backupValue);
                if (typeof select.attr("defaultValue") != "undefined") {
                    select.val(select.attr("defaultValue"));
                } else if (select.attr("mandatory") == "forAll" || select.attr("mandatory") == querystring("context")) {
                    console.log("set default to first option");
                    // select.eq(0).prop('selected', true);
                    select.val(select.find("option:first").val());
                } else {
                    select.val([]);
                }

                if (backupValue != null) {
                    select.val(backupValue);
                }
            }

            $("#results").append("<p><b>" + uri + "</b></p>");
            $("#results").append(JSON.stringify(dati));
            // alert( "Load was performed." );
        }).error(function () {
            console.log("error");
            observation.unregisterObserver(uri);
        }).complete(function () {
            console.log("complete");
            observation.unregisterObserver(uri);
        });
    }
}

$(document).ready(function () {
    console.log(elements);
    setAutocompletions();
    uriBasedLookups();
    queryBasedLookups();

    /*
				Object.watch("elements", function() {
					console.log("cambiato elements");
					console.log(elements);
				});
*/

    currentLanguage = lookupLanguage($("select[languageselector='true'] option:selected").attr("language_neutral"));
    $("select[languageselector='true']").change(function () {
        // var selectedLanguage =  $("#" + $(this).attr("id") + " option:selected").attr("languageNeutral");
        var optionSelected = $(this).find("option:selected");
        var selectedLanguage = optionSelected.attr("language_neutral");
        console.log("html: " + optionSelected.html());
        console.log("selected language is " + selectedLanguage);
        currentLanguage = lookupLanguage(selectedLanguage);
        // alert("changing language to " + currentLanguage);
        uriBasedLookups();
        translateLabels();
        translateHelpTexts();
    });

    // console.log("language: " + currentLanguage);
    // $("select[languageselector='true']").change();

    $("label[ismandatory]").removeClass("mandatory");
    $("label[ismandatory='forAll']").addClass("mandatory");
    $("label[ismandatory='" + querystring("context") + "']").addClass("mandatory");
    $(".datepicker").datepicker({
        format: "yyyy-mm-dd"
    }).on('changeDate', function (ev) {

        console.log("data: " + ev.date.valueOf());
    });
    // Fix strange bug
    $("*[prova]").each(function () {
        $(this).val($(this).attr("prova"));
        if ($(this).attr("defaultValue")) {
            $(this).val($(this).attr("defaultValue"));
        }
    });
    // End of strange fix

    $(".templateElement").each(function () {
        elements.push({
            id: $(this).attr("id"),
            original_id: $(this).attr("represents_element"),
            root: $(this).attr("hasRoot"),
            mandatory: $(this).attr("isMandatory"),
            label: "",
            items: []
        });
    });


    var pars = decodeURIComponent(querystring("parameters"));
    var par;
    if (pars && pars != "undefined" && pars != "") {
        pars = JSON.parse(pars);
        console.log(pars);
        console.log(pars.uid);
        $("input[querystringparameter!='']").each(function () {
            console.log("evaluating " + ("pars." + $(this).attr("querystringparameter")));
            par = eval("pars." + $(this).attr("querystringparameter"));
            console.log("input id='" + $(this).attr("id") + " -> parametro '" + $(this).attr("querystringparameter") + "' = '" + par + "'");
            if (par && par != "undefined" && par != "") {
                $(this).val(par);
            }
        });
    }
    // $('.btn-info').popover();
    $('a[data-toggle=popover]').popover();

    $('.duplicator').click(function () {
        var div = $("div[represents_element='" + $(this).attr("duplicates") + "']:last");
        var element_id = div.attr("id");
        var found = false;

        console.log("duplicating " + element_id);
        var newDiv = div.clone();
        newDiv.html(newDiv.html().replaceAll("\"" + element_id, "\"" + element_id + cloneSuffix));
        newDiv.find('.duplicator').remove();
        newDiv.find('button[removes]').remove();
        // var label = newDiv.find('label[for="' + element_id + cloneSuffix + '"]').first();
        newDiv.find('a[for="' + element_id + cloneSuffix + '"]').remove();
        newDiv.attr("id", element_id + cloneSuffix);
        $(this).attr("duplicates", div.attr("represents_element"));

        newDiv.find(".datepicker").datepicker({
            format: "yyyy-mm-dd"
        }).on('changeDate', function (ev) {

            console.log("data: " + ev.date.valueOf());
        });
        var button = newDiv.prepend("<button removes='" + element_id + cloneSuffix + "' id='" + element_id + cloneSuffix + "_remover' type='button' class='btn btn-mini btn-danger'>X</button>").children("button[removes]");
        console.log(button);
        div.after(newDiv);

        newDiv.find("button[removes]").click(function () {
            // alert('#' + $(this).attr("removes"));
            var element_id = $(this).attr("removes");
            var div = $('#' + $(this).attr("removes"));
            div.remove();
            // find element in array
            var found = false;
            for (i = 0; !found && i < elements.length; i++) {
                if (elements[i].id == element_id) {
                    console.log("deleting " + elements[i].id);
                    elements.splice(i, 1);
                    found = true;
                }
            }
            console.log(elements);
        });
        // $(this).detach().appendTo(newDiv);
        // find element in array
        console.log(elements);
        found = false;
        for (i = 0; !found && i < elements.length; i++) {
            if (elements[i].id == element_id) {
                var existingElement = elements[i];
                newElement = clone(existingElement);
                newElement.id = element_id + cloneSuffix;
                newElement.original_id = $(this).attr("duplicates");
                console.log("pushing " + newElement.id);
                console.log(newElement);
                addElement(newElement);
                found = true;
            }
        }
        console.log(elements);
    });
    $("#postButton").click(function () {
        var document = jQuery.parseXML("<ritmare></ritmare>");
        var version = querystring("version");
        if (!version) {
            version = "1.00";
        }
        var content = {
            elements: {
                version: version,
                template: querystring("template"),
                fileId: null,
                user: userUri,
                element: []
            }
        };

        var c = content.elements.element;
        var theElement;
        for (i = 0; i < elements.length; i++) {
            var elementId = elements[i].id;
            elements[i].items = {
                item: []
            };
            theElement = {};
            theElement.element = elements[i];

            urnValue = "";

            $("*[element_id='" + elementId + "']").each(function () {
                var type = $(this).attr("datatype");
                if (type == "code" || type == "query") {
                    console.log($(this) + " is a select");
                    console.log($(this).attr("id") + " option:selected");
                    value = $("#" + $(this).attr("id") + " option:selected").text();
                    codeValue = $(this).val();
                    languageNeutralValue = $("#" + $(this).attr("id") + " option:selected").attr("language_neutral");
                } else if (type == "autoCompletion") {
                    value = $(this).val();
                    codeValue = $("#" + $(this).attr("id") + "_uri").val();
                    urnValue = $("#" + $(this).attr("id") + "_urn").val();
                    languageNeutralValue = codeValue;
                    if ($(this).attr("useCode") == "true") {
                        value = codeValue;
                    }
                } else if (type == "boolean") {
                    value = $(this).is(":checked");
                    codeValue = value;
                    languageNeutralValue = codeValue;
                } else {
                    value = $(this).val();
                    codeValue = "";
                    languageNeutralValue = codeValue;
                }
                if (type != "ref" && $(this).attr("isLanguageNeutral") != "undefined" && $(this).attr("isLanguageNeutral") != "" && $(this).attr("language_neutral") != "undefined" && $(this).attr("language_neutral") != "") {
                    value = languageNeutralValue;
                }
                var item = {
                    id: $(this).attr("id"),
                    element_id: $(this).attr("element_id"),
                    path: $(this).attr("path"),
                    datatype: $(this).attr("datatype"),
                    fixed: $(this).attr("fixed"),
                    value: value,
                    codeValue: codeValue,
                    urnValue: urnValue,
                    languageNeutral: languageNeutralValue,
                    isLanguageNeutral: ($(this).attr("isLanguageNeutral") != "undefined" ? $(this).attr("isLanguageNeutral") : "")
                };
                theElement.element.items.item.push(item);
            });
            c.push(theElement.element);
            console.log(content);
        }
        // $("#debug").append("elements: " + JSON.stringify(elements));
        var x2js = new X2JS();
        var xml = /* '<?xml version="1.0" encoding="UTF-8"?>' + */ (x2js.json2xml_str(content));

        if (querystring("debug") == "on") {
            var newWindow1 = window.open("data:text/xml," + encodeURIComponent(xml), "_blank");
        }

        // $("#debug").append( htmlEncode(xml) );
        /*
				$.post( "postMetadata", 
					{ md: xml })
					.done(function( data ) {
  						$( "#debug" ).html( htmlEncode(data) );
					});
*/

        xml = '<?xml version="1.0" encoding="UTF-8"?>' + xml;
        if (typeof successCallback == 'undefined') {
            successCallback = defaultPostSuccessCallback;
        }
        if (typeof errorCallback == 'undefined') {
            errorCallback = defaultPostErrorCallback;
        }

        $.ajax({
            type: "POST",
            url: "postMetadata",
            contentType: "application/xml",
            processData: true,
            data: (xml),
            success: successCallback,
            error: errorCallback
        });
        $("element-copy").each(function () {
            /*
                            		var xml = jQuery.parseXML($(this).wrapAll('<xml></xml>').parent().html());
                            		$("#debug").append(htmlEncode(xmlToString(xml)));
                            		$("#debug").append("<br>");
                            		elementId = $(this).find("id").text();
                            		// $("#debug").append(xml2json(xml));
                            		$("*[element_id='" + elementId + "']").each(function() {
                            			$("#debug").append(htmlEncode($(this).attr("id") + ", " + $(this).attr("element_id") + " - " + $(this).attr("placeholder") + " - " + $(this).val()));
                            			var itemXml = jQuery.parseXML("<item><id>" + $(this).attr("id") + "</id><element_id>" + $(this).attr("element_id") + "</element_id><path>" + $(this).attr("placeholder") + "</path><value>" + $(this).val() + "</value></item>");
                            			$(xml).append(itemXml);
                            			$("#debug").append("<br>");
                            		});
                            		$(document).append(xml);
                            		*/

        });
        // $("#debug2").html(htmlEncode(xmlToString(document)));
        console.log(xmlToString(document));
        return false;
    });
});