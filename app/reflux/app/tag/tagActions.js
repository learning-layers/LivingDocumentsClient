"use strict";

let Reflux = require("reflux");

let TagActions = Reflux.createActions([
    "openAddModal",
    "openCreateModal",
    "openEditModal",
    "editTag",
    "createTag",
    "newTagCreated",
    "deleteTag",
    "addTag"
]);

module.exports = TagActions;