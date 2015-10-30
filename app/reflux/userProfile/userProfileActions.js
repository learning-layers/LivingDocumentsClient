"use strict";

let Reflux = require("reflux");

let UserProfileActions = Reflux.createActions([
    "userRetrieved",
    "userUpdated",
    "avatarUploaded",
    "tagAdded",
    "tagDeleted",
    "tagsRetrieved"
]);

module.exports = UserProfileActions;