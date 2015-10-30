"use strict";

import RestUtils from "../../../util/restUtils";
import React from "react";
import jQuery from "jquery";
import I18N from "../../../util/i18nUtils.js";
import EditTagModal from "../../../components/app/tags/editTagModal.jsx";
import CreateTagModal from "../../../components/app/tags/createTagModal.jsx";
import AddTagModal from "../../../components/app/tags/addTagModal.jsx";
import DocumentActions from "../../document/documentActions";
import UserProfileActions from "../../userProfile/userProfileActions";
let Reflux = require("reflux");
let TagActions = require("./tagActions");

let TagStore = Reflux.createStore({
    openAddModal: null,
    openEditModal: null,
    openCreateModal: null,
    ParentActions: null,
    serviceUrl: null,
    currentParent: null,
    state: {
    },
    listenables: [TagActions],
    init() {
    },
    getInitialState() {
        return this.state;
    },
    setParent() {
        if(this.currentParent.username) {
            this.ParentActions = UserProfileActions;
            this.serviceUrl = global.config.endpoint + "/api/users/";
        } else {
            this.ParentActions = DocumentActions;
            this.serviceUrl = global.config.endpoint + "/api/documents/";
        }
    },
    onOpenAddModal(currentParent) {
        this.currentParent = currentParent;
        this.setParent();
        let tags = [];
        jQuery.get(global.config.endpoint + "/api/tags/").then((data) => {
            tags = data.content;
            if (this.openAddModal === null) {
                this.openAddModal = React.render(<AddTagModal />, document.getElementById("add-tag-modal"));
                this.openAddModal.open(this.currentParent, tags);
            } else {
                this.openAddModal.open(this.currentParent , tags);
            }
        }, () => {
            console.error("Access to tags denied");
        });
    },
    onOpenCreateModal(currentParent) {
        this.currentParent = currentParent;
        this.setParent();
        if (this.openCreateModal === null) {
            this.openCreateModal = React.render(<CreateTagModal />, document.getElementById("create-tag-modal"));
            this.openCreateModal.open(this.currentParent);
        } else {
            this.openCreateModal.open(this.currentParent);
        }
    },
    onOpenEditModal(tag, currentParent) {
        this.currentParent = currentParent;
        this.setParent();
        if (this.openEditModal === null) {
            this.openEditModal = React.render(<EditTagModal />, document.getElementById("edit-tag-modal"));
            this.openEditModal.open(tag, this.currentParent);
        } else {
            this.openEditModal.open(tag, this.currentParent);
        }
    },
    onEditTag() {
        console.warn("onEditTag called in store");
    },
    onAddTag(tag, parentId) {
        jQuery.post(this.serviceUrl + parentId + "/tag/" + tag.id).then(()=> {
            this.ParentActions.tagAdded(tag);
        }, (error)=> {
            if (error.status !== 200) {
                console.error("Could not add tag to parent");
            } else {
                this.ParentActions.tagAdded(tag);
            }
        });
    },
    onDeleteTag(tag, parentId) {
        var Actions = this.ParentActions;
        jQuery.ajax({
            url: this.serviceUrl + parentId + "/tag/" + tag.id,
            type: "DELETE",
            success: function() {
                Actions.tagDeleted(tag);
            },
            error: function(error) {
                if (error.status !== 200) {
                    console.error("Could not delete tag");
                } else {
                    Actions.tagDeleted(tag);
                }
            }
        });
    }
});

module.exports = TagStore;