"use strict";

import jQuery from "jquery";
import DocumentActions from "../../../../reflux/document/documentActions";

let setDefault = function(original, value){
    return typeof original === "undefined" ? value : original;
};

let currentTotalElements = 0;

let documentIdWrapper = {
    documentId: null
};

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

    let uri = "/api/documents/" + documentIdWrapper.documentId + "/attachment?attachment-types=image%2Fpng%3Bimage%2Fjpeg&excluded-attachment-types=&page-number=" + page + "&page-size=" + pageSize + "&sort-direction=DESC&sort-property=createdAt";
    jQuery.get(global.config.endpoint + uri).then(function(data) {
        console.info(data);
        currentTotalElements = data.totalElements;
        callback({
            results: data.content,
            totalResults: data.totalElements,
            pageSize: pageSize
        });
    });
};

let setDocumentId = function(documentId) {
    documentIdWrapper.documentId = documentId;
};

let getDocumentWrapper = function() {
    return documentIdWrapper;
};

export default {
    externalDataMethod: externalDataMethod,
    setDocumentId: setDocumentId,
    getDocumentWrapper: getDocumentWrapper
};