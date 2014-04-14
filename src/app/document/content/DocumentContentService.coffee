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
documentContentService =
  angular.module("LivingDocuments.document.content.service", [])

class DocumentContentService extends BaseService
  constructor: (SecurityService, $http, $log) ->
    super(SecurityService, $http)
    @$log = $log.getInstance("DocumentContentService")
    return
  saveEditorContent: (documentId, editorContent) ->
    return @$http({
      method: 'PUT',
      url: @basePath + '/document/' + documentId +
        '/content',
      data: {editorContent: editorContent},
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString}
    }).success (success) ->
      that.$log.debug "Successfully updated document content!"
      return
  loadFileAttachments: (documentId) ->
    @$log.debug("Loading file attachments")
    return @$http({
      method: 'GET',
      url: @basePath + '/document/' + documentId +
        '/fileattachment',
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString}
    }).success (success) ->
      that.$log.debug success
      return
    return
  downloadFileAttachment: (fileattachmentId)->
    that = @
    @$http({
      method: 'GET',
      url: @basePath + '/prepdownload/attachment/' +
        fileattachmentId,
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString}
    })
    .success (success) ->
      that.$log.debug "Successfully downloaded " +
        "document file attachment!"

      document.location = that.basePath + '/dodownload/attachment/' +
        that.SecurityService.currentUser.id + '/' +
        success.uuid + '/' + success.attachmentname
      return
    return
  addHyperlink: (documentId, hyperlink, description) ->
    that = @
    return @$http({
      method: 'POST',
      url: @basePath + '/document/' + documentId + '/attachment/hyperlink',
      data: {
        hyperlink: hyperlink,
        description: description
      },
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString}
    }).success (success) ->
      that.$log.debug(
        "Successfully added new hyperlink" +
        "to document with id=" + documentId
      )
  loadHyperlinks: (documentId) ->
    that = @
    return @$http({
      method: 'GET',
      url: @basePath + '/document/' + documentId + '/attachment/hyperlink',
      headers: {
        'Authorization': that.SecurityService.currentUser.authorizationString
      }
    }).success (success) ->
      that.$log.debug(
        "Successfully retrieved hyperlinks for document with id=" +
        documentId
      )
      return
    return
  deleteFileAttachment: (documentId, fileAttachmentId) ->
    that = @
    return @$http({
      method: 'DELETE',
      url: @basePath + '/document/' + documentId +
        '/fileattachment/' + fileAttachmentId,
      headers: {
        'Authorization': that.SecurityService.currentUser.authorizationString
      }
    }).success (success) ->
      that.$log.debug(
        "Successfully deleted file attachment for document with id=" +
        documentId
      )
    return

DocumentContentService.$inject = ['SecurityService','$http', '$log']
documentContentService.service "DocumentContentService", DocumentContentService