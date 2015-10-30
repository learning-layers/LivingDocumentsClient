"use strict";

let Reflux = require("reflux");

let DocumentActions = Reflux.createActions([
    "createDocument",
    "newDocumentCreated",
    "documentRetrieved",
    "breadcrumbsRetrieved",
    "etherpadInfoRetrieved",
    "openFullscreenEditor",
    "closeFullscreenEditor",
    "currentTotalDiscussionsChanged",
    "tagAdded",
    "tagDeleted",
    "openShareDocumentModal",
    "openMainContentContexMenu",
    "closeMainContentContexMenu",
    "insertIntoTinyMce"
]);

module.exports = DocumentActions;