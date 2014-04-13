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
angular.module( 'LivingDocuments.core.resources', [
])

.factory('Registration', function(ClassManager, uuid4, SecurityService, $http) {
    var Registration = Class.create(ClassManager.getRegisteredClass('AbstractClass'), {
        uuid: null,
        domain: null,
        loginname: null,
        displayname: null,
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        registrationDescription: null,
        initialize: function(domain, loginname, displayname, firstname, lastname, email, password, registrationDescription) {
            this.uuid = uuid4.generate();
            this.domain = domain;
            this.loginname = loginname;
            this.displayname = displayname;
            this.firstname = firstname;
            this.lastname = lastname;
            this.email = email;
            this.password = password;
            this.registrationDescription = registrationDescription;
        },
        create: function(successCallback, errorCallback) {
            var outerThis = this;
            
            var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
            var registrationPath = '/register';
            $http({
                method: 'POST',
                url: basePath + registrationPath,
                data: {
                    uuid: outerThis.uuid,
                    domain: outerThis.domain,
                    loginname: outerThis.loginname,
                    displayname: outerThis.displayname,
                    firstname: outerThis.firstname,
                    lastname: outerThis.lastname,
                    email: outerThis.email,
                    password: outerThis.password,
                    registrationDescription: outerThis.registrationDescription
                },
                headers: {}
            })
            .success(function(success, status) {
                successCallback(success, status);
            })
            .error(function(error, status) {
                errorCallback(error, status);
            });
        }
    });
    ClassManager.registerClass('Registration', Registration);
    
    var getRegistrations = function(successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/register';
        $http({
            method: 'GET',
            url: basePath + registrationPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            successCallback(success, status);
        })
        .error(function(error, status) {
            errorCallback(error, status);
        });
    };
    
    return {
        Registration: Registration,
        getRegistrations: getRegistrations
    };
})

.factory('User', function(ClassManager, uuid4, SecurityService, $http) {
    
    var getUsers = function(successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/user';
        $http({
            method: 'GET',
            url: basePath + registrationPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            successCallback(success, status);
        })
        .error(function(error, status) {
            errorCallback(error, status);
        });
    };
    
    var getUserById = function(userId, successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/user/' + userId;
        $http({
            method: 'GET',
            url: basePath + registrationPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            successCallback(success, status);
        })
        .error(function(error, status) {
            errorCallback(error, status);
        });
    };
    
    var getTagsByUserId = function(userId, successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/user/' + userId + '?method=gettags';
        $http({
            method: 'GET',
            url: basePath + registrationPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            successCallback(success, status);
        })
        .error(function(error, status) {
            errorCallback(error, status);
        });
    };
    
    var deleteTag = function(userId, tagname, successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/user/' + userId + '/tag';
        $http({
            method: 'DELETE',
            url: basePath + registrationPath,
            data: {
                tagname: tagname
            },
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            successCallback(success, status);
        })
        .error(function(error, status) {
            errorCallback(error, status);
        });
    };

    var changePassword = function (newpassword) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress;
        var registrationPath = '/user/' + SecurityService.currentUser.id + '?method=changepassword';
        return $http({
            method: 'PUT',
            url: basePath + registrationPath,
            data: {
                newpassword: newpassword
            },
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        });
    };
    
    return {
        getUsers: getUsers,
        getUserById: getUserById,
        getTagsByUserId: getTagsByUserId,
        deleteTag: deleteTag,
        changePassword: changePassword
    };
})

.factory('Role', function(ClassManager, uuid4, SecurityService, $http) {
    
    var getRoles = function(successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/role';
        $http({
            method: 'GET',
            url: basePath + registrationPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            successCallback(success, status);
        })
        .error(function(error, status) {
            errorCallback(error, status);
        });
    };
    
    var setNewRole = function(userId, rolename, successCallback, errorCallback) {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var registrationPath = '/user/' + userId + '/role';
        $http({
                method: 'PUT',
                url: basePath + registrationPath,
                data: {
                    rolename: rolename
                },
                headers: {'Authorization': SecurityService.currentUser.authorizationString}
            })
            .success(function(success, status) {
                successCallback(success, status);
            })
            .error(function(error, status) {
                errorCallback(error, status);
            });
    };
    
    return {
        getRoles: getRoles,
        setNewRole: setNewRole
    };
})

;