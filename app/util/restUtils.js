"use strict";

import jQuery from "jquery";

let get = function(url) {
    let dfd = jQuery.Deferred(); // jshint ignore:line

    let ajax = null;
    if(window.XMLHttpRequest){ // Google Chrome, Mozilla Firefox, Opera, Safari, IE 10
        ajax = new XMLHttpRequest();
    }
    else if(window.ActiveXObject){ // Internet Explorer 9 and less
        try{
            ajax = new ActiveXObject("Msxml2.XMLHTTP.6.0"); // jshint ignore:line
        } catch(e){
            try{
                ajax = new ActiveXObject("Msxml2.XMLHTTP.3.0"); // jshint ignore:line
            }
            catch(e){}
        }
    }
    if (ajax !== null) {
        //let nocache = new Date().getTime(); // "?cache=" + nocache
        ajax.open("GET", url, true);
        ajax.withCredentials = true;
        ajax.onreadystatechange = function(){
            if(this.readyState === 4){
                if(this.status === 200 || this.status === 304){
                    let successObj = {
                        status: this.status,
                        statusText: this.statusText,
                        responseText: this.responseText
                    };
                    dfd.resolve(successObj);
                } else{
                    let errorObj = {
                        status: this.status,
                        statusText: this.statusText,
                        responseText: this.responseText
                    };
                    dfd.reject(errorObj);
                }
            } else {
                dfd.notify( "working... " );
            }
        };
        ajax.send(null);
    } else {
        alert("Your browser doesn't support AJAX!");
    }
    return dfd.promise();
};

export default {
    get: get
};