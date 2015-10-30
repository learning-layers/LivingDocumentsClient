"use strict";

import React from "react";
import ReactIntl from "../../../../node_modules/react-intl";
import jQuery from "jquery";
let Button = require("react-bootstrap").Button;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let Collapse = require("react-bootstrap").Collapse;
let Well = require("react-bootstrap").Well;
let FormattedRelative = ReactIntl.FormattedRelative;

let RepliesButton = React.createClass({
    getInitialState() {
        return {
        };
    },
    render() {
        var button = null;
        if (this.props.showSubComments && this.props.subCommentLength > 0) {
            button = <Button className="btn-sm btn-primary replies-btn" onClick={this.props.collapseSubComments}>
                <span className="glyphicon glyphicon-chevron-up"></span> Replies ({this.props.subCommentLength})
            </Button>;
        } else if (!this.props.showSubComments && this.props.subCommentLength > 0) {
            button = <Button className="btn-sm replies-btn" disabled={this.props.isSubCommentsLoading} onClick={!this.props.isSubCommentsLoading ? this.props.collapseSubComments : null}>
                {this.props.isSubCommentsLoading ? "Loading..." : <span className="glyphicon glyphicon-chevron-down"></span>} Replies ({this.props.subCommentLength})
            </Button>;
        }
        return (
            <div>
                {button}
            </div>
        );
    }
});

let OuterComment = React.createClass({
    propTypes: {
        comment: React.PropTypes.object.isRequired
    },
    getInitialState() {
        return {
            fullName: this.props.comment.creator.fullName,
            createdAt: this.props.comment.createdAt,
            open: false,
            showSubComments: false,
            reply: null,
            replyCreationInProgress: false,
            commentId : null,
            isSubCommentsLoading: false,
            items: [],
            subCommentLength: this.props.comment.subcommentlength
        };
    },
    componentWillReceiveProps(nextProps) {
        this.setState({
            fullName: nextProps.comment.creator.fullName,
            createdAt: nextProps.comment.createdAt,
            open: false,
            showSubComments: false,
            reply: null,
            replyCreationInProgress: false,
            commentId : null,
            isSubCommentsLoading: false,
            items: [],
            subCommentLength: nextProps.comment.subcommentlength
        });
    },
    changeReplyHandler(event) {
        this.setState({reply: event.target.value});
    },
    cancelNewComment() {
        let replyNode = React.findDOMNode(this.refs.reply);
        replyNode.childNodes[0].value = "";
        this.setState({
            open: false,
            reply: null
        });
    },
    submit() {
        this.setState({
            replyCreationInProgress: true
        });
        let newReply = {
            text: this.state.reply
        };
        jQuery.post(
            global.config.endpoint + "/api/comments/" + this.props.comment.id + "/comment",
            JSON.stringify(newReply)
        ).then((data) => {
            if (this.state.showSubComments) {
                if (data.creator && data.creator !== null) {
                    this.state.items.push(data);
                }
            } else {
                this.collapseSubComments();
            }
            let replyNode = React.findDOMNode(this.refs.reply);
            replyNode.childNodes[0].value = "";
            this.setState({
                subCommentLength: this.state.subCommentLength + 1,
                replyCreationInProgress: false,
                open: false,
                items: this.state.items,
                reply: null
            });
        }, () => {
            this.setState({
                replyCreationInProgress: false
            });
        });
    },
    collapseCreateSubComment() {
        this.setState({
            open: !this.state.open
        });
    },
    collapseSubComments() {
        if(this.state.showSubComments === true){
            this.setState({
                showSubComments: false
            });
        } else{
            this.setState({
                isSubCommentsLoading: true
            });
            jQuery.get(
                global.config.endpoint + "/api/comments/" + this.props.comment.id + "/comment/list"
            ).then((data) => {
                if (data.length > 0) {
                    this.setState({
                        items: data, //.reverse()
                        isSubCommentsLoading: false,
                        showSubComments: true
                    });
                } else {
                    this.setState({
                        isSubCommentsLoading: false,
                        showSubComments: false
                    });
                }
            },() => {
                this.setState({
                    isSubCommentsLoading: false
                });
            });
        }
    },
    _renderItems() {
        return this.state.items.map(function(comment, index) {
            return (
                <OuterComment key={"comment-" + comment.id} comment={comment} />
            );
        });
    },
    deleteFromList() {
        this.props.deleteFromList(this.props.comment);
    },
    render: function() {
        let reply = this.state.reply;
        let replyCreationInProgress = this.state.replyCreationInProgress;
        let isSubCommentsLoading = this.state.isSubCommentsLoading;
        return (
            <div className={"ld-panel outer-comment comment-" + this.props.comment.id}>
                <div className="userInfo">
                    <div className="avatar-img">
                        <img className="img-responsive img-circle" src={global.config.endpoint + "/api/users/avatar/" + this.props.comment.creator.id} />
                    </div>
                    <div className="comment-header">
                        <div className="comment-metadata">
                            <h4 className="username">{this.state.fullName}</h4>
                            <div className="created-at"><FormattedRelative value={this.state.createdAt} /></div>
                        </div>
                        <div className="comment-options">
                            <Button className="btn-sm" onClick={this.deleteFromList}>
                                <span className="glyphicon glyphicon-trash"></span>
                                &nbsp;Delete
                            </Button>
                            <Button className={this.state.open? "btn-sm reply-button btn-primary": "btn-sm reply-button"} onClick={this.collapseCreateSubComment}><span className="glyphicon glyphicon-share-alt"></span> Reply</Button>
                            <div className="clearfix"></div>
                            <Button className="btn-sm edit-button">
                                <span className="glyphicon glyphicon-pencil"></span>
                                &nbsp;Edit
                            </Button>
                            <RepliesButton showSubComments={this.state.showSubComments}
                                           subCommentLength={this.state.subCommentLength}
                                           collapseSubComments={this.collapseSubComments} />
                        </div>
                    </div>
                    <div className="clearfix"></div>
                </div>
                <div className="comment-text">
                    {this.props.comment.text}
                </div>
                <Collapse in={this.state.open}>
                    <div className="reply-panel">
                        <Well>
                            <form>
                                <Input ref="reply" type="textarea" value={reply} onChange={this.changeReplyHandler} placeholder="Enter new reply" />
                                <ButtonInput type="submit" value="Reply" disabled={!reply || replyCreationInProgress} onClick={this.submit}>create</ButtonInput>
                                <ButtonInput className="cancel-btn" value="Cancel" disabled={replyCreationInProgress} onClick={this.cancelNewComment}>cancel</ButtonInput>
                                <div className="clearfix"></div>
                            </form>
                        </Well>
                    </div>
                </Collapse>
                <Collapse in={this.state.showSubComments}>
                    <div className="subcomments-panel">
                        <Well>
                            <div>{this._renderItems()}</div>
                        </Well>
                    </div>
                </Collapse>
            </div>
        );
    }
});

export default OuterComment;