"use strict";

import ReactHotLoaderInjection from "react-hot-loader/Injection";
import React from "react";
import App from "./components/app.jsx";
import Home from "./components/home/home.jsx";
import Document from "./components/document/document.jsx";
import User from "./components/user/user.jsx";
import Explorer from "./components/explorer/explorer.jsx";
import Login from "./components/login/login.jsx";
import ReactRouter from "react-router";
import AuthStore from "./reflux/auth/authStore";
import AuthActions from "./reflux/auth/authActions";
import jQuery from "jquery";
import AppStore from "./reflux/app/appStore.jsx";
import config from "./config.js";
import ReactIntl from "../node_modules/react-intl";
import RouteUtils from "./util/routeUtils.jsx";
import Admin from "./components/admin/admin.jsx";
import Relogin from "./components/relogin/relogin.jsx";

global.ReactIntl = ReactIntl;
window.ReactIntl = ReactIntl;
global.config = config;

function onBlur() {
}
function onFocus(){
    AuthActions.authenticate(true); // force authentication
}

if (/*@cc_on!@*/false) { // check for Internet Explorer
    document.onfocusin = onFocus;
    document.onfocusout = onBlur;
} else {
    window.onfocus = onFocus;
    window.onblur = onBlur;
}

if (typeof String.prototype.startsWith !== "function") {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

var prevConsoleWarn = console.warn;
console.warn = function(msg) {
    // disable annoying react warnings in dev mode
    // TODO fix warning related issues
    if (typeof msg === "string" && !msg.startsWith("Warning: owner-based and parent-based contexts differ")) {
        prevConsoleWarn.call(console, msg);
    }
};

import NProgress from "nprogress";
jQuery(document).ajaxStart(function(){
    NProgress.start();
    //disableButtons();
}).ajaxComplete(function(){
    NProgress.done();
    //enableButtons();
});

let guardRouteAsync = RouteUtils.guardRouteAsync;
let NotFound = RouteUtils.NotFound;

let router = {
    router: null
};

//TODO allow public routes with pattern matching
let routes = (
    <ReactRouter.Route name="app" path="/" handler={App}>
        <ReactRouter.DefaultRoute handler={guardRouteAsync(Home, { state: "login" })}/>
        <ReactRouter.Route name="home" handler={guardRouteAsync(Home, { state: "login" })}/>
        <ReactRouter.Route name="documentItem" path="/document/:documentId" handler={guardRouteAsync(Document, { state: "login" })}/>
        <ReactRouter.Route name="userItem" path="/user/:userId" handler={guardRouteAsync(User, { state: "login" })}/>
        <ReactRouter.Route name="explorer" handler={guardRouteAsync(Explorer, { state: "login" })}/>
        <ReactRouter.Route name="login" handler={guardRouteAsync(Login, { state: "home" })}/>
        <ReactRouter.Route name="admin" handler={guardRouteAsync(Admin, { state: "login" })}/>
        <ReactRouter.Route name="relogin" handler={Relogin} />
        <ReactRouter.NotFoundRoute handler={NotFound}/> // jshint ignore:line
    </ReactRouter.Route>
);

import I18N from "./util/i18nUtils.js";
let authInitialized = false;
function main() {
    router.router = ReactRouter.run(routes, function (Handler) {
        let rootInstance = React.render(<Handler formats={I18N.formats} messages={I18N.messages} locales={I18N.locales} />, document.getElementById("content"));
        if (module.hot) {
            ReactHotLoaderInjection.RootInstanceProvider.injectProvider({
                getRootInstances: function () {
                    // Help React Hot Loader figure out the root component instances on the page:
                    return [rootInstance];
                }
            });
        }
        if (!authInitialized) {
            authInitialized = true;
            AuthActions.checkConnectionTask();
            AuthActions.authenticate();
        }
    });
}

function getRouter() {
    let dfd = jQuery.Deferred(); // jshint ignore:line
    if (router.router !== null) {
        dfd.resolve(router.router);
    } else {
        let checkRouterTask = setInterval(function() {
            if (router.router !== null) {
                clearInterval(checkRouterTask);
                dfd.resolve(router.router);
            }
        }, 20);
    }
    return dfd.promise();
}

export default {
    main: main,
    getRouter: getRouter
};