"use strict";

import React from "react";
import jQuery from "jquery";
import DocumentActions from "../../reflux/document/documentActions";
import DiscussionActions from "../../reflux/discussion/discussionActions";
import DiscussionStore from "../../reflux/discussion/discussionStore.jsx";
import Main from "../../main.jsx";
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;

const CreateDocumentModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            documentTitle: "",
            documentCreationInProgress: false
        };
    },
    close() {
        this.setState({ showModal: false });
    },
    open(selection) {
        this.setState({ showModal: true, selection: selection });
    },
    changeDocumentTitleHandler(event) {
        this.setState({documentTitle: event.target.value});
    },
    submit() {
        this.setState({
            documentCreationInProgress: true
        });
        let newDocument = {
            title: this.state.documentTitle,
            description: ""
        };
        if (this.state.selection === undefined) {
            jQuery.post(global.config.endpoint + "/api/documents", JSON.stringify(newDocument)).then((data) => {
                DocumentActions.newDocumentCreated(data);
                this.close();
                Main.getRouter().then(function (router) {
                    router.transitionTo("/document/" + data.id, {}, {});
                });
                this.setState({
                    documentCreationInProgress: false
                });
            }, () => {
                this.setState({
                    documentCreationInProgress: false
                });
            });
        } else {
            let newDiscussion = {
                document: newDocument,
                sectionText: this.state.selection.currentSelection.htmlContent
            };
            jQuery.post(global.config.endpoint + "/api/documents/" + this.state.selection.document.id + "/discuss/section", JSON.stringify(newDiscussion)).then((data) => {
                //DocumentActions.newDocumentCreated(data);
                this.close();
                Main.getRouter().then(function (router) {
                    router.transitionTo("/document/" + data.id, {}, {});
                });
                DiscussionActions.discussionCreated();
                this.setState({
                    documentCreationInProgress: false
                });
            }, () => {
                this.setState({
                    documentCreationInProgress: false
                });
            });
        }

    },
    render() {
        let documentTitle = this.state.documentTitle;
        let documentCreationInProgress = this.state.documentCreationInProgress;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="create-document-modal">
                    <Modal.Header closeButton>
                        {this.state.selection === undefined ? <Modal.Title>Create a new document</Modal.Title> : <Modal.Title>Create a new conversation</Modal.Title>}
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Input ref="documentTitle" type='text' value={documentTitle} onChange={this.changeDocumentTitleHandler}
                                   label={this.state.selection === undefined ? "Document title" : "Conversation title"}
                                   placeholder={this.state.selection === undefined ? "Enter document title" : "Enter conversation title"} />
                        </form>
                        {this.state.selection !== undefined ? <div>
                            <label className="from-control" for="selected-paragraph">Selected paragraph for this conversation:</label>
                            <div id="selected-paragraph" className="selection-to-discuss"
                                    dangerouslySetInnerHTML={{__html: this.state.selection.currentSelection.htmlContent}} />
                        </div>: null}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                        <ButtonInput type="submit" value="Submit Button"
                                     disabled={!documentTitle || documentCreationInProgress} onClick={this.submit}>create</ButtonInput>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default CreateDocumentModal;