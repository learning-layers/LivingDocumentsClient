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
angular.module( "LivingDocuments.navigation.controller", [
] )

class NavigationCtrl extends BaseController
  constructor: (@$scope, @$rootScope, @$timeout,
                @$location, @ApplicationState, @BusyTaskService,
                @SecurityService, @$modal, @$log, @$http) ->
    super($scope)
    @$log = $log.getInstance("NavigationController")
    @$scope.currentUser = this.SecurityService.currentUser
    @initializeScopeMethods()
    @initializeScopeEvents()
    return
  defineScope: ->
    @$scope.searchMode = false
    @$scope.busyTasks = this.BusyTaskService.busyTasks
    @$scope.username = ''
    @$scope.password = ''
    @$scope.ApplicationState = this.ApplicationState
    @$scope.loginInProgress = false
    @$scope.issueSearch = @issueSearch
    @$scope.login = @login
    return
  initializeScopeMethods: ->
    return
  initializeScopeEvents: ->
    return
  issueSearch: (searchValue) =>
    @$log.debug("Issued Search with searchValue=" + searchValue)
    @$rootScope.$broadcast('issueSearch', searchValue)
    return
  login: =>
    @$scope.loginInProgress = true
    #var BusyTask = ClassManager.getRegisteredClass('BusyTask')
    #var busyTaskInstance = new BusyTask("Perfoming login")
    @$rootScope.$broadcast('AddBusyTask', {})
    @SecurityService.login(@$scope.username, @$scope.password,
      (success) =>
        console.log(success)
        @$rootScope.$broadcast('RemoveBusyTask', {})
        @$location.path( @SecurityService.getInitialConfiguration().firstRequestURL )
        @ApplicationState.triggerApplicationNormalMode()
        @$scope.loginInProgress = false
        @$rootScope.$broadcast('success', "Login successful. Welcome!")
        return
      ,
      (error) =>
        console.error(error)
        @$rootScope.$broadcast('RemoveBusyTask', {})
        @$scope.loginInProgress = false
        @$rootScope.$broadcast('error', "Login failed, username or password wrong!")
        return
    )
    @$scope.username = ''
    @$scope.password = ''
    return

NavigationCtrl.$inject =
  ['$scope', '$rootScope', '$timeout',
   '$location', 'ApplicationState', 'BusyTaskService',
   'SecurityService', '$modal', '$log', '$http']