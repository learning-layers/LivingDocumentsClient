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
contentAttachmentUploadModal = angular.module(
  "LivingDocuments.document.content.attachment.uploadmodal",
  [
    "LivingDocuments.core.baseclass"
    "LivingDocuments.document.content.model"
  ]
)

###
>> AttachmentUploadModal Controller
###
class AttachmentUploadModalCtrl extends BaseController
  constructor: ($scope, @$modalInstance, @attachmentsActiveScope) ->
    super($scope)
    return
  defineScope: ->
    that = @
    @$scope.cancel = ->
      that.attachmentsActiveScope.attachmentsActive = true
      that.$modalInstance.dismiss('cancel')
      return
    return

AttachmentUploadModalCtrl.$inject =
  ['$scope', '$modalInstance', 'attachmentsActiveScope']
contentAttachmentUploadModal.controller( 'AttachmentUploadModalCtrl',
  AttachmentUploadModalCtrl)