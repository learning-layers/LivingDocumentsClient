"use strict";

import React from "react";
import jQuery from "jquery";
import FolderActions from "../../../reflux/folder/folderActions";
let Reflux = require("reflux");
let Tooltip = require("react-bootstrap").Tooltip;
let OverlayTrigger = require("react-bootstrap").OverlayTrigger;
let NativeListener = require("react-native-listener");

let FolderItem = React.createClass({
    getInitialState() {
        return {
            opened: false,
            active: false,
            children: [],
            isLoading: false,
            folder: this.props.folder
        };
    },
    mixins: [
        Reflux.listenTo(FolderActions.newFolderCreated, "onNewFolderCreated"),
        Reflux.listenTo(FolderActions.setSelectedFolder, "onSetSelectedFolder")
    ],
    componentWillReceiveProps(nextProps) {
        if (this.state.folder.id !== nextProps.folder.id) {
            this.setState({
                opened: false,
                active: false,
                children: [],
                isLoading: false,
                folder: nextProps.folder
            });
        }
    },
    onNewFolderCreated(folder) {
        if (this.state.folder.id === folder.jsonParentId) {
            if (this.state.opened) {
                this.state.children.push(folder);
                this.setState({});
            } else {
                this.onFolderDoubleClick();
            }
        }
    },
    onSetSelectedFolder(folder) {
        if (this.state.folder.id !== folder.id) {
            this.setState({
                active: false
            });
        }
    },
    onFolderClick(folderName, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
        }
        console.info("Selecting child folder for folder=" + folderName);
        FolderActions.setSelectedFolder(this.state.folder);
        if (this.state.active !== true) {
            this.setState({
                active: true
            });
        }
    },
    open() {
        this.state.opened = !this.state.opened;
        if (!this.state.opened) {
            this.setState({});
        }
        if (this.state.opened && !this.state.isLoading) {
            this.setState({isLoading: true});
            jQuery.get(
                global.config.endpoint +
                "/api/folders/" + this.state.folder.id + "/folders/list"
            ).then((data) => {
                this.state.children = data;
                this.state.isLoading = false;
                this.setState(this.state);
            }, () => {
                this.setState({isLoading: false});
            });
        }
    },
    onFolderDoubleClick(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
        }
        this.open();
    },
    onContextMenu: function(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        FolderActions.contextMenu(event.clientX, event.clientY, this.state.folder);
    },
    render: function() {
        let liClasses = "";
        if (this.state.active) {
            liClasses = "active";
        }
        let folderIcon = <span className="glyphicon glyphicon-folder-close"></span>;
        let btnClasses = "btn-default";
        if (this.state.opened) {
            folderIcon = <span className="glyphicon glyphicon-folder-open"></span>;
            btnClasses = "btn-primary";
        }
        const tooltip = (
            <Tooltip>Right click to open more options.</Tooltip>
        );
        let childFolders = this.state.children.map((folder) => {
            return (
                <li key={folder.id}><FolderItem folder={folder}/></li>
            );
        });
        return (
            <NativeListener onContextMenu={this.onContextMenu}>
                <div className={"folder-item " + liClasses}
                    onClick={this.onFolderClick.bind(this, "TestFolder")}
                    onDoubleClick={this.onFolderDoubleClick}>
                    <OverlayTrigger placement="top" overlay={tooltip} delayShow={700}>
                        <div>
                            <button className={"btn btn-fab btn-fab-mini btn-raised btn-sm " + btnClasses}
                                    onClick={this.onFolderDoubleClick}>
                                {folderIcon}
                                <div className="ripple-wrapper"></div>
                            </button>
                            <a role="button">
                                {this.state.folder.name}
                            </a>
                        </div>
                    </OverlayTrigger>
                    {this.state.children.length && this.state.opened > 0  ? <ul>
                        {childFolders}
                    </ul> : null}
                </div>
            </NativeListener>
        );
    }
});

export default FolderItem;