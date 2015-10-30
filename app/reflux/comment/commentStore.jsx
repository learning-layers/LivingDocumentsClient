"use strict";

import Main from "../../main.jsx";
import RestUtils from "../../util/restUtils";
//import CreateDocumentModal from "../../components/document/createCommentModal.jsx";
import React from "react";
import jQuery from "jquery";
import CreateCommentModal from "../../components/document/commentArea/createCommentModal.jsx";
let _ = require("underscore");
let Reflux = require("reflux");
let CommentActions = require("./commentActions");

function shortUid() {
    // http://stackoverflow.com/a/6248722/20003
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4); // jshint ignore:line
}

function mergeArrays(currentElements, externalResults) {
    let newArray = [];
    for(let i in currentElements){
        let shared = false;
        for (let j in externalResults) {
            if (externalResults[j].id === currentElements[i].id) {
                shared = true;
                break;
            }
        }
        if(!shared) {
            newArray.push(currentElements[i]);
        }
    }
    return newArray.concat(externalResults);
}

let CommentStore = Reflux.createStore({
    createCommentModal: null,
    listenables: [CommentActions],
    state: {},
    init() {
        this.resetState();
    },
    resetState() {
        this.state = this.getInitialState();
        this.trigger(this.state);
    },
    getInitialState() {
        return {
            currentTotalElements: 0,
            items: [],
            documentId: null,
            isLoading: false,
            currentPage: 0,
            allItemsLoaded: false
        };
    },
    onResetState() {
        this.resetState();
    },
    onCurrentTotalElementsChanged(currentTotalElements) {
        this.state.currentTotalElements = currentTotalElements;
        this.trigger(this.state);
    },
    onNewCommentCreated (data) {
        var dataArray = [data];
        let mergedArrays = mergeArrays(this.state.items, dataArray);
        mergedArrays = _.sortBy(mergedArrays, function (o) {
            return o.createdAt;
        }).reverse();
        this.state.items = mergedArrays;
        this.state.currentTotalElements += 1;
        this.trigger(this.state);
    },
    onCreateComment() {
        if (this.createCommentModal === null) {
            this.createCommentModal = React.render(<CreateCommentModal />, document.getElementById("create-comment-modal"));
            this.createCommentModal.open(this.state.documentId);
        } else {
            this.createCommentModal.open(this.state.documentId);
        }
    },
    onLoadMoreItems: function(documentId) {
        this.state.documentId = documentId;
        if (!this.state.allItemsLoaded) {
            this.state.isLoading = true;
            this.trigger(this.state);
            jQuery.get(global.config.endpoint + "/api/documents/" + this.state.documentId + "/comment?page-number=" +
                this.state.currentPage + "&page-size=" + 5 + "&sort-direction=DESC&sort-property=createdAt").then((data) => {
                if (this.state.currentTotalElements !== data.totalElements) {
                    this.state.currentTotalElements = data.totalElements;
                }
                let mergedArrays = mergeArrays(this.state.items, data.content);
                mergedArrays = _.sortBy(mergedArrays, function (o) {
                    return o.createdAt;
                }).reverse();
                if (mergedArrays.length === data.totalElements || data.content.length === 0) {
                    this.state.allItemsLoaded = true;
                }
                this.state.isLoading = false;
                this.state.items = mergedArrays;
                this.state.currentPage = this.state.currentPage + 1;
                this.trigger(this.state);
            }, () => {
                this.state.isLoading = false;
                this.state.allItemsLoaded = true;
                this.trigger(this.state);
            });
        }
    },
    onDeleteCommentFromList(comment) {
        try {
            let idx = -1;
            for (let i = 0;i<this.state.items.length;i++) {
                if (this.state.items[i].id === comment.id) {
                    idx = i;
                }
            }
            if (idx !== -1) {
                this.state.items.splice(idx, 1);
                this.trigger(this.state);
            }
        } catch (e) {
            //
        }
    }
});

module.exports = CommentStore;