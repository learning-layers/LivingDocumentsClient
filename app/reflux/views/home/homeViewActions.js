"use strict";

let Reflux = require("reflux");

let HomeViewActions = Reflux.createActions([
    "newHomeView",
    "refreshHomeView"
]);

module.exports = HomeViewActions;
