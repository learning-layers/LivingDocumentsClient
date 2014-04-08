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
documentContentController =
  angular.module("LivingDocuments.document.content.controller", [
    "LivingDocuments.document.content.model"
  ])

class DocumentContentCtrl extends BaseController
  constructor: (@$scope, $log, @DocumentContentModel, @$rootScope, @$modal) ->
    @$log = $log.getInstance "DocumentContentController"
    @documentContent = @DocumentContentModel.getActiveDocumentContent()
    @initScopeVars()
    @initScopeMethods()
    @initScopeWatches()
    return
  initScopeVars: ->
    @$scope.editorActive = false
    @$scope.documentContent = @documentContent
    @$scope.attachmentsActive = false
    @$scope.editorActive = false
    @$scope.tabs = {
      historyActive: true,
      filesActive: false,
      imgAVidsActive: false,
      linksActive: false,
      relDocsActive: false
    }
    @$scope.attachments = {
      files: [],
      hyperlinks: [],
      images: []
    }
    return
  initScopeMethods: ->
    that = @
    @$scope.openUserInfoModal = @openUserInfoModal.bind(@)
    @$scope.saveEditorContent = @saveEditorContent.bind(@)
    @$scope.openAuthorList = @openAuthorList.bind(@)
    @$scope.openViewerList = @openViewerList.bind(@)
    @$scope.setEditorContent = @setEditorContent.bind(@)
    @$scope.showContextMenu = @showContextMenu.bind(@)
    @$scope.switchToAttachments = @switchToAttachments.bind(@)
    @$scope.switchToDocumentContent = @switchToDocumentContent.bind(@)
    @$scope.openAttachmentUploadModal = @openAttachmentUploadModal.bind(@)
    @$scope.downloadFileAttachment = @downloadFileAttachment.bind(@)
    return
  initScopeWatches: ->
    that = @
    @$log.debug("Initializing scope watches")
    @$scope.$watch 'tabs.filesActive', (newVal) ->
      if newVal == true
        that.$log.debug("File tab opened")
        loadFileAttachmentsTask =
          that.DocumentContentModel.loadFileAttachments()
        loadFileAttachmentsTask.success (fileAttachments) ->
          for fileAttachment in fileAttachments
            that.$scope.attachments.files.add fileAttachment
          return
      return
    @$scope.$watch 'tabs.linksActive', (newVal) ->
      if newVal == true
        that.$log.debug("Hyperlink tab opened")
        loadHyperlinksTask =
          that.DocumentContentModel.loadHyperlinks()
        loadHyperlinksTask.success (hyperlinksAttachments) ->
          for hyperlinksAttachment in hyperlinksAttachments
            that.$scope.attachments.hyperlinks.add hyperlinksAttachment
          return
      return
    @$scope.$watch 'tabs.imgAVidsActive', (newVal) ->
      if newVal == true
        that.$log.debug("ImgAVids tab opened")
      return
    return
  switchToAttachments: ->
    @$log.debug "Attachments active"
    @$scope.attachmentsActive = true
    return
  switchToDocumentContent: ->
    @$log.debug "Document content active"
    @$scope.attachmentsActive = false
    return
  openAttachmentUploadModal: ->
    that = @
    @switchToDocumentContent()
    @$modal.open(
      {
        templateUrl: 'document/content/attachment' +
          '/uploadmodal.tpl.html'
        controller: AttachmentUploadModalCtrl
        resolve: {
          attachmentsActiveScope: ->
            return that.$scope
        }
      }
    )
    return
  openUserInfoModal: (userId) ->
    @$rootScope.$emit('openUserProfile', userId)
    return
  openAuthorList: ->
    ids = []
    angular.forEach @documentContent.content.authors, (value, key) ->
      ids.push value['id']
      return
    @$rootScope.$emit('openUserList', 'Authors', ids)
    return
  openViewerList: ->
    ids = []
    angular.forEach @documentContent.content.viewers, (value, key) ->
      ids.push value['id']
      return
    @$rootScope.$emit('openUserList', 'Viewers', ids)
    return
  saveEditorContent: ->
    that = @
    editorElement = angular.element( document.querySelector( '#editor' ) )
    editorContent = editorElement.cleanHtml()
    saveEditorContentTask =
      @DocumentContentModel.saveEditorContent(editorContent)
    saveEditorContentTask.success(
      (success) ->
        that.$scope.editorActive = false
        return
    )
  setEditorContent: ->
    editorElement = angular.element( document.querySelector( '#editor' ) )
    editorElement.html( @documentContent.content.content )
    return
  showContextMenu: (ev) ->
    that = @
    @getCurrentSelection (currentSelection) ->
      if currentSelection.startOffset < currentSelection.endOffset
        console.log(currentSelection)
        that.$rootScope.$emit(
          "ContextMenu:open:DocumentContent",
          {
            clientX: ev.clientX,
            clientY: ev.clientY,
            currentSelection: currentSelection
          }
        )
    return
  getCurrentSelection: (callback)->
    selectionObj = window.getSelection().getRangeAt(0)
    content = selectionObj.cloneContents()
    span = window.document.createElement('SPAN')

    span.appendChild(content)
    htmlContent = span.innerHTML
    currentSelection = {
      startOffset: selectionObj.startOffset
      endOffset: selectionObj.endOffset
      htmlContent: htmlContent
    }
    #alert("startOffset=" + selectionObj.startOffset + ", endOffset="
    # + selectionObj.endOffset + ", htmlContent=" + htmlContent)
    callback(currentSelection)
    return
  downloadFileAttachment: (fileattachmentId) ->
    @DocumentContentModel.downloadFileAttachment(fileattachmentId)
    return

DocumentContentCtrl.$inject =
  ['$scope', '$log', 'DocumentContentModel', '$rootScope']

documentContentController.controller(
  'DocumentContentCtrl',
  DocumentContentCtrl
)

class DocumentContentContextMenuCtrl  extends BaseController
  constructor: ($scope, $log, @$rootScope) ->
    super($scope)
    @$log = $log.getInstance "DocumentContentContextMenuCtrl"
    return
  defineScope: ->
    @$scope.visible = false
    @$scope.top = "10px"
    @$scope.left = "10px"
    @$scope.hide = @hide.bind(@)
    @$scope.discussSelection = @discussSelection.bind(@)
    @selection = null
    return
  defineListeners: ->
    super()
    that = @
    @$rootScope.$on(
      'ContextMenu:open:DocumentContent',
      (ev, selection) ->
        that.selection = selection
        that.$scope.$apply( ->
          that.$scope.visible = true
          that.$scope.top = selection.clientY + "px"
          that.$scope.left = selection.clientX + "px"
        )
        return
    )
    @$rootScope.$on(
      'ContextMenu:close:DocumentContent',
      (ev) ->
        that.$scope.visible = false
        return
    )
    return
  hide: ->
    @$scope.visible = false
    return
  discussSelection: ->
    that = @
    @$scope.visible = false
    @$rootScope.$emit(
      'discussSelection',
      that.selection
    )
    return

DocumentContentContextMenuCtrl.$inject =
  ['$scope', '$log', '$rootScope']

documentContentController.controller(
  'DocumentContentContextMenuCtrl',
  DocumentContentContextMenuCtrl
)