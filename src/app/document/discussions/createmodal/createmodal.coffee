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
createDiscussionModal = angular.module(
  "LivingDocuments.document.discussion.createmodal",
  [
    "LivingDocuments.core.baseclass"
  ]
)

###
>> CreateDiscussionModal Controller
###
class CreateDiscussionModalCtrl extends BaseController
  constructor: ($scope, @$modalInstance,
                @document, @DocumentDiscussionModel, @$location) ->
    super($scope)
    return
  defineScope: ->
    that = @
    @$scope.document = @document
    @$scope.createDiscussion = @createDiscussion.bind(@)
    @$scope.cancel = ->
      that.$modalInstance.dismiss('cancel')
    return
  createDiscussion: ->
    that = @
    console.error(@$scope.document.id)
    createDiscussionTask =
      @DocumentDiscussionModel.createDiscussion(
        @$scope.document.id,
        @$scope.title
      )
    createDiscussionTask.success( (success) ->
      that.$location.path('/document/' + success.discussion.id)
      that.$modalInstance.dismiss('close')
    )
    return

CreateDiscussionModalCtrl.$inject =
  ['$scope', '$modalInstance', 'document',
   'DocumentDiscussionModel', '$location']
createDiscussionModal.controller( 'CreateDiscussionModalCtrl',
  CreateDiscussionModalCtrl)