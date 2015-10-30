"use strict";

import React from "react";
import ReactRouter from "react-router";
import AuthStore from "../../reflux/auth/authStore";
import AuthActions from "../../reflux/auth/authActions";
import ConnectionIndicator from "./connectionIndicator.jsx";
import DocumentActions from "../../reflux/document/documentActions.js";
import DocumentStore from "../../reflux/document/documentStore.jsx";
import UserStore from "../../reflux/user/userStore";
import Main from "../../main.jsx";
let Reflux = require("reflux");
let Navbar = require("react-bootstrap").Navbar;
let Nav = require("react-bootstrap").Nav;
let NavItem = require("react-bootstrap").NavItem;
let DropdownButton = require("react-bootstrap").DropdownButton;
let NavDropdown = require("react-bootstrap").NavDropdown;
let MenuItem = require("react-bootstrap").MenuItem;
let Button = require("react-bootstrap").Button;
let State = ReactRouter.State;
let Link = ReactRouter.Link;

import layersBrandUrl from "../../assets/img/layers/layers-large-transparent-500.png";

let Header = React.createClass({
    mixins: [Reflux.connect(AuthStore, "auth"), Reflux.connect(UserStore, "user"), State],
    getInitialState() {
        return {
            counter: 0,
            documentDropDownOpen: false,
            settingsDropDownOpen: false,
            showCollapsedNavbar: false,
            _routePath: null
        };
    },
    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    },
    componentWillMount() {
        this.setState({
            _routePath: this.getPath()
        });
    },
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
    componentWillUpdate() {
        var newPath = this.getPath();

        if (this.state._routePath !== newPath) {
            this.setState({
                _routePath: newPath
            });
            this.closeCollapsedNavBar();
        }
    },
    closeCollapsedNavBar() {
        if (this.state.showCollapsedNavbar) {
            this.setState({
                showCollapsedNavbar: false
            });
        }
    },
    handleResize() {
        let clientWidthHeight = this.setWindowSize();
        if (clientWidthHeight[0] > 767) {
            this.closeCollapsedNavBar();
        }
    },
    setWindowSize() {
        let clientWidthHeight = [];
        if (typeof (window.innerWidth) === "number") {
            clientWidthHeight[0] = window.innerWidth;
            clientWidthHeight[1] = window.innerHeight;
        } else {
            if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                clientWidthHeight[0] = document.documentElement.clientWidth;
                clientWidthHeight[1] = document.documentElement.clientHeight;
            } else {
                if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                    clientWidthHeight[0] = document.body.clientWidth;
                    clientWidthHeight[1] = document.body.clientHeight;
                }
            }
        }
        return clientWidthHeight;
    },
    toggleDocumentDropdown() {
        this.setState({
            documentDropDownOpen: !this.state.documentDropDownOpen
        });
    },
    toggleSettingsDropdown(event) {
        this.setState({
            settingsDropDownOpen: !this.state.settingsDropDownOpen
        });
    },
    openUserProfile(id) {
        Main.getRouter().then(function(router) {
            router.transitionTo("login", {}, {});
        });
    },
    logout() {
        this.closeCollapsedNavBar();
        this.closeSettingsDropdown();
        AuthActions.logout();
    },
    openCreateDocumentModal() {
        this.closeCollapsedNavBar();
        this.closeDocumentDropdown();
        DocumentActions.createDocument();
    },
    closeDocumentDropdown() {
        this.setState({
            documentDropDownOpen: false
        });
    },
    closeSettingsDropdown() {
        this.setState({
            settingsDropDownOpen: false
        });
    },
    toggleCollapsedNavbar() {
        this.setState({
            showCollapsedNavbar: !this.state.showCollapsedNavbar
        });
    },
    render() {
        let isLoggedIn = this.state.auth.isLoggedIn;
        let endpoint = global.config.endpoint;
        let documentOpenCssClass = "";
        if (this.state.documentDropDownOpen) {
            documentOpenCssClass = " open";
        }
        let settingsOpenCssClass = "";
        if (this.state.settingsDropDownOpen) {
            settingsOpenCssClass = " open";
        }
        let username = "";
        let profilePath = "";
        if (this.state.user && this.state.user.currentUser !== null) {
            username = this.state.user.currentUser.username;
            profilePath = "#/user/" + this.state.user.currentUser.id;
        }
        let inClass = "";
        if (this.state.showCollapsedNavbar) {
            inClass = " in";
        }
        let userId = "";
        if (this.state.user.currentUser !== null) {
            userId = this.state.user.currentUser.id;
        }
        return (
            <div className="navbar navbar-static-top">
                <div className="navbar-brand">
                    <a href="#/home" onClick={this.closeCollapsedNavBar}>
                        <img src={layersBrandUrl} width="24" height="16" alt="Learning Layers" />
                        Living Documents
                    </a>
                </div>
                <button className="navbar-toggle" type="button" data-toggle="collapse" onClick={this.toggleCollapsedNavbar}>
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                {isLoggedIn ? <ul className="navbar-collapse collapse left-items">
                    <li role="presentation"><Link to="home">Home</Link></li>
                    <li className={"dropdown" + documentOpenCssClass} onMouseLeave={this.closeDocumentDropdown}>
                        <a role="button" className="dropdown-toggle" onClick={this.toggleDocumentDropdown}>
                            <span>Document</span>
                            <span> </span>
                            <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu" role="menu">
                            <li role="presentation" className="">
                                <a role="button" tabIndex="-1" onClick={this.openCreateDocumentModal}>New Document</a>
                            </li>
                            <li role="presentation" className="">
                                <a role="button" href="#/explorer" tabIndex="-1" onClick={this.closeCollapsedNavBar}>My Folders</a>
                            </li>
                        </ul>
                    </li>
                </ul>: null}
                {this.state.showCollapsedNavbar ? <div className="clearfix"></div> : null}
                <nav className={"navbar-collapse collapse" + inClass}>
                {isLoggedIn ? <ul className="nav navbar-nav navbar-right">
                        <span></span>
                        <li className="hidden-sm hidden-md hidden-lg" role="presentation">
                            <a href="#/home" onClick={this.closeCollapsedNavBar}>Home</a>
                        </li>
                        <li className={"hidden-sm hidden-md hidden-lg dropdown" + documentOpenCssClass} tabindex="-1" onMouseLeave={this.closeDocumentDropdown}>
                            <a role="button" className="dropdown-toggle" type="button" onClick={this.toggleDocumentDropdown}>
                                <span>Document</span>
                                <span>
                                    <span>
                                    </span>
                                    <span className="caret">
                                    </span>
                                </span>
                            </a>
                            <ul className="dropdown-menu" role="menu">
                                <li role="presentation">
                                    <a role="button" tabindex="-1" onClick={this.openCreateDocumentModal}>
                                        New Document
                                    </a>
                                </li>
                                <li role="presentation">
                                    <a href="#/explorer" onClick={this.closeCollapsedNavBar}>
                                        My Folders
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li role="presentation">
                            <a role="button" href="#" onClick={this.closeCollapsedNavBar}>
                                Alert
                            </a>
                        </li>
                        <li tabindex="-1" className={"dropdown" + settingsOpenCssClass} onMouseLeave={this.closeSettingsDropdown}>
                            <a role="button" className="dropdown-toggle" onClick={this.toggleSettingsDropdown}>
                                <span>
                                    {username}
                                </span>
                                <span>
                                    <span>
                                    </span>
                                    <span className="caret">
                                    </span>
                                </span>
                            </a>
                            <ul className="dropdown-menu" role="menu">
                                <li role="presentation">
                                    <a role="button" href={"#/user/" + userId} onClick={this.closeCollapsedNavBar}>
                                        Edit Profile
                                    </a>
                                </li>
                                <li role="presentation">
                                    <a role="button" tabindex="-1" onClick={this.logout}>
                                        Sign out
                                    </a>
                                </li>
                                <li role="presentation">
                                    <a role="menuitem" tabindex="-1" target="_blank" href="https://api.learning-layers.eu/o/oauth2/logout" onClick={this.logout}>
                                        Sign out from OIDC
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                : null}
                {!isLoggedIn ? <ul className="nav navbar-nav navbar-right">
                    <span></span>
                    <li role="presentation">
                        <a href={global.config.endpoint + "/openid_connect_login?identifier=https%3A%2F%2Fapi.learning-layers.eu%2Fo%2Foauth2%2F"}>
                            Login
                        </a>
                    </li>
                </ul>: null}
                </nav>
            </div>
        );
    }
});

export default Header;