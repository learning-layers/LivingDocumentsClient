"use strict";

import React from "react";
let Reflux = require("reflux");
let TestUtils = require("react/lib/ReactTestUtils");
let expect = require("expect");
let _ = require("lodash");

describe("app", function () {
    describe("tags", function () {
        describe("editTagModal", function () {
            let editTagModalInstance = null;
            let tag1 = null;
            let tag2 = null;
            let TagActions = null;
            beforeEach(function() {
                tag1 = {
                    id: 1,
                    name: "tag1"
                };
                tag2 = {
                    id: 2,
                    name: "tag2"
                };
                TagActions = require("../../../reflux/app/tag/tagActions");
                let EditTagModal = require("./editTagModal.jsx");
                editTagModalInstance = TestUtils.renderIntoDocument(<EditTagModal />);
            });

            it("renders without problems", function () {
                expect(editTagModalInstance).toExist();
            });

            it("renders with provided content", function () {
                expect(editTagModalInstance.open).toExist();
                editTagModalInstance.open(tag1);
                expect(editTagModalInstance.state.id).toEqual(1);
                expect(editTagModalInstance.state.tagName).toEqual("tag1");
                expect(editTagModalInstance.refs.tagNameInput).toExist();
                let tagNameInputNode = React.findDOMNode(editTagModalInstance.refs.tagNameInput);
                expect(tagNameInputNode.childNodes[1].value).toEqual("tag1");
            });

            it("rerenders with provided content", function () {
                expect(editTagModalInstance.open).toExist();
                editTagModalInstance.open(tag1);
                expect(editTagModalInstance.state.id).toEqual(1);
                expect(editTagModalInstance.close).toExist();
                editTagModalInstance.close();
                expect(editTagModalInstance.showContextMenu).toNotExist();

                expect(editTagModalInstance.open).toExist();
                editTagModalInstance.open(tag2);
                expect(editTagModalInstance.state.id).toEqual(2);
                expect(editTagModalInstance.state.tagName).toEqual("tag2");
                expect(editTagModalInstance.refs.tagNameInput).toExist();
                let tagNameInputNode = React.findDOMNode(editTagModalInstance.refs.tagNameInput);
                expect(tagNameInputNode.childNodes[1].value).toEqual("tag2");
            });

            it("closes when close button is pressed", function () {
                editTagModalInstance.open(tag1);
                let closeBtn = editTagModalInstance.refs.closeBtn;
                expect(closeBtn).toExist();
                TestUtils.Simulate.click(closeBtn);
                expect(editTagModalInstance.showContextMenu).toNotExist();
            });

            it("changes input value on user input", function () {
                editTagModalInstance.open(tag1);
                let tagNameInputNode = React.findDOMNode(editTagModalInstance.refs.tagNameInput);
                tagNameInputNode.value = 'tag3';
                TestUtils.Simulate.change(tagNameInputNode);
                jasmine.clock().tick();
                tagNameInputNode = React.findDOMNode(editTagModalInstance.refs.tagNameInput);
                expect(tagNameInputNode.value).toEqual("tag3");
            });

            it("persist edited tag information", function () {
                editTagModalInstance.open(tag1);
                let tagNameInputNode = React.findDOMNode(editTagModalInstance.refs.tagNameInput);
                tagNameInputNode.value = 'tag3';
                TestUtils.Simulate.change(tagNameInputNode);
                let editTagBtn = editTagModalInstance.refs.editTagBtn;
                expect(editTagBtn).toExist();
                expect(TagActions).toExist();
                expect(TagActions.editTag).toExist();
                let TagStore = require("../../../reflux/app/tag/tagStore.jsx");
                // we have to create a copy of the store because the listenables have
                // already been initialized when the require statement has been executed
                // thus we have no chance to setup our proxy spy
                let tagStoreCopy = copyStore(TagStore);
                var onEditTagSpy = expect.spyOn(tagStoreCopy, "onEditTag");
                let store = Reflux.createStore(tagStoreCopy);
                jasmine.clock().tick(300);
                TestUtils.Simulate.click(React.findDOMNode(editTagBtn).childNodes[0]);
                jasmine.clock().tick(300);
                expect(onEditTagSpy.calls.length).toEqual(1);
            });
        });
    });
});

function copyStore(store) {
    let storeCopy = {};
    for(let key in store) {
        var exceptions = [
            "hasListener",
            "listenToMany",
            "validateListening",
            "listenTo",
            "eventLabel",
            "emitter",
            "stopListeningTo",
            "stopListeningToAll",
            "fetchInitialState",
            "joinTrailing",
            "joinLeading",
            "joinConcat",
            "joinStrict",
            "preEmit",
            "shouldEmit",
            "listen",
            "promise",
            "listenAndPromise",
            "trigger",
            "triggerAsync",
            "triggerPromise",
            "subscriptions"
        ];
        if (!_.contains(exceptions, key)) {
            let value = store[key];
            storeCopy[key] = value;
        }
    }
    return storeCopy;
}