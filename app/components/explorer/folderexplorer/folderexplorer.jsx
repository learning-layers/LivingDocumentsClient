"use strict";

import React from "react";

let Reflux = require("reflux");
import ReactRouter from "react-router";
let State = ReactRouter.State;
let Button = require("react-bootstrap").Button;
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;

let folders = [
    "Composition Example",
    "Lorem ipsum dolor sit amet, consetetur sadipscing",
    "sed diam voluptua. At vero eos et accusam et justo",
    "Stet clita kasd gubergren, no",
    "labore et dolore magna aliquyam",
    "accusam et justo duo dolores et ea rebum",
    "nonumy eirmod tempor invidunt",
    "sanctus est Lorem ipsum dolor sit amet"
];

let FolderExplorer = React.createClass({
    statics: {
        onEnter: function() {

        }
    },
    getInitialState: function() {
        return {
            count: 0,
            folders: folders
        };
    },
    onFolderClick: function(folderName) {
        console.info("Selecting child folder for folder=" + folderName);
    },
    onFolderDoubleClick: function(folderName) {
        console.info("Loading child folder for folder=" + folderName);
    },
    render: function() {
        let folders = this.state.folders.map(function(folder) {
            return (
                <li><a href="#">{folder}</a></li>
            );
        });
        return (
            <div className="folderexplorer">
                <ol className="folders">
                    {folders}
                    <li><a className="active" role="button"  onClick={this.onFolderClick.bind(this, "TestFolder")} onDoubleClick={this.onFolderDoubleClick.bind(this, "TestFolder")}>TestFolder</a></li>
                </ol>
            </div>
        );
    }
});
module.exports = FolderExplorer;