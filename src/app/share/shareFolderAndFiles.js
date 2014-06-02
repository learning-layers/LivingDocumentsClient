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
angular.module( 'LivingDocuments.share.folderAndFiles', [
])

.directive('folderAndFileSharing', function () {
    var linker = function(scope, element, attrs) {
    };
    var controller = function($scope, SharingItemsModel) {
        $scope.foldersAndFiles = SharingItemsModel.foldersAndFiles;
        
        $scope.searchPersonOrGroupOptions = ['Person', 'Group'];
        $scope.searchPersonOrGroupOption = $scope.searchPersonOrGroupOptions[0];
        
        $scope.persons = SharingItemsModel.persons;
        $scope.groups = SharingItemsModel.groups;
        $scope.selectedPerson = '';
        $scope.selectedGroup = '';
        
        $scope.accessRightOptions = ['View', 'Edit', 'Own'];
        $scope.accessRightOption = $scope.accessRightOptions[0];
        
        $scope.isPersonSelected = false;
        $scope.setIsPersonSelected = function(isPersonSelected) {
            $scope.isPersonSelected = isPersonSelected;
        };
        
        $scope.isGroupSelected = false;
        $scope.setIsGroupSelected = function(isGroupSelected) {
            $scope.isGroupSelected = isGroupSelected;
        };
        
        $scope.shareFolderOrFile = function(searchPersonOrGroupOption, accessRightOption) {
            if (angular.isDefined($scope.mytree.currentNode)) {
                var currentNode = $scope.mytree.currentNode;
                var fileOrFolder = '';
                if (angular.isDefined(currentNode.fileicon)) {
                    fileOrFolder = 'File';
                } else {
                    fileOrFolder = 'Folder';
                }
                var id;
                if (searchPersonOrGroupOption == 'Person') {
                    id = $scope.selectedPerson.id;
                } else {
                    id = $scope.selectedGroup.id;
                }
                console.log('Shared ' + fileOrFolder + ' with ' + searchPersonOrGroupOption + ' with id=' + id + ' rights=' + accessRightOption);
            }
        };
        
        $scope.$watch('mytree.currentNode', function () {
            var currentNode = $scope.mytree.currentNode;
            if (angular.isUndefined($scope.personsThatHaveAccess)) {
                $scope.personsThatHaveAccess = [];
            }
            if (angular.isUndefined($scope.groupsThatHaveAccess)) {
                $scope.groupsThatHaveAccess = [];
            }
            if (angular.isDefined(currentNode) &&
                angular.isDefined(currentNode.id) && 
                angular.isDefined($scope.personsThatHaveAccess) && 
                angular.isDefined($scope.groupsThatHaveAccess)) {
                    
                console.log(currentNode.id);
                
                $scope.personsThatHaveAccess = [];
                SharingItemsModel.fetchPersonsThatHaveAccessRightsFor(currentNode.id, function (persons) {
                    console.log(persons);
                    $scope.personsThatHaveAccess = persons;
                });
                
                $scope.groupsThatHaveAccess = [];
                SharingItemsModel.fetchGroupsThatHaveAccessRightsFor(currentNode.id, function (groups) {
                    console.log(groups);
                    $scope.groupsThatHaveAccess = groups;
                });
            }
        });
        
        $scope.updateRights = function (personOrGroupCommand, personOrGroupId, rights) {
            var message = "Updated " + personOrGroupCommand + " rights of " + personOrGroupCommand + " with id=" + personOrGroupId + " to=" + rights + " for: ";
            var currentNode = $scope.mytree.currentNode;
            var fileOrFolder = '';
            if (angular.isDefined(currentNode.fileicon)) {
                fileOrFolder = 'File';
            } else {
                fileOrFolder = 'Folder';
            }
            console.log(message + fileOrFolder + ': id=' + currentNode.id);
        };
        $scope.deleteRights = function (personOrGroupCommand, personOrGroupId) {
            var message = "Deleted " + personOrGroupCommand + " rights of " + personOrGroupCommand + " with id=" + personOrGroupId + " for: ";
            var currentNode = $scope.mytree.currentNode;
            var fileOrFolder = '';
            if (angular.isDefined(currentNode.fileicon)) {
                fileOrFolder = 'File';
            } else {
                fileOrFolder = 'Folder';
            }
            console.log(message + fileOrFolder + ': id=' + currentNode.id);
        };
    };
    return {
        restrict: 'EA',
        templateUrl: "share/folderAndFileSharingDirective.tpl.html",
        controller: ['$scope', 'SharingItemsModel', controller],
        link: linker,
        scope: {
        }
    };
})

;