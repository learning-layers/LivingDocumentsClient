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
angular.module( 'LivingDocuments.share', [
    'ui.router',
    'LivingDocuments.share.folderAndFiles'
])

.config(function ( $stateProvider ) {
  $stateProvider.state( 'share', {
    url: '/share',
    views: {
      "main": {
        controller: 'ShareCtrl',
        templateUrl: 'share/share.tpl.html'
      }
    },
    data:{ pageTitle: 'Share' }
  });
})

.controller( 'ShareCtrl', function ($scope) {

})

.factory('SharingItemsModel', function () {
    var persons = [
        {id:1, name:'Hugo', details:'HelloWorld person'},
        {id:2, name:'Herbert', details:'HelloWorld person'},
        {id:3, name:'Anton', details:'HelloWorld person'},
        {id:4, name:'Heribert', details:'HelloWorld person'},
        {id:5, name:'Tom', details:'HelloWorld person'}
        ];
    var groups = [
        {id:1, name:'Learning Layers', details:'HelloWorld group'},
        {id:2, name:'EmployID', details:'HelloWorld group'},
        {id:3, name:'Bau ABC', details:'HelloWorld group'}
        ];
        
    var foldersAndFiles = [
        { "id": 1, "roleName" : "User", "roleId" : "role1", "children" : [
          { "id": 2, "roleName" : "subUser1", "roleId" : "role11", "collapsed" : true, "children" : [] },
          { "id": 3, "roleName" : "subUser2", "roleId" : "role12", "collapsed" : true, "children" : [
            { "id": 4, "roleName" : "subUser2-1", "roleId" : "role121", "children" : [
              { "id": 5, "roleName" : "subUser2-1-1", "roleId" : "role1211", "children" : [], "fileicon": true },
              { "id": 6, "roleName" : "subUser2-1-2", "roleId" : "role1212", "children" : [], "fileicon": true }
            ]}
          ]}
        ]},

        { "id": 7, "roleName" : "Admin", "roleId" : "role2", "children" : [
          { "id": 8, "roleName" : "subAdmin1", "roleId" : "role11", "collapsed" : true, "children" : [] },
          { "id": 9, "roleName" : "subAdmin2", "roleId" : "role12", "children" : [
            { "id": 10, "roleName" : "subAdmin2-1", "roleId" : "role121", "children" : [
              { "id": 11, "roleName" : "subAdmin2-1-1", "roleId" : "role1211", "children" : [], "fileicon": true },
              { "id": 12, "roleName" : "subAdmin2-1-2", "roleId" : "role1212", "children" : [], "fileicon": true }
            ]}
          ]}
        ]},

        { "id": 13, "roleName" : "Guest", "roleId" : "role3", "children" : [
          { "id": 14, "roleName" : "subGuest1", "roleId" : "role11", "children" : [] },
          { "id": 15, "roleName" : "subGuest2", "roleId" : "role12", "collapsed" : true, "children" : [
            { "id": 16, "roleName" : "subGuest2-1", "roleId" : "role121", "children" : [
              { "id": 17, "roleName" : "subGuest2-1-1", "roleId" : "role1211", "children" : [], "fileicon": true },
              { "id": 18, "roleName" : "subGuest2-1-2", "roleId" : "role1212", "children" : [], "fileicon": true }
            ]}
          ]}
        ]}
      ];
      
    var fetchGroupsThatHaveAccessRightsFor = function (id, callback) {
        callback([
            {id:1, name:'Learning Layers', rights:'View'},
            {id:2, name:'EmployID', rights:'Edit'},
            {id:3, name:'Bau ABC', rights:'View'}
            ]);
    };
    
    var fetchPersonsThatHaveAccessRightsFor = function (id, callback) {
        callback([
            {id:1, name:'Hugo', rights:'View'},
            {id:2, name:'Herbert', rights:'Edit'},
            {id:3, name:'Anton', rights:'Own'},
            {id:4, name:'Heribert', rights:'Edit'},
            {id:5, name:'Tom', rights:'View'}
            ]);
    };
        
    return {
        persons: persons,
        groups: groups,
        foldersAndFiles: foldersAndFiles,
        fetchGroupsThatHaveAccessRightsFor: fetchGroupsThatHaveAccessRightsFor,
        fetchPersonsThatHaveAccessRightsFor: fetchPersonsThatHaveAccessRightsFor
    };
})

;