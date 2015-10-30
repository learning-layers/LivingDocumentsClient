"use strict";

let Reflux = require("reflux");
let UserActions = require("./userProfileActions");
import Main from "../../main.jsx";
import React from "react";

let UserProfileStore = Reflux.createStore({
    state: {
        user: null,
        tags: []
    },
    listenables: [UserActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    onUserRetrieved(user){
        this.state.user = user;
        this.trigger(this.state);
    },
    onTagsRetrieved(tags) {
        this.state.tags = tags;
        this.trigger(this.state);
    },
    onTagAdded(newTag) {
        this.state.tags.push(newTag);
        this.trigger(this.state);
    },
    onTagDeleted(tag) {
        var tags = this.state.tags;
        var index = tags.indexOf(tag);
        if (index > -1) {
            tags.splice(index, 1);
        }
        this.state.tags = tags;
        this.trigger(this.state);
    }
});

module.exports = UserProfileStore;