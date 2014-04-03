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
documentCommentsModule = angular.module( "LivingDocuments.document.comments", [
  "LivingDocuments.document.comments.createmodal"
] )

documentCommentsModule.factory "DocumentCommentsController", ->
  class DocumentCommentsController
    constructor: (@$scope, @$modal) ->
      @initScopeMethods()
      return
    initScopeMethods: ->
      @$scope.openCreateCommentModal = @openCreateCommentModal.bind(@)
      return
    openCreateCommentModal: ->
      console.error("Create comment modal triggerd")
      that = @
      @$modal.open(
        {
          templateUrl: 'document/comments/createmodal' +
            '/createmodal.tpl.html'
          controller: CreateCommentModalCtrl
          resolve: {
            document: ->
              return that.$scope.document
          }
        }
      )
      return
  DocumentCommentsController

documentCommentsModule.directive "documentComments",
  (DocumentCommentsController) ->
    linker = (scope, element, attrs) ->
    controller = ($scope, $modal) ->
      new DocumentCommentsController($scope, $modal)
    scope = {
      document: '='
    }
    return {
      restrict: 'E',
      templateUrl: "document/comments/" +
        "documentCommentsDirective.tpl.html",
      controller: ['$scope', '$modal', controller],
      link: linker,
      scope: scope
    }