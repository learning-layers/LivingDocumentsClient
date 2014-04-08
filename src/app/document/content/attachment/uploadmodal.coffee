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
  constructor: ($scope, @$modalInstance,
                @attachmentsActiveScope, @documentId) ->
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

###
>> FileAndMediaUpload Controller
###
class FileAndMediaUploadCtrl extends BaseController
  constructor: ($scope, @$rootScope, @$upload,
                @SecurityService, @ClassManager,
                @$log, @DocumentContentModel) ->
    super($scope)
    @log = $log.getInstance("FileAndMediaUploadCtrl")
    return
  defineScope: ->
    that = @
    @$scope.onFileSelect = @onFileSelect.bind(@)
    return
  onFileSelect: ($files) ->
    that = @
    ProgressImageMessage =
      @ClassManager.getRegisteredClass('ProgressImageMessage')
    progressImageMessageInstance =
      new ProgressImageMessage("Profile image upload")
    @$rootScope.$broadcast('info', progressImageMessageInstance)
    #$files: an array of files selected, each file has name, size, and type.
    successFunction = (data, status, headers, config) ->
      #file is uploaded successfully
      that.log.debug(data)
      progressImageMessageInstance.fireIsFinished()
      return
    progressFunction = (evt) ->
      that.log.debug('percent: ' +
        parseInt(100.0 * evt.loaded / evt.total, 10))
      progressImageMessageInstance.setProgressPercentage(
        parseInt(100.0 * evt.loaded / evt.total, 10)
      )
      return
    for file, i in $files
      @DocumentContentModel.addAttachment(
        file, @$upload, that.$scope.myModelObj,
        progressFunction, successFunction
      )
    return

FileAndMediaUploadCtrl.$inject =
  ['$scope', '$rootScope', '$upload',
   'SecurityService', 'ClassManager',
   '$log', 'DocumentContentModel']
contentAttachmentUploadModal.controller( 'FileAndMediaUploadCtrl',
  FileAndMediaUploadCtrl)

class AddDocumentContentLinkCtrl extends BaseController
  constructor: ($scope, @$rootScope, @$log, @DocumentContentModel) ->
    super($scope)
    @log = $log.getInstance("AddDocumentContentLinkCtrl")
    return
  defineScope: ->
    @$scope.createHyperlink = @createHyperlink.bind(@)
    return
  createHyperlink: ->
    that = @
    @log.debug(
      "createHypelink called with hyperlink=" + @$scope.hyperlink +
      ", and description=" + @$scope.description
    )
    @DocumentContentModel.addHyperlink(
      that.$scope.hyperlink, that.$scope.description
    )
    return

AddDocumentContentLinkCtrl.$inject =
  ['$scope', '$rootScope', '$log', 'DocumentContentModel']
contentAttachmentUploadModal.controller( 'AddDocumentContentLinkCtrl',
  AddDocumentContentLinkCtrl)