"use strict";

let Reflux = require("reflux");

let UserActions = Reflux.createActions([
    "newUserData",
    "userRetrieved"
]);

module.exports = UserActions;