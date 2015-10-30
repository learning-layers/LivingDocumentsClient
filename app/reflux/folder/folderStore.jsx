"use strict";

import Main from "../../main.jsx";
import RestUtils from "../../util/restUtils";
import React from "react";
import jQuery from "jquery";
let _ = require("underscore");
let Reflux = require("reflux");
let FolderActions = require("./folderActions");
import FolderItemContextMenu from "../../components/explorer/treefolderexplorer/context-menu/folderItemContextMenu.jsx";
import CreateNewFolderModal from "../../components/explorer/treefolderexplorer/modal/createNewFolderModal.jsx";

let FolderStore = Reflux.createStore({
    folderItemContextMenu: null,
    createNewFolderModal: null,
    state: {
    },
    listenables: [FolderActions],
    onNewFolderCreated(newFolder) {
        console.log(newFolder);
    },
    onContextMenu(clientX, clientY, folder) {
        if (this.folderItemContextMenu === null) {
            this.folderItemContextMenu = React.render(<FolderItemContextMenu posX={clientX} posY={clientY} folder={folder} />, document.getElementById("folder-item-context-menu"));
            this.folderItemContextMenu.open(clientX, clientY, folder);
        } else {
            this.folderItemContextMenu.open(clientX, clientY, folder);
        }
    },
    onOpenCreateNewFolderModal(folder) {
        if (this.createNewFolderModal === null) {
            this.createNewFolderModal = React.render(<CreateNewFolderModal folder={folder} />, document.getElementById("create-folder-modal"));
            this.createNewFolderModal.open(folder);
        } else {
            this.createNewFolderModal.open(folder);
        }
    }
});

module.exports = FolderStore;