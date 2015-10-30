"use strict";

import React from "react";
import jQuery from "jquery";
import Main from "../../../main.jsx";
import AuthStore from "../../../reflux/auth/authStore";
import CommentStore from "../../../reflux/comment/commentStore.jsx";
import CommentActions from "../../../reflux/comment/commentActions";
import ReactRouter from "react-router";
import RefreshStore from "../../../reflux/refreshData/refreshStore";
import Waypoint from "react-waypoint";
import ReactIntl from "../../../../node_modules/react-intl";
import OuterComment from "./outerComment.jsx";
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
    getInitialState: function() {
        return {
        };
    },
    mixins: [Reflux.connect(CommentStore, "comment"), State],
    componentWillUnmount() {
        CommentActions.resetState();
    },
    _loadMoreItems: function(documentId) {
        setTimeout(() => {
            // timeout needed because the props are not refreshed when this
            // method is entered immediately
            CommentActions.loadMoreItems(this.props.documentId);
        }, 1);
    },
    _renderItems: function() {
        return this.state.comment.items.map(function(comment, index) {
            return (
                <OuterComment key={index}
                              className="infinite-scroll-example__list-item"
                              comment={comment} deleteFromList={CommentActions.deleteCommentFromList} />
            );
        });
    },
    _renderLoadingMessage: function() {
        if (this.state.comment.isLoading) {
            return (
                <p className="infinite-scroll-example__loading-message">
                    Loading...
                </p>
            );
        }
    },
    _renderWaypoint: function(documentId) {
        if (!this.state.comment.isLoading) {
            return (
                <Waypoint
                    onEnter={this._loadMoreItems.bind(this, documentId)}
                    threshold={0.5}
                    />
            );
        }
    },
    openCommentModal: function() {
        CommentActions.createComment();
    },
    /*
     <p className="infinite-scroll-example__count">
     Items Loaded: {this.state.comment.items.length}
     </p>
     */
    render: function() {
        return (
            <div className="comment-area" style={{paddingBottom: "3px"}}>
                <div className="ld-panel">
                    <div className="ld-panel-header">
                        <h4>Comments ({this.state.comment.currentTotalElements})</h4>
                        <Button className="add-comment-btn" onClick={this.openCommentModal}><span className="glyphicon glyphicon-plus"></span></Button>
                    </div>
                    <div className="ld-panel-content">
                        <div className="infinite-scroll-example">
                            <div className="infinite-scroll-example__scrollable-parent">
                                {this._renderItems()}
                                {this._renderWaypoint(this.props.documentId)}
                            </div>
                            <p className="infinite-scroll-example__arrow" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default CommentArea;