"use strict";

import React from "react";
import ReactIntl from "../../../../node_modules/react-intl";
import UserStore from "../../../reflux/user/userStore";
import avatarPlaceholder from "../../../assets/img/Portrait_placeholder.png";
import jQuery from "jquery";

let Button = require("react-bootstrap").Button;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let Collapse = require("react-bootstrap").Collapse;
let Well = require("react-bootstrap").Well;
let FormattedRelative = ReactIntl.FormattedRelative;
let Reflux = require("reflux");

let icons = [];
icons["entity"] = require("../../../assets/img/discussion-tool/icons/entity.png");
icons["evernoteNote"] = require("../../../assets/img/discussion-tool/icons/evernoteNote.png");
icons["evernoteNotebook"] = require("../../../assets/img/discussion-tool/icons/evernoteNotebook.png");
icons["evernoteResource"] = require("../../../assets/img/discussion-tool/icons/evernoteResource.png");
icons["file"] = require("../../../assets/img/discussion-tool/icons/file.png");
icons["fileDoc"] = require("../../../assets/img/discussion-tool/icons/fileDoc.png");
icons["filePdf"] = require("../../../assets/img/discussion-tool/icons/filePdf.png");
icons["image"] = require("../../../assets/img/discussion-tool/icons/image.png");
icons["fileImage"] = require("../../../assets/img/discussion-tool/icons/image.png");
icons["placeholder"] = require("../../../assets/img/discussion-tool/icons/placeholder.png");
icons["presentation"] = require("../../../assets/img/discussion-tool/icons/presentation.png");
icons["spreadsheet"] = require("../../../assets/img/discussion-tool/icons/spreadsheet.png");
icons["unknown"] = require("../../../assets/img/discussion-tool/icons/unknown.png");

let SSSAttachmentItem = React.createClass({
    getInitialState() {
        return {
            open: false,
            preparedDownloadUrl: null
        };
    },
    getFileIcon(fileIconString, attachedEntity) {
        let fileIcon = "";
        if (attachedEntity.type === "evernoteNote") {
            fileIcon = icons["evernoteNote"];
        } else if (attachedEntity.type === "evernoteNotebook") {
            fileIcon = icons["evernoteNotebook"];
        } else {
            fileIcon = icons[fileIconString];
            if (fileIcon === undefined) {
                fileIcon = icons["unknown"];
            }
        }
        return fileIcon;
    },
    downloadFile(attachedEntity, event) {
        let fileEntityId = encodeURIComponent(encodeURIComponent(attachedEntity.file.id));
        var openedWindow = window.open();
        jQuery.get(global.config.endpoint + "/api/discussions/fileEntity/" + fileEntityId + "/download").then((url) => {
            openedWindow.location.replace(url);
        }, (error) => {
            openedWindow.close();
        });
    },
    render(){
        let fileIconString = "";
        if (this.props.attachedEntity.file) {
            fileIconString = this.props.attachedEntity.file.fileIcon;
        }
        let fileIcon = this.getFileIcon(fileIconString, this.props.attachedEntity);
        return (
            <div className="inner-item" onClick={this.downloadFile.bind(this, this.props.attachedEntity)}>
                {this.props.attachedEntity.file && this.props.attachedEntity.file.fileIcon ? <img className="attachment-img" src={fileIcon} /> : null }
                {this.props.attachedEntity.label}
            </div>
        );
    }
});

export default SSSAttachmentItem;