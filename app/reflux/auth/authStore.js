"use strict";

import Main from "../../main.jsx";
import RestUtils from "../../util/restUtils";
import UserActions from "../user/userActions";
let Reflux = require("reflux");
let AuthActions = require("./authActions");

let AuthStore = Reflux.createStore({
    authenticationInProgress: false,
    state: {
        token: null,
        isLoggedIn: localStorage.token,
        isConnected: false
    },
    listenables: [AuthActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    onLogin(email, pass) {
        console.info("Performing login for user=" + email);
        setTimeout(() => {
            if (email === "joe@example.com" && pass === "password1") {
                let token = Math.random().toString(36).substring(7);
                localStorage.token = token;
                this.state.token = token;
                this.state.isLoggedIn = this.loggedIn();
                this.trigger(this.state);
                Main.getRouter().then(function(router) {
                    router.transitionTo("home", {}, {});
                });
            } else {
                AuthActions.loginFailed();
            }
        }, 0);
    },
    onLogout() {
        let logoutPromise = RestUtils.get(global.config.endpoint + "/logout?nocache=" + Math.floor((1 + Math.random()) * 0x10000));
        logoutPromise.then(
            () => {},
            () => {
                localStorage.logoutFailed = true;
            },
            () => {
                delete localStorage.token;
                UserActions.newUserData(null);
                this.state.token = null;
                this.state.isLoggedIn = false;
                this.trigger(this.state);
                Main.getRouter().then(function(router) {
                    router.transitionTo("login", {}, {});
                });
            }
        );
    },
    onAuthenticate(forced) {
        if (!this.authenticationInProgress || forced) {
            this.authenticationInProgress = true;
            let authPromise = RestUtils.get(global.config.endpoint + "/api/users/authenticate?nocache=" + Math.floor((1 + Math.random()) * 0x10000));
            setTimeout(() => {
                this.authenticationInProgress = false;
            }, 20000);
            return authPromise.then(
                (success) => {
                    console.info("Authentication success.");
                    let triggerChange = false;
                    /*if (this.state.isConnected === false) { // TODO comment this in as soon as the new server version is deployed
                        this.state.isConnected = true;
                        triggerChange = true;
                    }*/
                    if (this.state.isLoggedIn !== true) {
                        this.state.isLoggedIn = true;
                        triggerChange = true;
                    }
                    localStorage.token = success.statusText;
                    try {
                        UserActions.newUserData(JSON.parse(success.responseText));
                    } catch (e) {
                        console.error(e);
                    }
                    if (triggerChange) {
                        this.trigger(this.state);
                    }
                    Main.getRouter().then(function(router) {
                        let currentPath = router.getCurrentPathname();
                        if ("/login" === currentPath) {
                            router.transitionTo("home", {}, {});
                        }
                    });
                }, (error) => {
                    console.error("Authentication failed!");
                    if (this.state.isLoggedIn !== false) {
                        this.state.isLoggedIn = false;
                        this.trigger(this.state);
                    }
                    if (this.state.isConnected === false) {
                        // TODO block the application if no connection
                        this.onLogout(); // TODO remove this in favor of blocking the application
                    } else {
                        Main.getRouter().then((router) => {
                            let currentPath = router.getCurrentPathname();
                            let found = false;
                            // TODO change this to include all public paths and patterns
                            console.log(router.routes[0].childRoutes);
                            router.routes[0].childRoutes.forEach(function(route) {
                                if (route.path === currentPath) {
                                    found = true;
                                }
                            });
                            if (!found) {
                                router.transitionTo("login", {}, {});
                                this.onLogout();
                            }
                        });
                    }
                }
            );
        }
    },
    onCheckConnection() {
        let authPromise = RestUtils.get(global.config.endpoint + "/templates/blank.gif?nocache=" + Math.floor((1 + Math.random()) * 0x10000));
        authPromise.then(
            (success) => {
                console.info("Host reachable.");
                if (this.state.isConnected !== true) {
                    this.state.isConnected = true;
                    this.trigger(this.state);
                }
                AuthActions.authenticate();
            }, (error) => {
                console.error("Host not reachable!");
                if (this.state.isConnected !== false) {
                    this.state.isConnected = false;
                    this.trigger(this.state);
                }
            }
        );
        return authPromise;
    },
    onCheckConnectionTask() {
        this.onCheckConnection().then(
            () => {setTimeout(this.onCheckConnectionTask, 15000);},
            () => {setTimeout(this.onCheckConnectionTask, 15000);}
        );
    },
    loggedIn() {
        //TODO support offline mode
        if (!this.state.isLoggedIn && !!localStorage.token) {
            delete localStorage.token;
        }
        return this.state.isLoggedIn;
    }
});

module.exports = AuthStore;