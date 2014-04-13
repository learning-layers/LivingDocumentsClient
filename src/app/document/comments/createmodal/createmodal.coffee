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
  constructor: ($scope, @$modalInstance, $log, @document,
                @DocumentCommentModel, @comment, @cmd,
                @commentList, @rootScope) ->
    super($scope)
    @$log = $log.getInstance("CreateCommentModalCtrl")
    if angular.isDefined @comment
      @$log.debug(@comment)
    return
  defineScope: ->
    that = @
    @$scope.cmd = @cmd
    if (@cmd == 'Edit')
      @$scope.title = @comment.title
      @$scope.text = @comment.text
    @$scope.document = @document
    if angular.isDefined @comment
      @$scope.comment = @comment
    @$scope.cancel = ->
      that.$modalInstance.dismiss('cancel')
      return
    @$scope.createComment = @createComment.bind(@)
    return
  createComment: ->
    that = @
    newTitle = @$scope.title
    newText = @$scope.text
    if (@cmd != 'Edit')
      parentComment = @comment
      createCommentTask =
        @DocumentCommentModel.createComment(
          @$scope.document.id,
          newTitle,
          newText,
          @comment
        )
      createCommentTask.success((success) ->
        if (angular.isDefined(success.documentId))
          that.commentList.comments.add(
            {
              id: success.commentId
              title: newTitle
              text: newText
            }
          )
        else if (angular.isDefined(success.parentId))
          that.comment.commentList.add(
            {
              id: success.commentId
              title: newTitle
              text: newText
            }
          )
        that.$modalInstance.dismiss('close')
        return
      )
    else if (@cmd == 'Edit')
      commentToEdit = @comment
      editCommentTask =
        @DocumentCommentModel.editComment(
          @$scope.document.id,
          @comment.id,
          newTitle,
          newText
        )
      editCommentTask.success((success) ->
        commentToEdit.title = newTitle
        commentToEdit.text = newText
        that.$modalInstance.dismiss('close')
      )
    return

CreateCommentModalCtrl.$inject =
  ['$scope', '$modalInstance', '$log',
   'document', 'DocumentCommentModel', 'comment',
   'cmd', 'commentList', 'rootScope']
createCommentsCreateModal.controller( 'CreateCommentModalCtrl',
  CreateCommentModalCtrl)