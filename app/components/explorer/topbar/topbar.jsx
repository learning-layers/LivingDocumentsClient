"use strict";

import React from "react";

let ExplorerTopBar = React.createClass({
    render() {
        return (
            <div className="breadcrumb-search-wrapper">
                <div className="breadcrumbs-bar">
                    <div className="lbl"><a>Hierarchy:&nbsp;</a></div>
                    <ol className="breadcrumb">
                    </ol>
                    <div className="clearfix"></div>
                </div>
                <div className="search-bar">
                    <div className="lbl"><a>Search:&nbsp;</a></div>
                    <input type="search" placeholder="Search for folders, documents, tags, ...">
                        <a role="button">
                            <span className="glyphicon glyphicon-search"></span>
                        </a>
                    </input>
                </div>
            </div>
        );
    }
});

module.exports = ExplorerTopBar;