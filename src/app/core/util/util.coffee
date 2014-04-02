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
coreUtil = angular.module( "LivingDocuments.core.util", [
] )

coreUtil.directive 'setNgAnimate', ['$animate', ($animate) ->
  return {
    link:  ($scope, $element, $attrs) ->
      $scope.$watch(->
          return $scope.$eval $attrs.setNgAnimate, $scope
        , (valnew, valold)->
            console.log 'Directive animation Enabled: ' + valnew
            $animate.enabled !!valnew, $element
      )
      return
  }
]

coreUtil.directive 'bootstrapWysiwyg', ->
  console.log('Called bootstrap wysiwyg.')
  return {
    restrict: 'A',
    link: (scope, element, attrs) ->
      angular.element(element).wysiwyg(scope.$eval(attrs.directiveName))
      return
  }

coreUtil.directive 'ngRightClick', ($parse) ->
  return (scope, element, attrs) ->
    fn = $parse(attrs.ngRightClick)
    element.bind('contextmenu', (event) ->
      event.preventDefault()
      fn(scope, {$event:event})
    )
    return
###
  .directive('ngRightClick', ['$parse', function($parse) {
  return function(scope, element, attrs) {
  var fn = $parse(attrs.ngRightClick);
  element.bind('contextmenu', function(event) {
  scope.$apply(function() {
  event.preventDefault();
    fn(scope, {$event:event});
  });
  });
  };
}])
###