{% include 'geonode/ext_header.html' %}
{% include 'geonode/geo_header.html' %}
<style type="text/css">
#aboutbutton {
    display: none;
}
#paneltbar {
    margin-top: 81px;
}
button.logout {
    display: none;
}
button.login {
    display:none;
}
.map-title-header {
    margin-right: 10px;
}
</style>
<link href="{{ STATIC_URL}}geonode/css/geoexplorer/map_geoexplorer.css" rel="stylesheet"/>
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/extjs/GeoNode-mixin.js"></script>
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/extjs/Geonode-CatalogueApiSearch.js"></script>
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/extjs/GeoNode-GeoExplorer.js"></script>
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/utils/thumbnail.js"></script>
<script type="text/javascript">
var app;
Ext.onReady(function() {
{% autoescape off %}
    GeoExt.Lang.set("{{ LANGUAGE_CODE }}");
    var config = Ext.apply({
        authStatus: {% if user.is_authenticated %} 200{% else %} 401{% endif %},
        {% if PROXY_URL %}
        proxy: '{{ PROXY_URL }}',
        {% endif %}

        {% if 'access_token' in request.session %}
        access_token: "{{request.session.access_token}}",
        {% else %}
        access_token: null,
        {% endif %}

        {% if MAPFISH_PRINT_ENABLED %}
        printService: "{{GEOSERVER_BASE_URL}}pdf/",
        {% else %}
        printService: null,
        printCapabilities: null,
        {% endif %}

        /* The URL to a REST map configuration service.  This service
         * provides listing and, with an authenticated user, saving of
         * maps on the server for sharing and editing.
         */
        rest: "{% url "maps_browse" %}",
        ajaxLoginUrl: "{% url "account_ajax_login" %}",
        homeUrl: "{% url "home" %}",
        localGeoServerBaseUrl: "{{ GEOSERVER_BASE_URL }}",
        localCSWBaseUrl: "{{ CATALOGUE_BASE_URL }}",
        csrfToken: "{{ csrf_token }}",
        tools: [{ptype: "gxp_getfeedfeatureinfo"}],
        listeners: {
            "ready": function() {
                app.mapPanel.map.getMaxExtent = function() {
                    return new OpenLayers.Bounds(-80150033.36/2,-80150033.36/2,80150033.36/2,80150033.36/2);
                }
                app.mapPanel.map.getMaxResolution = function() {
                    return 626172.135625/2;
                }
                l = app.selectedLayer.getLayer();
                l.addOptions({wrapDateLine:true, displayOutsideMaxExtent: true});
                l.addOptions({maxExtent:app.mapPanel.map.getMaxExtent(), restrictedExtent:app.mapPanel.map.getMaxExtent()});

                {% if 'access_token' in request.session %}
                    try {
                        l.url += ( !l.url.match(/\b\?/gi) || l.url.match(/\b\?/gi).length == 0 ? '?' : '&');

                        if((!l.url.match(/\baccess_token/gi))) {
                            l.url += "access_token={{request.session.access_token}}";
                        } else {
                            l.url =
                                l.url.replace(/(access_token)(.+?)(?=\&)/, "$1={{request.session.access_token}}");
                        }
                    } catch(err) {
                        console.log(err);
                    }
                {% endif %}

                for (var ll in app.mapPanel.map.layers) {
                    l = app.mapPanel.map.layers[ll];
                    if (l.url && l.url.indexOf('{{GEOSERVER_BASE_URL}}') !== -1) {
                        l.addOptions({wrapDateLine:true, displayOutsideMaxExtent: true});
                        l.addOptions({maxExtent:app.mapPanel.map.getMaxExtent(), restrictedExtent:app.mapPanel.map.getMaxExtent()});
                        {% if 'access_token' in request.session %}
                            try {
                                    l.url += ( !l.url.match(/\b\?/gi) || l.url.match(/\b\?/gi).length == 0 ? '?' : '&');

                                    if((!l.url.match(/\baccess_token/gi))) {
                                        l.url += "access_token={{request.session.access_token}}";
                                    } else {
                                        l.url =
                                            l.url.replace(/(access_token)(.+?)(?=\&)/, "$1={{request.session.access_token}}");
                                    }
                            } catch(err) {
                                console.log(err);
                            }
                        {% endif %}
                    }
                }

                var map = app.mapPanel.map;
                var layer = app.map.layers.slice(-1)[0];
                var bbox = layer.bbox;
                var crs = layer.crs
                if (bbox != undefined)
                {
                   if (!Array.isArray(bbox) && Object.keys(layer.srs) in bbox) {
                    bbox = bbox[Object.keys(layer.srs)].bbox;
                   }

                   var extent = new OpenLayers.Bounds();

                   if(map.projection != 'EPSG:900913' && crs && crs.properties) {
                       extent.left = bbox[0];
                       extent.right = bbox[1];
                       extent.bottom = bbox[2];
                       extent.top = bbox[3];

                       if (crs.properties != map.projection) {
                           extent = extent.clone().transform(crs.properties, map.projection);
                       }
                   } else {
                       extent = OpenLayers.Bounds.fromArray(bbox);
                   }

                   var zoomToData = function()
                   {
                       map.zoomToExtent(extent, false);
                       app.mapPanel.center = map.center;
                       app.mapPanel.zoom = map.zoom;
                       map.events.unregister('changebaselayer', null, zoomToData);
                   };
                   map.events.register('changebaselayer',null,zoomToData);
                   if(map.baseLayer){
                       map.zoomToExtent(extent, false);
                   }
                }
            },
           'save': function(obj_id) {
               createMapThumbnail(obj_id);
           }
       }
    }, {{ config }});

    Ext.ns("Geosk");
    Geosk.Composer = Ext.extend(GeoNode.Composer, {
	loadConfig: function(config) {
        {% if request.path == '/maps/117/view' or  request.path == '/maps/117/embed' %}
	    config.listeners.ready = function(obj_id) {
		setTimeout(function(){
		    var sosUrls = ['http://david.ve.ismar.cnr.it/52nSOSv3_WAR/sos?',
				   'http://nodc.ogs.trieste.it/SOS/sos'
				   //'http://sos.ise.cnr.it/sos?',
				   //'http://sos.ise.cnr.it/biology/sos?',
				   //'http://sos.ise.cnr.it/chemistry/sos?'
				  ]

		    for(var index = 0; index < sosUrls.length; ++index){
			var sosUrl = sosUrls[index];
			var sourceConfig = {"config":{
                            "ptype": 'gxp_sossource',
                            "url": sosUrl,
                            "listeners": {
                                'loaded': function(config){
			            app.mapPanel.layers.add([config.record]);
                                }
                            }
                        }};
			var source = app.addLayerSource(sourceConfig);

			var layerConfig = {
  			    "url": sosUrl,
			    "group": "sos"
			};

			layerConfig.source = source.id;
			sosRecord = source.createLayerRecord(layerConfig);
                        // nei sos vecchi ho dovuto aggiungere anche questa riga di codice
                        //app.mapPanel.layers.add([sosRecord]);

		    }
		});
	    }

	    // il primo tool e' gxp_layermanager (rendere piu' robusto
	    config.tools[0].groups= {
		"sos": "SOS",
		"default": "Overlays", // title can be overridden with overlayNodeText
		"background": {
		    title: "Base Maps", // can be overridden with baseNodeText
		    exclusive: true
		}
	    };
	    {% endif %}

        config.tools.push({ptype: "gxp_addsos",
               id: "addsos",
               outputConfig: {defaults: {autoScroll: true}, width: 320},
               actionTarget: ["layers.tbar", "layers.contextMenu"],
               outputTarget: "tree"
              },
              {
              ptype: "gxp_getsosfeatureinfo"
              });
        Geosk.Composer.superclass.loadConfig.apply(this, arguments);
	}
    });



    app = new Geosk.Composer(config);
{% endautoescape %}
});
</script>
