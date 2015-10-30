"use strict";

let Reflux = require("reflux");

let AppModalActions = Reflux.createActions([
    "loading",
    "loadingProgress",
    "loadingComplete"
]);

module.exports = AppModalActions;