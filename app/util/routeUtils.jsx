"use strict";

import React from "react";
import jQuery from "jquery";
import AuthStore from "../reflux/auth/authStore";
import Main from "../main.jsx";
import RestUtils from "./restUtils";

const authenticationCheck = function(rolesAllowed) {
    let dfd = jQuery.Deferred(); // jshint ignore:line
    setTimeout(() => {
        if (rolesAllowed) {
            // route needs authentication
            if(!AuthStore.loggedIn()) {
                // reject if user is not logged in
                dfd.reject();
            } else {
                // TODO implement more detailed authorization check
                // check user roles
                dfd.resolve();
            }
        } else {
            // route is accessible without authentication
            dfd.resolve();
        }
    }, 1);
    return dfd.promise();
};

// @See http://www.keendevelopment.ch/restricting-react-router-with-guards/

/**
 * Guard the Component router handler with the given function.  If the function fails
 * (i.e. returns a falsey value) then redirect to the given state and parameters.
 *
 * @param fn The guard function, returning true (if the transition is allowed) or false if not
 * @param Component The React component used as the route handler
 * @param state The name of the state to redirect to if the guard fails
 * @param params Optional parameters for the redirect state
 * @returns {*}
 */
const guardRoute = function(fn, Component, { state, params }) {
    if (params === undefined) {
        params = {};
    }
    return React.createClass({
        statics: {
            willTransitionTo(transition, currentParams, currentQuery) {
                if (Component.onEnter) {
                    Component.onEnter();
                }
                if (!fn(currentParams)) {
                    transition.redirect(state, params);
                }
            }
        },
        render() {
            return <Component {...this.props} />;
        },
        displayName: `${Component.displayName}(Guarded)`
    });
};

/**
 * Asynchronously guard the Component router handler with the given function.  If the
 * function fails (i.e. the Promise resolves with a falsey value) then redirect to
 * the given state and parameters.
 *
 * @param fn The guard function, returning a Promise
 * @param Component The React component used as the route handler
 * @param state The name of the state to redirect to if the guard fails
 * @param params Optional parameters for the redirect state
 * @returns {*}
 */
const guardRouteAsync = function(Component, { state, params }) {
    if (params === undefined) {
        params = {};
    }
    return React.createClass({
        statics: {
            willTransitionTo(transition, currentParams, currentQuery, callback) {
                if (Component.onEnter) {
                    jQuery.when(authenticationCheck(Component.rolesAllowed), Component.onEnter(currentParams, currentQuery)).then((success) => {
                        callback();
                    }, (error) => {
                        transition.redirect(state, params);
                        callback();
                    });
                } else {
                    authenticationCheck(Component.rolesAllowed).then((success) => {
                        callback();
                    }, (error) => {
                        transition.redirect(state, params);
                        callback();
                    });
                }
            }
        },
        render() {
            return <Component {...this.props} />;
        },
        displayName: `${Component.displayName}(Guarded)`
    });
};

let NotFound = React.createClass({
    getInitialState() {
        Main.getRouter().then(function(router) {
            router.transitionTo("home", {}, {});
        });
        return {};
    },
    render: function() {
        return (
            <div></div>
        );
    }
});

let logoutIfFailed = function() {
    if (localStorage.logoutFailed) {
        let logoutPromise = RestUtils.get(global.config.endpoint + "/logout?nocache=" + Math.floor((1 + Math.random()) * 0x10000));
        logoutPromise.then(
            () => {
                delete localStorage.logoutFailed;
            },
            () => {
            },
            () => {
                delete localStorage.token;
                this.state.token = null;
                this.state.isLoggedIn = this.loggedIn();
                this.trigger(this.state);
                Main.getRouter().then(function(router) {
                    router.transitionTo("login", {}, {});
                });
            }
        );

        //TODO make sure this is only triggered when the user pressed Signout from OIDC
        //TODO configure OIDC endpoint to allow the CORS request
        /*let logoutFromOIDCPromise = RestUtils.get("https://api.learning-layers.eu/o/oauth2/logout");
        logoutFromOIDCPromise.then(
            () => {
                delete localStorage.logoutFailed;
            },
            () => {
            },
            () => {
                delete localStorage.token;
                this.state.token = null;
                this.state.isLoggedIn = this.loggedIn();
                this.trigger(this.state);
                Main.getRouter().then(function(router) {
                    router.transitionTo("login", {}, {});
                });
            }
        );*/
    }
};

export default {
    guardRouteAsync: guardRouteAsync,
    NotFound: NotFound,
    logoutIfFailed: logoutIfFailed
};