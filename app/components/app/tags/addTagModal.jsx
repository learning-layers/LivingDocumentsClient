"use strict";

import React from "react";
import jQuery from "jquery";
import ReactRouter from "react-router";
let Reflux = require("reflux");
let TagActions = require("../../../reflux/app/tag/tagActions");
let DocumentActions = require("../../../reflux/document/documentActions");
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let Panel = require("react-bootstrap").Panel;

const AddTagModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            parent: null,
            tags: [],
            activeTag: null
        };
    },
    close() {
        this.setState({
            showModal: false,
            activeTag: null
        });
    },
    open(currentParent, tags) {
        this.setState({
            showModal: true,
            parent: currentParent,
            tags: tags
        });
    },
    tagSelected(event) {
        this.setState({
            activeTag: JSON.parse(event.target.value)
        });
    },
    createNewTagHandler() {
        this.setState({
            showModal: false
        });
        TagActions.openCreateModal(this.state.parent);
    },
    addTag() {
        TagActions.addTag(this.state.activeTag, this.state.parent.id);
        this.close();
    },
    render() {
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="add-tag-modal-instance">
                <Modal.Header closeButton>
                    <Modal.Title>Add Tag</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Row className="show-grid">
                            <Col lg={6}>
                                <Input type="select" ref="select_tag" onChange={this.tagSelected} label="Select existing tag" multiple>
                                    {this.state.tags.map((tag) => {
                                        return (
                                            <option value={JSON.stringify(tag)}>{tag.name}</option>
                                        );
                                    })}
                                </Input>
                            </Col>
                            <Col lg={6}>
                                <form>
                                    {this.state.activeTag===null ? <div/> :
                                        <div>
                                            <Panel header="Name">
                                                {this.state.activeTag.name}
                                            </Panel>
                                            <Panel header="Description">
                                                {this.state.activeTag.description}
                                            </Panel>
                                        </div>
                                    }
                                </form>
                            </Col>
                        </Row>
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonInput ref="createNewBtn" className="footer-btn" type="submit" value="Create a new tag" onClick={this.createNewTagHandler} />
                    <ButtonInput ref="closeBtn" className="footer-btn" type="reset" value="Cancel" onClick={this.close} />
                    <ButtonInput ref="addTagBtn"
                                 className="footer-btn"
                                 type="submit" value="Add" disabled={this.state.activeTag===null} onClick={this.addTag}/>
                </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default AddTagModal;