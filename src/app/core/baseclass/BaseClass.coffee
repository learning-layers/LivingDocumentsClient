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
coreBaseclass = angular.module( "LivingDocuments.core.baseclass", [] )

###
>> BaseControllers
###
###
Thanks to
http://trochette.github.io/Angular-Design-Patterns-Best-Practices
for the guide on angularJS advanced best practices
###
class BaseController
  constructor: (@$scope) ->
    @defineListeners()
    @defineScope()
    return
  defineListeners: ->
    ###
    Destroy function don't need to be called from template,
    thus no need to make it publicly available via scope.
    ###
    @$scope.$on "destroy", @destroy.bind(this)
    return
  defineScope: ->
    #OVERRIDE : Create all scope properties here to keep track of them.
  destroy: (event)->
    #OVERRIDE : Remove all listeners, all timeouts and intervals
BaseController.$inject = ['$scope']

###
>> BaseServices
###
class BaseService
  constructor: (@SecurityService, @$http) ->
    @basePath = SecurityService.getInitialConfiguration().restServerAddress
    return
BaseService.$inject = ['SecurityService', '$http']

class BaseSecureService extends BaseService
  constructor: (SecurityService, $http) ->
    super(SecurityService, $http)
    #Don't link the line below directly to currentUser.authorizationString
    # this would mean, that after a user logs out and in again
    # the old authorizationString would be present
    @currentUser = SecurityService.currentUser
    return
BaseSecureService.$inject = ['SecurityService', '$http']

###
>> BaseEvents
###
class BaseEventDispatcher
  listeners = {}
  constructor: ->
  addEventListener: (type, listener) ->
  removeEventListener: (type, listener) ->
  dispatchEvent: ->
    listeners = null
    if !angular.isString(arguments[0])
      console.warn 'EventDispatcher',
        'First params must be an event type (String)'
    else
      listeners = @listeners[arguments[0]]
      for key in listeners
        #This could use .apply(arguments) instead,
        # but there is currently a bug with it.
        listeners[key](arguments[0],arguments[1],
          arguments[2],arguments[3],arguments[4],
          arguments[5],arguments[6])
    return
