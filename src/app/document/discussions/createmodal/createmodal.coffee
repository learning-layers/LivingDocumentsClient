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
                @document, @DocumentDiscussionModel,
                @selection, @$location) ->
    super($scope)
    return
  defineScope: =>
    @$scope.document = @document
    @$scope.createDiscussion = @createDiscussion
    @$scope.cancel = =>
      @$modalInstance.dismiss('cancel')
      return
    @$scope.selection = @selection
    return
  createDiscussion: =>
    createDiscussionTask =
      @DocumentDiscussionModel.createDiscussion(
        @$scope.document.id,
        @$scope.title,
        @$scope.selection
      )
    createDiscussionTask.success( (success) =>
      @$location.path('/document/' + success.discussion.id)
      @$modalInstance.dismiss('close')
    )
    return

CreateDiscussionModalCtrl.$inject =
  ['$scope', '$modalInstance', 'document',
   'DocumentDiscussionModel', 'selection', '$location']
createDiscussionModal.controller( 'CreateDiscussionModalCtrl',
  CreateDiscussionModalCtrl)