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
                @commentList, @rootScope, @SecurityService, @User) ->
    super($scope)
    @$log = $log.getInstance("CreateCommentModalCtrl")
    @$log.debug("SecurityService")
    @$log.debug(SecurityService.currentUser.displayname)
    if angular.isDefined @comment
      @$log.debug(@comment)
    return
  defineScope: ->
    @$scope.cmd = @cmd
    if (@cmd == 'Edit')
      @$scope.title = @comment.title
      @$scope.text = @comment.text
    @$scope.document = @document
    if angular.isDefined @comment
      @$scope.comment = @comment
    @$scope.cancel = =>
      @$modalInstance.dismiss('cancel')
      return
    @$scope.createComment = @createComment.bind(@)
    return
  createComment: =>
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
      createCommentTask.success((success) =>
        if (angular.isDefined(success.documentId))
          newComment = {
            id: success.commentId
            title: newTitle
            text: newText
            creator: {
              id: @SecurityService.currentUser.id,
              displayname: @SecurityService.currentUser.displayname
            }
          }
          @commentList.comments.add(
            newComment
          )
          @$log.debug("Created new comment")
          @$log.debug(newComment)
        else if (angular.isDefined(success.parentId))
          newComment = {
            id: success.commentId
            title: newTitle
            text: newText
            creator: {
              id: @SecurityService.currentUser.id,
              displayname: @SecurityService.currentUser.displayname
            }
          }
          @comment.commentList.add(
            newComment
          )
        @User.getUserById(
          @SecurityService.currentUser.id,
          (success) =>
            newComment.creator.displayname = success.user.displayname
          ,
          (error) =>
            @$scope.loadingProfileinfo = false
            return
        )
        @$log.debug("Created new comment")
        @$log.debug(newComment)
        @$modalInstance.dismiss('close')
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
      editCommentTask.success((success) =>
        commentToEdit.title = newTitle
        commentToEdit.text = newText
        @$modalInstance.dismiss('close')
      )
    return

CreateCommentModalCtrl.$inject =
  ['$scope', '$modalInstance', '$log',
   'document', 'DocumentCommentModel', 'comment',
   'cmd', 'commentList', 'rootScope', 'SecurityService', 'User']
createCommentsCreateModal.controller( 'CreateCommentModalCtrl',
  CreateCommentModalCtrl)