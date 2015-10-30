"use strict";

import React from "react";
let Reflux = require("reflux");
import ReactRouter from "react-router";
let State = ReactRouter.State;
import AuthStore from "../../reflux/auth/authStore";
import AuthActions from "../../reflux/auth/authActions";
import "./connectionIndicator.less";
import Alert from "react-bootstrap/lib/Alert";

let ConnectionIndicator = React.createClass({
    mixins: [Reflux.connect(AuthStore, "auth"), State],
    getInitialState: function () {
        return {
        };
    },
    render: function () {
        return (
            <div id="connection-indicator">
                {!this.state.auth.isConnected ? <span className="glyphicon glyphicon-flash"></span> : null}
                {!this.state.auth.isLoggedIn ? "Not authenticated" : null}
                <Alert bsStyle='warning'>
                    <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
                </Alert>
            </div>
        );
    }
});

export default ConnectionIndicator;