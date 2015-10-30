"use strict";

import React from "react";
import AuthStore from "../../reflux/auth/authStore";
import AuthActions from "../../reflux/auth/authActions";
import RefreshStore from "../../reflux/refreshData/refreshStore";
import ReactRouter from "react-router";
import jQuery from "jquery";
import swal from "sweetalert";
import ReactIntl from "../../../node_modules/react-intl";
import HomeModel from "./homeModel.js";
import Main from "../../main.jsx";
import UserStore from "../../reflux/user/userStore";
import HomeViewActions from "../../reflux/views/home/homeViewActions";
import OptionsComponent from "./optionsComponent.jsx";
let Reflux = require("reflux");
let Button = require("react-bootstrap").Button;
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;
let GriddleWithCallback = require("../../custom-libs/griddle/GriddleWithCallback.jsx");
let IntlMixin         = ReactIntl.IntlMixin;
let FormattedRelative = ReactIntl.FormattedRelative;

let Loading = React.createClass({
    getDefaultProps: function(){
        return {
            loadingText: "Loading"
        };
    },
    render: function(){
        let loadingStyle = {
            textAlign: "center",
            paddingBottom: "40px"
        };

        return <div className="loading container" style={loadingStyle}>{this.props.loadingText}</div>;
    }
});

let DateComponent = React.createClass({
    getInitialState() {
        return {
        };
    },
    render: function() {
        let date = this.props.data;
        return (
            <div>
            {date !== null ? <FormattedRelative value={date} />: null}
            </div>
        );
    }
});

let columnMeta = [
    {
        "columnName": "title",
        "order": 1,
        "locked": false,
        "visible": true,
        "displayName": "Document title"
    },
    {
        "columnName": "creator.username",
        "order": 2,
        "locked": false,
        "visible": true,
        "displayName": "Author"
    },
    {
        "columnName": "modifiedAt",
        "order": 3,
        "locked": false,
        "visible": true,
        "customComponent": DateComponent
    },
    {
        "columnName": "id",
        "order": 4,
        "locked": false,
        "visible": true,
        "displayName": "Options",
        "customComponent": OptionsComponent
    }
];

let Home = React.createClass({
    mixins: [
        Reflux.connect(UserStore, "user"),
        Reflux.connect(RefreshStore, "refresh"),
        ReactRouter.State
    ],
    statics: {
        rolesAllowed: ["ROLE_USER", "ROLE_ADMIN"],
        onEnter(currentParams, currentQuery) {
            let dfd = jQuery.Deferred(); // jshint ignore:line
            setTimeout(() => {
                document.title = "Home | Living Documents";
                dfd.resolve();
            }, 100);
            return dfd.promise();
        }
    },
    getInitialState: function() {
        let clientWidthHeight = this.setWindowSize();
        return {
            width: clientWidthHeight[0],
            height: clientWidthHeight[1]
        };
    },
    handleClick(row) {
        let item = row.props.data;
        console.debug("Clicked item=");
        console.debug(item);
        Main.getRouter().then(function(router) {
            router.transitionTo("/document/" + item.id, {}, {});
        });
    },
    handleResize(e) {
        let clientWidthHeight = this.setWindowSize();
        this.setState({
            width: clientWidthHeight[0],
            height: clientWidthHeight[1]
        });
    },
    componentDidMount() {
        HomeViewActions.newHomeView(this);
        window.addEventListener("resize", this.handleResize);
    },
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
    getDocumentTable() {
        if (this.refs.documentTable) {
            return this.refs.documentTable;
        } else {
            return null;
        }        
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
        if (this.state.user.currentUser === null) {
            return <div className="home"></div>;
        }
        let tableHeight = this.state.height - 150;
        let divStyle = {
            height: tableHeight + "px"
        };
        return (
            <div className="home">
                <Grid fluid>
                    <Row className="show-grid">
                        <Col lg={12}>
                            <div style={divStyle}>
                                <GriddleWithCallback ref="documentTable" onRowClick={this.handleClick}
                                                     getExternalResults={HomeModel.externalDataMethod} loadingComponent={Loading}
                                                     enableInfiniteScroll={true} useFixedHeader={true}
                                                     bodyHeight={tableHeight} columnMetadata={columnMeta} columns={["title", "creator.username", "modifiedAt", "id"]}/>;
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
});

module.exports = Home;