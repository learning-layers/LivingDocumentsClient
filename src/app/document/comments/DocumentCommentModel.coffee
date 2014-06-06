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
documentCommentModel = angular.module(
  "LivingDocuments.document.comments.model",
  [
    "LivingDocuments.core.baseclass"
    "LivingDocuments.document.comments.service"
  ]
)

class DocumentCommentModel extends BaseEventDispatcher
  constructor: ($log, @DocumentCommentService, @$rootScope) ->
    @activeDocumentComments = @initActiveDocumentComments()
    @defineListeners()
    return
  defineListeners: =>
    @$rootScope.$on(
      'ReceivedData:document.comments',
      (ev, documentId, comments) =>
        @activeDocumentComments.comments = comments
        return
    )
    return
  createComment: (documentId, commentTitle, commentText, parentComment) =>
    return @DocumentCommentService.createComment(
      documentId, commentTitle, commentText, parentComment
    )
  getActiveDocumentComments: =>
    return @activeDocumentComments
  initActiveDocumentComments: =>
    return {
      comments: []
    }
  editComment: (documentId, commentId, commentTitle, commentText) =>
    return @DocumentCommentService.editComment(
      documentId, commentId, commentTitle, commentText
    )
  increaseThumbsUp: (comment) =>
    return @DocumentCommentService.increaseThumbsUp(
      comment.id
    )


documentCommentModel.factory "DocumentCommentModel",
  ['$log', 'DocumentCommentService', '$rootScope',
    ($log, DocumentCommentService, $rootScope) ->
      return new DocumentCommentModel($log,
        DocumentCommentService, $rootScope)
  ]