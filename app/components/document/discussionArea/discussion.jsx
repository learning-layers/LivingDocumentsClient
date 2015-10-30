"use strict";

import React from "react";
import DiscussionActions from "../../../reflux/discussion/discussionActions";
import DiscussionStore from "../../../reflux/discussion/discussionStore.jsx";
import jQuery from "jquery";
import Main from "../../../main.jsx";
import CreateDocumentModal from "../createDocumentModal.jsx";
import AuthStore from "../../../reflux/auth/authStore";
import ReactRouter from "react-router";
import RefreshStore from "../../../reflux/refreshData/refreshStore";
import Waypoint from "react-waypoint";
import ReactIntl from "../../../../node_modules/react-intl";
let _ = require("underscore");
let Collapse = require("react-bootstrap").Collapse;
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
let DiscussionItem = React.createClass({
    getInitialState() {
        return {
            notFoundError: false,
            documentTitle: this.props.data.title,
            open: false
        };
    },
    render() {
        return (
            <div className="discussion-item">
                <div className="discussion-title" id="discussion-title">
                    <Button className="btn-sm" onClick={ ()=> this.setState({ open: !this.state.open })}>
                        <span className={!this.state.open ? "glyphicon glyphicon-triangle-right" : "glyphicon glyphicon-triangle-bottom"}></span>
                    </Button>
                    {this.props.data.title}
                </div>
                <Collapse in={this.state.open}>
                    <div>
                        <Button href={"#/document/" + this.props.data.id}>Open</Button>
                    </div>
                </Collapse>
            </div>
        );//<Button>delete</Button>
    }
});

function shortUid() {
    // http://stackoverflow.com/a/6248722/20003
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4); // jshint ignore:line
}

function mergeArrays(currentElements, externalResults) {
    let newArray = [];
    for(let i in currentElements){
        let shared = false;
        for (let j in externalResults) {
            if (externalResults[j].id === currentElements[i].id) {
                shared = true;
                break;
            }
        }
        if(!shared) {
            newArray.push(currentElements[i]);
        }
    }
    return newArray.concat(externalResults);
}

let currentTotalElements = 0;
let Discussion = React.createClass({
    _loadMoreItems: function(documentId) {
        setTimeout(() => {
            let currentItems = this.state.items;
            if (!this.state.allItemsLoaded && this.props.documentId === documentId) {
                this.setState({isLoading: true});
                jQuery.get(global.config.endpoint + "/api/documents/" + this.props.documentId + "/discussions?page-number=" +
                    this.state.currentPage + "&page-size=" + 5 + "&sort-direction=DESC&sort-property=createdAt").then((data) => {
                    if (currentTotalElements !== data.totalElements) {
                        currentTotalElements = data.totalElements;
                        DiscussionActions.currentTotalDiscussionsChanged(currentTotalElements);
                    }
                    let mergedArrays = mergeArrays(currentItems, data.content);
                    mergedArrays = _.sortBy(mergedArrays, function (o) {
                        return o.createdAt;
                    }).reverse();
                    if (mergedArrays.length === data.totalElements || data.content.length === 0) {
                        this.state.allItemsLoaded = true;
                    }
                    this.setState({
                        isLoading: false,
                        items: mergedArrays,
                        currentPage: this.state.currentPage + 1
                    });
                }, () => {
                    this.setState({
                        isLoading: false,
                        allItemsLoaded: true
                    });
                });
            } else if(this.props.documentId !== documentId) {
                this.setState({isLoading: true});
                jQuery.get(global.config.endpoint + "/api/documents/" + this.props.documentId + "/discussions?page-number=" +
                    this.state.currentPage + "&page-size=" + 5 + "&sort-direction=DESC&sort-property=createdAt").then((data) => {
                    if (currentTotalElements !== data.totalElements) {
                        currentTotalElements = data.totalElements;
                        DiscussionActions.currentTotalDiscussionsChanged(currentTotalElements);
                    }
                    let mergedArrays = mergeArrays(currentItems, data.content);
                    mergedArrays = _.sortBy(mergedArrays, function (o) {
                        return o.createdAt;
                    }).reverse();
                    if (mergedArrays.length === data.totalElements || data.content.length === 0) {
                        this.state.allItemsLoaded = true;
                    }
                    this.setState({
                        isLoading: false,
                        items: mergedArrays,
                        currentPage: this.state.currentPage + 1
                    });
                }, () => {
                    this.setState({
                        isLoading: false,
                        allItemsLoaded: true
                    });
                });
            }
        }, 1);
    },
    getInitialState: function() {
        let initialItems = [
        ];
        return {
            items: initialItems,
            isLoading: false,
            currentPage: 0,
            allItemsLoaded: false
        };
    },
    mixins: [
        Reflux.connect(DiscussionStore, "discussion"),
        Reflux.listenTo(DiscussionActions.discussionCreated, "onDiscussionCreated"),
        State
    ],
    componentWillReceiveProps(nextProps) {
        console.warn("componentWillReceiveProps triggered with props=");
        console.warn(nextProps);
        currentTotalElements = 0;
        DiscussionActions.currentTotalDiscussionsChanged(currentTotalElements);
        let initialItems = [
        ];
        this.setState({
            items: initialItems,
            isLoading: false,
            currentPage: 0,
            allItemsLoaded: false
        });
    },
    onDiscussionCreated() {
        this.setState({
            items: [],
            isLoading: false,
            currentPage: 0,
            allItemsLoaded: false
        });
        this._loadMoreItems();
    },
    _renderItems: function() {
        return this.state.items.map(function(discussion, index) {
            return (
                <li key={"doc-disc-" + discussion.id} className="infinite-scroll-example__list-item">
                    <DiscussionItem data={discussion} />
                </li>
            );
        });
    },
    _renderLoadingMessage: function() {
        if (this.state.isLoading) {
            return (
                <p className="infinite-scroll-example__loading-message">
                    Loading...
                </p>
            );
        }
    },
    _renderWaypoint: function() {
        if (!this.state.isLoading) {
            return (
                <Waypoint
                    onEnter={this._loadMoreItems.bind(this, this.props.documentId)}
                    threshold={1.0}
                    />
            );
        }
    },
    componentDidMount() {
        let discussionRetrievalURI = global.config.endpoint + "/api/documents/" + this.props.documentId + "/discussions?page-number=0&page-size=10&sort-direction=DESC&sort-property=createdAt";
        console.warn(discussionRetrievalURI);
        jQuery.get(discussionRetrievalURI).then((datadiscussion) => {
            console.warn(datadiscussion);
        }, (err) => {
            console.warn(err);
            this.setState({
                notFoundError: true
            });
        });
    },
    createDiscussion(){
        DiscussionActions.createDiscussion(this.props.documentId);
    },
    //<button className="btn btn-default" onClick={this.createDiscussion}> Create</button>
    render: function() {
        return (
            <div id="discussion" key={"doc-disc-container" + this.props.documentId}>
                <div className="ld-panel">
                    <div className="ld-panel-header">
                        <h4>Conversations ({this.state.discussion.currentTotalDiscussionElements})</h4>
                    </div>
                    <div className="ld-panel-content discussion-body">
                        <div className="infinite-scroll-example">
                            <div className="infinite-scroll-example__scrollable-parent">
                                <ul className="discussion-list">
                                    {this._renderItems()}
                                </ul>
                                {this._renderWaypoint()}
                            </div>
                            <p className="infinite-scroll-example__arrow" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Discussion;