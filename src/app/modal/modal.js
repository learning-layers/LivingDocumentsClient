/**
 * Copyright 2014 Karlsruhe University of Applied Sciences
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
angular.module( 'LivingDocuments.modal', [
  'ui.router'
])

.config(function ( $stateProvider ) {
  $stateProvider.state( 'modal', {
    url: '/modal',
    views: {
      "main": {
        controller: 'ModalCtrl',
        templateUrl: 'modal/modal.tpl.html'
      }
    },
    data:{ pageTitle: 'Modal' }
  });
})

.controller( 'ModalCtrl', function ( $scope ) {
})

/*.directive('contactlist', function () {

})*/

.directive('draggable', function () {
    var linker = function(scope, element, attrs) {
        element.draggable();
    };
    var controller = function($scope) {
    };
    return {
        restrict: 'A',
        controller: ['$scope', controller],
        link: linker
    };
})

.directive('resize', function () {
    var linker = function(scope, element, attrs) {
        element.resizable();
    };
    var controller = function($scope) {
    };
    return {
        restrict: 'A',
        controller: ['$scope', controller],
        link: linker
    };
})

/*.directive('chart', function () {
    var parseDataForCharts = function(sourceArray, sourceProp, referenceArray, referenceProp) {
        var data = [];
        referenceArray.each(function (reference) {
            var count = sourceArray.count(function (source) {
                return source[sourceProp] == reference[referenceProp];
            });
            data.push([reference[referenceProp], count]);
        });
        return data;
    };
    var linker = function(scope, element, attrs) {
        scope.data = parseDataForCharts(scope.sourceArray, scope.sourceProp, scope.referenceArray, scope.referenceProp);
        
        if (element.is(":visible")) {
            $.plot(element, [scope.data], {
                series: {
                    bars: {
                        show: true,
                        barWidth: 0.6,
                        align: "center"
                    }
                },
                xaxis: {
                    mode: "categories",
                    tickLength: 0
                }
            });
        }
    };
    var controller = function($scope) {
        // Controller goes here
    };
    return {
        restrict: 'A',
        controller: ['$scope', controller],
        link: linker,
        scope: {
            sourceArray: '=',
            sourceProp: '@',
            referenceArray: '=',
            referenceProp: '@'
        }
    };
})*/

;