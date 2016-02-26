var EdiProxy = function(config){
    var proxy = this;

    this.id_open_btn = config.id_open_btn;
    this.id_container = config.id_container;
    this.ediml_client_url = config.ediml_client_url;
    this.ediml_proxy_url = config.ediml_proxy_url;
    this.ediml_current_language = config.ediml_current_language;
    this.parameters = config.parameters;
    this.redirect_url = config.redirect_url;

    this.iframe = $('#' + this.id_container).find('iframe');

    $('#' + proxy.id_container).on('show', function () {
        proxy.iframe.attr("src", proxy.ediml_client_url + $.param(proxy.parameters));
    });

    $('#'+ proxy.id_open_btn).click(function(){
        $('#' + proxy.id_container).modal({show:true});
    });

    $('#save_metadata_btn').click(function(){
        var e = proxy.iframe[0].contentWindow;
        e.ediml.post();
    });

    this.iframe.on('load', $.proxy(this.initEdiclient, this));
};

EdiProxy.prototype.saveSuccess = function (robj) {
    var proxy = this;
    proxy.loading('Registration ...');
    var e = proxy.iframe[0].contentWindow;
    var x2js = new e.X2JS();
    var ediml = x2js.json2xml_str(e.ediml.content);
    $.ajax({
        url: proxy.ediml_proxy_url,
        dataType: "text",
        data: {
            ediml: ediml,
            generatedXml: robj.generatedXml,
            edimlid: robj.edimlId
        },
        type: 'POST',
        success: function(data){
            e.ediml.isDirty = false;
            // location.reload();
            location = proxy.redirect_url;
        },
        error: function(jqXHR, textStatus, errorThrown ){
            e.ediml.isDirty = true;
            proxy.error('');
        }
    });
};

EdiProxy.prototype.initEdiclient = function(){
    var proxy = this;
    this.modal = $("#ediclient_container");
    this.loadingAlert = this.modal.find('.alert-info');
    this.errorAlert = this.modal.find('.alert-error');
    this.loadingMessage = this.modal.find('.loading-message');
    this.errorMessage = this.modal.find('.error-message');
    this.progressBar = this.modal.find('.progress');
    var e = this.iframe[0].contentWindow;
    //e.ediml.setPostCallbackError();
    e.ediml.setPostCallbackSuccess($.proxy(this.saveSuccess, this));
    e.$('.bottoniera').hide();
    e.$('.container h1').hide();
    e.edi.setLanguage(this.ediml_current_language);
    e.$( e.document ).ajaxSend(function( event, xhr, settings ) {
        if ( settings.url === "http://sp7.irea.cnr.it/jboss/edi/rest/metadata" ) {
            proxy.loading('Processing ...');
        }
    });
    //
};

EdiProxy.prototype.hideAlerts = function(){
    this.loadingAlert.hide();
    this.errorAlert.hide();
};

EdiProxy.prototype.loading = function(message){
    this.hideAlerts();
    this.loadingMessage.text(message);
    this.loadingAlert.show();
};

EdiProxy.prototype.error = function(message){
    this.hideAlerts();
    this.errorMessage.text(message);
    this.errorAlert.show();
};
