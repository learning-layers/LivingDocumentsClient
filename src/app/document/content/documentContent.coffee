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
documentContentModule = angular.module( "LivingDocuments.document.content", [
  "LivingDocuments.document.content.model"
  "LivingDocuments.document.content.controller"
  "LivingDocuments.document.content.attachment.uploadmodal"
])

documentContentModule.directive "documentContent", ->
  linker = (scope, element, attrs) ->
  controller = ($scope, $log, DocumentContentModel, $rootScope, $modal) ->
    new DocumentContentCtrl($scope, $log,
      DocumentContentModel, $rootScope, $modal)
  scope = {
    document: '='
  }
  return {
    restrict: 'E'
    templateUrl: "document/content/" +
      "documentContentDirective.tpl.html"
    controller: [
      '$scope', '$log', 'DocumentContentModel',
      '$rootScope', '$modal', controller
    ]
    link: linker
    scope: scope
  }

documentContentModule.directive "documentContentContextMenu", ->
  linker = (scope, element, attrs) ->
  controller = ($scope, $log, $rootScope) ->
    new DocumentContentContextMenuCtrl($scope, $log, $rootScope)
  scope = {
  }
  return {
    restrict: 'E'
    templateUrl: "document/content/" +
      "documentContentContextMenuDirective.tpl.html"
    controller: [
      '$scope', '$log', '$rootScope',
      controller
    ]
    link: linker
    scope: scope
  }