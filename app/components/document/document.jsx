"use strict";

import React from "react";
import ReactRouter from "react-router";
import jQuery from "jquery";
import DocumentActions from "../../reflux/document/documentActions";
import DocumentStore from "../../reflux/document/documentStore.jsx";
import Breadcrumbs from "./breadcrumbs.jsx";
import MainContent from "./mainContent/mainContent.jsx";
import CommentArea from "./sssCommentArea/sssCommentArea.jsx";
import Discussion from "./discussionArea/discussion.jsx";
import jQueryUtils from "../../util/jQueryUtils.js";
import TagsBar from "./navigationArea/tagsBar.jsx";
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;
let ButtonToolbar = require("react-bootstrap").ButtonToolbar;
let Button = require("react-bootstrap").Button;
let Reflux = require("reflux");
let OverlayTrigger = require("react-bootstrap").OverlayTrigger;
let Popover = require("react-bootstrap").Popover;
let State = ReactRouter.State;

let LDDocument  = React.createClass({
    statics: {
        rolesAllowed: ["ROLE_USER", "ROLE_ADMIN"],
        onEnter: function(currentParams, currentQuery) {
            let dfd = jQuery.Deferred();
            let documentId = currentParams.documentId;
            // loading document and it's breadcrumbs in parallel
            // otherwise jQuery get would be sufficient
            jQueryUtils.whenWithProgress([
                {promiseName: "retrieveDocument", promiseObj: jQuery.get(global.config.endpoint + "/api/documents/" + documentId)},
                {promiseName: "retrieveBreadcrumbs", promiseObj: jQuery.get(global.config.endpoint + "/api/documents/" + documentId + "/breadcrumbs")},
                {promiseName: "retrieveEtherpadInfo", promiseObj: jQuery.get(global.config.endpoint + "/api/documentEtherpadInfo/edit/" + documentId)}
            ]).then((documentData, breadcrumbData, etherpadInfoData) => {
                document.title = documentData.title + " | Living Documents";
                console.debug("Retrieved document with id=" + documentId + "; data=");
                console.debug(documentData);
                DocumentActions.documentRetrieved(documentData);
                console.debug("Retrieved breadcrumbs for document with id=" + documentId + "; data=");
                console.debug(breadcrumbData);
                DocumentActions.breadcrumbsRetrieved(breadcrumbData);
                console.debug("Retrieved etherpadInfo for document with id=" + documentId + "; data=");
                console.debug(etherpadInfoData);
                DocumentActions.etherpadInfoRetrieved(etherpadInfoData);
                dfd.resolve();
            }, () => {
                console.error("Access to document with id=" + documentId + " denied!");
                dfd.reject();
            });
            return dfd.promise();
        }
    },
    mixins: [Reflux.connect(DocumentStore, "document"), Reflux.listenTo(DocumentActions.insertIntoTinyMce, "onInsertIntoTinyMce"), State],
    getInitialState() {
        return {
            discussionsLarge: true
        };
    },
    openSharingModal() {
        DocumentActions.openShareDocumentModal(this.state.document.currentDocument);
    },
    closeDiscussions() {
        this.setState({
            discussionsLarge: !this.state.discussionsLarge
        });
    },
    onInsertIntoTinyMce(content) {
        this.refs.tinyEditor._init({
            selector: "#content-tmce",
            plugins: "print image"
        }, content);
    },
    handleEditorChange(e) {
        console.warn(e.target.getContent());
    },
    render() {
        // check that required values are not null
        if (this.state.document.currentDocument === null ||
            this.state.document.currentBreadcrumbs === null ||
            this.state.document.currentEtherpadInfo === null) {
            return <div className="document">Loading...</div>;
        }
        var discussionWidth = "col-lg-3 col-md-4 col-sm-12";
        var mainContentWidth = "col-lg-9 col-md-8 col-sm-12";
        var openCloseDiscussionButtonStyle = " glyphicon-chevron-right";
        if (!this.state.discussionsLarge) {
            discussionWidth = "hidden";
            mainContentWidth = "col-lg-12 col-md-12 col-sm-12";
            openCloseDiscussionButtonStyle = " glyphicon-chevron-left";
        }
        return (
            <div className="document">
                <Grid fluid>
                    <Row className="show-grid">
                        <Col lg={12} md={12} sm={12}>
                            <div className="breadcrumb-tag-wrapper">
                                <Breadcrumbs breadcrumbs={this.state.document.currentBreadcrumbs}/>
                                <TagsBar parent={this.state.document.currentDocument} tags={this.state.document.currentDocument.tags}/>
                            </div>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <div className={mainContentWidth}>
                            <MainContent document={this.state.document.currentDocument} etherpadURI={this.state.document.currentEtherpadInfo} />
                            <div className="sharing-indicator">
                                <OverlayTrigger trigger="hover" placement="top" overlay={<Popover><strong>Share</strong> this document with others!</Popover>}>
                                    <Button className="sharing-indicator-btn" onClick={this.openSharingModal}>
                                        <span className={"glyphicon glyphicon glyphicon-share-alt"}></span>
                                    </Button>
                                </OverlayTrigger>
                            </div>
                            <div className="toggle-discussions visible-lg visible-md">
                                <OverlayTrigger trigger="hover" placement="top" overlay={<Popover>Hide Sub-Documents and Recommendations.</Popover>}>
                                    <Button className="close-discussion-btn" onClick={this.closeDiscussions}>
                                        <span className={"glyphicon" + openCloseDiscussionButtonStyle}></span>
                                    </Button>
                                </OverlayTrigger>
                            </div>
                            <div className="clearfix"></div>
                            <CommentArea key={"ca-doc-" + this.state.document.currentDocument.id} documentId={this.state.document.currentDocument.id} />
                        </div>
                        <div className={discussionWidth}>
                            <Discussion documentId={this.state.document.currentDocument.id} />
                        </div>
                    </Row>
                </Grid>
            </div>
        );
    }
});

module.exports = LDDocument;