"use strict";

import React from "react";
import jQuery from "jquery";
import Main from "../../../main.jsx";
import AppActions from "../../../reflux/app/appActions";
import ReactIntl from "../../../../node_modules/react-intl";
let TagActions = require("../../../reflux/app/tag/tagActions");
let Reflux = require("reflux");
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let IntlMixin = ReactIntl.IntlMixin;

const CreateTagModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            tagCreationInProgress: false,
            tagName: null,
            tagDescription: null,
            tagId: null,
            parentId: null
        };
    },
    close() {
        this.setState({
            showModal: false
        });
    },
    open(currentParent) {
        this.setState({
            showModal: true,
            parentId: currentParent.id
        });
    },
    changeTagNameHandler(event) {
        this.setState({
            tagName: event.target.value
        });
    },
    changeTagDescriptionHandler(event) {
        this.setState({
            tagDescription: event.target.value
        });
    },
    searchFor() {

    },
    submit() {
        let tag = {
            name: this.state.tagName,
            description: this.state.tagDescription
        };

        this.setState({
            tagCreationInProgress: true
        });

        // TODO check if tag already exists in database: GET /api/tags

        // add tag to database
        jQuery.post(global.config.endpoint + "/api/tags", JSON.stringify(tag)).then((data) => {
            this.close();
            this.setState({
                tagCreationInProgress: false,
                showModal: false,
                tagId: data.id
            });
            TagActions.addTag(data, this.state.parentId);
        });
    },
    render() {

        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="create-tag-modal-instance">
                    <Modal.Header closeButton>
                        <Modal.Title>Create tag</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Input onChange={this.changeTagNameHandler} ref="tagNameInput" type='text' label='Tag Name' placeholder="Enter new tag name" onKeyUp={this.searchFor} />
                            <Input onChange={this.changeTagDescriptionHandler} ref="tagDescriptionInput" type='textarea' label='Tag Description' placeholder="Enter new tag description" />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonInput ref="closeBtn" className="footer-btn" type='reset' value='Cancel' onClick={this.close} />
                        <ButtonInput ref="addTagBtn"
                                     className="footer-btn"
                                     type='submit' value='Create and Add' onClick={this.submit} disabled="" />
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default CreateTagModal;