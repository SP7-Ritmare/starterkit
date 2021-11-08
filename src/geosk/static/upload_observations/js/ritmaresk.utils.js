/**
 * *
 *  author: Paolo Tagliolato - CNR IREA in Milano - www.irea.cnr.it
 *            paolo.tagliolato@gmail.com
 *  created on on 11/05/15.
 *
 *  version: 1.1 beta
 *
 *
 *
 */


var ritmaresk=ritmaresk || {};

/**
 * @namespace
 */
ritmaresk.utils=(function (){
    /**
     *
     * @param name
     * @returns {string}
     */
    function getQueryStringParameterByName(name){
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    /**
     * @description whenAll receives an array of JQuery Promises (Deferred) and stores them in an array.
     * When all promises are fulfilled or rejected (that is "settled"), the global Deferred returned by this function
     * is settled: resolved if all promised are fulfilled or rejected if at least one promise is rejected.
     * Both the fail and done handler of the returned value of this method are called with the following object:
     *
     *      {
         *          resolved:[{
         *                      data: {*},
         *                      textStatus: {string},
         *                      jqXHR: {jqXHR}
         *                   }],
         *          rejected:[{
         *                      jqXHR: {jqXHR},
         *                      textStatus: {string},
         *                      errorThrown: {string}
         *                   }]
         *       }
     *
     * @note the jqXHRs within out.resolved and out.rejected are the ones to inspect for additionalInformation eventually added to jQuery.ajax() return value.
     * @param promises
     * @returns {Deferred}
     * @note cf. http://stackoverflow.com/questions/21515643/when-apply-on-array-of-promises
     * @note This is a way to keep track of all the promises: on the contrary, JQuery.when.apply(promises).fail() does not behave the same way:
     * it fails with the first promise failure.
     */
    function whenAll(promises) {
        var i, resolved = [], rejected = [], countFinished=0 , dfd = $.Deferred();

        var oneRejected = false;

        function resolveOrReject() {
            console.warn(countFinished);
            if (countFinished === promises.length) {
                var out={resolved: resolved,rejected:rejected};

                oneRejected ? dfd.reject(out) : dfd.resolve(out);
            }
        }

        // init promises done and fail handlers
        // for the done and fail args cf. https://github.com/jquery/api.jquery.com/issues/49
        // and the (following) JQuery Ajax documentation
        for (i = 0; i < promises.length; i++) {
            promises[i]
                .done(function (data, textStatus, jqXHR) {
                    resolved.push({data:data,textStatus:textStatus,jqXHR:jqXHR});
                    countFinished++;

                    resolveOrReject();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    oneRejected = true;
                    countFinished++;
                    //console.error("one promise failed:");
                    //console.log(jqXHR.myInfo);
                    rejected.push({jqXHR:jqXHR,textStatus:textStatus,errorThrown:errorThrown});

                    resolveOrReject();
                });
        }
        return dfd.promise();
    }

    /**
     * @description prints all the received arguments to console (pre-pending a title).
     * @param args
     * @param title
     */
    function debugArgs(args, title) {
        var rgs = Array.prototype.slice.call(args);
        console.warn("debugArgs\n" + title);

        rgs.map(function (d) {
            //console.log(d);
            console.log(typeof d+JSON.stringify(d,undefined,3));
            //console.log(typeof d);
        });
    }

    return({
        getQueryStringParameterByName:getQueryStringParameterByName,
        whenAll:whenAll,
        debugArgs:debugArgs
    });

})();


