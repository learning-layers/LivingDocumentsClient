"use strict";

import Main from "../../main.jsx";
import RestUtils from "../../util/restUtils";
import LoadingModal from "../../components/app/loadingModal.jsx";
import React from "react";
import jQuery from "jquery";
import I18N from "../../util/i18nUtils.js";
let Reflux = require("reflux");
let AppModalActions = require("./appActions");

let AppModalStore = Reflux.createStore({
    loadingModal: null,
    state: {
    },
    listenables: [AppModalActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    close() {
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },
    onLoading(promiseNameArray) {
        if (this.loadingModal === null) {
            this.loadingModal = React.render(<LoadingModal formats={I18N.formats} messages={I18N.messages} locales={I18N.locales} promiseNames={promiseNameArray} />, document.getElementById("loading-modal"));
        } else {
            this.loadingModal.open(promiseNameArray);
        }
    }
});

module.exports = AppModalStore;