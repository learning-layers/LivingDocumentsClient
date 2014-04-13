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
  "LivingDocuments.document.comments.model"
] )

documentCommentsModule.factory "DocumentCommentsController", ->
  class DocumentCommentsController
    constructor: (@$scope, @$modal, @$log,
                  @DocumentCommentModel, @SecurityService) ->
      @log = $log.getInstance("DocumentCommentsController")
      @initScopeMethods()
      return
    initScopeMethods: ->
      @$scope.openCreateCommentModal = @openCreateCommentModal.bind(@)
      @$scope.comments = @DocumentCommentModel.getActiveDocumentComments()
      @$scope.security = @SecurityService
      return
    openCreateCommentModal: (cmd, comment) ->
      that = @
      @log.debug("Opening create comment modal")
      @$modal.open(
        {
          templateUrl: 'document/comments/createmodal' +
            '/createmodal.tpl.html'
          controller: CreateCommentModalCtrl
          resolve: {
            $log: ->
              return that.$log
            document: ->
              return that.$scope.document
            DocumentCommentModel: ->
              return that.DocumentCommentModel
            comment: ->
              return comment
            cmd: ->
              return cmd
          }
        }
      )
      return
  DocumentCommentsController

documentCommentsModule.directive "documentComments",
  (DocumentCommentsController) ->
    linker = (scope, element, attrs) ->
    controller = ($scope, $modal, $log,
                  DocumentCommentModel, SecurityService) ->
      new DocumentCommentsController($scope, $modal,
        $log, DocumentCommentModel, SecurityService)
    scope = {
      document: '='
    }
    return {
      restrict: 'E',
      templateUrl: "document/comments/" +
        "documentCommentsDirective.tpl.html",
      controller: ['$scope', '$modal', '$log',
                   'DocumentCommentModel', 'SecurityService', controller],
      link: linker,
      scope: scope
    }