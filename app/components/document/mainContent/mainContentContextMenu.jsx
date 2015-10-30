"use strict";

import React from "react";
import DocumentActions from "../../../reflux/document/documentActions";
//import htmlDocx from "html-docx-js";
import Filesaver from "browser-filesaver";
import jQuery from "jquery";

const MainContentContextMenu = React.createClass({
    getInitialState() {
        return {
            showContextMenu: false,
            posX: 0,
            posY: 0,
            selection: this.props.selection,
            closeOnMouseOut: false,
            documentTitle: null
        };
    },
    mixins: [
        require('react-onclickoutside')
    ],
    handleClickOutside: function(evt) {
        this.close();
    },
    close() {
        this.setState({ showContextMenu: false });
    },
    open(posX, posY, selection, documentTitle) {
        let selectionText = "";
        if (selection !== undefined && selection.currentSelection !== undefined && selection.currentSelection.htmlContent !== undefined) {
            selectionText = selection.currentSelection.htmlContent;
        }
        console.error(selection);
        this.setState({
            showContextMenu: true,
            posX: posX,
            posY: posY,
            selection: selection,
            closeOnMouseOut: false,
            copyTextToClipboardValue: selectionText,
            documentTitle: documentTitle
        });
    },
    handleMouseEnter() {
        this.state.closeOnMouseOut = true;
    },
    handleMouseLeave() {
        this.close();
    },
    discussParagraph() {
        this.close();
        DocumentActions.createDocument(this.state.selection);
    },
    printDocument() {
        let iframe = document.getElementById("etherpadEditorIframe");
        let idoc = iframe.contentDocument || iframe.contentWindow.document;
        let aceOuter = idoc.getElementsByName("ace_outer")[0];
        let idocAceOuter = aceOuter.contentDocument || aceOuter.contentWindow.document;
        let aceInner = idocAceOuter.getElementsByName("ace_inner")[0];
        let idocAceInner = aceInner.contentDocument || aceInner.contentWindow.document;
        let body = idocAceInner.getElementsByTagName("body")[0];

        // insert into tinymce
        let iframe2 = document.getElementById("content-tmceo_ifr");
        let idoc2 = iframe2.contentDocument || iframe2.contentWindow.document;
        let body2 = idoc2.getElementsByTagName("body")[0];
        while (body2.firstChild) {
            body2.removeChild(body2.firstChild);
        }
        jQuery(body2).append(jQuery(body).html());
        setTimeout(global.tinymce.get("content-tmceo").execCommand("print"), 200);
    },
    exportToWord() {
        let iframe = document.getElementById("etherpadEditorIframe");
        let idoc = iframe.contentDocument || iframe.contentWindow.document;
        let aceOuter = idoc.getElementsByName("ace_outer")[0];
        let idocAceOuter = aceOuter.contentDocument || aceOuter.contentWindow.document;
        let aceInner = idocAceOuter.getElementsByName("ace_inner")[0];
        let idocAceInner = aceInner.contentDocument || aceInner.contentWindow.document;
        let body = idocAceInner.getElementsByTagName("body")[0];

        // insert into tinymce
        let iframe2 = document.getElementById("content-tmceo_ifr");
        let idoc2 = iframe2.contentDocument || iframe2.contentWindow.document;
        let body2 = idoc2.getElementsByTagName("body")[0];
        while (body2.firstChild) {
            body2.removeChild(body2.firstChild);
        }
        jQuery(body2).append(jQuery(body).html());

        global.convertImagesToBase64_c(() => {
            setTimeout(() => {
                var contentDocument = global.tinymce.get("content-tmceo").getDoc();
                var content = "<!DOCTYPE html>" + contentDocument.documentElement.outerHTML;
                //var orientation = document.querySelector('.page-orientation input:checked').value;
                var converted = global.htmlDocx.asBlob(content/*, {orientation: orientation}*/);
                saveAs(converted, this.state.documentTitle + ".docx");
            }, 100);
        });
    },
    render() {
        let style = {
            left: this.state.posX,
            top: this.state.posY
        };
        return (
            <div>
                {this.state.showContextMenu ? <div className="cctx" style={style}>
                    <ul>
                        {this.state.selection.isSelectionAvailable ? <li className="cctx-item" onClick={this.discussParagraph}>
                            <div className="cctx-item-icon">
                                <div className="discuss-section">
                                    <div className="glyph-minus"><span className="glyphicon glyphicon-minus"></span></div>
                                    <div className="glyph-pencil"><span className="glyphicon glyphicon-pencil"></span></div>
                                </div>
                            </div>
                            Start a conversation for this paragraph
                        </li> : null}
                        {this.state.selection.isSelectionAvailable ? <li className="cctx-separator"></li> : null}
                        <li className="cctx-item" onClick={this.printDocument}>
                            <div className="cctx-item-icon">
                            </div>
                            Print this document
                        </li>
                        <li className="cctx-separator"></li>
                        <li className="cctx-item" onClick={this.exportToWord}>
                            <div className="cctx-item-icon">
                            </div>
                            Export this document to a word file
                        </li>
                    </ul>
                </div>: null}
            </div>
        );
    }
});

export default MainContentContextMenu;
