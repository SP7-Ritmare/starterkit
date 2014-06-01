
function successCallback(msg){
    closeModal();
    if(msg.redirect){
	window.location.href = msg.redirect;
    }
}

function errorCallback(jqXHR, textStatus, errorThrown){
    console.log('ERRORCALLBACK');
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
    closeModal();
    $("#error-message").text(jqXHR.responseText)
    $("#loading-alert").modal('show');
}

function closeModal(){
    // hide gif here, eg:
    $("#loading-modal").modal('hide');
}
