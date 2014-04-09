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
angular.module( 'LivingDocuments', [
    /* vendor package dependencies */
    'ui.bootstrap',
    'ngAnimate', 
    'templates-app',
    'templates-common',
    'ui.route',
    'uuid',
    'LocalStorageModule',
    'angularTreeview',
    'angularFileUpload',
    'ui.keypress',
    'ngSanitize',

    /* application module dependencies */
    'LivingDocuments.core',
    'LivingDocuments.maincontroller',
    'LivingDocuments.user',
    'LivingDocuments.login',
    'LivingDocuments.home',
    'LivingDocuments.navigation',
    'LivingDocuments.contacts',
    'LivingDocuments.modal',
    'LivingDocuments.share',
    'LivingDocuments.feedback',
    'LivingDocuments.search',
    'LivingDocuments.document',
    'LivingDocuments.documents',
    'LivingDocuments.register',
    'LivingDocuments.admin'
])

.config(function ($stateProvider, $urlRouterProvider, $httpProvider, SecurityServiceProvider, $provide) {

    var initialConfiguration = {
        defaultPath: '/login',
        restServerAddress: "http://localhost/restNew",
        firstRequestURL: window.location.href.toString().split(window.location.host)[1].split('#')[1],
        is401response: false,
        currentClientVersion: '0.0.5-alpha'
    };
    SecurityServiceProvider.setInitialConfiguration(initialConfiguration);
    console.log("Current client version is=" + initialConfiguration.currentClientVersion);

    /* Logging decorator */
    $provide.decorator( '$log', [ "$delegate", function( $delegate ) {
        // Save the original $log functions
        var debugFn = $delegate.debug;
        var errorFn = $delegate.error;
        var warnFn = $delegate.warn;
        var infoFn = $delegate.info;
        var logFn = $delegate.log;
        
        function enhanceLogging(loggingFunc, context) {
            return function() {
                var modifiedArguments = [].slice.call(arguments);
                if (angular.isString(modifiedArguments[0])) {
                    modifiedArguments[0] = ['::[' + context + ']> '] + modifiedArguments[0];
                }
                loggingFunc.apply(null, modifiedArguments);
                // for angular mocks
                loggingFunc.logs = [];
            };
        }
        
        $delegate.getInstance = function(context) {
            var debug = enhanceLogging($delegate.debug, context);
            // initial log message when getInstance is being called
            debug("Begin: " + context);
            return {
                log : enhanceLogging($delegate.log, context),
                info : enhanceLogging($delegate.info, context),
                warn : enhanceLogging($delegate.warn, context),
                debug : debug,
                error : enhanceLogging($delegate.error, context)
            };
        };

        $delegate.debug = function() {
            var args    = [].slice.call(arguments);
          
            if (angular.isString(args[0])) {
                // Prepend timestamp
                var now     = Date.create(Date.now()).format('{12hr}:{mm}{tt}');
                args[0] = now + " - " + args[0];
            }

            // Call the original with the output prepended with formatted timestamp
            debugFn.apply(null, args);
        };
        // for angular mocks
        $delegate.debug.logs = [];
        
        $delegate.info = function() {
            var args    = [].slice.call(arguments);
            
            if (angular.isString(args[0])) {
                // Prepend timestamp
                var now     = Date.create(Date.now()).format('{12hr}:{mm}{tt}');
                args[0] = now + " - " + args[0];
            }

            // Call the original with the output prepended with formatted timestamp
            infoFn.apply(null, args);
        };
        // for angular mocks
        $delegate.info.logs = [];
        
        $delegate.warn = function() {
            var args    = [].slice.call(arguments);
            
            if (angular.isString(args[0])) {
                // Prepend timestamp
                var now     = Date.create(Date.now()).format('{12hr}:{mm}{tt}');
                args[0] = now + " - " + args[0];
            }

            // Call the original with the output prepended with formatted timestamp
            warnFn.apply(null, args);
        };
        // for angular mocks
        $delegate.warn.logs = [];
        
        $delegate.error = function() {
            var args    = [].slice.call(arguments);
            
            if (angular.isString(args[0])) {
                // Prepend timestamp
                var now     = Date.create(Date.now()).format('{12hr}:{mm}{tt}');
                args[0] = now + " - " + args[0];
            }

            // Call the original with the output prepended with formatted timestamp
            errorFn.apply(null, args);
        };
        // for angular mocks
        $delegate.error.logs = [];
        
        $delegate.log = function() {
            var args    = [].slice.call(arguments);
            
            if (angular.isString(args[0])) {
                // Prepend timestamp
                var now     = Date.create(Date.now()).format('{12hr}:{mm}{tt}');
                args[0] = now + " - " + args[0];
            }

            // Call the original with the output prepended with formatted timestamp
            logFn.apply(null, args);
        };
        // for angular mocks
        $delegate.log.logs = [];

        return $delegate;
    }]);
    
    var unauthorizedResponseInterceptor = {
        listeners : [],
        notify : function(isLoggedIn) {
            angular.forEach(this.listeners, function(value, key) {
                value(isLoggedIn);
            });
        },
        register : function(callback) {
            this.listeners.push(callback);
        }
    };
    
    var logsOutUserOn401 = ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
        var success = function (response) {
            if (response.config.url.toString().startsWith("http://")) {
                $rootScope.offlineMode = false;
            }
            return response;
        };

        var error = function (response) {
            console.log(response);
            if (response.status === 401) {
                console.log("Unauthorized");
                unauthorizedResponseInterceptor.notify(false);
                //initialConfiguration.rootScope.offlineMode = false;
                //redirect them back to login page
                //initialConfiguration.is401response = true;
                $location.path( initialConfiguration.defaultPath );
                if (angular.isDefined($rootScope.triggerLogout)) {
                    $rootScope.triggerLogout();
                }
                return $q.reject(response);
            }
            if (response.status === 0 && response.data === "") {
                // TODO add serverstatus check here
                // currently after aborting the file upload the offline mode
                // is being triggered but it shouldn't be triggered
                // because the server is in fact still online.
                console.log("Server offline triggering offline mode.");
                initialConfiguration.rootScope.offlineMode = true;
                return $q.reject(response);
            } else {
                initialConfiguration.rootScope.offlineMode = false;
                return $q.reject(response);
            }
        };

        return function (promise) {
            return promise.then(success, error);
        };
    }];

    $httpProvider.responseInterceptors.push(logsOutUserOn401);
    
    $urlRouterProvider.otherwise( '/home' );
    
    // Uncomment to intercept http calls.
    /*$provide.factory('MyHttpInterceptor', function ($q) {
        return {
            // On request success
            request: function (config) {
                console.log("-- BEGIN Intercepted request --");
                console.log(config); // Contains the data about the request before it is sent.
                console.log("-- END Intercepted request --");

                // Return the config or wrap it in a promise if blank.
                return config || $q.when(config);
            },

            // On request failure
            requestError: function (rejection) {
                // console.log(rejection); // Contains the data about the error on the request.

                // Return the promise rejection.
                return $q.reject(rejection);
            },

            // On response success
            response: function (response) {
                // console.log(response); // Contains the data from the response.

                // Return the response or promise.
                return response || $q.when(response);
            },

            // On response failure
            responseError: function (rejection) {
                // console.log(rejection); // Contains the data about the error.

                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    });

    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('MyHttpInterceptor');*/
})

.run( function run ($rootScope, $location, $http, $log, localStorageService, SecurityService, ApplicationState) {
    $rootScope.$on('$locationChangeStart', function (event) {
        $log.debug("Location url()=");
        $log.debug($location.url());
        $log.debug("Security.isAuthenticated evaluates to=");
        $log.debug(SecurityService.isAuthenticated());
        $log.debug("currentUser in localStorage is set evaluates to=");
        $log.debug(localStorageService.get('currentUser') != null);
        
        if ($location.url() === "/register") {
            // allowed urls no check needed
        } else {
        
            if ($location.url() === "/login" && SecurityService.isAuthenticated()) {
                $location.path( SecurityService.getInitialConfiguration().firstRequestURL );
                ApplicationState.triggerApplicationNormalMode();
            } else if (SecurityService.getInitialConfiguration().firstRequestURL === "/login") {
                SecurityService.getInitialConfiguration().firstRequestURL = "/home";
                if (!SecurityService.isAuthenticated() && localStorageService.get('currentUser') != null) {
                    SecurityService.authenticate(function() {
                        // is authenticated
                        // do nothing
                        console.log("Checked if user is authenticated and it evaluated to: true");
                        $log.debug("After automatic auth security.isAuthenticated evaluates to=" + SecurityService.isAuthenticated());
                        $log.debug("Redirecting to url=" + SecurityService.getInitialConfiguration().firstRequestURL );
                        $location.path( SecurityService.getInitialConfiguration().firstRequestURL );
                        ApplicationState.triggerApplicationNormalMode();
                    }, function() {
                        // not authenticated
                        ApplicationState.triggerApplicationLoginMode();
                    });
                } else if(SecurityService.isAuthenticated()) {
                    $location.path( SecurityService.getInitialConfiguration().firstRequestURL );
                    ApplicationState.triggerApplicationNormalMode();
                }
            } else if (angular.isUndefined(SecurityService.getInitialConfiguration().firstRequestURL) || SecurityService.getInitialConfiguration().firstRequestURL === null) {
                SecurityService.getInitialConfiguration().firstRequestURL = "/home";
            }
            
            if (SecurityService.getInitialConfiguration().firstRequestURL !== "/login" && !SecurityService.isAuthenticated()) {
                
                if (angular.isDefined(localStorageService.get('currentUser'))) {
                    $log.debug("Performing authentication=" + (SecurityService.getInitialConfiguration().firstRequestURL !== '/login' && !SecurityService.isAuthenticated()));
                    SecurityService.authenticate(function() {
                        // is authenticated
                        // do nothing
                        console.log("Checked if user is authenticated and it evaluated to: true");
                        $log.debug("After automatic auth security.isAuthenticated evaluates to=" + SecurityService.isAuthenticated());
                        $log.debug("Redirecting to url=" + SecurityService.getInitialConfiguration().firstRequestURL );
                        $location.path( SecurityService.getInitialConfiguration().firstRequestURL );
                        ApplicationState.triggerApplicationNormalMode();
                    }, function() {
                        // not authenticated
                        ApplicationState.triggerApplicationLoginMode();
                    });
                }
                $log.debug("Redirecting to login state");
                $location.path( "/login" );
                ApplicationState.triggerApplicationLoginMode();
            } else if (SecurityService.isAuthenticated()) {
                if (SecurityService.getInitialConfiguration().is401response) {
                    SecurityService.logout();
                    $location.path( "/login" );
                    ApplicationState.triggerApplicationLoginMode();
                }/* else {
                    $log.debug("User already authenticated redirecting to /home.");
                    $location.path( config.firstRequestURL );
                }*/
            }
                    
        }
        
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        // check if client version is up to date
        var basePath = SecurityService.getInitialConfiguration().restServerAddress;
        var currentClientVersion = SecurityService.getInitialConfiguration().currentClientVersion;
        $http({
            method: 'GET',
            url: basePath + '/clientversioncheck?version=' + currentClientVersion
        })
        .success(function(success) {
            $log.debug("Successfully checked the client version. Current client version is compatible=" + success.compatible);
            if (!success.compatible) {
                window.location.reload(true);
            }
        });
    });
})

;