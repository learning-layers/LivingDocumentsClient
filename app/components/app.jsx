"use strict";

import React from "react";
import ReactRouter from "react-router";
import Header from "./header/header.jsx";
import ReactIntl from "../../node_modules/react-intl";
import CreateDocumentModal from "./document/createDocumentModal.jsx";
import I18N from "../util/i18nUtils.js";
let IntlMixin = ReactIntl.IntlMixin;

let App = React.createClass({
    mixins: [IntlMixin],
    getInitialState() {
        return {};
    },
    getDefaultProps: function() {
        return {
            someTimestamp: 1409939308585,
            locales: ["en"],
            formats: {
                date: {
                    "time-style": {
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric"
                    }
                },
                number: {
                    eur: { style: "currency", currency: "EUR" },
                    usd: { style: "currency", currency: "USD" }
                }
            }
        };
    },
    render: function() {
        return (
            <div>
                <div id="headerContainer">
                    <Header formats={I18N.formats} messages={I18N.messages} locales={I18N.locales} />
                </div>
                <div id="mainContainer">
                    <ReactRouter.RouteHandler formats={I18N.formats} messages={I18N.messages} locales={I18N.locales} />
                </div>

            </div>
        );
    }
});

/*{this.formatMessage(this.getIntlMessage("SHORT"), {
 product: "apples",
 price: 2000.15,
 deadline: new Date(),
 timeZone: "UTC"
 })}*/

module.exports = App;