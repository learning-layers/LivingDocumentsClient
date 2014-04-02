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
  defineListeners: ->
    that = @
    @$rootScope.$on 'ReceivedData:document', (ev, id, document) ->
      that.activeDocumentId = id
      return
    @$rootScope.$on 'ReceivedData:document.content', (ev, id, content) ->
      that.activeDocumentId = id
      that.$log.debug("Received new document content " +
        "for document with id=" + id)
      that.$log.debug(content)
      that.$log.error(id)
      return
    return
  getActiveDocumentContent: ->
    return @activeDocumentContent
  initActiveDocumentContent: ->
    return {
      content: {
        content: '',
        authors: [],
        viewers: []
      }
    }
  saveEditorContent: (editorContent) ->
    that = @
    saveEditorContentTask = @DocumentContentService.saveEditorContent(
      that.activeDocumentId, editorContent
    )
    saveEditorContentTask.success (success) ->
      that.activeDocumentContent.content.content =
        editorContent
      that.activeDocumentContent.content.authors.push(
        {
          id: that.SecurityService.currentUser.id,
          displayname: that.SecurityService.currentUser.displayname
        }
      )
      return
    return saveEditorContentTask

documentContentModel.factory "DocumentContentModel",
  ['$log', 'DocumentContentService', '$rootScope', 'SecurityService'
    ($log, DocumentContentService, $rootScope, SecurityService) ->
      return new DocumentContentModel($log, DocumentContentService,
        $rootScope, SecurityService)
  ]