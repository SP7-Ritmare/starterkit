
/**
 *  ritmaresk.utils.insertResultHelper
 *
 *  @author Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *      paolo.tagliolato@gmail.com
 *
 *  @version 1.3 beta
 *
 *
 *
 */

if (typeof jQuery === 'undefined') { throw new Error('ritmaresk.utils.insertResultHelper\'s JavaScript requires jQuery') }
if (typeof ritmaresk.DateUtil === 'undefined') {
    throw new Error('ritmaresk.utils.insertResultHelper\'s JavaScript requires ritmaresk.DateUtil')
}
if (typeof ritmaresk.XsltTransformer === 'undefined') {
    throw new Error('ritmaresk.utils.insertResultHelper\'s JavaScript requires ritmaresk.XsltTransformer')
}

var ritmaresk=ritmaresk || {};
ritmaresk.utils=ritmaresk.utils || {};

/**
 * @namespace
 * @requires Handsontable
 * @requires jQuery
 * @requires ritmaresk.dateUtil
 * @requires ritmaresk.XsltTransformer
 * @todo check the docs (typedef pattern for Object input and return values, cf. http://www.justjson.com/2013/07/jsdoc-documenting-configparamcustom.html
 * @todo some functions should be part of ritmaresk.utils.namingConvention or (maybe better) ritmaresk.utils.swe
 * @todo consider renaming this module: after refactoring "handsontableHelper" could be more appropriate
 */
ritmaresk.utils.insertResultHelper=(function(){

    var ISO_datetime_validator_regexp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)?/;

    /**
     * @typedef {Object} ritmaresk.utils.insertResultHelper.ResultStructure
     * @property {ritmaresk.utils.insertResultHelper.DataRecordStructure[]} resultStructure
     * @property {Object} resultEncoding
     * @property {String[]|undefined} offerings
     */
    /**
     * DataRecordStructure
     * @typedef {Object} ritmaresk.utils.insertResultHelper.DataRecordStructure
     * @property {String} fieldName
     * @property {String} fieldType
     * @property {String} fieldDefinition should be a URI
     * @property {String} uom_code_value should be a valid UoM (Unit of Measurement) code
     * @property {String} uom_code_href should be the URI corresponding to the UoM code
     */
    /**
     * @typedef {Object} ritmaresk.utils.insertResultHelper.DataSchema
     * @property {Object} dataSchema an Object to be used as Handsontable "dataSchema" setting
     * @property {Object[]} columns an array of Objects to be used as Handsontable "columns" setting
     * @property {Object} columnsExtraInfo an object having the same properties as the dataSchema and storing additional info not valid as Handsontable dataSchema.
     */
    /**
     * @description input: an array of objects whose structure is defined both in resultTemplate2Structure.xsl and in sensor2JsStructure.xsl
     * which transforms a response to GetResultTemplate (resp. DescribeSensor) into an object being resultStructure an array of objects of this kind:
     * {
     *        "fieldName":"<xsl:value-of select="./@name"/>",
     *        "fieldType":"<xsl:value-of select="name(./*[1])"/>",
     *        "fieldDefinition":"<xsl:value-of select="./*[1]/@definition"/>",
     *        "uom_code_value":"<xsl:value-of select=".//swe:uom/@code"/>",
     *        "uom_code_href":"<xsl:value-of select=".//swe:uom/@xlink:href"/>"
     * }
     *
     * @param {ritmaresk.utils.insertResultHelper.DataRecordStructure[]} o
     * @returns {ritmaresk.utils.insertResultHelper.DataSchema}
     */
    function dataSchemaFromDataRecordStructure(o){
        //console.log("begin dataSchemaFromDataRecordStructure");

        var dataSchema={};
        var columns=[];
        var colinfo={};
        for(var i= 0,l= o.length; i<l; i++){
            var f=o[i];

            dataSchema[f.fieldName]=null;

            // scelta validatori in base al campo
            if(f.fieldType==='swe:Quantity'){
                colinfo[f.fieldName]={type:'numeric'};
                columns[i]={data: f.fieldName, type: 'numeric', format:'0.000',language: 'en',readOnly:false};
            }
            else if (f.fieldType==='swe:Time') {
                columns[i]={data: f.fieldName, validator: ISO_datetime_validator_regexp, allowInvalid: true,readOnly:false};
                colinfo[f.fieldName]={type:'timestamp'};
            }
            else{
                columns[i]={data: f.fieldName,readOnly:false};
                colinfo[f.fieldName]={type:'string'};
            }
            colinfo[f.fieldName].fieldStructure=f;
        }
        return({dataSchema:dataSchema,columns:columns,columnsExtraInfo:colinfo});
    }


    /**
     * @param xml
     * @returns {{resultStructure: Array, resultEncoding: {textEncoding: {tokenSeparator: String, blockSeparator: String} } }}
     *
     */
    function resultTemplate2DataRecordStructure(xml){
        return xml2json(xml,"xslt/resultTemplate2Structure.xsl");
    }

    /**
     * @param xml
     * @returns {{resultStructure: Array, resultEncoding: {textEncoding: {tokenSeparator: String, blockSeparator: String} } }}
     */
    function sensorDescription2DataRecordStructure(xml){
        return xml2json(xml,"xslt/sensor2JsStructure.xsl");
    }

    /**
     * @description utility method
     * @returns {Object}
     * @param {string} xml
     * @param filenameXsl
     */
    function xml2json(xml,filenameXsl){
        var xslt,     // XsltTransformer object
            xsl,      // xslt stylesheet: transform sensorDescription into insertResultTemplate document
        // Document object: sensorDescription already loaded in sos object or describeSensor to get from sos kvp endpoint
            xmlOut, // Document object: insertResultTemplate, output of xslt transformation and output of the function
            stringJSON; // string: insertResultTemplate parsed to string;

        xslt=ritmaresk.XsltTransformer.getInstance();
        xsl=xslt.loadXMLDoc(filenameXsl);

        xmlOut=xslt.transform(xsl, xml, undefined, undefined);

        stringJSON=(new XMLSerializer()).serializeToString(xmlOut);

        console.warn("xml output:");
        console.log(stringJSON);

        return JSON.parse(stringJSON);
    }


    /**
     * @description composes a legend for the input table, adding a <div> to the html element specified with the selector (jquery syntax) tableLegendHtmlElementSelector.
     * The legend is composed using information contained in the parameter 'o'
     * @param tableLegendHtmlElementSelector
     * @param {ritmaresk.utils.insertResultHelper.DataRecordStructure[]} o
     */
    function loadTableLegend(tableLegendHtmlElementSelector, o){
        var legend=[];
        for(var i=0; i<o.length; i++){
            var f=o[i];
            var typ;
            var nome,tipo,uom;
            switch(f.fieldType){
                case 'swe:Quantity':
                    //typ="Quantità";
                    typ="Quantity";
                    //uomh=f.uom_code_href;
                    break;
                case 'swe:Time':
                    //typ="Data e ora";
                    typ="Date and Time";
                    break;
                default:
                    typ=f.fieldType;
            }


            nome='<a href="'+f.fieldDefinition + '" target="_blank">' + f.fieldName + '</a>';
            tipo=f.uom_code_href!=="" ? '(<a href="' + f.uom_code_href + '" target="_blank">' + gettext(typ) + '</a>)' : '('+gettext(typ)+')';
            //uom=f.uom_code_value!=="" ? 'unità di misura: ' + f.uom_code_value : '';
            uom=f.uom_code_value!=="" ? gettext('Unit of measure')+': ' + f.uom_code_value : '';


            legend.push([nome,tipo,uom].join(" "));
        }

        //console.warn(legend.join("<br/>"));
        //$(tableLegendHtmlElementSelector).html("<div class=\"panel-heading\"><h3 class=\"panel-title\">Legenda - Definizione dei campi</h3></div><div class=\"panel-body\">"+legend.join("<br/>")+"</div>");
        $(tableLegendHtmlElementSelector).html("<div class=\"panel-heading\"><h3 class=\"panel-title\">"+gettext("Legend - Fields definition")+"</h3></div><div class=\"panel-body\">"+legend.join("<br/>")+"</div>");
    }

    // TODO: valutare la possibilita' di usare un callback (es after change o after validate per abilitare il pulsante che invia i dati - in modo che non si possa mandare due volte al SOS lo stesso set di dati)
    /**
     * @description Loads the input table within the element selected by tableHtmlElementSelector (jquery syntax)
     * @param {string} tableHtmlElementSelector jquery selector
     * @param dataSchema
     * @param columns
     * @param columnsExtraInfo
     * @param afterChangeFx
     * @require jquery.handsontable
     */
    function loadTable(tableHtmlElementSelector, dataSchema, columns, columnsExtraInfo, afterChangeFx){
        console.warn(JSON.stringify(dataSchema));
        console.warn(JSON.stringify(columns));
        columnsExtraInfo.columns=columns;//PROVA TODO:check me (voglio provare updatesettings e provare a disabilitare le colonne quando i post sono andati a buon fine)

        $(tableHtmlElementSelector).handsontable({
            //data: people,
            data: [],
            dataSchema: dataSchema,
            minSpareRows: 1,
            //contextMenu: true,
            //manualColumnMove: true,//check this...still some issues in validation.
            beforeChange: function (changes, source) {
                //console.log("table before change: ");
                //console.log(JSON.stringify(changes));
                var du=new ritmaresk.DateUtil();

                // changes[i][0] -< row num
                // changes[i][1] -< column name
                // changes[i][2] -< old value
                // changes[i][3] -< new value
                var errs="";
                for (var i = 0; i < changes.length; i++) {
                    var colname=changes[i][1],
                        newVal=changes[i][3];
                    var coltype=columnsExtraInfo[colname].type;

                    switch(coltype){
                        case 'numeric':
                            // trasformazione numeri proposti con la virgola in numeri con il "."
                            var snewVal=new String(newVal);
                            if(snewVal.indexOf('.')==-1){
                                changes[i][3]=parseFloat(snewVal.replace(/,/g,'.'));
                            }
                            break;
                        case 'timestamp':
                            // trasformazione timestamp in formato ISO
                            var snewVal=new String(newVal);
                            if(!du.isIso(snewVal)){
                                var converted;
                                try{
                                    converted=du.convertStringToISO_noTZ(snewVal,"DD/MM/YY[YY] HH*mm[*ss]");
                                    changes[i][3]=converted;
                                }
                                catch(err){
                                    errs+="; "+err;
                                }
                            }
                            break;
                        //default: nothing
                    }

                }
                if(errs!==""){
                    console.error(errs);
                }

                return(true);
            },
            afterChange: function (changes, source) {
                if (source !== 'loadData') {
                    console.log("table after change: "+JSON.stringify(changes));

                    var d = this;
                    console.log("triggering validate cells");
                    d.validateChanges(changes, source, function (){d.render()});//REMARK: requires cnr modified version of handsontable
                    if(afterChangeFx && (typeof afterChangeFx==='function')){
                        afterChangeFx();
                    }
                }
            },

            colHeaders: Object.keys(dataSchema),
            columns: columns,
            contextMenu: ['row_above', 'row_below', 'remove_row', 'undo', 'redo'],
            colWidths: 155
        });

        $(tableHtmlElementSelector).data('handsontable').ritmareskColumnsExtraInfo=columnsExtraInfo;

    }

    /**
     * Updates the handsontable columns settings, using the current value of the
     * ritmareskColumnsExtraInfo.columns
     * stored in the handsontable instance
     * @example it is useful for disabling specific columns at runtime
     * (for example when insert obsevations succeeds for a column, we need to disable its editing)
     * To do this we need to call {handsontable instance}.ritmareskColumnsExtraInfo.columns[1].readOnly=true;
     * followed by a call to this function
     * @param tableHtmlElementSelector
     */
    function refreshTableColumnsSettings(tableHtmlElementSelector){
        //e.g. after an external call to ta.ritmareskColumnsExtraInfo.columns[1].readOnly=true
        var tbl = $(tableHtmlElementSelector).data('handsontable');
        if(tbl.ritmareskColumnsExtraInfo&&tbl.ritmareskColumnsExtraInfo.columns) {
            tbl.updateSettings({columns: tbl.ritmareskColumnsExtraInfo.columns});
        }
    }

    /**
     *
     * @param tableHtmlElementSelector
     * @param columnIndexArray
     */
    function disableTableColumns(tableHtmlElementSelector,columnIndexArray){
        var tbl=$(tableHtmlElementSelector).data('handsontable');
        columnIndexArray.map(function(c){
            tbl.ritmareskColumnsExtraInfo.columns[c].readOnly=true;
        });
        refreshTableColumnsSettings(tableHtmlElementSelector);
    }

    /**
     *
     * @param tableHtmlElementSelector
     */
    function resetTableData(tableHtmlElementSelector){
        $(tableHtmlElementSelector).handsontable('getInstance').loadData([]);
    }

    /**
     * @description select the min and max value contained in each column with datetime datatype
     * @param {string} tableHtmlElementSelector jQuery selector
     * @param {string} colname
     * @returns {object} {headerOfDateTimeColumn1:{colnum:column1Number,minmaxdate:[min, max]}, ... , headerOfDateTimeColumnK:{colnum:columnKNumber,minmaxdate:[min, max]}}
     */
    function getDateColumnsInfo(tableHtmlElementSelector,colname){
        // pass in the phenomenonTime array (or ResultTime array): the function returns the min and max date represented as a string in ISO format
        var getMinMaxDate=function(datesArray){
            var a=datesArray;
            a.sort();
            return([a[0],a[a.indexOf(null)-1]]);
        };

        var res={};
        var tt=$(tableHtmlElementSelector).data('handsontable');
        //identify date columns by ritmareskColumnsExtraInfo
        var hdrs=tt.getColHeader();

        for(var i=0; i<hdrs.length; i++){
            var cname=hdrs[i];
            if(tt.ritmareskColumnsExtraInfo && tt.ritmareskColumnsExtraInfo[cname] && tt.ritmareskColumnsExtraInfo[cname].type && tt.ritmareskColumnsExtraInfo[cname].type=="timestamp"){
                res[cname]={
                    colnum:i,
                    minmaxdate: getMinMaxDate(tt.getDataAtCol(i))
                };
            }
        }

        return res;
    }



    return {
        dataSchemaFromResultTemplateStructure:dataSchemaFromDataRecordStructure,//backwardCompatibility
        dataSchemaFromResultStructure:dataSchemaFromDataRecordStructure,
        dataSchemaFromDataRecordStructure:dataSchemaFromDataRecordStructure,
        loadTableLegend:loadTableLegend,
        loadTable:loadTable,
        resultTemplate2DataRecordStructure:resultTemplate2DataRecordStructure,
        sensorDescription2DataRecordStructure:sensorDescription2DataRecordStructure,
        getDateColumnsInfo:getDateColumnsInfo,
        //refreshTableColumnsSettings:refreshTableColumnsSettings,
        disableTableColumns:disableTableColumns,
        resetTableData:resetTableData
    };

})();