"use strict";

import React from "react";

let Breadcrumbs  = React.createClass({
    render: function() {
        let breadcrumbs = null;
        breadcrumbs = this.props.breadcrumbs.map(function (breadcrumb) {
            let activeClass = breadcrumb.current ? "active" : "";
            return (
                <li key={breadcrumb.documentId}>
                    <a href={"#/document/" + breadcrumb.documentId} className={activeClass}>{breadcrumb.documentTitle}</a>
                </li>
            );
        });
        if (breadcrumbs !== null) {
            breadcrumbs = breadcrumbs.reverse();
        }
        return (
            <div className="breadcrumbs-bar">
                <div className="lbl"><a>Hierarchy:&nbsp;</a></div>
                <ol className="breadcrumb">
                    {breadcrumbs}
                </ol>
                <div className="clearfix"></div>
            </div>
        );
    }
});

export default Breadcrumbs;