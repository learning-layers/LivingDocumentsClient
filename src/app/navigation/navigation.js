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
angular.module( 'LivingDocuments.navigation', [
])

.factory('NavigationController', function(ClassManager) {
    
    
    var NavigationController = Class.create(ClassManager.getRegisteredClass('AbstractClass'), {
        $scope: null,
        $rootScope: null, 
        $timeout: null, 
        $location: null, 
        ApplicationState: null,
        BusyTaskService: null, 
        SecurityService: null,
        $modal: null,
        $log: null,
        $http: null,
        initialize: function($scope, $rootScope, $timeout, $location, ApplicationState, BusyTaskService, SecurityService, $modal, $log, $http) {
            this.$scope = $scope;
            this.$rootScope = $rootScope; 
            this.$timeout = $timeout;
            this.$location = $location; 
            this.ApplicationState = ApplicationState;
            this.BusyTaskService = BusyTaskService;
            this.SecurityService = SecurityService;
            this.$modal = $modal;
            this.$log = $log.getInstance("NavigationController");
            this.$http = $http;
            
            this.$scope.currentUser = this.SecurityService.currentUser;
            
            this.initializeScopeVariables();
            this.initializeScopeMethods();
            this.initializeScopeEvents();
        },
        initializeScopeVariables: function() {
            this.$scope.searchMode = false;
            this.$scope.busyTasks = this.BusyTaskService.busyTasks;
            this.$scope.username = '';
            this.$scope.password = '';
            this.$scope.ApplicationState = this.ApplicationState;
            this.$scope.loginInProgress = false;
        },
        initializeScopeMethods: function() {
            var outerThis = this;
            
            this.$scope.issueSearch = function(searchValue) {
                outerThis.$log.debug("Issued Search with searchValue=" + searchValue);
                outerThis.$rootScope.$broadcast('issueSearch', searchValue);
            };
            
            this.$scope.login = function () {
                outerThis.$scope.loginInProgress = true;
                var BusyTask = ClassManager.getRegisteredClass('BusyTask');
                var busyTaskInstance = new BusyTask("Perfoming login");
                outerThis.$rootScope.$broadcast('AddBusyTask', busyTaskInstance);
                outerThis.SecurityService.login(outerThis.$scope.username, outerThis.$scope.password, 
                    function (success) {
                        console.log(success);
                        outerThis.$rootScope.$broadcast('RemoveBusyTask', busyTaskInstance);
                        outerThis.$location.path( outerThis.SecurityService.getInitialConfiguration().firstRequestURL );
                        outerThis.ApplicationState.triggerApplicationNormalMode();
                        outerThis.$scope.loginInProgress = false;
                        outerThis.$rootScope.$broadcast('success', "Login successful. Welcome!");
                    }, 
                    function(error) {
                        console.error(error);
                        outerThis.$rootScope.$broadcast('RemoveBusyTask', busyTaskInstance);
                        outerThis.$scope.loginInProgress = false;
                        outerThis.$rootScope.$broadcast('error', "Login failed, username or password wrong!");
                    });
                outerThis.$scope.username = '';
                outerThis.$scope.password = '';
            };
            this.$scope.logout = function () {
                console.log("Logout pressed");
                outerThis.SecurityService.logout();
            };
            this.$scope.checkRoles = function() {
                var currentUser  = outerThis.SecurityService.currentUser;
                if (angular.isDefined(currentUser.roles)) {
                    var index = -1;
                    try {
                        index = currentUser.roles.indexOf('superadmin');
                    } catch(err) {
                    }
                    if (index !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };
            
            var CreateNewDocumentModalInstanceCtrl = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.title = '';
                $scope.togglePublicOn = true;
                $scope.togglePublicCount = 0;
                $scope.togglePublic = function() {
                    // This function contains a workaround because it is triggered twice
                    // upon clicking the checkbox.
                    //$log.debug("Triggered toggleRememberMe function");
                    if ($scope.togglePublicCount == 1) {
                        $scope.togglePublicOn = !$scope.togglePublicOn;
                        outerThis.$log.debug("togglePublicOn=" + $scope.togglePublicOn);
                        $scope.togglePublicCount = 0;
                    } else {
                        $scope.togglePublicCount++;
                    }
                };
                
                $scope.ok = function (title) {
                    $modalInstance.close(title);
                };
                
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }];
            
            this.$scope.openCreateNewDocumentModal = function() {
                var modalInstance = outerThis.$modal.open({
                    templateUrl: 'document/createmodal/createmodal.tpl.html',
                    controller: CreateNewDocumentModalInstanceCtrl,
                    resolve: {
                    }
                });
            
                modalInstance.result.then(
                    function (title) {
                        // creat new document
                        var basePath = outerThis.SecurityService.getInitialConfiguration().restServerAddress; 
                        var userPath = '/document';
                        outerThis.$http({
                            method: 'POST',
                            url: basePath + userPath,
                            data: {
                                title: title
                            },
                            headers: {'Authorization': outerThis.SecurityService.currentUser.authorizationString}
                        })
                        .success(function(success, status) {
                            outerThis.$rootScope.$broadcast('success', "Document created successfully.");
                            outerThis.$location.path('/document/' + success.document.id);
                        })
                        .error(function(error, status) {
                            outerThis.$rootScope.$broadcast('error', "Document couldn't be created!");
                        });
                    }, 
                    function () {
                        outerThis.$log.info('Modal dismissed at: ' + new Date());
                    });
            };
        },
        initializeScopeEvents: function() {
            var outerThis = this;
            
            var searchTimeout = null;
            
            this.$scope.$watch('searchValue', function() {
                if (searchTimeout !== null) {
                    outerThis.$timeout.cancel(searchTimeout);
                    searchTimeout = null;
                }
                searchTimeout = outerThis.$timeout(function() {
                    outerThis.$scope.issueSearch(outerThis.$scope.searchValue);
                    outerThis.$log.debug('searchValue changed to=' + outerThis.$scope.searchValue);
                }, 350);
            });
            
            this.$scope.$watch('searchMode', function() {
                outerThis.$rootScope.$broadcast('searchModeChange', outerThis.$scope.searchMode);  
            });
            if (angular.isUndefined(this.$scope.loginForm)) {
                this.$scope.loginForm = '';
                this.$scope.$watch('loginForm', function() {
                    console.log("Login form change detected!");
                    outerThis.$scope.$watch('loginForm.$invalid', function() {
                        if (outerThis.$scope.loginForm.$invalid) {
                            outerThis.$rootScope.$broadcast('error', "Username contains a character that isn't allowed!");
                        }
                    });
                });
            }

            this.$scope.profileImgSrc = '';
            that = this;
            var getUserAvatar = function() {
                var basePath = that.SecurityService.getInitialConfiguration().restServerAddress;
                var userPath = '/user/' + that.SecurityService.currentUser.id + '/profile/image';
                that.$http({
                    method: 'GET',
                    url: basePath + userPath,
                    headers: {'Authorization': that.SecurityService.currentUser.authorizationString}
                })
                .success(function(success, status) {
                    that.$scope.profileImgSrc = 'data:' + success.type + ';base64,' + success.content;
                })
                .error(function(error, status) {
                });
            };
            this.$scope.$watch('ApplicationState.application.loginMode', function(newValue, oldValue) {
                if (!newValue) {
                    getUserAvatar();
                }
            });
        }
    });
    return NavigationController;
})

.directive( 'navigationBar', function (NavigationController) {
    var linker = function(scope, element, attrs) {
    };
    var controller = function($scope, $rootScope, $timeout, $location, ApplicationState, BusyTaskService, SecurityService, $modal, $log, $http) {
        return new NavigationController($scope, $rootScope, $timeout, $location, ApplicationState, BusyTaskService, SecurityService, $modal, $log, $http);
    };
    return {
        restrict: 'E',
        templateUrl: "navigation/navigationBarDirective.tpl.html",
        controller: ['$scope', '$rootScope', '$timeout', '$location', 'ApplicationState', 'BusyTaskService', 'SecurityService', '$modal', '$log', '$http', controller],
        link: linker,
        scope: {
        }
    };
})

;