// Derived and simplified from example on bryntum.com
// http://stackoverflow.com/questions/15029462/exporting-sdk2-grid-to-csv
GridExporter = Ext.extend(Object, {
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
        var cols    = grid.colModel.columns;
        var store   = grid.store;
        var data    = '';

        var that = this;
        Ext.each(cols, function(col, index) {
            if (col.hidden != true) {
                data += that._getFieldTextAndEscape(col.header) + ',';
            }
        });
        data += "\n";

        store.each(function(record) {
            var entry       = record.data;
            Ext.each(cols, function(col, index) {
                if (col.hidden != true) {
                    var fieldName   = col.dataIndex;
                    var text        = entry[fieldName];
                    data += that._getFieldTextAndEscape(text) + ',';
		    console.log(fieldName);
		    console.log(text);
		    console.log(that._getFieldTextAndEscape(text));
                }
            });
            data += "\n";
        });

        return data;
    },

    _ieGetGridData : function(grid, sheet) {
        var that            = this;
        var resourceItems   = grid.store.data.items;
        var cols            = grid.colModel.columns;

        Ext.each(cols, function(col, colIndex) {
            if (col.hidden != true) {
                console.log('header: ', col.header);
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

// http://stackoverflow.com/questions/16376161/javascript-set-file-in-download
function Mydownload(strData, strFileName, strMimeType) {
    var D = document,
    a = D.createElement("a");
    strMimeType= strMimeType || "application/octet-stream";


    if (navigator.msSaveBlob) { // IE10
        return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
    } /* end if(navigator.msSaveBlob) */


    if ('download' in a) { //html5 A[download]
        a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
        a.setAttribute("download", strFileName);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            a.click();
            D.body.removeChild(a);
        }, 66);
        return true;
    } /* end if('download' in a) */


    //do iframe dataURL download (old ch+FF):
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
} /* end download() */