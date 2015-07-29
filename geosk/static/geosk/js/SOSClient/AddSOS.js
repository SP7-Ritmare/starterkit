Ext.namespace("gxp.plugins");

gxp.plugins.AddSOS = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = gxp_layerproperties */
    ptype: "gxp_addsos",

    /** api: config[menuText]
     *  ``String``
     *  Text for layer properties menu item (i18n).
     */
    menuText: "Add SOS",

    addText: "Add new Server",

    /** api: config[toolTip]
     *  ``String``
     *  Text for layer properties action tooltip (i18n).
     */
    toolTip: "Add SOS",

    constructor: function(config) {
        gxp.plugins.AddSOS.superclass.constructor.apply(this, arguments);
        if (!this.outputConfig) {
            this.outputConfig = {
                width: 325,
                autoHeight: true
            };
        }
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var actions = gxp.plugins.AddSOS.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            iconCls: "gxp-icon-addsos",
            disabled: false,
            tooltip: this.toolTip,
            handler: function() {
                this.removeOutput();
                this.addOutput();
            },
            scope: this
        }]);
        return actions;
    },
    addOutput: function(config) {
        config = config || {};
        //TODO create generic gxp_layerpanel
        var xtype = "gxp_sossourcedialog";
        var output = gxp.plugins.AddSOS.superclass.addOutput.call(this, Ext.apply({
	    title: this.addText,
            xtype: "gxp_sossourcedialog",
            target: this.target,
            listeners: {
                'addfoi':function (config) {
                    var sourceConfig = {"config":{
                        "ptype": 'gxp_sossource',
                        "listeners": {
                            'beforeload': function(){
                                this.loadingMask = new Ext.LoadMask(Ext.getBody());
                                this.loadingMask.show();
                            },
                            'loaded': function(config){
                                this.target.mapPanel.layers.add([config.record]);
                                this.sosDialog.hide();
                                this.loadingMask.hide();
                            },
                            'failure': function(){
                                this.loadingMask.hide();
                            },
                            'scope': this
                        }
                    }};
                    if (config.url) {
                        sourceConfig.config["url"] = config.url;
                    }
                    var source = this.target.addLayerSource(sourceConfig);
                    config.source = source.id;
                    source.createLayerRecord(config);
                },
                scope: this
	    }
	}, config));
        output.on({
            added: function(cmp) {
                if (!this.outputTarget) {
                    cmp.on("afterrender", function() {
                        cmp.ownerCt.ownerCt.center();
                    }, this, {single: true});
                }
            },
            scope: this
        });
	this.sosDialog = output;
        return output;
    }

});

Ext.preg(gxp.plugins.AddSOS.prototype.ptype, gxp.plugins.AddSOS);
