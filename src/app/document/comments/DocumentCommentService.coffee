###

  Code contributed to the Learning Layers project
  http://www.learning-layers.eu
  Development is partly funded by the FP7 Programme of the European
  Commission under Grant Agreement FP7-ICT-318209.
  Copyright (c) 2014, Karlsruhe University of Applied Sciences.
  For a list of contributors see the AUTHORS file at the top-level directory
  of this distribution.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

###
documentCommentService = angular.module(
  "LivingDocuments.document.comments.service",
  [
    "LivingDocuments.core.baseclass"
  ]
)

class DocumentCommentService extends BaseService
  constructor: (SecurityService, $http, $log) ->
    super(SecurityService, $http)
    @$log = $log.getInstance("DocumentCommentService")
    return
  createComment: (documentId, commentTitle, commentText, parentComment) =>
    return @$http.post(
      @basePath + '/document/' + documentId + '/comment',
      {
        documentId: documentId,
        commentTitle: commentTitle,
        commentText: commentText,
        parentComment: parentComment
      },
      headers: {
        "Authorization": @SecurityService.currentUser.authorizationString
      }
    ).success (success) =>
      @$log.debug "Created comment with id=" + success.commentId
      return
  editComment: (documentId, commentId, commentTitle, commentText) =>
    return @$http.put(
      @basePath + '/document/' + documentId + '/comment',
      {
        commentId: commentId,
        commentTitle: commentTitle,
        commentText: commentText
      },
      headers: {
        "Authorization": @SecurityService.currentUser.authorizationString
      }
    ).success (success) =>
      @$log.debug "Edited comment with id=" + commentId
      return
    return
  increaseThumbsUp: (commentId) =>
    return @$http.put(
      @basePath + '/documentcomment/' + commentId + '/like',
      {
        commentId: commentId
      },
      headers: {
        "Authorization": @SecurityService.currentUser.authorizationString
      }
    ).success (success) =>
      @$log.debug "Liked comment with id=" + commentId
      return
    return

DocumentCommentService.$inject = ['SecurityService','$http', '$log']
documentCommentService.service(
  "DocumentCommentService",
  DocumentCommentService
)