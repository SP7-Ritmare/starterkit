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
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/thumbnail/map_thumbnail.js"></script>
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/extjs/GeoNode-mixin.js"></script>
<script type="text/javascript" src="{{ STATIC_URL}}geonode/js/extjs/GeoNode-GeoExplorer.js"></script>
<script type="text/javascript">
var app;
Ext.onReady(function() {
{% autoescape off %}
    GeoExt.Lang.set("{{ LANGUAGE_CODE }}");
    var config = Ext.apply({
        authStatus: {% if user.is_authenticated %} 200{% else %} 401{% endif %},
        proxy: '{{ PROXY_URL }}',
        {% if PRINT_NG_ENABLED %}
        listeners: {
            'save': function(obj_id) {
                createMapThumbnail(obj_id);
            }
        },
        {% endif %}
        {% if MF_PRINT_ENABLED %}
        printService: "{{GEOSERVER_BASE_URL}}pdf/",
        {% else %}
        printService: "",
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
    }, {{ config }});

    //console.log(config);

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


    // app = new GeoNode.Composer(config);
    app = new Geosk.Composer(config);

{% endautoescape %}
});
</script>
