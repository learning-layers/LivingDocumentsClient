"use strict";

// ie8 jquery fix
import jQuery from "jquery";
if (global["$"] === undefined) {
    global["$"] = jQuery;
} else {
    global.jQuery = global["$"];
    global.$ = global["$"];
    window.jQuery = global["$"];
    window.$ = global["$"];
}

import toastr from "toastr";
global.toastr = toastr;
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

import basicUtils from "./util/faviconUtils.js";
import faviconUrl from "./assets/favicon.ico";
basicUtils.changeFavicon(faviconUrl);

jQuery.ajaxSetup({
    type: "POST, GET, PUT, DELETE",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    data: {},
    dataType: "json",
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true
});

import "./main.less";
import Main from "./main.jsx";
Main.main(); // jshint ignore:line