"use strict";

import React from "react";
import jQuery from "jquery";
import Main from "../../../../main.jsx";
import FolderActions from "../../../../reflux/folder/folderActions";
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;

const CreateNewFolderModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            folderName: "",
            folder: this.props.folder
        };
    },
    close() {
        this.setState({ showModal: false });
    },
    open(folder) {
        this.setState({
            showModal: true,
            folder: folder
        });
    },
    changeFolderNameHandler(event) {
        this.setState({folderName: event.target.value});
    },
    submit(event) {
        event.preventDefault();
        let newFolder = {
            name: this.state.folderName
        };
        if (this.state.folderName !== "") {
            jQuery.post(global.config.endpoint + "/api/folders/" + this.state.folder.id + "/folders", JSON.stringify(newFolder)).then((folderResponse) => {
                FolderActions.newFolderCreated(folderResponse);
                this.close();
            });
        }
    },
    render() {
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="create-folder-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new folder</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Input ref="folderName" type="text" value={this.state.folderName} onChange={this.changeFolderNameHandler} placeholder="New folder name" />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                        <ButtonInput type="submit" value="Submit Button" onClick={this.submit}>create</ButtonInput>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default CreateNewFolderModal;