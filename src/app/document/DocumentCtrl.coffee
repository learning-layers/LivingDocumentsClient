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
angular.module( "LivingDocuments.document.controller", [
  "LivingDocuments.document.service"
  "LivingDocuments.document.model"
] )

class DocumentCtrl extends BaseController
  constructor:
    ($scope, @$stateParams, @$modal, @$log, @$http, @DocumentModel) ->
      super($scope)
      @$log.debug "Opening document with id=" + $stateParams.item
      documentLoadTask = DocumentModel.get(
        $stateParams.item,
        "?filter=id,title,attachmentCount,viewCount,authorCount"+
        ",commentCount," +
        "lastUpdateAt,createdAt,content,is_discussion,parent_document_id" +
        "&embed=tags:id,name;content:all;discussions:all;comments:all"
      )
      documentLoadTask.success((success) =>
        $scope.loadingDocument = false
        return
      )
      @defineWatches()
      return
  defineScope: =>
    @$scope.item = @$stateParams.item
    @$scope.loadingDocument = true
    @$scope.document = @DocumentModel.getActiveDocument()
    @$scope.openEditTags = @openEditTags
    @$scope.triggerTitleEditMode = @triggerTitleEditMode
    @$scope.toggleTitleEditMode = @toggleTitleEditMode
    @$scope.saveDocumentTitle = @saveDocumentTitle
    return
  defineWatches: =>
    #Subscriptions
    @$scope.$watch 'document.subscriptions.all', (newVal, oldVal) =>
      if newVal == oldVal
        #After initialization watches are triggered,
        # but newVal equals oldVal in this case
        # so we can decide to skip the update to the model
        return
      @DocumentModel.updateSubscriptions({all: newVal})
      return
    @$scope.$watch 'document.subscriptions.content', (newVal, oldVal) =>
      if newVal == oldVal
        return
      @DocumentModel.updateSubscriptions({content: newVal})
      return
    @$scope.$watch 'document.subscriptions.attachment', (newVal, oldVal) =>
      if newVal == oldVal
        return
      @DocumentModel.updateSubscriptions({attachment: newVal})
      return
    @$scope.$watch 'document.subscriptions.discussions', (newVal, oldVal) =>
      if newVal == oldVal
        return
      @DocumentModel.updateSubscriptions({discussions: newVal})
      return
    @$scope.$watch 'document.subscriptions.comments', (newVal, oldVal) =>
      if newVal == oldVal
        return
      @DocumentModel.updateSubscriptions({comments: newVal})
      return
    return
  openEditTags: =>
    EditDocTagsModalInstanceCtrl =
      ['$scope', '$modalInstance', 'document', 'DocumentModel',
      ($scope, $modalInstance, document, DocumentModel) =>
        @$scope = $scope
        $scope.tagObj = {}
        $scope.tagSelected = false
        $scope.selectedTag = null
        $scope.document = document
        $scope.ok = (tagObj) =>
          $modalInstance.close(tagObj)
          return
        $scope.cancel = =>
          $modalInstance.dismiss('cancel')
          @$scope.tagSelected = false
          @$scope.selectedTag = null
          return
        $scope.removeTag = (tag) =>
          DocumentModel.removeTag(tag)
          @$scope.selectedTag = null
          @$scope.tagSelected = false
          return
        $scope.createNewTag = (newTagName) =>
          DocumentModel.addTag(newTagName)
          return
      ]
    @$modal.open(
      {
        templateUrl: 'document/EditTagsModal.tpl.html',
        controller: EditDocTagsModalInstanceCtrl,
        resolve: {
          document: =>
            return @$scope.document
          DocumentModel: =>
            return @DocumentModel
        }
      }
    )
    return
  toggleTitleEditMode: (document) =>
    @$log.debug("Toggling document title edit mode")
    if !document.titleEditMode
      document.oldValues.title = document.title
    else
      document.title = document.oldValues.title
    document.titleEditMode = !document.titleEditMode
    return
  triggerTitleEditMode: (document) =>
    @$log.debug("Triggering document title edit mode")
    if !document.titleEditMode
      document.oldValues.title = document.title
      document.titleEditMode = !document.titleEditMode
    return
  saveDocumentTitle: (document) =>
    @$log.debug("Saving document title")
    if (document.titleEditMode)
      document.titleEditMode = !document.titleEditMode
      if (document.title != "")
      else
        document.title = '<Empty title>'
      #@AktuellesModel.saveDocument(document)
    return

DocumentCtrl.$inject =
  ['$scope','$stateParams','$modal','$log', '$http', 'DocumentModel']