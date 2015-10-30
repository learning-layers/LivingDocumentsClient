"use strict";

import React from "react";
import ContentEditor from "./contentEditor.jsx";
import FileAttachments from "./fileAttachments/fileAttachments.jsx";
import MediaAttachments from "./mediaAttachments/mediaAttachments.jsx";
let Button = require("react-bootstrap").Button;
let ButtonToolbar = require("react-bootstrap").ButtonToolbar;
let Badge = require("react-bootstrap").Badge;

let filterImageAttachments = (imageAttachment) => {
    let imageMimeType = [
        "image/cis-cod",
        "image/cmu-raster",
        "image/fif",
        "image/gif",
        "image/ief",
        "image/jpeg",
        "image/png",
        "image/tiff",
        "image/vasa",
        "image/vnd.wap.wbmp",
        "image/x-freehand",
        "image/x-icon",
        "image/x-portable-anymap",
        "image/x-portable-bitmap",
        "image/x-portable-graymap",
        "image/x-portable-pixmap",
        "image/x-rgb",
        "image/x-windowdump",
        "image/x-xbitmap",
        "image/x-xpixmap"
    ];
    return (imageMimeType.indexOf(imageAttachment.mimeType) !== -1);
};
let filterNonImageAttachments = (attachment) => {
    return !filterImageAttachments(attachment);
};

let MainContent = React.createClass({
    getInitialState() {
        return {
            attachmentsBarOpened: false,
            activeAttachmentTab: "contentEditor"
        };
    },
    componentWillReceiveProps(nextProps) {
        if (this.props.document && this.props.document.id !== nextProps.document.id) {
            this.setState({});
        }
    },
    setAttachmentTabActive(tabName) {
        this.setState({
            activeAttachmentTab: tabName
        });
    },
    render() {
        var fileAttachments = 0;
        var mediaAttachments = 0;
        if (this.props.document.attachments !== null) {
            this.props.document.attachments.forEach((fileAttachment) => {
                if (!filterImageAttachments(fileAttachment)) {
                    fileAttachments++;
                } else {
                    mediaAttachments++;
                }
            });
        } else {
            fileAttachments = this.props.document.fileAttachmentCount;
            mediaAttachments = this.props.document.mediaAttachmentCount;
        }
        return (
            <div className="ld-panel">
                <div className="ld-panel-header">
                    <h4 className="document-title">{this.props.document.title}</h4>
                </div>
                <div className="ld-panel-content">
                    <div className="attachments-bar">
                        <ul className="attachment-bar-icons">
                            <li className={"" + (this.state.activeAttachmentTab === "contentEditor" ? "active" : "")}
                                onClick={this.setAttachmentTabActive.bind(this, "contentEditor")}>
                                <div className="icon-wrapper edit-main-content"><span className="glyphicon glyphicon-pencil"></span></div>
                            </li>
                            <li className={"" + (this.state.activeAttachmentTab === "files" ? "active" : "")}
                                onClick={this.setAttachmentTabActive.bind(this, "files")}>
                                <div className="icon-wrapper"><span className="glyphicon glyphicon-file"></span></div>
                                <div className="badge-wrapper"><Badge>{fileAttachments}</Badge></div>
                            </li>
                            <li className={"" + (this.state.activeAttachmentTab === "media" ? "active" : "")}
                                onClick={this.setAttachmentTabActive.bind(this, "media")}>
                                <div className="icon-wrapper"><span className="glyphicon glyphicon-picture"></span></div>
                                <div className="badge-wrapper"><Badge>{mediaAttachments}</Badge></div>
                            </li>
                        </ul>
                    </div>
                    <div className="content">
                        <ContentEditor className={this.state.activeAttachmentTab === "contentEditor" ? "block" : "hidden"} etherpadURI={this.props.etherpadURI} document={this.props.document} />
                        {this.state.activeAttachmentTab === "files" ? <FileAttachments document={this.props.document} /> : null}
                        {this.state.activeAttachmentTab === "media" ? <MediaAttachments document={this.props.document} /> : null}
                    </div>
                </div>
            </div>
        );
    }
});

export default MainContent;