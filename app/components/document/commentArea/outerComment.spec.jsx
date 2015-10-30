"use strict";

import React from "react";
let TestUtils = require("react/lib/ReactTestUtils");
let expect = require("expect");
let OuterComment = require("./outerComment.jsx");

describe("document", function () {
    describe("commentArea", function () {
        describe("outerComment", function () {
            let commentWithChildComments = null;
            let commentWithoutChildComments = null;
            beforeEach(function() {
                let exampleComment = {
                    comments: [
                        {
                            comments: null,
                            createdAt: 1442184003000,
                            id: 7,
                            subcommentlength: 0,
                            text: "test",
                            creator: {
                                createdAt: 1442184003000,
                                fullName: "Test User",
                                id: 3
                            }
                        }
                    ],
                    createdAt: 1442184003000,
                    id: 5,
                    subcommentlength: 1,
                    text: "test",
                    creator: {
                        createdAt: 1442184003000,
                        fullName: "Test User",
                        id: 3
                    }
                };
                let exampleComment2 = {
                    comments: null,
                    createdAt: 1442184003000,
                    id: 5,
                    subcommentlength: 0,
                    text: "test",
                    creator: {
                        createdAt: 1442184003000,
                        fullName: "Test User",
                        id: 3
                    }
                };
                commentWithChildComments = TestUtils.renderIntoDocument(<OuterComment comment={exampleComment} />);
                commentWithoutChildComments = TestUtils.renderIntoDocument(<OuterComment comment={exampleComment2} />);
            });

            it("renders without problems", function () {
                expect(commentWithChildComments).toExist();
            });

            it("renders replies button when child exists", function() {
                let repliesBtn = TestUtils.findRenderedDOMComponentWithClass(commentWithChildComments, "replies-btn");
                expect(repliesBtn).toExist();
            });

            it("doesn't render replies button when no child exists", function() {
                let repliesBtn = null;
                try {
                    repliesBtn = TestUtils.findRenderedDOMComponentWithClass(commentWithoutChildComments, "replies-btn");
                } catch (e) {
                    //
                }
                expect(repliesBtn).toNotExist();
            });

            it("renders edit button", function() {
                let replyBtn = TestUtils.findRenderedDOMComponentWithClass(commentWithoutChildComments, "reply-button");
                expect(replyBtn).toExist();
            });

            it("reply area shows up when edit button is clicked", function() {
                // check that the reply button exists
                let replyBtn = TestUtils.findRenderedDOMComponentWithClass(commentWithoutChildComments, "reply-button");
                expect(replyBtn).toExist();
                // check that the state open variable is not true
                expect(commentWithoutChildComments.state.open).toNotExist();
                let replyPanel = TestUtils.findRenderedDOMComponentWithClass(commentWithoutChildComments, "reply-panel");
                // check that the collapsible area is collapsed
                expect(replyPanel.props.className).toEqual("reply-panel collapse");

                // open the reply panel via click on the reply button
                TestUtils.Simulate.click(replyBtn);
                // assert that the state changes to open
                expect(commentWithoutChildComments.state.open).toExist();
                // wait till the appropriate css classes are applied
                jasmine.clock().tick(600);
                replyPanel = TestUtils.findRenderedDOMComponentWithClass(commentWithoutChildComments, "reply-panel");
                // check if the css classes represent the "open" state
                expect(replyPanel.props.className).toEqual("reply-panel collapse in");

                // check if the edit textarea is empty
                let replyNode = React.findDOMNode(commentWithoutChildComments.refs.reply);
                expect(replyNode.childNodes[0].value).toEqual("");
            });
        });
    });
});
