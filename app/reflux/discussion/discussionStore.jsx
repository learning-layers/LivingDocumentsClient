"use strict";

import Main from "../../main.jsx";
import RestUtils from "../../util/restUtils";
import React from "react";
import jQuery from "jquery";
import CreateDiscussionModal from "../../components/document/createDiscussionModal.jsx";
let Reflux = require("reflux");
let DiscussionActions = require("./discussionActions");

let DocumentStore = Reflux.createStore({
    createDiscussionModal: null,
    state: {
        currentTotalDiscussionElements: 0
    },
    listenables: [DiscussionActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    onDiscussionCreated() {
    },
    onCurrentTotalDiscussionsChanged(currentTotalDiscussionElements) {
        this.state.currentTotalDiscussionElements = currentTotalDiscussionElements;
        this.trigger(this.state);
    },
    onCreateDiscussion(documentId, section) {
        if (this.createDiscussionModal === null) {
            this.createDiscussionModal = React.render(<CreateDiscussionModal documentId={documentId} />, document.getElementById("create-discussion-modal"));
        } else {
            this.createDiscussionModal.open();
        }
    }
});

module.exports = DocumentStore;