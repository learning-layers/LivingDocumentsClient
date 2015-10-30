"use strict";

import React from "react";
import jQuery from "jquery";
import DocumentActions from "../../reflux/document/documentActions";
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;

const CreateDiscussionModal = React.createClass({
    getInitialState() {
        return {
            showModal: true,
            documentTitle: "",
            documentCreationInProgress: false
        };
    },
    close() {
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },
    changeDocumentTitleHandler(event) {
        this.setState({documentTitle: event.target.value});
    },
    submit() {
        this.setState({
            documentCreationInProgress: true
        });
        let newDiscussion = {
            document: {
                title: this.state.documentTitle,
                description: ""
            },
            sectionText: null
        };
        jQuery.post(global.config.endpoint + "/api/documents/" + this.props.documentId + "/discuss/section", JSON.stringify(newDiscussion)).then((data) => {
            //DocumentActions.newDocumentCreated(data);
            this.close();
            this.setState({
                documentCreationInProgress: false
            });
        });
    },
    render() {
        let documentTitle = this.state.documentTitle;
        let documentCreationInProgress = this.state.documentCreationInProgress;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="create-discussion-modal-instance">
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new document</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Input ref="documentTitle" type='text' value={documentTitle} onChange={this.changeDocumentTitleHandler} label='Document title' placeholder='Enter document title' />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                        <ButtonInput type='submit' value='Submit Button' disabled={!documentTitle || documentCreationInProgress} onClick={this.submit}>create</ButtonInput>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default CreateDiscussionModal;
