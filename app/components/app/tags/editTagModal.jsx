"use strict";

import React from "react";
import jQuery from "jquery";
import DocumentActions from "../../../reflux/document/documentActions";
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

const EditTagModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            tagName: null,
            tag: null,
            editActionInProgress: false,
            parentId: null
        };
    },
    componentWillReceiveProps(nextProps) {
    },
    close() {
        this.setState({ showModal: false });
    },
    open(tag, currentParent) {
        this.setState({
            showModal: true,
            tag: tag,
            tagName: tag.name,
            parentId: currentParent.id
        });
    },
    changeTagName(event) {
        this.state.tagName = event.target.value;
        this.setState({});
    },
    editSubmit() {
        this.setState({
            editActionInProgress: true
        });
        TagActions.editTag(
            this.state.tag.id,
            this.refs.tagNameInput.value
        );
        setTimeout(() => {
            this.setState({
                editActionInProgress: false
            });
        }, 500);
    },
    deleteTag() {
        TagActions.deleteTag(this.state.tag, this.state.parentId);
        this.close();
    },
    render() {
        if (this.state.tag === null) {
            return (
                <div>
                    <Modal show={this.state.showContextMenu} onHide={this.close}>
                    </Modal>
                </div>
            );
        }
        return (
            <div>
                <Modal show={this.state.showContextMenu} onHide={this.close} id="edit-tag-modal-instance">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit tag</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Input ref="tagNameInput" type='text' label='Tag name' placeholder='Enter new tag name' value={this.state.tagName} onChange={this.changeTagName} />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonInput ref="closeBtn" className="footer-btn" type='reset' value='Cancel' onClick={this.close} />
                        <ButtonInput className="footer-btn" value='Delete' onClick={this.deleteTag}/>
                        <ButtonInput ref="editTagBtn"
                                     className="footer-btn"
                                     type='submit' value='Edit'
                                     disabled={this.state.tagName === "" || this.state.editActionInProgress}
                                     onClick={this.editSubmit} />
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default EditTagModal;