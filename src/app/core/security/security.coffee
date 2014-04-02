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
coreSecurity = angular.module( 'LivingDocuments.core.coreSecurity', [
  'LocalStorageModule'
])

class SecurityService
  currentUser: {
    id: null,
    username: null,
    email: null,
    authorizationString: null,
    sessionId: null,
    data: null,
    roles: null
  }
  loginListeners: []
  logoutListeners: []
  logoutHappened: false
  constructor: (@$http, @$log, @$location,
    @$rootScope, @localStorageService, @initialConfiguration) ->
    @resetCurrentUser()
    @login.bind(@)
    @doLogin.bind(@)
    @logout.bind(@)
    @doLogout.bind(@)
    @isAuthenticated.bind(@)
    @authenticate.bind(@)
    return
  getInitialConfiguration: ->
    return @initialConfiguration
  resetCurrentUser: ->
    @currentUser.id = null
    @currentUser.username = null
    @currentUser.email = null
    @currentUser.authorizationString = null
    @currentUser.sessionId = null
    @currentUser.data = null
    @currentUser.roles = null
    return
  registerLoginListener: (callback) ->
    @loginListeners.add callback
    return
  registerLogoutListener: (callback) ->
    @logoutListeners.add callback
    return
  notifyLogin: ->
    angular.forEach this.loginListeners, (callback, key) ->
      callback this.currentUser
    return
  notifyLogout: ->
    angular.forEach this.logoutListeners, (callback, key) ->
      callback()
    return
  login: (username, password, successCallback, errorCallback) ->
    that = @
    if angular.isUndefined @$rootScope.triggerLogout
      @$rootScope.triggerLogout = ->
        if that.isAuthenticated()
          that.logout {message:"Unauthorized"}
    @resetCurrentUser()
    @$log.info "Performing login with username=" + username
    @$log.debug "-- BEGIN Login --"
    authorizationString = null
    base64encodedUserCredentials = null
    @$log.debug "password !== null is"
    @$log.debug password != null
    @$log.debug "angular.isDefined(localStorageService.get('currentUser')) is"
    @$log.debug angular.isDefined @localStorageService.get 'currentUser'
    if (
      password != null ||
      !(angular.isDefined @localStorageService.get 'currentUser' &&
      @localStorageService.get 'currentUser' != null)
    )
      base64encodedUserCredentials = (username + ':' + password).encodeBase64()
      authorizationString = 'Basic ' + base64encodedUserCredentials
    else
      authorizationString =
        @localStorageService.get('currentUser').authorizationString
    @doLogin(username, authorizationString, successCallback, errorCallback)
    return
  doLogin: (username, authorizationString, successCallback, errorCallback) ->
    that = @
    @$http({
      method: 'POST'
      url: @initialConfiguration.restServerAddress + '/sessionlogin'
      headers: {'Authorization': authorizationString}
    })
    .success((data) ->
      that.initialConfiguration.is401response = false
      that.currentUser.id = data.id
      that.currentUser.username = username
      that.currentUser.email = username + "@example.com"
      that.currentUser.authorizationString = authorizationString
      that.currentUser.sessionId = data.sessionId
      that.localStorageService.add 'currentUser', that.currentUser
      that.notifyLogin()
      that.$log.info "Success in logging in with username=" + username
      successCallback that.currentUser
      that.$log.info "-- END Login --"

      #Fetch user information
      that.$http({
        method: 'GET'
        url: that.initialConfiguration.restServerAddress +
          '/user/' + that.currentUser.id
        headers: {'Authorization': authorizationString}
      })
      .success((data) ->
        that.$log.debug data.user
        that.currentUser.data = data.user
        that.currentUser.roles = data.roles
      )
      .error((data) ->
      )
      return
    )
    .error((data) ->
      that.$log.error "Failed logging in with username=" + username
      that.$log.error "Reason="
      that.$log.error data
      that.localStorageService.remove 'currentUser'
      errorCallback()
      that.$log.info "-- END Login --"
      return
    )
    return
  logout: (reason) ->
    that = @
    try
      @localStorageService.remove 'currentUser'
    catch e
    @initialConfiguration.is401response = false
    authorizationString = @currentUser.authorizationString
    data = {
      sessionId: @currentUser.sessionId
    }
    @doLogout(data, authorizationString, reason)
    return
  doLogout: (data, authorizationString, reason) ->
    that = @
    @$http({
      method: 'PUT'
      url: that.initialConfiguration.restServerAddress + '/sessionlogout'
      headers: {'Authorization': authorizationString}
      data: data
    })
    .success((data) ->
      that.$log.debug "Logout successful!"
      return
    )
    .error((data) ->
      that.$log.debug "Logout failed!"
      return
    )
    @resetCurrentUser()
    if angular.isDefined @localStorageService.get 'currentUser'
      @$log.debug "Deleting cookie information due to user logout."
      @localStorageService.remove 'currentUser'
    #Reset first request url because now that the user
    # has logged out. The initial request url shall
    # not be taken into account after
    # a logout happened.
    @notifyLogout()
    @initialConfiguration.firstRequestURL = "/home"
    @$location.path "/login"
    if angular.isUndefined reason
      @$rootScope.$broadcast 'success', "Logout successful!"
    else
      @$rootScope.$broadcast 'error', "Unauthorized!"
      @$rootScope.$broadcast 'user:logout', {}
    return
  authenticate: (successCallback, errorCallback) ->
    that = @
    @$log.debug "Method: Performing authentication =" + !@currentUser &&
      angular.isDefined(@localStorageService.get('currentUser')) &&
      @localStorageService.get('currentUser') != null
    if (
      @currentUser.authorizationString == null &&
      angular.isDefined(@localStorageService.get('currentUser')) &&
      @localStorageService.get('currentUser') != null
    )
      #User is not authenticated yet but
      # has a cookie with the login information
      if (
        angular.isDefined(@localStorageService.get('currentUser').username)
      )
        @login(that.localStorageService.get('currentUser').username, null,
          ((success)->
            that.$log.debug "Successfully authenticated via cookie " +
              "stored user authentication details."
            successCallback()
            return
          ),
          ((error) ->
            that.$log.debug "Error authenticating " +
              "via cookie stored user authentication details."
            that.localStorageService.remove('currentUser')
            errorCallback()
            return
          )
        )
      else
        @$log.debug "User is not logged " +
          "in but cookie information is available."
    else
      @$log.debug "User is not logged in and " +
        "there is no cookie information available."
      errorCallback()
    return
  isAuthenticated: ->
    @currentUser.authorizationString != null

class SecurityServiceProvider
  initialConfiguration: null
  constructor: ->
    return
  setInitialConfiguration: (config) ->
    @initialConfiguration = config
    return
  getInitialConfiguration: ->
    return @initialConfiguration
  $get: ['$http', '$log', '$location', '$rootScope', 'localStorageService',
    ($http, $log, $location, $rootScope, localStorageService) ->
      return new SecurityService($http, $log, $location,
        $rootScope, localStorageService, @initialConfiguration)
  ]
coreSecurity.provider "SecurityService", ->
  return new SecurityServiceProvider()