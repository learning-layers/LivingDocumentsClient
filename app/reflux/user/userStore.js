"use strict";

let Reflux = require("reflux");
let UserActions = require("./userActions");
import Main from "../../main.jsx";
import React from "react";
import UserProfileActions from "../userProfile/userProfileActions.js";

let UserStore = Reflux.createStore({
    state: {
        currentUser: null,
    },
    listenables: [UserActions],
    init() {
        Reflux.listenTo(UserProfileActions.userUpdated,"onNewUserData");
    },
    getInitialState() {
        return this.state;
    },
    onNewUserData(user) {
        console.debug("New user data=");
        console.debug(user);
        this.state.currentUser = user;
        this.trigger(this.state);
    },
    getCurrentUser() {
        return this.state.currentUser;
    }
});

module.exports = UserStore;