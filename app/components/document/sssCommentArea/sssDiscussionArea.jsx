"use strict";

import React from "react";
import jQuery from "jquery";
import ReactIntl from "../../../../node_modules/react-intl";
import SSSEntry from "./sssEntry.jsx";
import UserStore from "../../../reflux/user/userStore";
import avatarPlaceholder from "../../../assets/img/Portrait_placeholder.png";
import ReactQuill from "react-quill";
import SSSAttachmentItem from "./sssAttachmentItem.jsx";

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

let SSSDiscussionArea = React.createClass({
    mixins: [Reflux.connect(UserStore, "user")],
    getInitialState() {
        return {
            open: false,
            currentDiscussion: this.props.discussion,
            editMode: false
        };
    },
    createDiscussionDescription(description) {
        return {__html: description};
    },
    descriptionEditHandler(value) {

    },
    triggerEditMode() {
        this.setState({
            editMode: !this.state.editMode
        });
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
    render(){
        let createdAt = new Date(this.props.discussion.creationTime.substring(0, 10)*1000);
        return (
            <div className={"sss-discussion ld-panel outer-comment comment-" + this.props.discussion.id}>
                <div className="userInfo">
                    <div className="avatar-img">
                        <img className="img-responsive img-circle" src={avatarPlaceholder} />
                    </div>
                    <div className="comment-header">
                        <div className="comment-metadata">
                            <h4 className="username">{this.props.discussion.author.label}</h4>
                            <div className="created-at"><FormattedRelative value={createdAt} /></div>
                        </div>
                        <div className="comment-options">
                            <div className="clearfix"></div>
                            {this.props.discussion.author.email === this.state.user.currentUser.email ? <Button className="btn-sm edit-button" onClick={this.triggerEditMode}>
                                <span className="glyphicon glyphicon-pencil"></span>
                                &nbsp;Edit
                            </Button>: null}
                        </div>
                    </div>
                    <div className="clearfix"></div>
                </div>
                <div className="comment-text">
                    {!this.state.editMode ? <div className="sss-discussion-title">
                        {this.props.discussion.label}
                    </div>: null }
                    {this.state.editMode ? <Input type="text" placeholder="Enter discussion title" className="sss-discussion-title" value={this.props.discussion.label} /> : null }
                    {!this.state.editMode ? <div className="sss-discussion-description"
                         dangerouslySetInnerHTML={this.createDiscussionDescription(this.props.discussion.description)} /> : null}
                    {this.state.editMode ?
                        <div className="edit-area">
                            <ReactQuill theme="snow" value={this.state.currentDiscussion.description} onChange={this.descriptionEditHandler}/>
                            <Button className="btn-sm btn-primary pull-right" style={{color: "white"}} onClick={this.triggerEditMode}>
                                Save
                            </Button>
                            <Button className="btn-sm pull-right" onClick={this.triggerEditMode}>
                                Cancel
                            </Button>
                            <div className="clearfix"></div>
                        </div>
                    : null}
                </div>
                {this.props.discussion.attachedEntities.length > 0 ? <ul className="attachment-area">
                    {this.props.discussion.attachedEntities.map((attachedEntity) => {
                        return (
                            <li key={"ae-" + attachedEntity.id + "-disc-" + this.props.discussion.id}>
                                <SSSAttachmentItem attachedEntity={attachedEntity}/>
                            </li>
                        );
                    })}
                </ul> : null}
                {this.props.discussion.tags.length > 0 ? <ul className="tags-area">
                    {this.props.discussion.tags.map((tag) => {
                        return (
                            <li key={"tag-" + tag.id + "-disc-" + this.props.discussion.id}>
                                <span className="badge">{tag.label}</span>
                            </li>
                        );
                    })}
                </ul> : null}
                {this.props.discussion.entries.length > 0 ? <div className="subcomments-panel">
                    <Well>
                        {this.props.discussion.entries.map((entry) => {
                            return (
                                <SSSEntry key={"entry-" + entry.id} entry={entry} />
                            );
                        })}
                    </Well>
                </div> : null}
            </div>
        );
    }
});

export default SSSDiscussionArea;