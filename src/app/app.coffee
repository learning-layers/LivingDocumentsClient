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

angular.module( 'LivingDocuments', [
  #vendor package dependencies
  "ui.bootstrap"
  "ngAnimate"
  "templates-app"
  "templates-common"
  "ui.route"
  "uuid"
  "LocalStorageModule"
  "angularTreeview"
  "angularFileUpload"
  "ui.keypress"
  "ngSanitize"
  "summernote"

  #dependencies of this application
  "LivingDocuments.core"
  "LivingDocuments.maincontroller"
  "LivingDocuments.user"
  "LivingDocuments.login"
  "LivingDocuments.home"
  "LivingDocuments.navigation"
  "LivingDocuments.contacts"
  "LivingDocuments.modal"
  "LivingDocuments.share"
  "LivingDocuments.feedback"
  "LivingDocuments.search"
  "LivingDocuments.document"
  "LivingDocuments.documents"
  "LivingDocuments.register"
  "LivingDocuments.admin"
])

.config(($stateProvider, $urlRouterProvider, $httpProvider,
         SecurityServiceProvider, $provide) ->
  getFirstURL = ->
    windowLocString = window.location.href.toString()
    return windowLocString.split(window.location.host)[1].split('#')[1]

  initialConfiguration = {
    defaultPath: "/login"
    restServerAddress: "http://its-clever.de/demo/livingDocumentsREST"
    firstRequestURL: getFirstURL()
    is401response: false
    currentClientVersion: '0.1.3-alpha'
  }

  SecurityServiceProvider.setInitialConfiguration(initialConfiguration)
  console.log(
    "Current client version is=" +
    initialConfiguration.currentClientVersion
  )

  # Logging decorator
  $provide.decorator "$log", [
    "$delegate"
    ($delegate) ->

      # Save the original $log functions
      enhanceLogging = (loggingFunc, context) ->
        ->
          modifiedArguments = [].slice.call(arguments)
          modifiedArguments[0] = ["::[" + context + "]> "] +
            modifiedArguments[0]
          if angular.isString(modifiedArguments[0])
            loggingFunc.apply null, modifiedArguments

          # for angular mocks
          loggingFunc.logs = []
          return
      debugFn = $delegate.debug
      errorFn = $delegate.error
      warnFn = $delegate.warn
      infoFn = $delegate.info
      logFn = $delegate.log
      $delegate.getInstance = (context) ->
        debug = enhanceLogging($delegate.debug, context)

        # initial log message when getInstance is being called
        debug "Begin: " + context
        log: enhanceLogging($delegate.log, context)
        info: enhanceLogging($delegate.info, context)
        warn: enhanceLogging($delegate.warn, context)
        debug: debug
        error: enhanceLogging($delegate.error, context)

      $delegate.debug = ->
        args = [].slice.call(arguments)
        if angular.isString(args[0])

          # Prepend timestamp
          now = Date.create(Date.now()).format("{12hr}:{mm}{tt}")
          args[0] = now + " - " + args[0]

        # Call the original with the output prepended with formatted timestamp
        debugFn.apply null, args
        return


      # for angular mocks
      $delegate.debug.logs = []
      $delegate.info = ->
        args = [].slice.call(arguments)
        if angular.isString(args[0])

          # Prepend timestamp
          now = Date.create(Date.now()).format("{12hr}:{mm}{tt}")
          args[0] = now + " - " + args[0]

        # Call the original with the output prepended with formatted timestamp
        infoFn.apply null, args
        return


      # for angular mocks
      $delegate.info.logs = []
      $delegate.warn = ->
        args = [].slice.call(arguments)
        if angular.isString(args[0])

          # Prepend timestamp
          now = Date.create(Date.now()).format("{12hr}:{mm}{tt}")
          args[0] = now + " - " + args[0]

        # Call the original with the output prepended with formatted timestamp
        warnFn.apply null, args
        return


      # for angular mocks
      $delegate.warn.logs = []
      $delegate.error = ->
        args = [].slice.call(arguments)
        if angular.isString(args[0])

          # Prepend timestamp
          now = Date.create(Date.now()).format("{12hr}:{mm}{tt}")
          args[0] = now + " - " + args[0]

        # Call the original with the output prepended with formatted timestamp
        errorFn.apply null, args
        return


      # for angular mocks
      $delegate.error.logs = []
      $delegate.log = ->
        args = [].slice.call(arguments)
        if angular.isString(args[0])

          # Prepend timestamp
          now = Date.create(Date.now()).format("{12hr}:{mm}{tt}")
          args[0] = now + " - " + args[0]

        # Call the original with the output prepended with formatted timestamp
        logFn.apply null, args
        return


      # for angular mocks
      $delegate.log.logs = []
      return $delegate
  ]

  unauthorizedResponseInterceptor =
    listeners: []
    notify: (isLoggedIn) ->
      angular.forEach @listeners, (value, key) ->
        value isLoggedIn
        return
      return
    register: (callback) ->
      @listeners.push callback
      return
  return

  logsOutUserOn401 = [
    '$q', '$location', '$rootScope',
    ($q, $location, $rootScope) ->
      success = (response) ->
        if (response.config.url.toString().startsWith("http://"))
          $rootScope.offlineMode = false
        return response

      error = (response) ->
        console.log(response)
        if (response.status == 401)
          console.log("Unauthorized")
          unauthorizedResponseInterceptor.notify(false)
          #InitialConfiguration.rootScope.offlineMode = false;
          #redirect them back to login page
          #initialConfiguration.is401response = true
          $location.path( initialConfiguration.defaultPath )
          if (angular.isDefined($rootScope.triggerLogout))
            $rootScope.triggerLogout()
          return $q.reject(response)
        if (response.status == 0 && response.data == "")
          #TODO add serverstatus check here
          #currently after aborting the file upload the offline mode
          #is being triggered but it shouldn't be triggered
          #because the server is in fact still online.
          console.log("Server offline triggering offline mode.")
          initialConfiguration.rootScope.offlineMode = true
          return $q.reject(response)
        else
          initialConfiguration.rootScope.offlineMode = false
          return $q.reject(response)
      return
    ]

  $httpProvider.responseInterceptors.push(logsOutUserOn401)

  $urlRouterProvider.otherwise( '/home' )
)

.run(($rootScope, $location, $http, $log,
      localStorageService, SecurityService, ApplicationState) ->
  $rootScope.$on('$locationChangeStart', (event) ->
    $log.debug("Location url()=")
    $log.debug($location.url())
    $log.debug("Security.isAuthenticated evaluates to=")
    $log.debug(SecurityService.isAuthenticated())
    $log.debug("currentUser in localStorage is set evaluates to=")
    $log.debug(localStorageService.get('currentUser') != null)

    if ($location.url() == "/register")
      #allowed urls no check needed
    else
      if ($location.url() == "/login" && SecurityService.isAuthenticated())
        $location.path(
          SecurityService.getInitialConfiguration().firstRequestURL
        )
        ApplicationState.triggerApplicationNormalMode()

      else if (
        SecurityService.getInitialConfiguration().firstRequestURL == "/login"
      )
        SecurityService.getInitialConfiguration().firstRequestURL = "/home"
        if (!SecurityService.isAuthenticated() &&
            localStorageService.get('currentUser') != null)
          SecurityService.authenticate(
            ->
              #is authenticated
              #do nothing
              console.log(
                "Checked if user is authenticated and it evaluated to: true"
              )
              $log.debug(
                "After automatic auth security.isAuthenticated evaluates to=" +
                SecurityService.isAuthenticated()
              )
              $log.debug(
                "Redirecting to url=" +
                SecurityService.getInitialConfiguration().firstRequestURL
              )
              $location.path(
                SecurityService.getInitialConfiguration().firstRequestURL
              )
              ApplicationState.triggerApplicationNormalMode()
              return
            ,
            ->
              #not authenticated
              ApplicationState.triggerApplicationLoginMode()
              return
          )
        else if SecurityService.isAuthenticated()
          $location.path(
            SecurityService.getInitialConfiguration().firstRequestURL
          )
          ApplicationState.triggerApplicationNormalMode()

      else if (
        angular.isUndefined(
          SecurityService.getInitialConfiguration().firstRequestURL
        ) ||
        SecurityService.getInitialConfiguration().firstRequestURL == null
      )
        SecurityService.getInitialConfiguration().firstRequestURL = "/home"

      if (
        SecurityService.getInitialConfiguration().firstRequestURL != "/login" &&
        !SecurityService.isAuthenticated()
      )
        if (angular.isDefined(localStorageService.get('currentUser')))
          $log.debug(
            "Performing authentication=" +
            (
              SecurityService.getInitialConfiguration().firstRequestURL != '/login' &&
              !SecurityService.isAuthenticated()
            )
          )
          SecurityService.authenticate(
            ->
              #Is authenticated
              #do nothing
              console.log("Checked if user is authenticated and it evaluated to: true")
              $log.debug(
                "After automatic auth security.isAuthenticated evaluates to=" +
                SecurityService.isAuthenticated()
              )
              $log.debug(
                "Redirecting to url=" +
                SecurityService.getInitialConfiguration().firstRequestURL
              )
              $location.path( SecurityService.getInitialConfiguration().firstRequestURL )
              ApplicationState.triggerApplicationNormalMode()
              return
            ,
            ->
              #not authenticated
              ApplicationState.triggerApplicationLoginMode()
              return
          )
        $log.debug("Redirecting to login state")
        $location.path( "/login" )
        ApplicationState.triggerApplicationLoginMode()
      else if (SecurityService.isAuthenticated())
        if (SecurityService.getInitialConfiguration().is401response)
          SecurityService.logout()
          $location.path( "/login" )
          ApplicationState.triggerApplicationLoginMode()
    return
  )

  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) ->
    #check if client version is up to date
    basePath = SecurityService.getInitialConfiguration().restServerAddress
    currentClientVersion = SecurityService.getInitialConfiguration().currentClientVersion
    $http({
      method: 'GET',
      url: basePath + '/clientversioncheck?version=' + currentClientVersion
    })
    .success((success) ->
      $log.debug(
        "Successfully checked the client version." +
        " Current client version is compatible=" + success.compatible
      )
      if (!success.compatible)
        window.location.reload(true)
      return
    )
    return
  )

  return
)