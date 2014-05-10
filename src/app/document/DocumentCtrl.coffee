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

DocumentCtrl.$inject =
  ['$scope','$stateParams','$modal','$log', '$http', 'DocumentModel']