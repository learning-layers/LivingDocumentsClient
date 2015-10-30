"use strict";

import React from "react";

let Relogin = React.createClass({
    render: function () {
        return (
            <div className="relogin">
                Relogin route page
                <a href={global.config.endpoint + "/openid_connect_login?identifier=https%3A%2F%2Fapi.learning-layers.eu%2Fo%2Foauth2%2F"}>
                    Login
                </a>
            </div>
        );
    }
});

export default Relogin;