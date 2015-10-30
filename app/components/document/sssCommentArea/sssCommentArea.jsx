"use strict";

import React from "react";
import jQuery from "jquery";
import Main from "../../../main.jsx";
import AuthStore from "../../../reflux/auth/authStore";
import CommentStore from "../../../reflux/comment/commentStore.jsx";
import SSSCommentActions from "../../../reflux/sssComment/sssCommentActions2";
import ReactRouter from "react-router";
import RefreshStore from "../../../reflux/refreshData/refreshStore";
import Waypoint from "react-waypoint";
import ReactIntl from "../../../../node_modules/react-intl";
import SSSDiscussionArea from "./sssDiscussionArea.jsx";
import facebookLoadingIndicator from "../../../assets/img/ajax-loader.gif";
import SSSCreateDiscussionModal from "./sssCreateDiscussionModal.jsx";

let _ = require("underscore");
let Reflux = require("reflux");
let GriddleWithCallbackSingleRow = require("../../../custom-libs/griddle/GriddleWithCallbackSingleRow.jsx");
let Button = require("react-bootstrap").Button;
let ButtonToolbar = require("react-bootstrap").ButtonToolbar;
let Badge = require("react-bootstrap").Badge;
let FormattedRelative = ReactIntl.FormattedRelative;
let State = ReactRouter.State;

let Loading = React.createClass({
    getDefaultProps: function(){
        return {
            loadingText: "Loading"
        };
    },
    render: function(){
        let loadingStyle = {
            textAlign: "center",
            paddingBottom: "40px"
        };
        return <div className="loading container" style={loadingStyle}>{this.props.loadingText}</div>;
    }
});

let CommentArea = React.createClass({
    mixins: [Reflux.listenTo(SSSCommentActions.refresh, "refreshView")],
    sssCreateDiscsModal: null,
    getInitialState: function() {
        return {
            initialized: false,
            discs: [],
            currentDiscussion: null,
            loadingFailedNotAuthenticated: false,
            activeDiscussion: -1
        };
    },
    componentWillReceiveProps(nextProps) {
        setTimeout(() => {
            this.refreshView();
        }, 1);
    },
    componentWillUnmount() {
        //CommentActions.resetState();
        React.unmountComponentAtNode(document.getElementById("sss-create-discs-modal"));
    },
    componentDidMount() {
        this.refreshView();
    },
    refreshView(disc, scrollToBottom) {
        let documentId = this.props.documentId;
        //let documentId = 1;
        //let documentId = 1;
        jQuery.get(global.config.endpoint + "/api/discussions/document/" + documentId + "/discussions/list").then((data) => {
            let currentDiscussion = null;
            let reverseDiscussions = data.discs.reverse();
            if (reverseDiscussions.length > 0) {
                currentDiscussion = reverseDiscussions[0];
            }
            if (disc && scrollToBottom) {
                let selectedDisc = disc;
                reverseDiscussions.forEach((innerDisc) => {
                    if (innerDisc.id === disc.id) {
                        selectedDisc = innerDisc;
                    }
                });
                this.setState({
                    discs: reverseDiscussions,
                    initialized: true,
                    currentDiscussion: selectedDisc,
                    activeDiscussion: selectedDisc.id
                });
                setTimeout(() => {
                    jQuery("html, body").animate({ scrollTop: jQuery(document).height() }, "slow");
                }, 200);
            } else if(currentDiscussion !== null) {
                this.setState({
                    discs: reverseDiscussions,
                    initialized: true,
                    currentDiscussion: currentDiscussion,
                    activeDiscussion: currentDiscussion.id
                });
            } else {
                this.setState({
                    discs: reverseDiscussions,
                    initialized: true,
                    currentDiscussion: currentDiscussion,
                    activeDiscussion: -1
                });
            }
        }, (error) => {
            this.setState({loadingFailedNotAuthenticated: true});
        });
    },
    openCreateDiscussionModal(cmd) {
        let disc = null;
        if (cmd === "comment") {
            disc = this.state.currentDiscussion;
        }
        if (this.sssCreateDiscsModal === null) {
            this.sssCreateDiscsModal = React.render(<SSSCreateDiscussionModal />, document.getElementById("sss-create-discs-modal"));

            this.sssCreateDiscsModal.open(this.props.documentId, disc);
        } else {
            this.sssCreateDiscsModal.open(this.props.documentId, disc);
        }
    },
    openCommentModal() {
        //CommentActions.createComment();
    },
    changeDiscussion(disc) {
        this.setState({
            currentDiscussion: disc,
            activeDiscussion: disc.id
        });
    },
    relogin() {
        let location = window.location.href.split("/");
        var child = window.open(location[0] + "//" + location[2] + "/#/" + "relogin");
        var timer = setInterval(checkChild, 500);
        function checkChild() {
            if (child.closed) {
                window.alert("Child window closed");
                clearInterval(timer);
            }
        }
    },
    render: function() {
        if (this.state.loadingFailedNotAuthenticated) {
            // <Button onClick={this.relogin}>Relogin</Button>
            return (
                <div className="comment-area" style={{paddingBottom: "3px"}}>
                    <div className="ld-panel">
                        Loading to a backend service failed because your access to it ran out - please log out and in again to Living documents.
                    </div>
                </div>
            );
        }
        if (!this.state.initialized) {
            return (
                <div className="comment-area" style={{paddingBottom: "3px"}}>
                    <div className="ld-panel">
                        Loading
                        <img className="sss-comment-area-loading-indicator" src={facebookLoadingIndicator} />
                    </div>
                </div>
            );
        }
        return (
            <div className="comment-area" style={{paddingBottom: "3px"}}>
                <div className="ld-panel">
                    <div className="ld-panel-header">
                        <div className="inner-discussion-header">
                            <h4 className="disc-section-name">
                                Discussions ({this.state.discs.length})
                            </h4>
                            <Button className="add-comment-btn pull-right" onClick={this.openCreateDiscussionModal}><span className="glyphicon glyphicon-plus"></span></Button>
                            <ul className="sss-discussions nav nav-tabs">
                                {this.state.discs.map((disc)=> {
                                    let discClasses = "";
                                    if (this.state.activeDiscussion === disc.id) {
                                        discClasses = "active";
                                    }
                                    return (
                                        <li className={discClasses} onClick={this.changeDiscussion.bind(this, disc)}>{disc.label}</li>
                                    );
                                })}
                            </ul>
                        </div>
                        {this.state.currentDiscussion !== null ? <div className="inner-comment-header">
                            <h4>Comments ({this.state.currentDiscussion.entries.length + 1})</h4>
                            <Button className="add-comment-btn pull-right" onClick={this.openCreateDiscussionModal.bind(this, "comment")}><span className="glyphicon glyphicon-plus"></span></Button>
                        </div> : null}
                    </div>
                    {this.state.currentDiscussion !== null ? <div className="ld-panel-content">
                        {this.state.currentDiscussion !== null ? <div className="sss-discussion-description">
                            <SSSDiscussionArea discussion={this.state.currentDiscussion} />
                        </div> : null }
                        <div className="inner-comment-header" style={{height: "50px"}}>
                            <h4 style={{display: "inline-block"}}>Create a new comment</h4>
                            <Button style={{display: "inline-block", left: "200px"}} className="btn-sm add-comment-btn pull-right" onClick={this.openCreateDiscussionModal.bind(this, "comment")}><span className="glyphicon glyphicon-plus"></span></Button>
                        </div>
                    </div> : null}
                </div>
            </div>
        );
    }
});

export default CommentArea;