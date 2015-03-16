/**
 * Copyright (c) 2008-2011 The Open Planning Project
 *
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/SOSSource.js
 * @requires widgets/PointSymbolizer.js
 */

/** api: (define)
 *  module = gxp
 *  class = SOSSourceDialog
 *  base_link = `Ext.Container <http://extjs.com/deploy/dev/docs/?class=Ext.Container>`_
 */

Ext.namespace("gxp");

/** api: constructor
 *  .. class:: SOSSourceDialog(config)
 *
 *      A  dialog for creating a SOS FOI layer
 */
gxp.SOSSourceDialog = Ext.extend(Ext.Container, {
    /** api: config[SOSTypeText] ``String`` i18n */
    sosTypeText: "Source",
    /** api: config[addSOSText] ``String`` i18n */
    addLocalSOSText: "Local OSK SOS",
    /** api: config[addSOSText] ``String`` i18n */
    addSOSText: "Remote SOS",
    /** api: config[addFeedText] ``String`` i18n */
    addFOISText: "Add to Map",
    /** api: config[doneText] ``String`` i18n */
    doneText: "Done",
    /** api: config[emptyText] ``String`` i18n */
    emptyText: "Select a SOS source...",

    /**
     * api: config[width]
     * ``Number`` width of dialog
     */
    width: 300,

    /**
     * api: config[autoHeight]
     * ``Boolean`` default is true
     */
    autoHeight: true,

    /**
     * api: config[closeAction]
     * ``String`` default is destroy
     */
    closeAction: 'destroy',

    /** private: method[initComponent]
     */
    initComponent: function() {

        this.addEvents("addfoi");

        if (!this.sosServices) {
            this.sosServices  = [
		[this.addLocalSOSText, '/observations/sos/kvp'],
		['SOS ISMAR', 'http://david.ve.ismar.cnr.it/52nSOSv3_WAR/sos?'],
		['SOS LTER', 'http://sp7.irea.cnr.it/tomcat/SOS32/sos'],
		['SOS ISE', 'http://sos.ise.cnr.it/sos?'],
		['SOS ISE BIO', 'http://sos.ise.cnr.it/biology/sos?'],
		['SOS ISE CHEM', 'http://sos.ise.cnr.it/chemistry/sos?'],
                [this.addSOSText, '']
            ];
        }

        var sosStore = new Ext.data.ArrayStore({
            fields: ['name', 'url'],
            data : this.sosServices
        });

        var sourceTypeSelect = new Ext.form.ComboBox({
            store: sosStore,
            fieldLabel: this.sosTypeText,
            displayField:'name',
            valueField:'url',
            typeAhead: true,
            width: 180,
            mode: 'local',
            triggerAction: 'all',
            emptyText: this.emptyText,
            selectOnFocus:true,
            listeners: {
                "select": function(choice) {
                    if (choice.value == '') {
                        urlTextField.show();
                        // symbolizerField.show();
			symbolizerField.hide();
                    } else {
                        urlTextField.hide();
                        urlTextField.setValue(choice.value)
                        symbolizerField.hide();
                    }
                    submitButton.setDisabled(choice.value == null);
                },
                scope: this
            }
        });

        var urlTextField = new Ext.form.TextField({
            fieldLabel: "URL",
            allowBlank: false,
            hidden: true,
            width: 180,
            msgTarget: "right",
            validator: this.urlValidator.createDelegate(this)
        });


        var symbolizerField = new gxp.PointSymbolizer({
            bodyStyle: {padding: "10px"},
            width: 280,
            border: false,
            hidden: true,
            labelWidth: 70,
            defaults: {
                labelWidth: 70
            },
            symbolizer: {pointGraphics: "circle", pointRadius: "5"}
        });


        symbolizerField.find("name", "rotation")[0].hidden = true;

        if (this.symbolType === "Point" && this.pointGraphics) {
            cfg.pointGraphics = this.pointGraphics;
        }

        var submitButton =  new Ext.Button({
            text: this.addFOISText,
            iconCls: "gxp-icon-addsos",
            disabled: true,
            handler: function() {
                var config = {};

                config.url = urlTextField.getValue();
                var symbolizer = symbolizerField.symbolizer;
                config.defaultStyle = {};
                config.selectStyle = {};
                Ext.apply(config.defaultStyle, symbolizer);
                Ext.apply(config.selectStyle, symbolizer);
                Ext.apply(config.selectStyle, {
                    fillColor: "Yellow",
                    pointRadius: parseInt(symbolizer["pointRadius"]) + 2
                });

                this.fireEvent("addfoi", config);

            },
            scope: this
        });


        var bbarItems = [
            "->",
            submitButton,
            new Ext.Button({
                text: this.doneText,
                handler: function() {
                    this.hide();
                },
                scope: this
            })
        ];

        this.panel = new Ext.Panel({
            bbar: bbarItems,
            autoScroll: true,
            items: [
                sourceTypeSelect,
                urlTextField,
                symbolizerField
            ],
            layout: "form",
            border: false,
            labelWidth: 100,
            bodyStyle: "padding: 5px",
            autoWidth: true,
            autoHeight: true
        });

        this.items = this.panel;

        gxp.FeedSourceDialog.superclass.initComponent.call(this);

    },



    /** private: property[urlRegExp]
     *  `RegExp`
     *
     *  We want to allow protocol or scheme relative URL
     *  (e.g. //example.com/).  We also want to allow username and
     *  password in the URL (e.g. http://user:pass@example.com/).
     *  We also want to support virtual host names without a top
     *  level domain (e.g. http://localhost:9080/).  It also makes sense
     *  to limit scheme to http and https.
     *  The Ext "url" vtype does not support any of this.
     *  This doesn't have to be completely strict.  It is meant to help
     *  the user avoid typos.
     */
    urlRegExp: /^(http(s)?:)?\/\/([\w%]+:[\w%]+@)?([^@\/:]+)(:\d+)?\//i,

    /** private: method[urlValidator]
     *  :arg url: `String`
     *  :returns: `Boolean` The url looks valid.
     *
     *  This method checks to see that a user entered URL looks valid.  It also
     *  does form validation based on the `error` property set when a response
     *  is parsed.
     */
    urlValidator: function(url) {
        var valid;
        if (!this.urlRegExp.test(url)) {
            valid = this.invalidURLText;
        } else {
            valid = !this.error || this.error;
        }
        // clear previous error message
        this.error = null;
        return valid;
    }


});

/** api: xtype = gxp_feedsourcedialog */
Ext.reg('gxp_sossourcedialog', gxp.SOSSourceDialog);
