"use strict";

import React from "react";
import jQuery from "jquery";
import CommentActions from "../../../reflux/comment/commentActions";
import ReactQuill from "react-quill";
import SSSCommentActions from "../../../reflux/sssComment/sssCommentActions2";
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let Tabs = require("react-bootstrap").Tabs;
let Tab = require("react-bootstrap").Tab;
let ReactTags = require("react-tag-input").WithContext;

const SSSCreateDiscussionModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            label: "",
            commentCreationInProgress: false,
            documentId: null,
            description: "&lt;Description&gt;",
            suggestions: [],
            tags: [],
            disc: null
        };
    },
    close() {
        this.setState({ showModal: false });
    },
    open(documentId, disc) {
        let description = "&lt;Description&gt;";
        if (disc !== null) {
            description = "&lt;Comment&gt;";
        }
        this.setState({
            showModal: true,
            documentId: documentId,
            label: "",
            description: description,
            suggestions: [],
            tags: [],
            disc: disc
        });
    },
    changeCommentHandler(event) {
        this.setState({label: event.target.value});
    },
    submit() {
        this.setState({
            commentCreationInProgress: true
        });
        if (this.state.description === "&lt;Description&gt;") {
            this.state.description = "";
        }
        let tagList = [];
        this.state.tags.forEach((tag) => {
            tagList.push(tag.text);
        });

        if (this.state.disc === null) {
            let newDiscussion = {
                description: this.state.description,
                label: this.state.label,
                tags: tagList
            };
            jQuery.post(
                global.config.endpoint + "/api/discussions/document/" + this.state.documentId + "/discussion",
                JSON.stringify(newDiscussion)
            ).then((data) => {
                    this.close();
                    this.setState({
                        commentCreationInProgress: false,
                        description: ""
                    });
                    SSSCommentActions.refresh();
                }, (error)=> {
                    if (error.status === 200) {
                        this.close();
                        this.setState({
                            commentCreationInProgress: false,
                            description: ""
                        });
                        SSSCommentActions.refresh();
                    } else {
                        this.setState({
                            commentCreationInProgress: false
                        });
                    }
                });
        } else {
            let newEntry = {
                disc: this.state.disc.id,
                entry: this.state.description,
                tags: tagList
            };
            jQuery.post(
                global.config.endpoint + "/api/discussions/discussion/comment",
                JSON.stringify(newEntry)
            ).then((data) => {
                this.close();
                this.setState({
                    commentCreationInProgress: false,
                    description: ""
                });
                SSSCommentActions.refresh(this.state.disc, true);
            },(error)=>{
                if (error.status === 200) {
                    this.close();
                    this.setState({
                        commentCreationInProgress: false,
                        description: ""
                    });
                    SSSCommentActions.refresh(this.state.disc, true);
                } else {
                    this.setState({
                        commentCreationInProgress: false
                    });
                }
            });
        }
    },
    descriptionEditHandler(value) {
        this.state.description = value;
    },
    onFocusEditor() {
        window.alert("hello");
    },
    handleTagAddition(tag) {
        var tags = this.state.tags;
        tags.push({
            id: tags.length + 1,
            text: tag
        });
        this.setState({tags: tags});
    },
    handleTagDelete(i) {
        var tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
    },
    handleTagDrag(tag, currPos, newPos) {
        var tags = this.state.tags;

        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);

        // re-render
        this.setState({ tags: tags });
    },
    render() {
        let title = "";
        if (this.state.disc === null) {
            if (this.state.label === "") {
                title = "Create a new discussion";
            } else {
                title = "Create discussion '" + this.state.label + "'";
            }
        } else {
            title = "Create a comment for discussion '" + this.state.disc.label + "'";
        }
        let commentCreationInProgress = this.state.commentCreationInProgress;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="create-sss-discussion-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs className="modal-tabs" defaultActiveKey={1}>
                            <Tab eventKey={1} title={this.state.disc === null ? "Discussion" : "Comment"}>
                                <form>
                                    {this.state.disc === null ? <Input ref="comment" type="text" value={this.state.label} onChange={this.changeCommentHandler} placeholder="Discussion title" /> : null}
                                    <ReactQuill theme="snow" value={this.state.description} onChange={this.descriptionEditHandler} onFocus={this.onFocusEditor} />
                                </form>
                            </Tab>
                            <Tab eventKey={2} title="Tags">
                                <ReactTags tags={this.state.tags}
                                           suggestions={this.state.suggestions}
                                           handleDelete={this.handleTagDelete}
                                           handleAddition={this.handleTagAddition}
                                           handleDrag={this.handleTagDrag} />
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonInput type="submit" value="Submit Button" disabled={(this.state.label === "" && this.state.disc === null) || commentCreationInProgress} onClick={this.submit}>create</ButtonInput>
                        <ButtonInput onClick={this.close}>Close</ButtonInput>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default SSSCreateDiscussionModal;