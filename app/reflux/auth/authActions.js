"use strict";

let Reflux = require("reflux");

let AuthActions = Reflux.createActions([
    "login",
    "logout",
    "loggedIn",
    "loginFailed",
    "authenticate",
    "checkConnection",
    "checkConnectionTask"
]);

module.exports = AuthActions;