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

class DocumentContentCtrl
  constructor: (@$scope, $log, @DocumentContentModel, @$rootScope) ->
    @$log = $log.getInstance "DocumentContentController"
    @documentContent = @DocumentContentModel.getActiveDocumentContent()
    @initScopeVars()
    @initScopeMethods()
    return
  initScopeVars: ->
    @$scope.editorActive = false
    @$scope.documentContent = @documentContent
    @$scope.attachmentsActive = false
    @$scope.editorActive = false
    return
  initScopeMethods: ->
    that = @
    @$scope.openUserInfoModal = @openUserInfoModal.bind(@)
    @$scope.saveEditorContent = @saveEditorContent.bind(@)
    @$scope.openAuthorList = @openAuthorList.bind(@)
    @$scope.openViewerList = @openViewerList.bind(@)
    @$scope.setEditorContent = @setEditorContent.bind(@)
    @$scope.switchToAttachments = ->
      that.$log.debug "Attachments active"
      that.$scope.attachmentsActive = true
    @$scope.switchToDocumentContent = ->
      that.$log.debug "Document content active"
      that.$scope.attachmentsActive = false
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

DocumentContentCtrl.$inject =
  ['$scope', '$log', 'DocumentContentModel', '$rootScope']

documentContentController.controller(
  'DocumentContentCtrl',
  DocumentContentCtrl
)

class DocumentContentContextMenuCtrl
  constructor: (@$scope, $log, @$rootScope) ->
    @$log = $log.getInstance "DocumentContentContextMenuCtrl"
    @defineListeners()
    return
  defineScope: ->
    @$scope.visible = true
    return
  defineListeners: ->
    @$rootScope.$on(
      'ContextMenu:open:DocumentContent',
      (ev) ->
        @$scope.visible = true
        return
    )
    @$rootScope.$on(
      'ContextMenu:close:DocumentContent',
      (ev) ->
        @$scope.visible = false
        return
    )
    return

DocumentContentContextMenuCtrl.$inject =
  ['$scope', '$log', '$rootScope']

documentContentController.controller(
  'DocumentContentContextMenuCtrl',
  DocumentContentContextMenuCtrl
)