"use strict";

import React from "react";
import TagActions from "../../../reflux/app/tag/tagActions";
import TagStore from "../../../reflux/app/tag/tagStore.jsx";
let Button = require("react-bootstrap").Button;
let OverlayTrigger = require("react-bootstrap").OverlayTrigger;
let Popover = require("react-bootstrap").Popover;

let TagsBar  = React.createClass({
    propTypes: {
        tags: React.PropTypes.array.isRequired
    },
    onAddTagClick() {
        TagActions.openAddModal(this.props.parent);
    },
    onTagClick(tag) {
        TagActions.openEditModal(tag, this.props.parent);
    },
    render() {
        if (!this.props.tags) {
            return (
                <div className="tags-bar">
                    <div className="lbl"><a>Tags:&nbsp;</a><Button onClick={this.onAddTagClick}><span className="glyphicon glyphicon-plus"></span></Button></div>
                    Loading...
                </div>
            );
        }
        return (
            <div className="tags-bar">
                <div className="lbl"><a>Tags:&nbsp;</a><Button onClick={this.onAddTagClick}><span className="glyphicon glyphicon-plus"></span></Button></div>
                <ul className="tags">
                    {this.props.tags.map((tag) => {
                        return (
                            <li key={tag.id} onClick={this.onTagClick.bind(this, tag)}>
                                <OverlayTrigger trigger="hover" placement="bottom" overlay={<Popover>{tag.description}</Popover>}>
                                    <a role="button">#{tag.name}</a>
                                </OverlayTrigger>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
});

export default TagsBar;