"use strict";

import React from "react";
import FolderActions from "../../../../reflux/folder/folderActions";

const FolderItemContextMenu = React.createClass({
    getInitialState() {
        return {
            showContextMenu: false,
            posX: 0,
            posY: 0,
            folder: this.props.folder
        };
    },
    componentWillReceiveProps(nextProps) {
        if (this.state.folder.id !== nextProps.folder.id) {
            this.setState({
                showContextMenu: true,
                posX: nextProps.posX,
                posY: nextProps.posY,
                folder: nextProps.folder
            });
        }
    },
    close() {
        this.setState({ showContextMenu: false });
    },
    open(posX, posY, folder) {
        this.setState({
            showContextMenu: true,
            posX: posX,
            posY: posY,
            folder: folder
        });
    },
    createNewFolder() {
        this.close();
        FolderActions.openCreateNewFolderModal(this.state.folder);
    },
    render() {
        let style = {
            left: this.state.posX,
            top: this.state.posY
        };
        return (
            <div>
                {this.state.showContextMenu ? <div className="context-menu folder-item-context-menu" style={style}>
                    <ul className="folder-item-options">
                        <li className="folder-item-option" onClick={this.createNewFolder}>
                            <span className="glyphicon glyphicon-folder-close"></span>
                            New Folder ...
                        </li>
                    </ul>
                </div>: null}
            </div>
        );
    }
});

export default FolderItemContextMenu;
