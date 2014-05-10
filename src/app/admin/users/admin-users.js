/**
 * Code contributed to the Learning Layers project
 * http://www.learning-layers.eu
 * Development is partly funded by the FP7 Programme of the European
 * Commission under Grant Agreement FP7-ICT-318209.
 * Copyright (c) 2014, Karlsruhe University of Applied Sciences.
 * For a list of contributors see the AUTHORS file at the top-level directory
 * of this distribution.
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
angular.module( 'LivingDocuments.admin.users', [
    'ui.router'
])

.config(function ( $stateProvider ) {
  $stateProvider.state( 'admin.users', {
    url: '/users',
    views: {
      "admincontent": {
        controller: 'AdminUsersCtrl',
        templateUrl: 'admin/users/admin-users.tpl.html'
      }
    },
    data:{ pageTitle: 'Manage Users' }
  });
})

.controller( 'AdminUsersCtrl', function ($scope, $rootScope, $http, Registration, SecurityService, User, $log, $modal, Role) {
    $scope.getRoleSelect = function(user) {
        var newUserRole = '';
        if (angular.isDefined(user.roles[0])) {
            newUserRole = user.roles[0].name;
        } else { 
            newUserRole = {id:-1, name:'normaluser'};
        }
        return newUserRole;
    };
    
    $scope.setNewRole = function(user, rolename) {
        Role.setNewRole(user.id, rolename, function(success, status) {
                $scope.getUsers();
            }, function(error, status) {
            });
    };
    
    $scope.roles = [];
    $scope.roles.add({id:-1, name:'normaluser'});
    $scope.getRoles = function() {
        Role.getRoles(
            function(success, status) {
                console.log(success);
                $scope.roles = success.roles;
                $scope.roles.add({id:-1, name:'normaluser'});
            }, function(error, status) {
            });
    };
    $scope.getRoles();
    
    $scope.registrations = [];
    $scope.getRegistrations = function() {
        Registration.getRegistrations(
            function(success, status) {
                 $scope.registrations = success.registrations;
            }, function(error, status) {
            });
    };
    $scope.getRegistrations();
    $scope.approveRegistration = function(registrationId, registration) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
            var registrationPath = '/register/' + registrationId;
            $http({
                method: 'PUT',
                url: basePath + registrationPath,
                headers: {'Authorization': SecurityService.currentUser.authorizationString}
            })
            .success(function(success, status) {
                $rootScope.$broadcast('success', "Registration accepted. User has been created and is now activated.");
                $scope.registrations.remove(registration);
            })
            .error(function(error, status) {
                $rootScope.$broadcast('error', "An error occured while trying to create a user from a registration");
            });
    };
    var rejectRegistration = function(registrationId, registration) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/register/' + registrationId;
        $http({
            method: 'DELETE',
            url: basePath + registrationPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            $rootScope.$broadcast('success', "Registration rejected.");
            $scope.registrations.remove(registration);
        })
        .error(function(error, status) {
            $rootScope.$broadcast('error', "An error occured while trying to reject a registration");
        });
    };
    $scope.users = [];
    $scope.getUsers = function() {
        User.getUsers(
            function(success, status) {
                $scope.users = success.users;
            }, function(error, status) {
            });
    };
    $scope.getUsers();
    
    var DeleteRegistrationModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.deleteInput = '';
        $scope.errorMessage = false;
        
        $scope.ok = function (deleteInput) {
            console.log("Pressed ok with deleteInputValue=" + $scope.deleteInput);
            if (deleteInput == 'delete') {
                $modalInstance.close();
            } else {
                $scope.errorMessage = true;
            }
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    
    $scope.openRejectRegistration = function(registrationId, registration) {
        var modalInstance = $modal.open({
            templateUrl: 'DeleteRegistrationModalContent.html',
            controller: DeleteRegistrationModalInstanceCtrl,
            resolve: {
            }
        });
    
        modalInstance.result.then(
            function () {
                rejectRegistration(registrationId, registration);
            }, 
            function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
    };
    
    var DeleteUserModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.deleteInput = '';
        $scope.errorMessage = false;
        
        $scope.ok = function (deleteInput) {
            console.log("Pressed ok with deleteInputValue=" + $scope.deleteInput);
            if (deleteInput == 'delete') {
                $modalInstance.close();
            } else {
                $scope.errorMessage = true;
            }
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    
    $scope.openDeleteUser = function(userId, user) {
        var modalInstance = $modal.open({
            templateUrl: 'DeleteUserModalContent.html',
            controller: DeleteUserModalInstanceCtrl,
            resolve: {
            }
        });
    
        modalInstance.result.then(
            function () {
                // delete user
                var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
                var userPath = '/user/' + userId;
                $http({
                    method: 'DELETE',
                    url: basePath + userPath,
                    headers: {'Authorization': SecurityService.currentUser.authorizationString}
                })
                .success(function(success, status) {
                    $rootScope.$broadcast('success', "User deleted.");
                    $scope.users.remove(user);
                })
                .error(function(error, status) {
                    $rootScope.$broadcast('error', "An error occured while trying to delete the user!");
                });
            }, 
            function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
    };
})

;