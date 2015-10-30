"use strict";

import React from "react";
import jQuery from "jquery";
import DocumentActions from "../../reflux/document/documentActions";
import AppActions from "../../reflux/app/appActions";
import ReactIntl from "../../../node_modules/react-intl";
let Reflux = require("reflux");
let Modal = require("react-bootstrap").Modal;
let Button = require("react-bootstrap").Button;
let Popover = require("react-bootstrap").Popover;
let Tooltip = require("react-bootstrap").Tooltip;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let IntlMixin = ReactIntl.IntlMixin;
let FormattedMessage = ReactIntl.FormattedMessage;

const LoadingModal = React.createClass({
    mixins: [
        Reflux.listenTo(AppActions.loadingProgress, "onLoadingProgress"),
        Reflux.listenTo(AppActions.loadingComplete, "onLoadingComplete"),
        IntlMixin
    ],
    propTypes: {
        promiseNames: React.PropTypes.array
    },
    getInitialState() {
        var currentLoadingTasks = [];
        this.props.promiseNames.forEach((promiseName) => {
            currentLoadingTasks.push({promiseName: promiseName, status: "loading"});
        });
        return {
            showModal: true,
            currentLoadingTasks: currentLoadingTasks,
            error: false,
            success: false
        };
    },
    componentWillReceiveProps(nextProps) {
        var currentLoadingTasks = [];
        nextProps.forEach((promiseName) => {
            currentLoadingTasks.push({promiseName: promiseName, status: "loading"});
        });
        this.setState({
            showModal: true,
            currentLoadingTasks: currentLoadingTasks,
            error: false,
            success: false
        });
    },
    close() {
        this.setState({ showModal: false });
    },
    open(promiseNameArray) {
        var currentLoadingTasks = [];
        promiseNameArray.forEach((promiseName) => {
            currentLoadingTasks.push({promiseName: promiseName, status: "loading"});
        });
        this.setState({
            showModal: true,
            currentLoadingTasks: currentLoadingTasks,
            error: false,
            success: false
        });
    },
    onLoadingProgress(promiseObj) {
        var newStatus = "loading";
        if (promiseObj.success) {
            newStatus = "success";
        } else if (promiseObj.error) {
            newStatus = "error";
        }
        this.state.currentLoadingTasks.forEach((currentLoadingTask) => {
            if (currentLoadingTask.promiseName === promiseObj.promiseName) {
                currentLoadingTask.status = newStatus;
            }
        });
        this.setState({});
    },
    onLoadingComplete(completionObj) {
        if (completionObj.success) {
            this.setState({
                success: true
            });
            this.close();
        } else {
            this.setState({
                error: true
            });
        }
    },
    doNotClose() {
    },
    render() {
        var idName = "";
        if (this.state.error === true) {
            idName = "-error";
        }
        return (
            <div>
                <Modal show={this.state.showContextMenu} onHide={this.doNotClose} id={"loading-modal-instance" + idName}>
                    <Modal.Header closeButton={this.state.error ? true : false}>
                        <Modal.Title>Loading...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            {this.state.currentLoadingTasks.map((loadingTask) => {
                                return (
                                    <li key={loadingTask.promiseName}>
                                        <div className="promise-name">
                                            <FormattedMessage key={loadingTask.promiseName + "-message"} message={this.getIntlMessage(loadingTask.promiseName)} />
                                        </div>
                                        <div className="status">{loadingTask.status}</div>
                                    </li>
                                );
                            })}
                        </ul>
                        {this.state.error ? <div className="sweet-alert">
                            <div className="sa-icon sa-error animateErrorIcon" style={{display: "block"}}>
                                  <span className="sa-x-mark animateXMark">
                                        <span className="sa-line sa-left"></span>
                                        <span className="sa-line sa-right"></span>
                                  </span>
                            </div>
                        </div> : null}
                        {this.state.success ? <div className="sweet-alert">
                            <div className="sa-icon sa-success animate" style={{display: "block"}}>
                                <span className="sa-line sa-tip animateSuccessTip"></span>
                                <span className="sa-line sa-long animateSuccessLong"></span>

                                <div className="sa-placeholder"></div>
                                <div className="sa-fix"></div>
                            </div>
                        </div> : null}
                    </Modal.Body>
                    <Modal.Footer>
                        {this.state.error ? <Button onClick={this.close}>Close</Button> : null}
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

export default LoadingModal;