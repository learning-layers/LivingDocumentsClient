###

  Copyright 2014 Karlsruhe University of Applied Sciences

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
  createComment: (documentId, commentTitle, commentText) ->
    that = @
    return @$http.post(
      @basePath + '/document/' + documentId + '/comment',
      {
        documentId: documentId,
        commentTitle: commentTitle,
        commentText: commentText
      },
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString}
    )
    .success (success) ->
      that.$log.debug "Created comment with id=" + success.comment.id
      return

DocumentCommentService.$inject = ['SecurityService','$http', '$log']
documentCommentService.service(
  "DocumentCommentService",
  DocumentCommentService
)