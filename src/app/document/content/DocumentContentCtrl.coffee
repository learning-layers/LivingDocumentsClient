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
  currentAttachmentItem: null
  constructor: (@$scope, @$log, @DocumentContentModel,
                @$rootScope, @$modal, @SecurityService, @$timeout) ->
    @log = $log.getInstance "DocumentContentController"
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
    @$scope.SecurityService = @SecurityService
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
    @$scope.options = {
      focus: true,
      toolbar: [
        ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['insert', ['link', 'picture', 'video']],
        ['table', ['table']]
      ]
    }
    return
  initScopeMethods: =>
    @$scope.openUserInfoModal = @openUserInfoModal
    @$scope.saveEditorContent = @saveEditorContent
    @$scope.openAuthorList = @openAuthorList
    @$scope.openViewerList = @openViewerList
    @$scope.setEditorContent = @setEditorContent
    @$scope.showContextMenu = @showContextMenu
    @$scope.switchToAttachments = @switchToAttachments
    @$scope.switchToDocumentContent = @switchToDocumentContent
    @$scope.openAttachmentUploadModal = @openAttachmentUploadModal
    @$scope.downloadFileAttachment = @downloadFileAttachment
    @$scope.deleteFileAttachment = @deleteFileAttachment
    @$scope.triggerEditMode = @triggerEditMode
    @$scope.summernoteAreaClick = @summernoteAreaClick
    return
  initScopeWatches: =>
    @$log.debug("Initializing scope watches")
    @$scope.$watch 'tabs.filesActive', (newVal) =>
      if newVal == true
        @$log.debug("File tab opened")
        @refreshFileList()
      return
    @$rootScope.$on("finishedFileUpload", =>
      @refreshFileList()
      @log.debug "Refreshing file list after successful upload"
      return
    )
    @$scope.$watch 'tabs.linksActive', (newVal) =>
      if newVal == true
        @$log.debug("Hyperlink tab opened")
        @refreshHyperLinks()
      return
    @$rootScope.$on("hyperLinkAdded", =>
      @refreshHyperLinks()
      @log.debug "Refreshing file list after successful upload"
      return
    )
    @$scope.$watch 'tabs.imgAVidsActive', (newVal) =>
      if newVal == true
        @$log.debug("ImgAVids tab opened")
      return
    return
  switchToAttachments: =>
    @$log.debug "Attachments active"
    @$scope.attachmentsActive = true
    @refreshFileList()
    @refreshHyperLinks()
    return
  switchToDocumentContent: =>
    @$log.debug "Document content active"
    @$scope.attachmentsActive = false
    return
  openAttachmentUploadModal: =>
    @switchToDocumentContent()
    @$modal.open(
      {
        templateUrl: 'document/content/attachment' +
          '/uploadmodal.tpl.html'
        controller: AttachmentUploadModalCtrl
        resolve: {
          attachmentsActiveScope: =>
            return @$scope
        }
      }
    )
    return
  openUserInfoModal: (userId) =>
    @$rootScope.$emit('openUserProfile', userId)
    return
  openAuthorList: =>
    ids = []
    angular.forEach @documentContent.content.authors, (value, key) =>
      ids.push value['id']
      return
    @$rootScope.$emit('openUserList', 'Authors', ids)
    return
  openViewerList: =>
    ids = []
    angular.forEach @$scope.document.viewers, (value, key) =>
      ids.push value['id']
      return
    @$rootScope.$emit('openUserList', 'Viewers', ids)
    return
  saveEditorContent: =>
    editorElement = angular.element(
      document.querySelector( '.note-editable' )
    )
    editorContent = editorElement[0].innerHTML
    console.log(editorContent)
    saveEditorContentTask =
      @DocumentContentModel.saveEditorContent(editorContent)
    saveEditorContentTask.success(
      (success) =>
        @$scope.editorActive = false
        return
    )
    return
  setEditorContent: =>
    editorElement = angular.element(
      document.querySelector( '.note-editable' )
    )
    editorElement.html( @documentContent.content.content )
    return
  showContextMenu: (ev) =>
    @getCurrentSelection (currentSelection) =>
      if currentSelection.startOffset < currentSelection.endOffset
        console.log(currentSelection)
        @$rootScope.$emit(
          "ContextMenu:open:DocumentContent",
          {
            clientX: ev.clientX,
            clientY: ev.clientY,
            currentSelection: currentSelection
          }
        )
    return
  getCurrentSelection: (callback) =>
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
  downloadFileAttachment: (fileattachmentId) =>
    @DocumentContentModel.downloadFileAttachment(fileattachmentId)
    return
  deleteFileAttachment: (fileAttachmentId, attachmentName) =>
    confirmResult = confirm(
      "Are you sure you want to delete the attachement '" +
      attachmentName + "'"
    )
    if (confirmResult == true)
      @DocumentContentModel.deleteFileAttachment(
        fileAttachmentId, @$scope.attachments.files
      )
    return
  refreshFileList: =>
    loadFileAttachmentsTask =
      @DocumentContentModel.loadFileAttachments()
    loadFileAttachmentsTask.success (fileAttachments) =>
      @$scope.attachments.files = fileAttachments
      return
    return
  refreshHyperLinks: =>
    loadHyperlinksTask =
      @DocumentContentModel.loadHyperlinks()
    loadHyperlinksTask.success (hyperlinksAttachments) =>
      @$scope.attachments.hyperlinks = hyperlinksAttachments
      return
    return
  triggerEditMode: (cmd, itemType, item, attributeName, oldVal) =>
    if (
      angular.isDefined(@currentAttachmentItem) &&
      @currentAttachmentItem != null &&
      @currentAttachmentItem != item
    )
      @currentAttachmentItem.editmode = false
      if angular.isDefined @currentAttachmentItem.rememberOldVal
        angular.forEach(@currentAttachmentItem.rememberOldVal, (value, key) =>
          @currentAttachmentItem[key] = value
          return
        )
    if angular.isUndefined(item.editmode) || item.editmode == false
      #If edit mode is starting
      item.rememberOldVal = {}
      item.rememberOldVal[attributeName] = oldVal
      @currentAttachmentItem = item
    else
      #If edit mode is ending
      if cmd == 'cancel'
        item[attributeName] = item.rememberOldVal[attributeName]
      else if cmd == 'save'
        console.log "Save triggered with item value=" + item[attributeName]
        newValueSaveTask = @DocumentContentModel.saveNewValueFor(
          itemType, item, attributeName, item[attributeName]
        )
        newValueSaveTask.success(=>
          return
        )
        newValueSaveTask.error(=>
          item[attributeName] = item.rememberOldVal[attributeName]
          return
        )
    item.editmode = !item.editmode
    return
  summernoteAreaClick: =>
    $( "body" ).addClass( "hide-summernote-backdrop-workaround" )
    @$timeout(
      ->
        $('.modal-backdrop').remove()
        $( "body" ).removeClass( "hide-summernote-backdrop-workaround" )
        return
      ,
      200
    )
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
  defineListeners: =>
    super()
    @$rootScope.$on(
      'ContextMenu:open:DocumentContent',
      (ev, selection) =>
        @selection = selection
        @$scope.$apply( =>
          @$scope.visible = true
          @$scope.top = selection.clientY + "px"
          @$scope.left = selection.clientX + "px"
        )
        return
    )
    @$rootScope.$on(
      'ContextMenu:close:DocumentContent',
      (ev) =>
        @$scope.visible = false
        return
    )
    return
  hide: =>
    @$scope.visible = false
    return
  discussSelection: =>
    @$scope.visible = false
    @$rootScope.$emit(
      'discussSelection',
      @selection
    )
    return

DocumentContentContextMenuCtrl.$inject =
  ['$scope', '$log', '$rootScope', 'SecurityService']

documentContentController.controller(
  'DocumentContentContextMenuCtrl',
  DocumentContentContextMenuCtrl
)