"use strict";

import React from "react";
import FileUploadArea from "../fileUploadArea.jsx";
import swal from "sweetalert";
import ReactIntl from "../../../../../node_modules/react-intl";
import FileAttachmentModel from "./fileAttachmentModel.js";
let Button = require("react-bootstrap").Button;
let ButtonToolbar = require("react-bootstrap").ButtonToolbar;
let Badge = require("react-bootstrap").Badge;
let GriddleWithCallback = require("../../../../custom-libs/griddle/GriddleWithCallback.jsx");
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

let OptionsComponent = React.createClass({
    deleteAttachment(documentId, e) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this document!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            console.log("Deleting document with id=" + documentId);
            swal("Deleted!", "Document <title> has been deleted!", "success"); // TODO add title here
        });
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    },
    render: function() {
        let attachmentId = this.props.data;
        let documentWrapper = FileAttachmentModel.getDocumentWrapper();
        return (
            <div className="attachment-options">
                <Button onClick={this.deleteAttachment.bind(this, attachmentId)}>Delete</Button>
                <Button href={global.config.endpoint + "/api/documents/" + documentWrapper.documentId + "/download/" + attachmentId}>Download</Button>
            </div>
        );
    }
});

let columnMeta = [
    {
        "columnName": "name",
        "order": 1,
        "locked": false,
        "visible": true,
        "displayName": "File name"
    },
    {
        "columnName": "creator.username",
        "order": 2,
        "locked": false,
        "visible": true,
        "displayName": "uploaded by"
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

let FileAttachments = React.createClass({
    getInitialState() {
        FileAttachmentModel.setDocumentId(this.props.document.id);
        return {
            uploadAreaOpened: false
        };
    },
    componentWillReceiveProps(nextProps) {
        FileAttachmentModel.setDocumentId(nextProps.document.id);
    },
    toggleUploadArea() {
        this.setState({
            uploadAreaOpened: !this.state.uploadAreaOpened
        });
    },
    render() {
        return (
            <div id="file-attachments">
                <div className="uploaded-files">
                    <GriddleWithCallback onRowClick={this.handleClick}
                                         getExternalResults={FileAttachmentModel.externalDataMethod} loadingComponent={Loading}
                                         enableInfiniteScroll={true} useFixedHeader={true}
                                         bodyHeight={287} columnMetadata={columnMeta} columns={["name", "creator.username", "modifiedAt", "id"]}/>
                </div>
                <div className="uploading-panel">
                    {this.state.uploadAreaOpened ? <div className="upload-area">
                        <FileUploadArea document={this.props.document} />
                    </div> : null}
                    <div className={!this.state.uploadAreaOpened ? "open-close-wrapper": "open-close-wrapper open"}>
                        <Button bsStyle="primary" className="upload-new-file-btn" onClick={this.toggleUploadArea}>
                            {!this.state.uploadAreaOpened ? "Upload new file": "Close upload area"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileAttachments;