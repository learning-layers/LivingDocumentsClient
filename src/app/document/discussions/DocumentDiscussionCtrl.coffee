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
documentDiscussionController = angular.module(
  "LivingDocuments.document.discussions.controller",
  [
    "LivingDocuments.core.baseclass"
    "LivingDocuments.document.discussions.model"
  ]
)

class DocumentDiscussionsController extends BaseController
  constructor: (@$scope, @$rootScope,
    @$log, @$modal, @DocumentDiscussionModel) ->
    super($scope)
    return
  defineScope: ->
    @$scope.$rootScope = @$rootScope
    @$scope.openUserInfoModal = @openUserInfoModal
    @$scope.openCreateDiscussionModal = @openCreateDiscussionModal
    @$scope.discussions = @DocumentDiscussionModel.getActiveDiscussions()
    @$scope.loadUserImgSrc = @loadUserImgSrc
    return
  defineListeners: =>
    discussionWatches = []
    @$rootScope.$on 'discussSelection', (ev, selection) =>
      @openCreateDiscussionModal(selection)
      return
    return
  openUserInfoModal: (userId) =>
    @$rootScope.$emit('openUserProfile', userId)
    return
  openCreateDiscussionModal: (selection) =>
    @$modal.open(
      {
        templateUrl: 'document/discussions/createmodal' +
          '/createmodal.tpl.html'
        controller: CreateDiscussionModalCtrl
        resolve: {
          document: ->
            return @$scope.document
          DocumentDiscussionModel: =>
            return @DocumentDiscussionModel
          selection: ->
            return selection
        }
      }
    )
    return
  loadUserImgSrc: (userId, srcToUpdate) =>
    @DocumentDiscussionModel.getUserAvatar(userId, srcToUpdate)
    return