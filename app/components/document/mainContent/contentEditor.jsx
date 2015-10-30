"use strict";

import React from "react";
import DocumentActions from "../../../reflux/document/documentActions";
import IframeWithOnLoad from "./iframeWithOnLoad.jsx";
let Button = require("react-bootstrap").Button;
let ButtonToolbar = require("react-bootstrap").ButtonToolbar;
let Badge = require("react-bootstrap").Badge;
let Reflux = require("reflux");
let OverlayTrigger = require("react-bootstrap").OverlayTrigger;
let Popover = require("react-bootstrap").Popover;

let ContentEditor = React.createClass({
    mixins: [Reflux.listenTo(DocumentActions.closeFullscreenEditor, "onCloseFullscreenEditor")],
    iframeNotYetLoaded: 0,
    getInitialState() {
        return {
            className: this.props.className,
            fullScreenOpen: false,
            iframeLoadingStatus: "red"
        };
    },
    componentWillReceiveProps(nextProps) {
        this.setState({
            className: nextProps.className,
            fullScreenOpen: false//,
            //iframeLoadingStatus: "red"
        });
    },
    openInFullscreen() {
        this.setState({
            fullScreenOpen: true
        });
        DocumentActions.openFullscreenEditor(this.props.etherpadURI);
    },
    onCloseFullscreenEditor() {
        console.log("CloseFullScreenEditor has been called");
        this.setState({
            fullScreenOpen: false
        });
    },
    onIframeFinishedLoading() {
        this.setState({
            iframeLoadingStatus: "green"
        });
    },
    getOffset(el) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        console.info("top=" + _y + ", left=" + _x);
        return { top: _y, left: _x };
    },
    onIframeLoaded() {
        setTimeout(() => {
            this.setState({
                iframeLoadingStatus: "red"
            });
            try {
                let iframe = document.getElementById("etherpadEditorIframe");
                let idoc = iframe.contentDocument || iframe.contentWindow.document;
                this.setState({
                    iframeLoadingStatus: "lightred"
                });
                let aceOuter = idoc.getElementsByName("ace_outer")[0];
                let idocAceOuter = aceOuter.contentDocument || aceOuter.contentWindow.document;
                this.setState({
                    iframeLoadingStatus: "orange"
                });
                let aceInner = idocAceOuter.getElementsByName("ace_inner")[0];
                let idocAceInner = aceInner.contentDocument || aceInner.contentWindow.document;
                this.setState({
                    iframeLoadingStatus: "yellow"
                });
                let selection = idocAceInner.getSelection();
                idocAceInner.addEventListener("click", (e) => {
                    DocumentActions.closeMainContentContexMenu();
                });
                idocAceInner.addEventListener("contextmenu", (e) => {
                    let selectionObj = selection.getRangeAt(0);
                    let content = selectionObj.cloneContents();
                    let span = window.document.createElement("SPAN");
                    span.appendChild(content);
                    let htmlContent = span.innerHTML;
                    let currentSelection = {
                        startOffset: selectionObj.startOffset,
                        endOffset: selectionObj.endOffset,
                        htmlContent: htmlContent
                    };
                    console.info(currentSelection);
                    let isSelectionAvailable = true;
                    /*if (currentSelection.startOffset !== currentSelection.endOffset) {
                        isSelectionAvailable = true;
                    }*/
                    DocumentActions.openMainContentContexMenu({
                        clientX: e.clientX,
                        clientY: e.clientY + this.getOffset(iframe).top + 60,
                        currentSelection: currentSelection,
                        isSelectionAvailable: isSelectionAvailable,
                        document: this.props.document
                    }, this.props.document.title);
                    e.preventDefault();
                });
                this.onIframeFinishedLoading();
            } catch (e) {
                this.iframeNotYetLoaded++;
                if (this.iframeNotYetLoaded <= 40) {
                    console.error(e);
                    this.onIframeLoaded();
                }
            }
        }, 1000);
    },
    render() {
        if (!this.props.etherpadURI) {
            return <div id="etherpadEditor" className={this.state.className}></div>;
        }
        var fullScreenButtonIcon = " glyphicon-resize-full";
        if (this.state.fullScreenOpen) {
            fullScreenButtonIcon = " glyphicon-resize-small";
        }
        let iframeLoadingStatusIndicator = <div style={{backgroundColor: this.state.iframeLoadingStatus, width: "100px", height: "100px"}} />;
        return (
            <div id="etherpadEditor" className={this.state.className}>
                <div key={"doc-eth-editor-" + this.props.document.id}>
                    <OverlayTrigger trigger="hover" placement="top" overlay={<Popover>Open <strong>Fullscreen editor</strong>.</Popover>}>
                        <Button className="fullscreen-btn" onClick={this.openInFullscreen}>
                            <span className={"glyphicon" + fullScreenButtonIcon}></span>
                        </Button>
                    </OverlayTrigger>
                    <div className="iframe-loading-inidicator">
                        {iframeLoadingStatusIndicator}
                    </div>
                    {!this.state.fullScreenOpen ? <IframeWithOnLoad id="etherpadEditorIframe" name="etherpadEditor" src={this.props.etherpadURI} scrolling="no" onLoaded={this.onIframeLoaded} seamless>
                    </IframeWithOnLoad> : null}
                </div>
            </div>
        );
    }
});

export default ContentEditor;