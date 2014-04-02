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
angular.module( 'LivingDocuments.register', [
    'ui.router'
])

.config(function ( $stateProvider ) {
  $stateProvider.state( 'register', {
    url: '/register',
    views: {
      "main": {
        controller: 'RegisterCtrl',
        templateUrl: 'register/register.tpl.html'
      }
    },
    data:{ pageTitle: 'Register' }
  });
})

.controller( 'RegisterCtrl', function ($scope, $rootScope, $location, Registration) {
    $scope.isRegistrationInProgress = false;
    $scope.submitRegistration = function() {
        $scope.isRegistrationInProgress = true;
        if ($scope.email == $scope.emailconfirmation && $scope.password == $scope.confirmpassword) {
            var registration = new Registration.Registration(
                $scope.domain, $scope.loginname, $scope.displayname, $scope.firstname, $scope.lastname, $scope.email, $scope.password, $scope.registrationDescription);
            registration.create(
                function(success, status) {
                    $rootScope.$broadcast('success', "Registration successful! After the account is validated by an admin you can access this service.");
                    $scope.isRegistrationInProgress = false;
                    $location.path("/home");
                }, function(error, status) {
                    if (status == '409') {
                        $rootScope.$broadcast('error', "Registration failed! Username, Displayname or Email already exists, please choose another one.");
                    } else {
                        $rootScope.$broadcast('error', "Registration failed! Username, Displayname or Email already exists, please choose another one.");
                    }
                    $scope.isRegistrationInProgress = false;
                });
        } else {
            if ($scope.password != $scope.confirmpassword) {
                $rootScope.$broadcast('error', "Password and password confirmation don't match");
                $scope.password = '';
                $scope.confirmpassword = '';
            } else {
                $rootScope.$broadcast('error', "Email and email confirmation don't match");
            }
            $scope.isRegistrationInProgress = false;
        }
    };
})

;