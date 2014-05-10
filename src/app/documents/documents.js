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
angular.module( 'LivingDocuments.documents', [
    'ui.router'
])

.config(function ( $stateProvider ) {
  $stateProvider.state( 'documents', {
    url: '/documents',
    views: {
      "main": {
        controller: 'DocumentsCtrl',
        templateUrl: 'documents/documents.tpl.html'
      }
    },
    data:{ pageTitle: 'Documents' }
  });
})

.controller( 'DocumentsCtrl', function ($scope, $http, ClassManager, SecurityService, $rootScope, $log) {
    var FolderManagement =  Class.create(ClassManager.getRegisteredClass('AbstractClass'), {
        $scope: null,
        $http: null,
        basePath: null,
        $rootScope: null,
        $log: null,
        initialize: function($scope, $http, $rootScope, $log) {
            this.$scope = $scope;
            this.$http = $http;
            this.basePath = SecurityService.getInitialConfiguration().restServerAddress;
            this.$rootScope = $rootScope;
            this.$log = $log.getInstance("FolderManagement");
            
            this.initializeScopeVariables();
            this.initializeScopeMethods();
            this.initializeScopeEvents();
            
            this.afterInitialize();
        },
        initializeScopeVariables: function() {
            // Set initial folder structure
            this.$scope.folderAndFileStructure = [{"generatedId": 'Root', "name" : "My Folders", "children" : []}];
            this.$log.debug("Initialized folder and file structure.");
            this.$scope.isRootFolder = false;
            this.$scope.organiseDocumentsTree = {
                expandedOrCollapsedFolderOrFileNode: {
                    expanded: null
                }
            };
        },
        initializeScopeMethods: function() {
            var folderManagement = this;
            this.$scope.submitRename = function(editValue) {
                folderManagement.$log.debug("Renaming folder to name=" + editValue + " former name=" + folderManagement.$scope.organiseDocumentsTree.currentNode.name);
                folderManagement.renameFolder(editValue);
            };
            this.$scope.submitCreate = function(createValue) {
                folderManagement.$log.debug("Creating folder with name=" + createValue + " in folder=" + folderManagement.$scope.organiseDocumentsTree.currentNode.name);
                folderManagement.createFolder(createValue);
            };
        },
        initializeScopeEvents: function() {
            var folderManagement = this;
            this.$scope.$watch('organiseDocumentsTree.currentNode', function () {
                var currentNode = $scope.organiseDocumentsTree.currentNode;
                if (angular.isDefined(currentNode) && currentNode !== null && angular.isDefined(currentNode.generatedId)) {
                    folderManagement.$log.debug("Selected node with generatedId=" + currentNode.generatedId + ", name=" + currentNode.name);
                    if (currentNode.generatedId === 'Root') {
                        folderManagement.$scope.isRootFolder = true;
                        folderManagement.$log.debug("RootFolder has been selected");
                    } else {
                        folderManagement.$scope.isRootFolder = false;
                    }
                }
            });
            var expansionWatcherUnregistration = null;
            this.$scope.$watch('organiseDocumentsTree.expandedOrCollapsedFolderOrFileNode', function () {
                var expandedOrCollapsedNode = folderManagement.$scope.organiseDocumentsTree.expandedOrCollapsedFolderOrFileNode;
                if (angular.isDefined(expandedOrCollapsedNode) && expandedOrCollapsedNode !== null && angular.isDefined(expandedOrCollapsedNode.generatedId)) {
                    if (expansionWatcherUnregistration !== null) {
                        expansionWatcherUnregistration();
                        expansionWatcherUnregistration = null;
                    }
                    expansionWatcherUnregistration = folderManagement.$scope.$watch('organiseDocumentsTree.expandedOrCollapsedFolderOrFileNode.expanded', function () {
                        var expandedOrCollapsedNode = folderManagement.$scope.organiseDocumentsTree.expandedOrCollapsedFolderOrFileNode;
                        if (angular.isDefined(expandedOrCollapsedNode) && expandedOrCollapsedNode !== null && angular.isDefined(expandedOrCollapsedNode.generatedId)) {
                            if (expandedOrCollapsedNode.expanded) {
                                folderManagement.$log.debug("Expanded node with generatedId=" + expandedOrCollapsedNode.generatedId + ", name=" + expandedOrCollapsedNode.name);
                                var generatedFolderIdsToLoad = [];
                                generatedFolderIdsToLoad.add(expandedOrCollapsedNode.generatedId);
                                folderManagement.retrieveAndInsertSubFolders(generatedFolderIdsToLoad);
                            }
                        }
                    });
                }
            });
        },
        afterInitialize: function() {
            var folderManagement = this;
            
            var generatedFolderIdsToLoad = ['Root'];
            //folderManagement.retrieveAndInsertSubFolders(generatedFolderIdsToLoad);
        },
        insertChildAt: function(folderManagement, node, parentGeneratedId, folder, firstlevel, expandNode) {
            if (firstlevel) {
                folderManagement.$log.debug("Inserting retrieved folder into tree at node.parentGeneratedId=" + parentGeneratedId + ", folder.name=" + folder.name);
            }
            var insertionPointFound = false;
            angular.forEach(node, function(parent, key) {
                if (!insertionPointFound) {
                    if (parent.generatedId === parentGeneratedId) {
                        insertionPointFound = true;
                        
                        var childAlreadyPresent = false;
                        angular.forEach(parent.children, function(child, key) {
                            if (!childAlreadyPresent) {
                                if (child.generatedId === folder.generatedId) {
                                    childAlreadyPresent = true;
                                }
                            }
                        });
                        if (!childAlreadyPresent) {
                            parent.children.add(folder);
                        }
                    } else if (parent.children.length > 0) {
                        folderManagement.insertChildAt(folderManagement, parent.children, parentGeneratedId, folder, false, expandNode);
                    }
                }
            });
        },
        createFolder: function(newFolderName) {
            var folderManagement = this;
            
            $http({
                method: 'POST',
                url: folderManagement.basePath + '/folder',
                data: {
                    generatedId: folderManagement.$scope.organiseDocumentsTree.currentNode.generatedId,
                    name: newFolderName
                },
                headers: {'Authorization': SecurityService.currentUser.authorizationString}
            })
            .success(function(success, status) {
                folderManagement.$log.debug("Successfully created folder with name=" + folderManagement.$scope.organiseDocumentsTree.currentNode.generatedId);
                folderManagement.$log.debug(success);
                folderManagement.insertChildAt(folderManagement, folderManagement.$scope.folderAndFileStructure, success.folders[0].parentGeneratedId, success.folders[0], false, true);
            })
            .error(function(error, status) {
                folderManagement.$log.error("Error while creating folder!");
            });
        },
        retrieveAndInsertSubFolders: function(generatedFolderIdsToLoad) {
            var folderManagement = this;
            
            // load folders
            $http({
                method: 'PUT',
                url: folderManagement.basePath + '/folder?method=getfolders',
                data: {
                    generatedFolderIdsToLoad: generatedFolderIdsToLoad
                },
                headers: {'Authorization': SecurityService.currentUser.authorizationString}
            })
            .success(function(success, status) {
                folderManagement.$log.debug("Successfully retrieved subfolders.");
                angular.forEach(success.folders, function(value, key) {
                    folderManagement.$log.debug("Successfully retrieved subfolder=" + value.name + " with generatedId=" + value.generatedId);
                    folderManagement.insertChildAt(folderManagement, folderManagement.$scope.folderAndFileStructure, value.parentGeneratedId, value, true, false);
                });
            })
            .error(function(error, status) {
                folderManagement.$log.error("Error while fetching subfolders!");
            });
        },
        renameFolder: function(changedFolderName) {
            var folderManagement = this;
            
            var generatedId = folderManagement.$scope.organiseDocumentsTree.currentNode.generatedId;
            var hashTagIndex = generatedId.indexOf('#');
            var id = generatedId.substring(hashTagIndex + 1, generatedId.length);
            
            $http({
                method: 'PUT',
                url: folderManagement.basePath + '/folder/' + id,
                data: {
                    newName: changedFolderName
                },
                headers: {'Authorization': SecurityService.currentUser.authorizationString}
            })
            .success(function(success, status) {
                folderManagement.$log.debug("Successfully renamed folder with name=" + folderManagement.$scope.organiseDocumentsTree.currentNode.name + " to new name=" + changedFolderName);
                folderManagement.$scope.organiseDocumentsTree.currentNode.name = changedFolderName;
            })
            .error(function(error, status) {
                folderManagement.$log.error("Error while renaming folder!");
            });
        }
    });
    
    var folderManagementInstance = new FolderManagement($scope, $http, $rootScope, $log);
})

;