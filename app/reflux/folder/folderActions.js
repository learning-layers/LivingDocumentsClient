"use strict";

let Reflux = require("reflux");

let FolderActions = Reflux.createActions([
    "contextMenu",
    "createNewFolder",
    "newFolderCreated",
    "setSelectedFolder",
    "openCreateNewFolderModal"
]);

module.exports = FolderActions;