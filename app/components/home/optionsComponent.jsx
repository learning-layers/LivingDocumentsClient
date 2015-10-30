"use strict";

import React from "react";
import UserStore from "../../reflux/user/userStore";
import swal from "sweetalert";
import jQuery from "jquery";
import HomeViewActions from "../../reflux/views/home/homeViewActions";
import HomeViewStore from "../../reflux/views/home/homeViewStore.jsx";
let Button = require("react-bootstrap").Button;

let OptionsComponent = React.createClass({
    getInitialState() {
        return {
            isCreator: true,
            initialized: false
        };
    },
    deleteDocument(documentId, e) {
        let document = HomeViewStore.findDocumentInDocumentListById(documentId);
        console.warn(document);
        swal({
            title: "Are you sure you want to delete the document '" + document.title + "'?",
            text: "Warning: You will not be able to recover the document '" + document.title + "'! Type 'delete' and press ok to continue!",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Type delete and press ok to continue!"
        }, function(inputValue){
            if (inputValue === false) {
                return false;
            }
            if (inputValue !== null && inputValue.toLowerCase() === "delete") {
                jQuery.ajax({
                    url: global.config.endpoint + "/api/documents/" + documentId,
                    type: "DELETE",
                    success: function(result) {
                        HomeViewActions.refreshHomeView();
                        swal("Deleted!", "Document " + document.title + " has been deleted!", "success");
                    },
                    error: function (error) {
                        console.warn(error);
                        if (error.status !== 200) {
                            swal("Deletion failed!", "The deletion of document with title " + document.title + " failed!.", "error");
                        } else {
                            HomeViewActions.refreshHomeView();
                            // parse error // TODO api has to be changed to return the id (or any valid json obj)
                            swal("Deleted!", "Document " + document.title + " has been deleted!", "success");
                        }
                    }
                });
                return true;
            } else {
                swal("Canceled!", "You aborted the deletion of document with title " + document.title + ".", "warning");
                return false;
            }
        });
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    },
    updateCreator(props) {
        let document = HomeViewStore.findDocumentInDocumentListById(props.data);
        let currentUser = UserStore.getCurrentUser();
        let isCreator = false;
        if (document && document.creator.id === currentUser.id) {
            isCreator = true;
        }
        if (this.state.isCreator !== isCreator) {
            this.setState({
                isCreator: isCreator,
                initialized: true
            });
        } else if (!this.state.initialized) {
            this.setState({
                initialized: true
            });
        }
    },
    componentDidMount() {
        this.updateCreator(this.props);
    },
    componentWillReceiveProps(nextProps) {
        this.updateCreator(nextProps);
    },
    render: function() {
        var style = {
            visibility: "visible"
        };
        if (!this.state.initialized) {
            style.visibility = "hidden";
        }
        return (
            <div>
                {this.state.isCreator ? <Button className="delete-document-btn" style={style} onClick={this.deleteDocument.bind(this, this.props.data)}>
                    <span className="glyphicon glyphicon-trash"></span>
                </Button>: null}
            </div>
        );
    }
});

export default OptionsComponent;