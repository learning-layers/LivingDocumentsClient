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
angular.module( 'LivingDocuments.home', [
  'ui.router'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function ( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'HomeCtrl', function ( $scope ) {
    $scope.subscriptionChanges = [
        {changes:[{type:"comments", changedByUsers:[{name:"David"}, {name:"Martin"}]}, {type:"content", changedByUsers:[{name:"Christine"}]}], document:{name:'Dementias DES Summary', lastUpdateAt:'01/10/2013 13:25'}},
        {changes:[{type:"content", changedByUsers:[{name:"Andreas"}]}], document:{name:'Registration Guidelines', lastUpdateAt:'03/05/2014 15:25'}}
        ];
    $scope.otherChanges = [
        {changes:[{type:"comments", changedByUsers:[{name:"Martin"}]}, {type:"content", changedByUsers:[{name:"Christine"}]}], document:{name:'Dementias DES Summary', lastUpdateAt:'01/10/2013 13:25'}},
        {changes:[{type:"content", changedByUsers:[{name:"Andreas"}]}], document:{name:'Registration Guidelines', lastUpdateAt:'03/05/2014 15:25'}}
        ];
})

.controller('CarouselDemoCtrl', function ($scope, $animate) {    
    $scope.animate = false;
    $scope.animateGlobal = true;
    $scope.slides = [
        { image: 'http://lorempixel.com/400/200/', text: 'blah' },    
        { image: 'http://lorempixel.com/400/200/', text: 'blah' },
        { image: 'http://lorempixel.com/400/200/', text: 'blah' }
    ];
    $scope.myInterval = 5000;
})

;