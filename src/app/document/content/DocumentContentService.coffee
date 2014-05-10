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
documentContentService =
  angular.module("LivingDocuments.document.content.service", [])

class DocumentContentService extends BaseService
  constructor: (SecurityService, $http, $log) ->
    super(SecurityService, $http)
    @$log = $log.getInstance("DocumentContentService")
    return
  saveEditorContent: (documentId, editorContent) =>
    return @$http({
      method: 'PUT',
      url: @basePath + '/document/' + documentId +
        '/content',
      data: {editorContent: editorContent},
      headers: {'Authorization':
        @SecurityService.currentUser.authorizationString}
    }).success (success) =>
      @$log.debug "Successfully updated document content!"
      return
  loadFileAttachments: (documentId) =>
    @$log.debug("Loading file attachments")
    return @$http({
      method: 'GET',
      url: @basePath + '/document/' + documentId +
        '/fileattachment',
      headers: {'Authorization':
        @SecurityService.currentUser.authorizationString}
    }).success (success) =>
      @$log.debug success
      return
    return
  downloadFileAttachment: (fileattachmentId) =>
    @$http({
      method: 'GET',
      url: @basePath + '/prepdownload/attachment/' +
        fileattachmentId,
      headers: {'Authorization':
        @SecurityService.currentUser.authorizationString}
    })
    .success (success) =>
      @$log.debug "Successfully downloaded " +
        "document file attachment!"

      document.location = @basePath + '/dodownload/attachment/' +
        @SecurityService.currentUser.id + '/' +
        success.uuid + '/' + success.attachmentname
      return
    return
  addHyperlink: (documentId, hyperlink, description) =>
    return @$http({
      method: 'POST',
      url: @basePath + '/document/' + documentId + '/attachment/hyperlink',
      data: {
        hyperlink: hyperlink,
        description: description
      },
      headers: {'Authorization':
        @SecurityService.currentUser.authorizationString}
    }).success (success) =>
      @$log.debug(
        "Successfully added new hyperlink" +
        "to document with id=" + documentId
      )
  loadHyperlinks: (documentId) =>
    return @$http({
      method: 'GET',
      url: @basePath + '/document/' + documentId + '/attachment/hyperlink',
      headers: {
        'Authorization': @SecurityService.currentUser.authorizationString
      }
    }).success (success) =>
      @$log.debug(
        "Successfully retrieved hyperlinks for document with id=" +
        documentId
      )
      return
    return
  deleteFileAttachment: (documentId, fileAttachmentId) =>
    return @$http({
      method: 'DELETE',
      url: @basePath + '/document/' + documentId +
        '/fileattachment/' + fileAttachmentId,
      headers: {
        'Authorization': @SecurityService.currentUser.authorizationString
      }
    }).success (success) =>
      @$log.debug(
        "Successfully deleted file attachment for document with id=" +
        documentId
      )
    return
  saveNewFile: (documentId, item, attributeName, value) =>
    data = {}
    data[attributeName] = value
    return @$http({
      method: 'PUT',
      url: @basePath + '/document/' + documentId +
        '/fileattachment/' + item.id,
      data: data
      headers: {
        'Authorization': @SecurityService.currentUser.authorizationString
      }
    }).success (success) =>
      @$log.debug(
        "Successfully changed file attachment name " +
        "for attachment with id=" +
        item.id + " to newvalue=" + value
      )
    return

DocumentContentService.$inject = ['SecurityService','$http', '$log']
documentContentService.service "DocumentContentService", DocumentContentService