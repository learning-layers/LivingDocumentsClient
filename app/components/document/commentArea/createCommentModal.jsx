"use strict";

import React from "react";
import jQuery from "jquery";
import CommentActions from "../../../reflux/comment/commentActions";
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;

const CreateCommentModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            comment: "",
            commentCreationInProgress: false,
            documentId: null
        };
    },
    close() {
        this.setState({ showModal: false });
    },
    open(documentId) {
        this.setState({
            showModal: true,
            documentId: documentId,
            comment: ""
        });
    },
    changeCommentHandler(event) {
        this.setState({comment: event.target.value});
    },
    submit() {
        this.setState({
            commentCreationInProgress: true
        });
        let newComment = {
            text: this.state.comment
        };
        jQuery.post(
            global.config.endpoint + "/api/documents/"+ this.state.documentId +"/comment",
            JSON.stringify(newComment)
        ).then((data) => {
            CommentActions.newCommentCreated(data);
            this.close();
            this.setState({
                commentCreationInProgress: false,
                comment: ""
            });
        },()=>{
            this.setState({
                commentCreationInProgress: false
            });
        });
    },
    render() {
        let comment = this.state.comment;
        let commentCreationInProgress = this.state.commentCreationInProgress;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="create-document-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new comment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Input ref="comment" type="textarea" value={comment} onChange={this.changeCommentHandler} label="New Comment" placeholder="Enter new comment" />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                        <ButtonInput type="submit" value="Submit Button" disabled={!comment || commentCreationInProgress} onClick={this.submit}>create</ButtonInput>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default CreateCommentModal;