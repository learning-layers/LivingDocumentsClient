"use strict";

import React from "react";
import jQuery from "jquery";
let _ = require("underscore");
let Reflux = require("reflux");
let HomeViewActions = require("./homeViewActions");

let HomeViewStore = Reflux.createStore({
    currentHomeView: null,
    state: {
    },
    listenables: [HomeViewActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    onNewHomeView(currentHomeView) {
        this.currentHomeView = currentHomeView;
    },
    findDocumentInDocumentListById(id) {
        if (this.currentHomeView && this.currentHomeView !== null) {
            var currentDocumentTable = this.currentHomeView.getDocumentTable();
            if (currentDocumentTable !== null) {
                var results = currentDocumentTable.state.results;
                return _.findWhere(results, {id: id});
            }
        }
        return null;
    },
    onRefreshHomeView() {
        console.warn("Refreshing home view");
        if (this.currentHomeView && this.currentHomeView !== null) {
            console.warn("Refreshing home view (1)");
            var currentDocumentTable = this.currentHomeView.getDocumentTable();
            if (currentDocumentTable !== null) {
                console.warn("Refreshing home view (2)");
                var results = currentDocumentTable.state.results = [];
                currentDocumentTable.changeSort("createdAt", "DESC");
            }
        }
    }
});

module.exports = HomeViewStore;