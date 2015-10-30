"use strict";

import React from "react";
import ReactRouter from "react-router";
import AuthStore from "../../reflux/auth/authStore";
import AuthActions from "../../reflux/auth/authActions";
import jQuery from "jquery";
import FolderExplorer from "./folderexplorer/folderexplorer.jsx";
import TreeFolderExplorer from "./treefolderexplorer/treefolderexplorer.jsx";
import SplitPane from "react-split-pane";
import ExplorerTopBar from "./topbar/topbar.jsx";

let Reflux = require("reflux");
let State = ReactRouter.State;
let Button = require("react-bootstrap").Button;
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;

let Explorer = React.createClass({
    statics: {
        rolesAllowed: ["ROLE_USER", "ROLE_ADMIN"],
        onEnter: function() {
            let dfd = jQuery.Deferred(); // jshint ignore:line
            setTimeout(() => {
                document.title = "MyFolders | Living Documents";
                dfd.resolve();
            }, 100);
            return dfd.promise();
        }
    },
    getInitialState: function() {
        let clientWidthHeight = this.setWindowSize();
        return {
            count: 0,
            width: clientWidthHeight[0],
            height: clientWidthHeight[1]
        };
    },
    handleResize(e) {
        let clientWidthHeight = this.setWindowSize();
        this.setState({
            width: clientWidthHeight[0],
            height: clientWidthHeight[1]
        });
    },
    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    },
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
    setWindowSize() {
        let clientWidthHeight = [];
        if (typeof (window.innerWidth) === "number") {
            clientWidthHeight[0] = window.innerWidth;
            clientWidthHeight[1] = window.innerHeight;
        } else {
            if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                clientWidthHeight[0] = document.documentElement.clientWidth;
                clientWidthHeight[1] = document.documentElement.clientHeight;
            } else {
                if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                    clientWidthHeight[0] = document.body.clientWidth;
                    clientWidthHeight[1] = document.body.clientHeight;
                }
            }
        }
        return clientWidthHeight;
    },
    render: function() {
        let explorerHeight = this.state.height;
        let divStyle = {
            height: explorerHeight - 71 - 10 - 200 + "px"
        };
        let minSize = (this.state.width-14)*0.20;
        return (
            <div className="explorer">
                <Grid fluid>
                    <Row className="show-grid">
                        <Col lg={12} style={divStyle}>
                            <ExplorerTopBar />
                            <SplitPane split="vertical" minSize={minSize} defaultSize={minSize}>
                                <div><TreeFolderExplorer /></div>
                                <div></div>
                            </SplitPane>
                        </Col>
                    </Row>
                </Grid>

            </div>
        );
    }
});

module.exports = Explorer;