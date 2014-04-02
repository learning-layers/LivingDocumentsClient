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
documentDiscussions = angular.module( "LivingDocuments.document.discussions", [
  "LivingDocuments.document.discussion.createmodal"
  "LivingDocuments.document.discussions.controller"
] )

documentDiscussions.directive "documentDiscussions", ->
  linker = (scope, element, attrs) ->
  controller = ($scope, $rootScope, $log, $modal) ->
    new DocumentDiscussionsController($scope, $rootScope, $log, $modal)
  scope = {
    document: '='
  }
  return {
    restrict: 'E',
    templateUrl: "document/discussions/" +
      "documentDiscussionsDirective.tpl.html",
    controller: ['$scope', '$rootScope', '$log', '$modal', controller],
    link: linker,
    scope: scope
  }