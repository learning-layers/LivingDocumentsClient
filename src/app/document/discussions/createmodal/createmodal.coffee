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
  constructor: ($scope, @$modalInstance, document) ->
    super($scope)
    @$scope.document = document
    return
  defineScope: ->
    that = @
    @$scope.cancel = ->
      that.$modalInstance.dismiss('cancel')
    return

CreateDiscussionModalCtrl.$inject =
  ['$scope', '$modalInstance', 'document']
createDiscussionModal.controller( 'CreateDiscussionModalCtrl',
  CreateDiscussionModalCtrl)

###
>> CreateDiscussionModal Model
###
class CreateDiscussionModel extends BaseEventDispatcher
  constructor: ($log) ->
    @$log = $log.getInstance("UserInfoModel")
    return

createDiscussionModal.factory "CreateDiscussionModel",
  ['$log',
    ($log) ->
      return new CreateDiscussionModel($log)
  ]