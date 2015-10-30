"use strict";

import React from "react";
import Reflux from "reflux";
import jQuery from "jquery";
import DocumentActions from "../../../reflux/document/documentActions";
import swal from "sweetalert";
import UserStore from "../../../reflux/user/userStore";

let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Table = require("react-bootstrap").Table;
let Tab = require("react-bootstrap").Tab;
let Tabs = require("react-bootstrap").Tabs;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
var Select = require("react-select");

var options = [
    //{ value: "READ", label: "Can view" },
    //{ value: "READ;COMMENT_DOCUMENT", label: "Can comment" },
    //{ value: "READ;COMMENT_DOCUMENT;ATTACH_FILES", label: "Can attach files" },
    { value: "READ;COMMENT_DOCUMENT;ATTACH_FILES;WRITE", label: "Can edit" }
];

var gravatarStyle = {
    borderRadius: 3,
    display: "inline-block!important",
    marginRight: "5px",
    position: "relative",
    top: -2,
    verticalAlign: "middle",
    maxWidth: "35px",
    maxHeight: "35px",
    border: "1px solid #ccc"
};

let UserOption = React.createClass({
    propTypes: {
        addLabelText: React.PropTypes.string,
        className: React.PropTypes.string,
        mouseDown: React.PropTypes.func,
        mouseEnter: React.PropTypes.func,
        mouseLeave: React.PropTypes.func,
        option: React.PropTypes.object.isRequired,
        renderFunc: React.PropTypes.func
    },
    render () {
        var obj = this.props.option;
        var size = 15;

        return (
            <div className={this.props.className}
                 onMouseEnter={this.props.mouseEnter}
                 onMouseLeave={this.props.mouseLeave}
                 onMouseDown={this.props.mouseDown}
                 onClick={this.props.mouseDown}>
                <img src={global.config.endpoint + "/api/users/avatar/" + obj.value} style={gravatarStyle} />
                <b>{obj.label}</b>
            </div>
        );
    }
});

const ShareDocumentModal = React.createClass({
    mixins: [Reflux.connect(UserStore, "user")],
    getInitialState() {
        return {
            showModal: false,
            document: null,
            isLoading: false,
            shareUserId: "",
            shareOption: "READ;COMMENT_DOCUMENT;ATTACH_FILES;WRITE",
            alreadySharedForUsers: []
        };
    },
    close() {
        this.setState({
            showModal: false,
            document: null,
            isLoading: false,
            shareUserId: "",
            shareOption: "READ;COMMENT_DOCUMENT;ATTACH_FILES;WRITE",
            alreadySharedForUsers: []
        });
    },
    reloadUsersThatHaveAccess() {
        jQuery.get(global.config.endpoint + "/api/documents/" + this.state.document.id + "/access/users?permissions=all&page-number=0&page-size=30&sort-direction=DESC&sort-property=createdAt").then((data) => {
            this.setState({
                alreadySharedForUsers: data.content
            });
        });
    },
    open(document) {
        this.setState({
            showModal: true,
            document: document
        });
        this.reloadUsersThatHaveAccess();
    },
    getOptions(input, callback) {
        this.setState({
            isLoading: true
        });
        let url = "";
        if (input && input !== "") {
            url = "?page-number=0&page-size=30&search-term=" + input;
        } else {
            url = "?page-number=0&page-size=30";
        }
        jQuery.get(global.config.endpoint + "/api/users/suggestions" + url).then((data) => {
            this.setState({
                isLoading: false
            });
            let options = [];
            data.content.forEach((user) => {
                let found = false;
                if (user.id === this.state.user.currentUser.id) {
                    found = true;
                } else {
                    this.state.alreadySharedForUsers.forEach((userAccess) => {
                        if(userAccess.user.id === user.id) {
                            found = true;
                        }
                    });
                }
                if (!found) {
                    options.push({
                        value: user.id,
                        label: user.username
                    });
                }
            });
            callback(null, {
                options: options,
                // CAREFUL! Only set this to true when there are no more options,
                // or more specific queries will not be sent to the server.
                complete: false
            });
        }, () => {
            this.setState({
                isLoading: false
            });
            callback(null, {
                options: [],
                // CAREFUL! Only set this to true when there are no more options,
                // or more specific queries will not be sent to the server.
                complete: false
            });
        });
    },
    clearOptionsCache() {
        if (this.refs.selectUser && this.refs.selectUser._optionsCache) {
            this.refs.selectUser._optionsCache = {};
            this.refs.selectUser.setState({});
        }
    },
    doShareDocument(userIdToShareWith, userValue) {
        jQuery.post(global.config.endpoint + "/api/documents/" + this.state.document.id + "/share?userIds=" + userIdToShareWith + "&permissions=" + this.state.shareOption).then((data) => {
            swal("Sharing success!", "Successfully shared the document '" + userValue + "' !", "success");
            this.reloadUsersThatHaveAccess();
            this.clearOptionsCache();
        }, (error) => {
            if (error.status === 200) {
                swal("Sharing success!", "Successfully shared the document with '" + userValue + "' !", "success");
                this.reloadUsersThatHaveAccess();
                this.clearOptionsCache();
            } else {
                swal("Sharing failed!", "Sharing the document with '" + userValue + "' failed! #2", "error");
            }
        });
    },
    shareDocument() {
        // check again if the selection is the same as the last info
        // from the share user changed event
        let userIdToShareWith = this.state.shareUserId;
        let userValue = this.state.shareUserValue;
        if (userIdToShareWith && userIdToShareWith !== null && userIdToShareWith === this.refs.selectUser.state.value) {
            // the user with the give id already exists (since the selection was done via the dropdown and not changed afterwards)
            // so the sharing request can be done instantly
            console.debug("Same value");
            jQuery.ajax({
                url: global.config.endpoint + "/api/documents/" + this.state.document.id + "/access/users/" + userIdToShareWith,
                type: "DELETE",
                success: function(result) {
                    //
                },
                error: function (error) {
                    if (error.status !== 200) {
                        swal("Sharing failed!", "Sharing the document '" + userValue + "' failed! #1", "error");
                    }
                }
            }).then((success) => {
                this.doShareDocument(userIdToShareWith, userValue);
            }, (error) => {
                if (error.status === 200) {
                    this.doShareDocument(userIdToShareWith, userValue);
                }
            });
        } else {
            // the input has changed since the last user has been chosen form the user input
            // so we have to check if a user for the current input value exists
            console.debug("Not the same value it has to be checked if the user exists in the database");

        }
    },
    handleShareUserChanged(userId) {
        this.setState({
            shareUserId: userId
        });
        setTimeout(() => {
            this.setState({
                shareUserValue: this.refs.selectUser.state.placeholder
            });
        }, 400);
    },
    handleShareOptionChanged(shareOption) {
        this.setState({
            shareOption: shareOption
        });
    },
    unshareDocument(userId, username) {
        swal({
            title: "Are you sure?",
            text: "Are you sure you want to revoke the access of this document for the user '" + username + "'?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, revoke it!",
            closeOnConfirm: false
        }, () => {
            jQuery.ajax({
                url: global.config.endpoint + "/api/documents/" + this.state.document.id + "/access/users/" + userId,
                type: "DELETE",
                success: (result) => {
                    swal("Unsharing successful!", "Unsharing the document for '" + username + "' was successful", "success");
                    this.reloadUsersThatHaveAccess();
                    this.clearOptionsCache();
                },
                error: (error) => {
                    if (error.status !== 200) {
                        swal("Unsharing failed!", "Unsharing the document for '" + username + "' failed!", "error");
                    } else {
                        swal("Unsharing successful!", "Unsharing the document for '" + username + "' was successful", "success");
                        this.reloadUsersThatHaveAccess();
                        this.clearOptionsCache();
                    }
                }
            });
        });
    },
    checkPermission(permissions) {
        if (this.state.document.creator && this.state.document.creator.id === this.state.user.currentUser.id) {
            // user is the creator of the document
            return true;
        } else if (this.state.document && this.state.document.accessList) {
            let userAccessFound = null;
            this.state.document.accessList.forEach((userAccess) => {
                if (userAccess.user && userAccess.user.id === this.state.user.currentUser.id) {
                    userAccessFound = userAccess;
                }
            });
            if (userAccessFound !== null) {
                let hasPermission = false;
                permissions.forEach((permission) => {
                    if (this.hasPermission(permission, userAccessFound)) {
                        hasPermission = true;
                    }
                });
                return hasPermission;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    hasPermission(permission, userAccess) {
        let found = false;
        if (userAccess.permissionList) {
            userAccess.permissionList.forEach((permissionItem) => {
                if (permission === permissionItem) {
                    found = true;
                }
            });
        }
        return found;
    },
    render() {
        if (!this.state.document) {
            return (
                <div>
                    <Modal show={this.state.showModal} onHide={this.close} id="share-document-modal-instance">
                        <Modal.Header closeButton>
                            <Modal.Title>Share the document with others</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Loading...
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.close}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        }
        let numberOfUserAccessInfos = 0;
        let userAccessInfos = this.state.alreadySharedForUsers.map((user) => {
            if (user.user.id === this.state.user.currentUser.id) {
                return null;
            } else {
                numberOfUserAccessInfos++;
            }
            return (
                <tr key={"acc-usr-" + user.user.id}>
                    <td className="user-access-item">
                        <img src={global.config.endpoint + "/api/users/avatar/" + user.user.id} style={gravatarStyle} />
                        <b>{user.user.username}</b>
                        <Button onClick={this.unshareDocument.bind(this, user.user.id, user.user.username)}>Unshare</Button>
                        <Select
                            name="user-access-option"
                            value={this.state.shareOption}
                            clearable={false}
                            onChange={this.handleShareOptionChanged.bind(this, user.user.id)}
                            options={options}
                            />
                    </td>
                </tr>
            );
        });
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close} id="share-document-modal-instance">
                    <Modal.Header closeButton>
                        <Modal.Title>Share the document with others</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {false ? <div><label for="make-private-btn" className="sharing-lbl pull-left">General sharing setting:</label>
                        <Button id="make-public-btn" className="btn-primary pull-right">Make public</Button>
                        <Button id="make-private-btn" className="btn-primary pull-right">Make private</Button>
                        <div className="clearfix"></div>
                        <hr />
                        </div>: null}
                        <Tabs defaultActiveKey={1}>
                            <Tab eventKey={1} title="Users">
                                {this.checkPermission(["WRITE"]) ? <div>
                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                        <Select ref="selectUser"
                                            optionComponent={UserOption}
                                            isLoading={this.state.isLoading}
                                            name="form-field-name"
                                            value={this.state.shareUserId}
                                            onChange={this.handleShareUserChanged}
                                            asyncOptions={this.getOptions}
                                            backspaceRemoves={true}
                                            cacheAsyncResults={true}
                                            clearable={false}
                                            />
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                        <Select
                                            name="form-field-name"
                                            value={this.state.shareOption}
                                            clearable={false}
                                            onChange={this.handleShareOptionChanged}
                                            options={options}
                                            />
                                    </div>
                                    <div className="col-lg-12">
                                        <Button className="btn-primary pull-right" onClick={this.shareDocument} disabled={this.state.shareUserId === null}>Add</Button>
                                    </div>
                                </div> : null}
                                <div className="clearfix"></div>
                                <div className="user-access-table">
                                    <div className="user-access-table-inner">
                                        {numberOfUserAccessInfos > 0 ? <Table responsive>
                                            <tbody>
                                                {userAccessInfos}
                                            </tbody>
                                        </Table> : <div><hr /><b>This document is currently not shared with anyone.</b></div>}
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey={2} title="Groups" disabled>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default ShareDocumentModal;