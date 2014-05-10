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
    currentClientVersion: '0.1.2-alpha'
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
)