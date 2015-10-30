"use strict";

import React from "react";
import jQuery from "jquery";
import DocumentActions from "../../../reflux/document/documentActions";
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;

const FullScreenEditorModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            etherpadURI: null
        };
    },
    close() {
        DocumentActions.closeFullscreenEditor();
        this.setState({
            showModal: false,
            etherpadURI: null
        });
    },
    open(etherpadURI) {
        this.setState({
            showModal: true,
            etherpadURI: etherpadURI
        });
    },
    render() {
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="fullscreen-editor-modal-instance">
                    <Modal.Header closeButton>
                        <Modal.Title>Fullscreen editor</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.etherpadURI !== null ? <iframe id="etherpadEditorFullscreen" name="etherpadEditorFullscreen" src={this.state.etherpadURI} scrolling="no" seamless>
                        </iframe> : null}
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default FullScreenEditorModal;