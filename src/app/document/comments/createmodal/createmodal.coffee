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
createCommentsCreateModal = angular.module(
  "LivingDocuments.document.comments.createmodal",
  [
    "LivingDocuments.core.baseclass"
    "LivingDocuments.document.comments.model"
  ]
)

###
>> CreateCommentModal Controller
###
class CreateCommentModalCtrl extends BaseController
  constructor: ($scope, @$modalInstance, @document, @DocumentCommentModel) ->
    super($scope)
    return
  defineScope: ->
    that = @
    @$scope.document = @document
    @$scope.cancel = ->
      that.$modalInstance.dismiss('cancel')
      return
    @$scope.createComment = @createComment.bind(@)
    return
  createComment: ->
    that = @
    createDiscussionTask =
      @DocumentCommentModel.createComment(
        @$scope.document.id,
        @$scope.title,
        @$scope.text
      )
    createDiscussionTask.success( (success) ->
      that.$modalInstance.dismiss('close')
    )
    return

CreateCommentModalCtrl.$inject =
  ['$scope', '$modalInstance', 'document', 'DocumentCommentModel']
createCommentsCreateModal.controller( 'CreateCommentModalCtrl',
  CreateCommentModalCtrl)