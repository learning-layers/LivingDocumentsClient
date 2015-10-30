"use strict";

import Main from "../../main.jsx";
import RestUtils from "../../util/restUtils";
import CreateDocumentModal from "../../components/document/createDocumentModal.jsx";
import ShareDocumentModal from "../../components/document/sharing/shareDocumentModal.jsx";
import FullScreenEditorModal from "../../components/document/mainContent/fullscreenEditorModal.jsx";
import React from "react";
import jQuery from "jquery";
import MainContentContextMenu from "../../components/document/mainContent/mainContentContextMenu.jsx";
let _ = require("underscore");
let Reflux = require("reflux");
let DocumentActions = require("./documentActions");

let DocumentStore = Reflux.createStore({
    mainContentContextMenu: null,
    createDocumentModal: null,
    fullscreenEditorModal: null,
    shareDocumentModal: null,
    state: {
        currentDocument: null,
        currentBreadcrumbs: null,
        currentEtherpadInfo: null,
        currentTotalDiscussionElements: 0
    },
    listenables: [DocumentActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    onOpenMainContentContexMenu(selection, documentTitle) {
        if (this.mainContentContextMenu === null) {
            this.mainContentContextMenu = React.render(<MainContentContextMenu posX={selection.clientX} posY={selection.clientY} />, document.getElementById("document-selection-context-menu"));
            this.mainContentContextMenu.open(selection.clientX, selection.clientY, selection, documentTitle);
        } else {
            this.mainContentContextMenu.open(selection.clientX, selection.clientY, selection, documentTitle);
        }
    },
    onCloseMainContentContexMenu() {
        if (this.mainContentContextMenu !== null) {
            this.mainContentContextMenu.close();
        }
    },
    onOpenShareDocumentModal(LDdocument) {
        if (this.shareDocumentModal === null) {
            this.shareDocumentModal = React.render(<ShareDocumentModal />, document.getElementById("share-document-modal"));
            this.shareDocumentModal.open(LDdocument);
        } else {
            this.shareDocumentModal.open(LDdocument);
        }
    },
    onCreateDocument(selection) {
        if (this.createDocumentModal === null) {
            this.createDocumentModal = React.render(<CreateDocumentModal />, document.getElementById("create-document-modal"));
            this.createDocumentModal.open(selection);
        } else {
            this.createDocumentModal.open(selection);
        }
    },
    onDocumentRetrieved(documentData) {
        this.state.currentDocument = documentData;
        this.trigger(this.state);
    },
    onBreadcrumbsRetrieved(breadcrumbData) {
        this.state.currentBreadcrumbs = breadcrumbData;
        this.trigger(this.state);
    },
    onEtherpadInfoRetrieved(etherpadInfo) {
        this.state.currentEtherpadInfo = etherpadInfo;
        this.trigger(this.state);
    },
    onOpenFullscreenEditor(etherpadURI) {
        if (this.fullscreenEditorModal === null) {
            this.fullscreenEditorModal = React.render(<FullScreenEditorModal />, document.getElementById("fullscreen-editor-modal"));
            this.fullscreenEditorModal.open(etherpadURI);
        } else {
            this.fullscreenEditorModal.open(etherpadURI);
        }
    },
    onCurrentTotalDiscussionsChanged(currentTotalDiscussionElements) {
        this.state.currentTotalDiscussionElements = currentTotalDiscussionElements;
        this.trigger(this.state);
    },
    onTagAdded(newTag) {
        this.state.currentDocument.tags.push(newTag);
        this.trigger(this.state);
    },
    onTagDeleted(tag) {
        var tags = this.state.currentDocument.tags;
        var index = tags.indexOf(tag);
        if (index > -1) {
            tags.splice(index, 1);
        }
        this.state.currentDocument.tags = tags;
        this.trigger(this.state);
    }
});

module.exports = DocumentStore;