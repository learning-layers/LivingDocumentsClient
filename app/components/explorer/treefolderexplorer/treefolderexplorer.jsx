"use strict";

import React from "react";
import UserStore from "../../../reflux/user/userStore";
import Waypoint from "react-waypoint";
import jQuery from "jquery";
import ReactRouter from "react-router";
import FolderCreateItem from "./folderCreateItem.jsx";
import FolderItem from "./folderItem.jsx";
import FolderActions from "../../../reflux/folder/folderActions";
import FolderStore from "../../../reflux/folder/folderStore.jsx";
import facebookLoadingIndicator from "../../../assets/img/ajax-loader.gif";

let _ = require("underscore");
let Reflux = require("reflux");
let State = ReactRouter.State;
let Button = require("react-bootstrap").Button;
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;
let Input = require("react-bootstrap").Input;

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

let TreeFolderExplorer = React.createClass({
    statics: {
        onEnter: function() {

        }
    },
    mixins: [
        Reflux.listenTo(FolderActions.newFolderCreated, "onNewFolderCreated"),
        Reflux.connect(UserStore, "user"),
        Reflux.connect(FolderStore, "folder")
    ],
    getInitialState() {
        return {
            count: 0,
            folders: [],
            isLoading: false,
            allItemsLoaded: false,
            currentPage: 0,
            currentTotalElements: 0
        };
    },
    onNewFolderCreated(folder) {
        if (!folder.jsonParentId || folder.jsonParentId === null) {
            this.state.folders.push(folder);
            this.refs.folderCreateItem.reset();
            this.setState({});
        }
    },
    _loadMoreItems() {
        setTimeout(() => {
            // timeout needed because the props are not refreshed when this
            // method is entered immediately
            if (!this.state.allItemsLoaded) {
                this.state.isLoading = true;
                this.setState(this.state);
                jQuery.get(
                    global.config.endpoint +
                    "/api/folders?page-number=" +
                    this.state.currentPage +
                    "&page-size=" + 5 + "&sort-direction=DESC&sort-property=createdAt"
                ).then((data) => {
                    if (this.state.currentTotalElements !== data.totalElements) {
                        this.state.currentTotalElements = data.totalElements;
                    }
                    let mergedArrays = mergeArrays(this.state.folders, data.content);
                    mergedArrays = _.sortBy(mergedArrays, function (o) {
                        return o.createdAt;
                    }).reverse();
                    if (mergedArrays.length === data.totalElements || data.content.length === 0) {
                        this.state.allItemsLoaded = true;
                    }
                    this.state.isLoading = false;
                    this.state.folders = mergedArrays;
                    this.state.currentPage = this.state.currentPage + 1;
                    this.setState(this.state);
                }, () => {
                    this.state.isLoading = false;
                    this.state.allItemsLoaded = true;
                    this.setState(this.state);
                });
            }
        }, 1);
    },
    _renderWaypoint() {
        if (!this.state.isLoading && !this.state.allItemsLoaded) {
            return (
                <Waypoint className="waypoint"
                    onEnter={this._loadMoreItems()}
                    threshold={0.5}
                    />
            );
        }
    },
    render() {
        if (this.state.user.currentUser === null) {
            return (
                <div className="folderexplorer">
                    Loading...
                </div>
            );
        }
        let folders = this.state.folders.map((folder) => {
            return (
                <li key={folder.id} className="folder-item-wrapper">
                    <FolderItem folder={folder}/>
                </li>
            );
        });
        let folderListClasses = "folders";
        if (this.state.isLoading) {
            folderListClasses += " isloading";
        }
        return (
            <div className="folderexplorer">
                <ul className={folderListClasses}>
                    <FolderCreateItem ref="folderCreateItem" folder={"Create a new folder"} />
                    {folders}
                    {this._renderWaypoint()}
                </ul>
            </div>
        );
    }
});
module.exports = TreeFolderExplorer;