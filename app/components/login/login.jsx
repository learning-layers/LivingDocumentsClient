"use strict";

import React from "react";

let Reflux = require("reflux");
import ReactRouter from "react-router";
let State = ReactRouter.State;
import AuthStore from "../../reflux/auth/authStore";
let Button = require("react-bootstrap").Button;
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;
import AuthActions from "../../reflux/auth/authActions";
import jQuery from "jquery";

import llLogo from "../../assets/img/layers/layers-large-transparent-500.png";

let Login = React.createClass({
    mixins: [Reflux.connect(AuthStore, "auth"), State],
    statics: {
        onEnter: function() {
            let dfd = jQuery.Deferred(); // jshint ignore:line
            setTimeout(() => {
                document.title = "Login | Living Documents";
                if (AuthStore.loggedIn()) {
                    dfd.reject();
                } else {
                    dfd.resolve();
                }
            }, 100);
            return dfd.promise();
        }
    },
    getInitialState: function() {
        return { count: 0 };
    },
    handleClick: function() {
        this.setState({count: this.state.count + 1});
    },
    render: function() {
        let isLoggedIn = this.state.auth.loggedIn;
        return (
            <div className="login">
                <Grid fluid>
                    <Row className="show-grid">
                        <Col lg={12}>
                            <h2 className="letterpress-effect">Living Documents</h2>
                            <div className="center-logo">
                                <img src={llLogo} />
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
});

module.exports = Login;