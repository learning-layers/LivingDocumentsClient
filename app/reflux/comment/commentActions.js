"use strict";

let Reflux = require("reflux");

let CommentActions = Reflux.createActions([
    "createComment",
    "newCommentCreated",
    "commentRetrieved",
    "currentTotalElementsChanged",
    "loadMoreItems",
    "resetState",
    "deleteCommentFromList"
]);

module.exports = CommentActions;