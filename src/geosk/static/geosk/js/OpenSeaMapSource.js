/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/TMS.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = OpenSeaMapSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: OpenSeaMapSource(config)
 *
 *    Plugin for using OpenSeaMap layers with :class:`gxp.Viewer` instances.
 *
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    openseamap: {
 *        ptype: "gxp_openseamapsource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "openseamap"
 *    }
 *
 */
gxp.plugins.OpenSeaMapSource = Ext.extend(gxp.plugins.LayerSource, {
    
    /** api: ptype = gxp_openseamapsource */
    ptype: "gxp_openseamapsource",

    /** api: property[store]
     *  ``GeoExt.data.LayerStore``. Will contain records with name field values
     *  matching OpenSeaMap layer names.
     */
    
    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "OpenSeaMap Layers",
    
    /** i18n **/
    openSeaMapTitle: "OpenSeaMap - The free nautical chart",

    getTileURL: function(bounds) {
       var res = this.map.getResolution();
       var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
       var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
       var z = this.map.getZoom();
       var limit = Math.pow(2, z);
       if (y < 0 || y >= limit) {
          return null;
       } else {
          x = ((x % limit) + limit) % limit;
          url = this.url;
          path= z + "/" + x + "/" + y + "." + this.type;
          if (url instanceof Array) {
             url = this.selectUrl(path, url);
          }
          return url+path;
       }
    },

    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */
    createStore: function() {
        
        var layers = [
           new OpenLayers.Layer.TMS(
              "OpenSeaMap", 
              "http://tiles.openseamap.org/seamark/", 
              { 
                 type: 'png', 
                 getURL: this.getTileURL, 
                 displayOutsideMaxExtent: true,
                 projection: "EPSG:900913",
                 maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
                 maxResolution: 156543.03390625,
                 numZoomLevels: 18,
                 isBaseLayer: false,
                 units: "m"// ,
                 // buffer: 1,
                 // transitionEffect: "resize"
              }
           )
        ];

        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string"},
                {name: "abstract", type: "string"},
                {name: "group", type: "string"},
                {name: "fixed", type: "boolean"},
                {name: "selected", type: "boolean"}
            ]
        });
        //this.store.each(function(l) {
        //    l.set("group", "background");
        //});
        this.fireEvent("ready", this);

    },
    
    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record;
        var index = this.store.findExact("name", config.name);
        if (index > -1) {

            record = this.store.getAt(index).copy(Ext.data.Record.id({}));
            var layer = record.getLayer().clone();
 
            // set layer title from config
            if (config.title) {
                /**
                 * Because the layer title data is duplicated, we have
                 * to set it in both places.  After records have been
                 * added to the store, the store handles this
                 * synchronization.
                 */
                layer.setName(config.title);
                record.set("title", config.title);
            }

            // set visibility from config
            if ("visibility" in config) {
                layer.visibility = config.visibility;
            }
            
            record.set("selected", config.selected || false);
            record.set("source", config.source);
            record.set("name", config.name);
            if ("group" in config) {
                record.set("group", config.group);
            }

            record.data.layer = layer;
            record.commit();
        }
        return record;
    }

});

Ext.preg(gxp.plugins.OpenSeaMapSource.prototype.ptype, gxp.plugins.OpenSeaMapSource);
