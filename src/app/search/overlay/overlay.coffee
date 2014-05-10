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
searchOverlay = angular.module( 'LivingDocuments.search.overlay', [
] )

class SearchOverlayCtrl extends BaseController
  constructor: ($scope, @$rootScope, @$log, @SearchService) ->
    super($scope)
  defineScope: ->
    @$scope.searchMode = false
    @$scope.accordionCloseOthers = false
    @$scope.accordionTabIsOpen = false
    @$scope.users = []
    @$scope.documents = []

    @initScopeMethods()
    @initScopeEvents()
    return
  initScopeMethods: =>
    #Add searchUser to scope and bind this
    @$scope.searchuser = @searchUser
    @$scope.dismissSearchOverlay = @dismissSearchOverlay
    return
  initScopeEvents: =>
    @$rootScope.$on 'searchModeChange', (ev, searchMode) =>
      #Listen to searchModeChange events to react on the current
      # search mode (e. g. show the search overlay).
      console.log "Search overlay received searchMode=" + searchMode
      @$scope.searchMode = searchMode
    @$rootScope.$on 'issueSearch', (ev, searchValue) =>
      @$log.debug "Received issued search with value=" + searchValue
      @searchUser searchValue
    return
  searchUser: (searchValue) =>
    if angular.isDefined searchValue
      @SearchService.get(searchValue)
      .success((success, status) =>
        @$log.debug "Successfully retrieved user search result!"
        @$log.debug(success)
        if angular.isUndefined success.users
          @$scope.users = []
        else
          @$scope.users = success.users
      )
      .error((error) =>
        @$log.error "Error while retrieving user search results!"
      )
    return
  dismissSearchOverlay: =>
    #switch search mode to false
    @$rootScope.$emit('searchModeChange', false)
    return
SearchOverlayCtrl.$inject =
  ['$scope', '$rootScope', '$log', 'SearchService']
searchOverlay.controller( 'SearchOverlayCtrl', SearchOverlayCtrl)

searchOverlay.directive "searchOverlay", ->
  linker = (scope, element, attrs) ->
  controller = ($scope, $rootScope, $log, SearchService) ->
    new SearchOverlayCtrl($scope, $rootScope, $log, SearchService)
  return {
    restrict: 'E'
    templateUrl: "search/overlay/overlay.tpl.html"
    controller: ['$scope', '$rootScope', '$log', 'SearchService', controller]
    link: linker
    scope: {
    }
  }