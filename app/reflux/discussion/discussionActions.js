"use strict";

let Reflux = require("reflux");

let DocumentActions = Reflux.createActions([
    "currentTotalDiscussionsChanged",
    "createDiscussion",
    "discussionCreated"
]);

module.exports = DocumentActions;