"use strict";

import React from "react";
let TestUtils = require("react/lib/ReactTestUtils");
let expect = require("expect");
let Home = require("./components/home/home.jsx");

describe("home", function () {
    it("renders without problems", function () {
        let home = TestUtils.renderIntoDocument(<Home/>);
        expect(home).toExist();
    });
});