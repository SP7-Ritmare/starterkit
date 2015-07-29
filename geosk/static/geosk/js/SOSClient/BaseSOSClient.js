function ValidURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(!pattern.test(str)) {
          return false;

  } else {
          return true;

  }
}
// override read function adding X-CSRFToken header
OpenLayers.Protocol.SOS.v1_0_0.prototype.read = function(options) {
    options = OpenLayers.Util.extend({}, options);
    OpenLayers.Util.applyDefaults(options, this.options || {});
    var response = new OpenLayers.Protocol.Response({requestType: "read"});
    var format = this.format;
    var data = OpenLayers.Format.XML.prototype.write.apply(format,
    	[format.writeNode("sos:GetFeatureOfInterest", {fois: this.fois})]
    );
    response.priv = OpenLayers.Request.POST({
        url: options.url,
        callback: this.createCallback(this.handleRead, response, options),
        data: data,
        headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
    });
    return response;
};

OpenLayers.SOSFoiClient = OpenLayers.Class({
    CLASS_NAME: "OpenLayers.SOSFoiClient"
});


OpenLayers.SOSClient = OpenLayers.Class({
    url: null,
    map: null,
    capsformat: new OpenLayers.Format.SOSCapabilities(),
    obsformat: new OpenLayers.Format.SOSGetObservation(),
    legends: null,
    updateLegendTimeout: null,
    latestPosition: null,
    events: null,

    // 52n bug on v4.0.0 and SOS1.0.0 need to check resultModel
    resultModel: 'om:Measurement',

    /**
     *
     */
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
        this.events = new OpenLayers.Events(this);
        var params = {'service': 'SOS', 'request': 'GetCapabilities', 'acceptVersions': '1.0.0'};
        var paramString = OpenLayers.Util.getParameterString(params);
        url = OpenLayers.Util.urlAppend(this.url, paramString);
        OpenLayers.Request.GET({url: url,
                                success: this.parseSOSCaps,
                                failure: this.onFailure,
                                scope: this
                               });
    },
    onFailure: function(){
        this.events.triggerEvent("failure");
    },
    getRandomColor: function () {
        var colorIndex;
        var color;
        var colors = ['#33a02c', '#1f78b4', '#b2df8a', '#a6cee3', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6' ,'#6a3d9a', '#ffff99', '#b15928'];
	// warning: global variable
	// if(sosColorsIndex  === 'undefined'){
	if(typeof sosColorsIndex == 'undefined'){
	    sosColorsIndex = 0;
	}
	colorIndex = sosColorsIndex;
	if(colorIndex < colors.length){
	    color = colors[colorIndex];
	} else {
	    var letters = '0123456789ABCDEF'.split('');
	    color = '#';
	    for (var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	    }
	}
	sosColorsIndex += 1;
	return color;
    },
    createLayer: function(){
	//console.log(this);
	this.layer = new OpenLayers.Layer.Vector(this.SOSCapabilities.serviceIdentification.title, {
            styleMap: new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({},{
		    rules: [
			new OpenLayers.Rule({
			    'name': 'base',
			    'title': 'FOI',
			    symbolizer: {
				graphicName:"circle", pointRadius:6, fillOpacity:0.8, fillColor: this.getRandomColor()
				//'pointRadius': 10,
				//'externalGraphic': 'http://cigno.ve.ismar.cnr.it/static/cigno/img/sos_marker.png',
			    }
			})
		    ]
                })
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.SOS({
                formatOptions: {internalProjection: new OpenLayers.Projection('EPSG:4326')},
                //url: this.url,
                // url: this.urlPOST,
		url: this.getURL('GetFeatureOfInterest', 'post', 'application/xml'),
                fois: this.getFois()
            }),
            projection: new OpenLayers.Projection("EPSG:4326")
            // displayInLayerSwitcher: false
        });
	return this.layer
    },

    getURL: function(operation, method, contentType){
	var elements = this.SOSCapabilities.operationsMetadata[operation].dcp.http[method];
	for(var index = 0; index < elements.length; ++index){
	    var el = elements[index];
	    if (typeof el.constraints === 'undefined'){
		return el.url;
	    } else {
		if(el.constraints['Content-Type'].allowedValues[contentType] === true){
		    return el.url;
		}
	    }
	}
	return elements[0].url;
    },

    parseSOSCaps: function(response) {
        // cache capabilities for future use
        this.SOSCapabilities = this.capsformat.read(response.responseXML || response.responseText);
	//console.log(this.SOSCapabilities.operationsMetadata.GetFeatureOfInterest.dcp.http.post[0].url);
	// non lancio piu' queste funzioni perche' ora controlla tutto il gxp_source
        // this.map.addLayer(this.createLayer());
        // this.ctrl = new OpenLayers.Control.SelectFeature(this.layer,
        //                               {scope: this, onSelect: this.onFeatureSelect});
        // this.map.addControl(this.ctrl);
        // this.ctrl.activate();
        this.events.triggerEvent("loaded",
                         {"capabilities": this.SOSCapabilities});
    },

    /**
     *
     */
    getFois: function() {
        var result = [];
        this.offeringCount = 0;
	//console.log(this.SOSCapabilities);
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            this.offeringCount++;
            for (var i=0, len=offering.featureOfInterestIds.length; i<len; i++) {
                var foi = offering.featureOfInterestIds[i];
                if (OpenLayers.Util.indexOf(result, foi) === -1) {
                    result.push(foi);
                }
            }
        }
        return result;
    },

    getTitleForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return offering.name;
            }
        }
    },

    getNameForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return name;
            }
        }
    },

    getNameForFoi: function(property) {
        for (var fid in this.layer.features) {
            if(this.layer.features[fid].attributes.id == property){
		return this.layer.features[fid].attributes.name;
	    }
        }
    },

    getObservationRequest: function(foiId, offering_id, observedProperties, begin, end, resultModel){
	var foi = {objectId: foiId};
        // get a time range for chart
        var xml = this.obsformat.write({
            eventTime: 'first',
            resultModel: resultModel,
            responseMode: 'inline',
            procedure: foiId,     // TODO: verificare procedure
            foi: foi,
            offering: offering_id,
            observedProperties: observedProperties,
            responseFormat: this.getResponseFormat()
        });

        var timeperiodXml = this.getGmlTimeperiod(begin, end);

        // a little rework due to missing timeperiod in OL-Format
        xml = xml.replace("xmlns:ogc=\"http://www.opengis.net/ogc\"", "xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\"");
        xml = xml.replace("<eventTime/>", timeperiodXml);
	return xml;
    },

    getGmlTimeperiod: function(begin, end) {
        var timeperiod = "<eventTime>" +
                "<ogc:TM_During>" +
                "<ogc:PropertyName>om:samplingTime</ogc:PropertyName>" +
                "<gml:TimePeriod>" +
                "<gml:beginPosition>" + moment(begin).format() + "</gml:beginPosition>" +
                "<gml:endPosition>" + moment(end).format() + "</gml:endPosition>" +
                "</gml:TimePeriod>" +
                "</ogc:TM_During>" +
                "</eventTime>";

        return timeperiod;
    },


    getResponseFormat: function(){
        if (!this.responseFormat) {
            for (format in this.SOSCapabilities.operationsMetadata.GetObservation.parameters.responseFormat.allowedValues) {
                // look for a text/xml type of format
                if (format.indexOf('text/xml') >= 0) {
                    this.responseFormat = format;
                }
            }
        }
	return this.responseFormat;
    },

    getOfferingsByFoi: function(foi){
	var foiId = foi.attributes.id;
	var offerings = {};
        for (var name in this.SOSCapabilities.contents.offeringList) {
	    // console.log(foi);
            var offering = this.SOSCapabilities.contents.offeringList[name];
	    // console.log(offering.featureOfInterestIds);

            // test foi in offeringList
            if(offering.featureOfInterestIds.indexOf(foiId) !== -1){
                //problema nel loop degli array all'interno del writers perche' Ext modifica l'array base dj js ( Ext Array.prototype.indexOf)
                //trasformo l'array in un dictionary
                // var observedProperties = {};
                // offering.observedProperties.forEach(function(val, i) {
                // observedProperties[i]=val;
		//});

		offerings[name] = offering;
            }
        }
	return offerings;
    },

    onFeatureSelect: function(feature) {
	//alert(feature);
	//console.log(feature);
	var foiExplorer = new FoiExplorer({sosClient: this,
					   foi: feature,
					   title: "SOS details: " + feature.attributes.name
					  });

        foiExplorer.show();
    },

    getObservation: function(foiId, offering_id, observedProperty_id, begin, end, onSuccess){
        var offering = this.SOSCapabilities.contents.offeringList[offering_id];
        //c'e' un problema con array e extjs: vedi commento piu' avanti
        var observedProperties = {};
	// doesn't work in IE
        // offering.observedProperties.forEach(function(val, i) {
        //     observedProperties[i]=val;
        // });
	//
	// non funziona nenanche questo in alcuni casi -> prendo solo la prima
        // for(var i=0; i< offering.observedProperties.length; i++) {
	//    observedProperties[i] = offering.observedProperties[i];
	//}
	//if(offering.observedProperties.length>0){
	//  var observedProperties = {0: offering.observedProperties[0]}
        //}

	// ora e' passato come parametro alla funzione
	var observedProperties = {0: observedProperty_id}

	var xmlRequest = this.getObservationRequest(foiId, offering_id, observedProperties, begin,end, this.resultModel);
        OpenLayers.Request.POST({
            // url: this.sosClient.urlPOST,
	    url: this.getURL('GetObservation', 'post', 'application/xml'),
            scope: this,
            success: function(response) {
		//console.log(response.responseText);
		//check for exceptions
		var xmlReader = new OpenLayers.Format.XML();
		var doc = xmlReader.read(response.responseText);
		if(doc && doc.documentElement.tagName == "ows:ExceptionReport"){
		    var els = doc.documentElement.getElementsByTagName('ExceptionText');
		    if(els.length > 0 && els[0].textContent.indexOf("om:Measurement") > -1){
			this.resultModel = null;
			// this.chartReload(); //TODO lanciare automaticamente il reload
		    }
		}
		var output = this.obsformat.read(response.responseXML || response.responseText);
		//console.log(output);
		onSuccess(offering, output);
	    },

            failure: function(response) {
                ("No data for charts...");
            },
            data: xmlRequest,
            headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
        });
    },



    /**
     *
     */
    destroy: function () {
    },

    /**
     *
     */
    CLASS_NAME: "OpenLayers.SOSClient"
});

    PlotDataStore = Ext.extend(Ext.util.Observable, {
	constructor: function(config){
	    this.dataSeries = [];
            this.name = config.name;
            this.addEvents({
		"addSerie" : true,
		"reload" : true
            });

            this.listeners = config.listeners;

            PlotDataStore.superclass.constructor.call(this, config)
	},
	addSerie: function(data){
	    this.dataSeries.push(data);
	    this.fireEvent('addSerie', this.dataSeries, data);
	},
	removeAll: function(){
	    this.dataSeries = [];
	    this.fireEvent('reload', this.dataSeries);
	},
	removeSerie: function(serie_id){
            for(var i=0; i< this.dataSeries.length; i++) {
		if(this.dataSeries[i]['serie_id'] == serie_id){
		    this.dataSeries.splice(i, 1);
		}
            }
	    this.fireEvent('reload', this.dataSeries);
	},
	reload: function(){
	    this.fireEvent('reload', this.dataSeries);
	},
	download: function(){
	    // console.log(this.dataSeries);
	    var de = new DataExporter();
	    de.exportGrid(this.dataSeries);
	}

    });


DataExporter = Ext.extend(Object, {
    dateFormat : 'Y-m-d g:i',

    exportGrid: function(grid) {
        if (Ext.isIE) {
            this._ieToExcel(grid);

        } else {
            var data = this._getCSV(grid);
	    Mydownload(data, "dowload.csv", "text/csv");

            //window.location = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
        }
    },

    _escapeForCSV: function(string) {
        if (string.match(/,/)) {
            if (!string.match(/"/)) {
                string = '"' + string + '"';
            } else {
                string = string.replace(/,/g, ''); // comma's and quotes-- sorry, just loose the commas
            }
        }
        return string;
    },

    _getFieldText: function(fieldData) {
        var text;

        if (fieldData == null || fieldData == undefined) {
            text = '';

        } else if (fieldData._refObjectName && !fieldData.getMonth) {
            text = fieldData._refObjectName;

        } else if (fieldData instanceof Date) {
            text = Ext.Date.format(fieldData, this.dateFormat);

        } else if (typeof fieldData === 'number') {
            text = "" + fieldData;

        } else if (!fieldData.match) { // not a string or object we recognize...bank it out
            text = '';

        } else {
            text = fieldData;
        }

        return text;
    },

    _getFieldTextAndEscape: function(fieldData) {
        var string  = this._getFieldText(fieldData);

        return this._escapeForCSV(string);
    },

    _getCSV: function (grid) {
        var store   = grid.store;
        var data    = '';

        var that = this;
	var headers = ['offering', 'time', 'value']
        Ext.each(headers, function(col, index) {
            data += that._getFieldTextAndEscape(col) + ',';
        });
        data += "\n";

        Ext.each(grid, function(serie) {
	    Ext.each(serie.data, (function(record) {
		var time = new Date(record[0]).toISOString();
		var value = record[1];
		data += that._getFieldTextAndEscape(serie.serie_id) + ',';
		data += that._getFieldTextAndEscape(time) + ',';
		data += that._getFieldTextAndEscape(value) + ',';
		data += "\n";
	    }));
	});

        return data;
    },

    _ieGetGridData : function(grid, sheet) {
        var that            = this;
        var resourceItems   = grid.store.data.items;
        var cols            = grid.colModel.columns;

        Ext.each(cols, function(col, colIndex) {
            if (col.hidden != true) {
                // console.log('header: ', col.header);
                sheet.cells(1,colIndex + 1).value = col.header;
            }
        });

        var rowIndex = 2;
        grid.store.each(function(record) {
            var entry   = record.data;

            Ext.each(cols, function(col, colIndex) {
                if (col.hidden != true) {
                    var fieldName   = col.dataIndex;
                    var text        = entry[fieldName];
                    var value       = that._getFieldText(text);

                    sheet.cells(rowIndex, colIndex+1).value = value;
                }
            });
            rowIndex++;
        });
    },

    _ieToExcel: function (grid) {
        if (window.ActiveXObject){
            var  xlApp, xlBook;
            try {
                xlApp = new ActiveXObject("Excel.Application");
                xlBook = xlApp.Workbooks.Add();
            } catch (e) {
                Ext.Msg.alert('Error', 'For the export to work in IE, you have to enable a security setting called "Initialize and script ActiveX control not marked as safe" from Internet Options -> Security -> Custom level..."');
                return;
            }

            xlBook.worksheets("Sheet1").activate;
            var XlSheet = xlBook.activeSheet;
            xlApp.visible = true;

            this._ieGetGridData(grid, XlSheet);
            XlSheet.columns.autofit;
        }
    }
});


FoiExplorer = Ext.extend(Ext.Window, {
    constructor: function(config){
        var today = new Date(), begin = new Date(), end = new Date();

	this.timeRange = 2;

        begin.setDate(today.getDate() - this.timeRange);
        this.dateRange = [begin, end];
	this.frequency = 10;
	this.interval = 3600;

	this.sosClient = config.sosClient;
	this.foiId = config.foi.attributes.id

	// add listeners
        this.addEvents({
            //"addSerie" : true,
            //"removeSerie" : true,
	    //"reload": true
        });
        this.listeners = config.listeners;

	// configure window
        this.count = 0;

        //reinit
        this.offeringsGridId = Ext.id();
        this.placeholderId = Ext.id();
	this.manualModeId = Ext.id();
	this.realtimeModeId = Ext.id();

	var defaultConfig = this.configureSOSWindow();
	Ext.apply(defaultConfig, config);
	FoiExplorer.superclass.constructor.call(this, defaultConfig);


	// lo creo qui per avere lo scope: this
	// create stores
	this.plotDataStore = new PlotDataStore({
	    listeners: {
		addSerie: function(dataSeries, data) {
		    this.drawChart(dataSeries);
		},
		reload: function(dataSeries){
		    this.drawChart(dataSeries);
		},
		scope: this
	    }
	});


	//console.log(config.foi);
	var offerings = this.sosClient.getOfferingsByFoi(config.foi);
	for (var name in offerings) {
	    this.addSensorRecord(offerings[name], name);
	    //console.log(offerings[name].observedProperties);
	}

	this.enableRealTime(false);

    },
    plot: null,
    chartOptions: {
        series: {
            lines: { show: true },
            points: { show: true, radius: 2 } ,
            stack: false
        },
        crosshair: { mode: "x" },
        xaxis: {
            mode: "time",
            timeformat: "%d/%m/%y %H:%M",
            labelAngle: 45
        },
        grid: { hoverable: true, autoHighlight: false},
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
        //yaxis: { min: 0.00, max: 360.00 }
    },
    drawChart: function(dataSeries) {
        var options = this.chartOptions;
        this.plot = $.plot($("#"+ this.placeholderId), dataSeries, options);
        this.initLegends();
        this.initPanZoom();
    },
    chartMask: null,
    onDeselectOffering: function(sm, rowIndex, record ){
	this.plotDataStore.removeSerie(record.data.name);
    },
    onSelectOffering: function(sm, rowIndex, record ){
        var offering_id = record.data.name;
	var observedProperty_id = record.data.observedProperty;
	var observedProperty_label = record.data.observedPropertyLabel;
	var begin;
	var end;
	if(!this.realTime){
            begin = this.dateRange[0];
            end = this.dateRange[1];
	} else {
            var now = new Date();
	    begin = new Date();
	    end = new Date();
            begin.setTime(now.getTime() - this.interval * 1000);
	}

	//console.log(moment(begin).format());
	//console.log(moment(end).format());

        if(! this.chartMask) this.chartMask = new Ext.LoadMask(Ext.get(this.placeholderId));
        this.chartMask.show();

	var plotDataStore = this.plotDataStore;
	this.sosClient.getObservation(this.foiId, offering_id, observedProperty_id, begin,end,
				      function(offering, output){
					  var rows = [];
                                          var uom = "-";
					  if (output.measurements.length > 0) {
					      // a look-up object for different time formats
					      var timeMap = {};
					      for(var i=0; i<output.measurements.length; i++) {
						  var timePos = output.measurements[i].samplingTime.timeInstant.timePosition;
						  var timePosObj = new Date(timePos);
						  var timestamp = timePosObj.getTime();
						  rows.push([timestamp, parseFloat(output.measurements[i].result.value)]);
					      }

                                              // get uom from first record
                                              if(output.measurements.length > 0){
                                                  uom = output.measurements[0].result.uom;
                                              }

					      function sortfunction(a, b){
						  if(a[0] > b[0]) {
						      return 1;
						  }
						  else {
						      return -1;
						  }
					      }
					      rows.sort(sortfunction);
					  }
					  var label = observedProperty_label + " (" + uom + ") = No Values";
					  plotDataStore.addSerie({data: rows, label: label, serie_id: offering_id});
				      });
    },
    chartReload: function(){
	var grid = Ext.getCmp(this.offeringsGridId);
	this.plotDataStore.removeAll();

	var selection= grid.getSelectionModel();
	for(i=0;i < grid.store.getCount();i++){
            if(selection.isSelected(i)){
		this.onSelectOffering(1, 1, grid.store.getAt(i));
	    }
	}
    },
    download: function(){
	this.plotDataStore.download();
    },
    startRealTime: function(){
	var inst=this;
	// verifico che ci sia una frequenza valida, altrimenti resto in ascolto
	var freq = 1;
	if(this.frequency > 0){
	    this.chartReload();
	    freq = this.frequency;
	}
	this.realTimeTimeOut = setTimeout(function(){
	    inst.startRealTime();
	}, freq * 1000);
	//console.log('REALTIME');
    },
    stopRealTime: function(){
	clearTimeout(this.realTimeTimeOut);
	//console.log('STOP REALTIME');
    },
    enableRealTime: function(enable){
	this.realTime = enable;
	Ext.getCmp(this.realtimeModeId).setDisabled(!enable);
	Ext.getCmp(this.manualModeId).setDisabled(enable);
	if(enable){
	    this.startRealTime();
	} else {
	    this.stopRealTime();
	}
    },
    getFormattedDateFromTimePos: function(timePos) {
	//console.log(timePos);
	//console.log(Date.parse(timePos));
        // var date = new Date(Date.parse(timePos));
        // var formattedString = date.format("isoDate") + " " + date.format("isoTime");

	var date = moment(timePos);
	var a = date.format("YYYY-MM-DD HH:mm");
        return a;
    },
    addSensorRecord: function(offering, name, time, lastvalue) {
        this.count++;
	for(var i=0; i< offering.observedProperties.length; i++) {
	    //console.log(i);
            //exclude phenomenonTime
            if(offering.observedProperties[i] == 'http://www.opengis.net/def/property/OGC/0/PhenomenonTime'){
                continue;
            }
            observedPropertyLabel = offering.observedProperties[i];
	    this.offeringsStore.add(
		this.getSensorRecord({
		    type: offering.name,
		    name: name,
		    observedProperty: offering.observedProperties[i],
		    observedPropertyLabel: observedPropertyLabel,
		    time: time,
		    startPeriod: (offering.time && offering.time.timePeriod) ? this.getFormattedDateFromTimePos(offering.time.timePeriod.beginPosition) : '-',
		    endPeriod: (offering.time && offering.time.timePeriod) ? this.getFormattedDateFromTimePos(offering.time.timePeriod.endPosition) : '-',
		    lastvalue: lastvalue
		})
	    );
        };
    },
    getSensorRecord: function(config){
	Ext.apply({
	    type: null,
	    name: null,
	    observedProperty: null,
	    observedPropertyLabel: null,
	    time: null,
	    startPeriod: null,
	    endPeriod: null,
	    lastvalue: null
	}, config);
	var SensorRecord =  Ext.data.Record.create([
            {name: "type", type: "string"},
            {name: "name", type: "string"},
            {name: "observedProperty", type: "string"},
            {name: "observedPropertyLabel", type: "string"},
            {name: "time", type: "string"},
            {name: "startPeriod", type: "string"},
            {name: "endPeriod", type: "string"},
            {name: "lastvalue", type: "string"}
	]);
	return new SensorRecord({
            type: config.type,
            name: config.name,
            observedProperty: config.observedProperty,
            observedPropertyLabel: config.observedPropertyLabel,
            time: config.time,
            startPeriod: config.startPeriod,
            endPeriod: config.endPeriod,
            lastvalue: config.lastvalue
        });
    },

    // chart's functions
    initLegends: function(){
        this.legends = $("#" + this.placeholderId + " .legendLabel");
        this.legends.each(function () {
            // fix the widths so they don't jump around
            $(this).css('width', $(this).width());
        });
	var sos = this;
        $("#"+this.placeholderId).bind("plothover",  function (event, pos, item) {
            sos.latestPosition = pos;
            //if (!sos.updateLegendTimeout){
	    //sos.updateLegendTimeout = setTimeout(function(){sos.updateLegend();}, 50);
	    //}
	    sos.updateLegend();
        });
    },

    initPanZoom: function(){
	var sos = this;
        $("#"+this.placeholderId).bind('plotpan', function (event, plot) {
            sos.initLegends();
        });

        $("#"+this.placeholderId).bind('plotzoom', function (event, plot) {
            sos.initLegends();
        });

    },
    updateLegend: function(){
        this.updateLegendTimeout = null;
        var pos = this.latestPosition;
        var axes = this.plot.getAxes();
        if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
            pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
            return;

        var i, j, dataset = this.plot.getData();
        for (i = 0; i < dataset.length; ++i) {
            var series = dataset[i];

            // find the nearest points, x-wise
            for (j = 0; j < series.data.length; ++j)
                if (series.data[j][0] > pos.x)
                    break;

            // now interpolate
            var y, p1 = series.data[j - 1], p2 = series.data[j];
            if (p1 == null)
                y = p2[1];
            else if (p2 == null)
                y = p1[1];
            else
                y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);

            this.legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(3)));
        }
    },

    configureSOSWindow: function(){
	this.offeringsStore = new Ext.data.ArrayStore({
            // store configs
            // autoDestroy: true,
            // reader configs
            idIndex: 0,
            fields: [
		{name: 'type'},
		{name: 'name'},
		{name: 'observedProperty'},
		{name: 'observedPropertyLabel'},
		{name: 'time'},
		{name: 'startPeriod'},
		{name: 'endPeriod'},
		{name: 'lastvalue'}
            ]
	});
        this.offeringsStore.addListener('add', function(store, records, index){
            var record = records[0];
            var op = record.get('observedProperty');
            if(ValidURL(op)){
                var request = OpenLayers.Request.GET({
                    url: op,
                    success: function(request){
                        var doc = null;
                        if(!request.responseXML.documentElement) {
                            var format = new OpenLayers.Format.XML();
                            doc = format.read(request.responseText);
                        } else {
                            doc = request.responseXML;
                        }
                        var label = doc.getElementsByTagNameNS('http://www.w3.org/2004/02/skos/core#', 'altLabel');
                        if(label){
                            label = label[0].textContent;
                        }
                        if(label && label != ''){
                            record.set('observedPropertyLabel', label);
                        }
                    },
                    failure: function(request){}
                });
            }
        }, this.offeringsStore);
        return {
            maximizable: true,
            width: 1000,
            height: 350,
            layout: 'border',
	    cls: 'sos-window',
	    defaults: {
		collapsible: true,
		split: true
		//bodyStyle: 'padding:15px'
	    },
            items: [
		{
		    title: 'Metadata',
		    region: 'west',
		    minSize: 150,
		    width: 300,
		    bodyStyle: 'padding: 5px',
		    html: '<p><b>Service: </b>' + this.sosClient.SOSCapabilities.serviceIdentification.title + '</p>'
			+ '<p><b>Abstract: </b> ' + this.sosClient.SOSCapabilities.serviceIdentification.abstract + '</p>'
			+ '<p><b>Provider: </b> ' + this.sosClient.SOSCapabilities.serviceProvider.providerName + '</p>'
			+ '<p><b>Foi: </b> ' + this.sosClient.getNameForFoi(this.foiId) + '</p>'
		},
		{
                    xtype: 'panel',
                    title: 'Observations',
                    //iconCls: 'chart_curve',
                    html: "<div id='" + this.placeholderId + "' class='chart'></div>",
                    //padding: '3 3 3 3',
		    region: 'south',
		    height: 150,
		    minSize: 150,
		    //maxSize: 250,
		    //cmargins: '5 0 0 0',
		    tbar: [{
			xtype:'buttongroup',
			title: 'Settings',
			defaults: {
			    scale: 'medium'
			},
			items: [{
			    text: 'Mode',
			    menu: {        // <-- submenu by nested config object
				items: [
				    {
					checked: true,
					group: 'theme',
					text: 'Manual',
					icon: 'images/chart_line.png',
					listeners: {
					    "click": function(){
						this.enableRealTime(false);
					    },
					    scope: this
					}
				    }, {
					checked: false,
					group: 'theme',
					text: 'Real-time',
					icon: 'images/chart_curve.png',
					listeners: {
					    "click": function() {
						this.enableRealTime(true);
					    },
					    scope: this
					}
				    }
				]
			    }
			},{
			    text: 'Style',
			    menu: {        // <-- submenu by nested config object
				items: [
				    {
					checked: true,
					group: 'theme',
					text: 'Line & points',
					icon: 'images/chart_line.png',
					listeners: {
					    "click": function(){
						this.chartOptions['series']['lines']['show'] = true;
						this.chartOptions['series']['points']['show'] = true;
						this.plotDataStore.reload();
					    },
					    scope: this
					}
				    }, {
					checked: false,
					group: 'theme',
					text: 'Line',
					icon: 'images/chart_curve.png',
					listeners: {
					    "click": function(){
						this.chartOptions['series']['lines']['show'] = true;
						this.chartOptions['series']['points']['show'] = false;
						this.plotDataStore.reload();
					    },
					    scope: this
					}
				    }, {
					checked: false,
					group: 'theme',
					text: 'Points',
					icon: 'images/chart_point.png',
					listeners: {
					    "click": function(){
						this.chartOptions['series']['lines']['show'] = false;
						this.chartOptions['series']['points']['show'] = true;
						this.plotDataStore.reload();
					    },
					    scope: this
					}
				    }
				]
			    }
			}]
		    }, {
			id: this.manualModeId,
			xtype: 'buttongroup',
			title: 'Manual',
			items: [{
                            xtype: 'label',
			    html:'Start date'
			},{
                            xtype: 'datefield',
                            value: this.dateRange[0],
			    format: 'd/m/Y',
			    width: 100,
                            listeners: {
		                "valid": function(field){
                                    this.dateRange[0] =  field.getValue();
                                    if(this.dateRange[0]){
					this.dateRange[0].setHours(0,0,0,0);
                                    }
		                },
				scope: this
	                    }
			},{
                            xtype: 'label',
			    html:'End date'
			},{
                            xtype: 'datefield',
                            value: this.dateRange[1],
			    format: 'd/m/Y',
			    width: 100,
                            listeners: {
		                "valid": function(field){
                                    this.dateRange[1] = field.getValue();
                                    if(this.dateRange[1]){
					this.dateRange[1].setHours(23,59,59,99);
                                    }
		                },
				scope: this
	                    }
			},{
                            text: 'Reload',
                            icon: 'images/arrow_refresh.png',
                            listeners: {
		                "click": this.chartReload,
				scope: this
	                    }
			}]
		    },{
			id: this.realtimeModeId,
			xtype:'buttongroup',
			title: 'Real-time',
			items: [{
                            xtype: 'label',
			    html:'Freq. (sec)'
			},{
			    xtype: 'numberfield',
			    value: this.frequency,
			    maxLength: 5,
			    width: 60,
			    autoCreate: {tag: 'input', type: 'text', size: '7', autocomplete:'off', maxlength: '5'},
                            listeners: {
		                "valid": function(field){
                                    this.frequency = field.getValue();
		                },
				scope: this
	                    }
			},{
                            xtype: 'label',
			    html:'Interval (sec)'
			},{
			    xtype: 'numberfield',
			    value: this.interval,
			    maxLength: 5,
			    width: 60,
			    autoCreate: {tag: 'input', type: 'text', size: '7', autocomplete:'off', maxlength: '5'},
                            listeners: {
		                "valid": function(field){
                                    this.interval = field.getValue();
		                },
				scope: this
	                    }
			}]
		    },{
			xtype:'buttongroup',
			title: 'Download',
			defaults: {
			    scale: 'medium'
			},
			items: [{
                            text: 'Download',
			    // style: {padding: '15px'},
                            // icon: 'images/arrow_refresh.png',
                            listeners: {
		                "click": this.download,
				scope: this
	                    }
			}]
		    }],
                    tbaraaa:[
			'-',' ','-',' ','-',,'-']
		},
                {
                    xtype: 'grid',
		    id: this.offeringsGridId,
		    title: 'Offerings',
                    region: 'center',
            	    //bodyStyle: {"padding": "1px"},
                    //split: true,
                    store: this.offeringsStore,
                    colModel: new Ext.grid.ColumnModel({
                        defaults: {
                            width: 150,
                            sortable: true
                        },
                        columns: [
                            //{id: 'type', header: 'Type', dataIndex: 'type'},
			    {header: 'Observed property', dataIndex: 'observedPropertyLabel'},
                            {header: 'Start', dataIndex: 'startPeriod'},
                            {header: 'End', dataIndex: 'endPeriod'}//,
                            //{header: 'Time', dataIndex: 'time'},
                            //{header: 'Last Value', dataIndex: 'lastvalue'}
                        ]
                    }),
                    sm: new Ext.grid.RowSelectionModel({
                        singleSelect:false,
                        listeners: {
                            'rowselect': this.onSelectOffering,
                            'rowdeselect': this.onDeselectOffering,
                            scope: this
                        }
                    }),
                    autoScroll: true
                }
            ],
            // items: {
            //     xtype: "container",
            //     cls: "error-details",
            //     html: html
            // },
            autoScroll: true,
            buttons: [{
                text: "OK",
                handler: function() { this.close(); },
		scope: this
            }]
        }
    }
});
