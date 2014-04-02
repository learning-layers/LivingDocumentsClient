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
angular.module( 'LivingDocuments.user.profile', [
  'ui.router'
])

.config(function ( $stateProvider ) {
  $stateProvider.state( 'userprofile', {
    url: '/userprofile/:item',
    views: {
      "main": {
        controller: 'UserProfileCtrl',
        templateUrl: 'user/profile/profile.tpl.html'
      }
    },
    data:{ pageTitle: 'Userprofile' }
  });
})

.controller( 'UserProfileCtrl', function UserProfileCtrl( $scope, $stateParams, $rootScope, $http, User, SecurityService, $modal, $log) {
    $scope.item = $stateParams.item;
    $scope.isOwner = (SecurityService.currentUser.id == $stateParams.item);

    $scope.editMode = false;

    $scope.profileImgSrc = '';
    
    User.getUserById($scope.item, 
        function(success) {
            console.log(success);
            $scope.userprofile = success.user;
        }, function(error) {
            
        });
        
    User.getTagsByUserId($scope.item,
        function(success) {
            $scope.usertags = success.tags;
        }, 
        function(error) {
            
        });
    
    $scope.saveEdit = function(args) {
        var fieldname = args.fieldname;
        var value = args.value;
        console.log("Input with value=[" + args.value + "] for field with name=[" + args.fieldname + "] saved.");
        var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
        var userPath = '/user/' + $scope.item + '?method=updatefield';
        $http({
            method: 'PUT',
            url: basePath + userPath,
            data: {
                fieldname: fieldname,
                value: value
            },
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            $rootScope.$broadcast('success', "User profile updated.");
            $scope.userprofile[fieldname] = value;
            console.log(value);
            console.log($scope.userprofile);
        })
        .error(function(error, status) {
            $rootScope.$broadcast('error', "An error occured while trying to update the user profile!");
        });
    };
    
    var AddUserTagModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.deleteInput = '';
        $scope.errorMessage = false;
        
        $scope.ok = function (tagname) {
            $modalInstance.close(tagname);
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    
    $scope.openAddTag = function() {
        var modalInstance = $modal.open({
            templateUrl: 'AddUserTagModalContent.html',
            controller: AddUserTagModalInstanceCtrl,
            resolve: {
                tagname: function () {
                    return $scope.tagname;
                }
            }
        });
    
        modalInstance.result.then(
            function (tagname) {
                var basePath = SecurityService.getInitialConfiguration().restServerAddress; 
                var userPath = '/user/' + $scope.item + '?method=addtag';
                $http({
                    method: 'PUT',
                    url: basePath + userPath,
                    data: {
                        tagname: tagname
                    },
                    headers: {'Authorization': SecurityService.currentUser.authorizationString}
                })
                .success(function(success, status) {
                    $rootScope.$broadcast('success', "Successfully added a tag to this user.");
                    $scope.usertags.add({name: tagname});
                })
                .error(function(error, status) {
                    $rootScope.$broadcast('error', "An error occured while trying to add a tag!");
                });
            }, 
            function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
    };
    $scope.deleteTag = function(userId, usertagname) {
        User.deleteTag($scope.item, usertagname,
            function(success) {
                $scope.usertags.remove(function(tag) {
                    return tag.name == usertagname; 
                });
                $rootScope.$broadcast('success', "Successfully removed tag.");
            }, 
            function(error) {
                $rootScope.$broadcast('error', "An error occured while trying to remove a tag!");
            });
    };

    var getUserAvatar = function() {
        var basePath = SecurityService.getInitialConfiguration().restServerAddress;
        var userPath = '/user/' + $scope.item + '/profile/image';
        $http({
            method: 'GET',
            url: basePath + userPath,
            headers: {'Authorization': SecurityService.currentUser.authorizationString}
        })
        .success(function(success, status) {
            $scope.profileImgSrc = 'data:' + success.type + ';base64,' + success.content;
        })
        .error(function(error, status) {
        });
    };
    getUserAvatar();

    $rootScope.$on('RefreshData:user.profileimg', function(ev) {
        console.log("Refresh img triggered!");
        getUserAvatar();
    });
})

.controller('ProfileImageUploadCtrl', function($scope, $rootScope, $upload, SecurityService, ClassManager) {
    var basePath = SecurityService.getInitialConfiguration().restServerAddress;
    
    $scope.onFileSelect = function ($files) {
        console.log($files);
        var ProgressImageMessage = ClassManager.getRegisteredClass('ProgressImageMessage');
        var progressImageMessageInstance = new ProgressImageMessage("Profile image upload");
        $rootScope.$broadcast('info', progressImageMessageInstance);
        //$files: an array of files selected, each file has name, size, and type.
        var successFunction = function(data, status, headers, config) {
            // file is uploaded successfully
            console.log(data);
            progressImageMessageInstance.fireIsFinished();
            $rootScope.$broadcast('RefreshData:user.profileimg');
        };
        var progressFunction = function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total, 10));
            progressImageMessageInstance.setProgressPercentage(parseInt(100.0 * evt.loaded / evt.total, 10));
        };
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
                url: basePath + '/user/' + SecurityService.currentUser.id + '/profile?method=uploadimage',
                //method: 'PUT',
                data: {myObj: $scope.myModelObj},
                headers: {'Authorization': SecurityService.currentUser.authorizationString},
                file: file
            }).progress(progressFunction).success(successFunction);
            //.error(...)
            //.then(success, error, progress); 
        }
    };
})

.directive('editInputText', function () {
    return {
        restrict: 'E',
        templateUrl: "user/profile/editInputText.tpl.html",
        scope: {
            editMode: "&",
            fieldname: "@",
            label: "@",
            value: "=",
            saveMethod: "="
        },
        link: function (scope, iElm, iAttrs) {
            scope.reset = function() {
                scope.editedValue = Object.clone(scope.value);
            };
            scope.$watch('value', function() {
                scope.editedValue = Object.clone(scope.value);
            });
            scope.editedValue = Object.clone(scope.value);
            scope.editModeInputText = false;
            scope.saveEditedValue = function() {
                console.log("Save has been pressed");
                scope.saveMethod({fieldname: scope.fieldname, value: scope.editedValue});
                scope.editModeInputText = false;
            };
        }
    };
})

.directive('editInputTextarea', function () {
    return {
        restrict: 'E',
        templateUrl: "user/profile/editInputTextarea.tpl.html",
        scope: {
            editMode: "&",
            fieldname: "@",
            label: "@",
            value: "=",
            saveMethod: "="
        },
        link: function (scope, iElm, iAttrs) {
            scope.reset = function() {
                scope.editedValue = Object.clone(scope.value);
            };
            scope.$watch('value', function() {
                scope.editedValue = Object.clone(scope.value);
            });
            scope.editedValue = Object.clone(scope.value);
            scope.editModeInputText = false;
            scope.saveEditedValue = function() {
                console.log("Save has been pressed");
                scope.saveMethod({fieldname: scope.fieldname, value: scope.editedValue});
                scope.editModeInputText = false;
            };
        }
    };
})

.factory( 'UserProfileFactory', function() {
    var getUserProfileByUuid = function(uuid) {
        return {
            firstname: "Martin",
            lastname: "Bachl"
        };
    };
    
    return {
        getUserProfileByUuid: getUserProfileByUuid    
    };
})

;