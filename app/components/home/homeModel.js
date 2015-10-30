"use strict";

import jQuery from "jquery";
import DocumentActions from "../../reflux/document/documentActions";
import _ from "underscore";

let setDefault = function(original, value){
    return typeof original === "undefined" ? value : original;
};

let currentTotalElements = 0;

//this is a really ugly method for simulating a lot of the stuff that should be occuring on an API call or something of that nature
let externalDataMethod = function(filterString, sortColumn, sortAscending, page, pageSize, callback) {

    console.debug("Fetching data for page=" + page + " with pageSize=" + pageSize);

    //need some ECMA6
    filterString = setDefault(filterString, null);
    sortColumn = setDefault(sortColumn, null);
    sortAscending = setDefault(sortAscending, null);
    page = setDefault(page, 0);
    pageSize = setDefault(pageSize, 5);
    callback = setDefault(callback, null);
    let initialIndex = page * pageSize;
    let endIndex = initialIndex + pageSize;

    jQuery.get(global.config.endpoint + "/api/documents?page-number=" + page + "&page-size=" + pageSize + "&sort-direction=DESC&sort-property=createdAt").then(function(data) {
        console.info(data);
        currentTotalElements = data.totalElements;
        callback({
            results: data.content,
            totalResults: data.totalElements,
            pageSize: pageSize
        });
    });
};

export default {
    externalDataMethod: externalDataMethod
};