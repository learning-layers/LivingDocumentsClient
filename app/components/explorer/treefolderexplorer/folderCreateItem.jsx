"use strict";

import React from "react";
import jQuery from "jquery";
import FolderActions from "../../../reflux/folder/folderActions";

let Input = require("react-bootstrap").Input;

let FolderCreateItem = React.createClass({
    getInitialState() {
        return {
            createFolderName: ""
        };
    },
    reset() {
        this.setState({
            createFolderName: ""
        });
    },
    componentDidMount: function() {
        jQuery(document.body).on("keydown", this.handleKeyDown);
    },

    componentWillUnmount: function() {
        jQuery(document.body).off("keydown", this.handleKeyDown);
    },
    changeCreateFolder(event) {
        this.state.createFolderName = event.target.value;
        this.setState({});
    },
    submit() {
        let value = React.findDOMNode(this.refs.folderNameInput).childNodes[0].value;
        console.info("current value=" + value);
        // https://api.learnenv.com:9000/api/folders
        //{name: "Test2"}
        let newFolder = {name: value};
        jQuery.post(
            global.config.endpoint +
            "/api/folders",
            JSON.stringify(newFolder)
        ).then((data) => {
            console.log(data);
            FolderActions.newFolderCreated(data);
        });
    },
    handleKeyDown: function(e) {
        var ENTER = 13;
        if( e.keyCode === ENTER ) {
            this.submit();
        }
    },
    render: function() {
        let folderIcon = <span className="glyphicon glyphicon-folder-close"></span>;
        let btnClasses = "btn-default";
        return (
            <li className="folder-item">
                <button className={"btn btn-fab btn-fab-mini btn-raised btn-sm " + btnClasses}>
                    {folderIcon}
                    <div className="ripple-wrapper"></div>
                </button>
                <Input ref="folderNameInput" type="text" placeholder={this.props.folder} value={this.state.createFolderName} onChange={this.changeCreateFolder} />
            </li>
        );
    }
});

export default FolderCreateItem;