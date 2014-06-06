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
documentContentModel =
  angular.module("LivingDocuments.document.content.model", [
    "LivingDocuments.document.content.service"
  ])

class DocumentContentModel extends BaseEventDispatcher
  constructor: ($log, @DocumentContentService,
                @$rootScope, @SecurityService) ->
    @$log = $log.getInstance("DocumentContentModel")
    @activeDocumentContent = @initActiveDocumentContent()
    @activeDocumentId = -1
    @defineListeners()
    return
  defineListeners: =>
    @$rootScope.$on 'ReceivedData:document', (ev, id, document) =>
      @$log.debug("Received new document information.")
      @activeDocumentId = id
      @activeDocumentContent.content = {
        content: ''
        authors: []
        viewers: []
      }
      return
    @$rootScope.$on 'ReceivedData:document.content', (ev, id, content) =>
      @activeDocumentId = id
      @$log.debug("Received new document content " +
        "for document with id=" + id)
      @$log.debug(content.content)
      @refreshDocumentContent(id, content)
      return
    return
  getActiveDocumentContent: =>
    return @activeDocumentContent
  getActiveDocumentId: =>
    return @activeDocumentId
  getSecurityService: =>
    return @SecurityService
  initActiveDocumentContent: =>
    return {
      content: {
        content: '',
        authors: [],
        viewers: []
      }
    }
  refreshDocumentContent: (id, content) =>
    @activeDocumentContent.content.content = content.content
    @activeDocumentContent.content.authors = content.authors
    return
  saveEditorContent: (editorContent) =>
    saveEditorContentTask = @DocumentContentService.saveEditorContent(
      @activeDocumentId, editorContent
    )
    saveEditorContentTask.success (success) =>
      @activeDocumentContent.content.content =
        editorContent
      @activeDocumentContent.content.authors.push(
        {
          id: @SecurityService.currentUser.id,
          displayname: @SecurityService.currentUser.displayname
        }
      )
      return
    return saveEditorContentTask
  addAttachment: (file, $upload, modelObj,
                  progressFunction, successFunction) =>
    basePath = @SecurityService.getInitialConfiguration().restServerAddress
    $upload.upload(
      {
        url: basePath + '/document/' +
          @activeDocumentId +
          '/attachment',
        #method: 'PUT',
        data: {myObj: modelObj},
        headers: {
          'Authorization':
            @SecurityService.currentUser.authorizationString
        },
        file: file
      }
    ).progress(progressFunction).success(successFunction)
    #.error(...)
    #.then(success, error, progress)
    return
  loadFileAttachments: =>
    loadFileAttachmentsTask = @DocumentContentService.loadFileAttachments(
      @activeDocumentId
    )
    loadFileAttachmentsTask.success (success) =>
      @$log.debug success
      return
    return loadFileAttachmentsTask
  downloadFileAttachment: (fileattachmentId) =>
    @DocumentContentService.downloadFileAttachment(fileattachmentId)
    return
  addHyperlink: (hyperlink, description) =>
    return @DocumentContentService.addHyperlink(
      @activeDocumentId, hyperlink, description
    )
  loadHyperlinks: =>
    return @DocumentContentService.loadHyperlinks(
      @activeDocumentId
    )
    return
  deleteFileAttachment: (fileattachmentId, files) =>
    deleteFileAttachmentTask =
      @DocumentContentService.deleteFileAttachment(
        @activeDocumentId, fileattachmentId
      )
    deleteFileAttachmentTask.success((success) =>
      files.remove((n) ->
        return n['id'] == fileattachmentId
      )
      return
    )
    return
  saveNewValueFor: (itemType, item, attributeName, value) =>
    return @DocumentContentService.saveNewFile(
      @activeDocumentId, item, attributeName, value
    )


documentContentModel.factory "DocumentContentModel",
  ['$log', 'DocumentContentService', '$rootScope', 'SecurityService'
    ($log, DocumentContentService, $rootScope, SecurityService) ->
      return new DocumentContentModel($log, DocumentContentService,
        $rootScope, SecurityService)
  ]