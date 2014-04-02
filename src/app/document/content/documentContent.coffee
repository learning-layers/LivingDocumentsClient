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
angular.module( "LivingDocuments.document.content", [
  "LivingDocuments.document.content.model"
  "LivingDocuments.document.content.controller"
])

.directive "documentContent", ->
  linker = (scope, element, attrs)->
  controller = ($scope, $log, DocumentContentModel, $rootScope) ->
    new DocumentContentCtrl($scope, $log, DocumentContentModel, $rootScope)
  scope = {
    document: '='
  }
  return {
    restrict: 'E'
    templateUrl: "document/content/" +
      "documentContentDirective.tpl.html"
    controller: [
      '$scope', '$log', 'DocumentContentModel',
      '$rootScope', controller
    ]
    link: linker
    scope: scope
  }