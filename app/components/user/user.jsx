"use strict";

import React from "react";
import AuthStore from "../../reflux/auth/authStore";
import UserStore from "../../reflux/user/userStore";
import UserProfileStore from "../../reflux/userProfile/userProfileStore";
import UserProfileActions from "../../reflux/userProfile/userProfileActions";
import AuthActions from "../../reflux/auth/authActions";
import ReactRouter from "react-router";
import jQuery from "jquery";
import swal from "sweetalert";
import ReactIntl from "../../../node_modules/react-intl";
import HomeModel from "../home/homeModel.js";
import TagsBar from "../document/navigationArea/tagsBar.jsx";
import Main from "../../main.jsx";
let Reflux = require("reflux");
let Grid = require("react-bootstrap").Grid;
let Row = require("react-bootstrap").Row;
let Col = require("react-bootstrap").Col;
let TabbedArea = require("react-bootstrap").TabbedArea;
let TabPane = require("react-bootstrap").TabPane;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let Button = require("react-bootstrap").Button;
let Collapse = require("react-bootstrap").Collapse;
let Well = require("react-bootstrap").Well;
let FormControls = require("react-bootstrap").FormControls;
let ProgressBar = require("react-bootstrap").ProgressBar;

let ProfileTabs = React.createClass({
    mixins: [Reflux.connect(UserStore, "user"), ReactRouter.State],
    getInitialState() {
        return {
            fullName: this.props.user.fullName,
            description: this.props.user.description,
            userUpdateInProgress: false
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            fullName: nextProps.user.fullName,
            description: nextProps.user.description
        });
    },
    changeFullNameHandler(event) {
        this.setState({fullName: event.target.value});
    },
    changeDescriptionHandler(event) {
        this.setState({description: event.target.value});
    },
    updateProfile: function(e) {
        e.preventDefault();
        this.setState({
            userUpdateInProgress: true
        });
        let updatedUser = {
            fullName: this.state.fullName,
            description: this.state.description
        };
        jQuery.ajax({
            url: global.config.endpoint + "/api/users/profile",
            type: "PUT",
            data: JSON.stringify(updatedUser),
            success: function(response) {
                UserProfileActions.userUpdated(response);
            }
        });
        this.setState({
            userUpdateInProgress: false
        });
    },
    render: function() {
        if (this.state.user.currentUser === null) {
            return <div>Loading...</div>;
        }
        let isCurrentUser = this.state.user.currentUser.id === this.props.user.id;
        if (!isCurrentUser) {
            return(
                <div>
                    <h2>Personal Info</h2>
                    <form>
                        <FormControls.Static label="Full Name" value={this.state.fullName}/>
                        <FormControls.Static label="Description" value={this.state.description}/>
                    </form>
                </div>
            );
        }
        return (
        <TabbedArea className="tabs-bar" defaultActiveKey={1}>
            <TabPane eventKey={1} tab='Profile'>
                <h2>Personal Info</h2>
                <form>
                    <Input ref="fullNameInput" type="text" label="Full Name" value={this.state.fullName} onChange={this.changeFullNameHandler} placeholder="Full Name" disabled={!isCurrentUser}/>
                    <Input ref="descriptionInput" type="textarea" label="Description" value={this.state.description} onChange={this.changeDescriptionHandler} placeholder="Description" disabled={!isCurrentUser}/>
                    <ButtonInput type="submit" value="Submit" onClick={this.updateProfile}/>
                </form>
            </TabPane>
            <TabPane eventKey={2} tab="Settings" disabled={!isCurrentUser}>
                <div>
                    <Button onClick={ ()=> this.setState({ open: !this.state.open })}>
                        Change Password
                    </Button>
                    <Collapse in={this.state.open}>
                        <div>
                            <Well>
                                <Input type='password' label="Password" />
                                <Input type='password' label="Password Confirmation" />
                                <ButtonInput type="submit" value="Change password" />
                            </Well>
                        </div>
                    </Collapse>
                </div>
            </TabPane>
        </TabbedArea>
        );
    }
});

let Avatar = React.createClass({
    mixins: [Reflux.connect(UserStore, "user"), ReactRouter.State],
    getInitialState() {
        return {
            avatarUploadInProgress: false,
            file: null,
            timestamp: new Date(),
            tags: [],
            userId: this.props.user.id
        };
    },
    componentDidMount() {
        jQuery.get(global.config.endpoint + "/api/users/"+ this.props.user.id +"/tags").then((data)=> {
            if (Array.isArray(data.content)) {
                this.setState({
                    tags: data.content
                });
            }
            UserProfileActions.tagsRetrieved(this.state.tags);
        }, () => {
            console.error("Access to tags of user with id=" + this.props.user.id + " denied");
        });
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.user.id !== this.state.userId) {
            this.setState({
                avatarUploadInProgress: false,
                file: null,
                timestamp: new Date(),
                tags: [],
                userId: nextProps.user.id
            });
            jQuery.get(global.config.endpoint + "/api/users/" + nextProps.user.id + "/tags").then((data)=> {
                this.setState({
                    tags: data
                });
                //UserProfileActions.tagsRetrieved(this.state.tags);
            }, () => {
                console.error("Access to tags of user with id=" + nextProps.user.id + " denied");
            });
        }
    },
    handleChange: function(event) {
        let file = {
            name: event.target.files[0].name,
            handle: event.target.files[0]
        };
        this.setState({
            file: file,
            timestamp: new Date()
        });
    },
    uploadAvatar: function() {
        this.setState( {
            avatarUploadInProgress: true
        });
        let file = this.state.file;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", global.config.endpoint + "/api/users/avatar");
        xhr.withCredentials = true;
        xhr.upload.onprogress = function (e) {
            file.uploadProgress = ((e.loaded / e.total) * 100);
            this.setState({
                file: file
            });
        }.bind(this);

        xhr.onload = function () {
            file.uploadFinished = true;
            file.uploadProgress = 100;
            this.setState({
                file: file,
                avatarUploadInProgress: false,
                timestamp: new Date()
            });
        }.bind(this);
        let form = new FormData();
        form.append("file", this.state.file.handle);
        xhr.send(form);
    },
    render: function() {
        if (this.state.user.currentUser === null) {
            return <div></div>;
        }
        let isCurrentUser = this.state.user.currentUser.id === this.props.user.id;
        let avatarPath = global.config.endpoint+ "/api/users/avatar/"+this.props.user.id;
        if (!isCurrentUser) {
            return(
                <div>
                    <img src={avatarPath}></img>
                    <TagsBar parent={this.props.user} tags={this.state.tags} />
                </div>
            );
        }
        return(
            <div>
                <div id="img-container">
                    <img key={this.state.timestamp} className="img-responsive" src={avatarPath}></img>
                    <Button className="btn-avatar" onClick={ ()=> this.setState({ open: !this.state.open })}>
                        <span className="glyphicon glyphicon-edit"></span>
                         Edit
                    </Button>
                </div>
                <Collapse in={this.state.open}>
                    <div>
                        <Well>
                            <form onSubmit={this.uploadAvatar}>
                                <Input ref="avatarUpload" type='file' label='File'  onChange={this.handleChange} />
                                <ButtonInput type="submit" value="Submit" disabled={this.state.file===null}/>
                            </form>
                            <div>
                                {this.state.file===null || this.state.file.uploadFinished ? <div/> :
                                    <div className="col-12">{this.state.file.uploadProgress ?
                                        <ProgressBar active now={this.state.file.uploadProgress}/> :
                                        <ProgressBar active now={0}/>}</div>
                                }
                            </div>
                        </Well>
                    </div>
                </Collapse>
                <TagsBar parent={this.props.user} tags={this.state.tags} />
            </div>
        );
    }
});

let User = React.createClass({
    mixins: [Reflux.connect(UserProfileStore, "userProfile"), ReactRouter.State],
    statics: {
        rolesAllowed: ["ROLE_USER", "ROLE_ADMIN"],
        onEnter(currentParams, currentQuery) {

            console.debug("Trying to enter route user with id=" + currentParams.userId);
            let userId = currentParams.userId;

            let dfd = jQuery.Deferred(); // jshint ignore:line
            jQuery.get(global.config.endpoint + "/api/users/id?id=" + userId).then((dataUser) => {
                // TODO check on the server side why the address for retrieving the user is not
                // https://<domain>/api/users/<userId>
                document.title = "Userprofile | Living Documents";
                console.debug("Retrieved user=");
                console.debug(dataUser);
                UserProfileActions.userRetrieved(dataUser);
                dfd.resolve();
            }, () => {
                console.error("Access to user with id=" + userId + " denied!");
                dfd.reject();
            });
            return dfd.promise();
        }
    },
    getInitialState: function() {
        return {

        };
    },
    render: function() {
        if (this.state.userProfile.user === null) {
            return <div className="user"></div>;
        }
        return (
            <div className="user">
                <Grid fluid>
                    <Row className="show-grid">
                        <Col lg={3}>
                            <Avatar user={this.state.userProfile.user}/>
                        </Col>
                        <Col className="profile-tabs" lg={9}>
                            <ProfileTabs user={this.state.userProfile.user}/>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
});

module.exports = User;