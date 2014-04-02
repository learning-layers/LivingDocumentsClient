/*
  https://github.com/MarcinSzoldrowski/angular.treeview

  forked from:
  @license Angular Treeview version 0.1.6
  ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
  License: MIT

  [TREE attribute]
  angular-treeview: the treeview directive
  tree-id : each tree's unique id.
  tree-model : the tree model on $scope.
  node-id : each node's id
  node-label : each node's label
  node-children: each node's children
  search-query-scope : scope with query string

  <div
    data-angular-treeview="true"
    data-tree-id="tree"
    data-tree-model="roleList"
    data-node-id="roleId"
    data-node-label="roleName"
    data-node-children="children"
    data-search-query-scope="searchQuery"
  </div>
*/

(function ( angular ) {
  'use strict';

  angular.module( 'angularTreeview', [] ).directive( 'treeModel', ['$compile', function( $compile ) {
    return {
      restrict: 'A',
      link: function ( scope, element, attrs ) {
        //tree id
        var treeId = attrs.treeId;

        //tree model
        var treeModel = attrs.treeModel;

        //node id
        var nodeId = attrs.nodeId;

        //node label
        var nodeLabel = attrs.nodeLabel;

        //children
        var nodeChildren = attrs.nodeChildren;

        //search query
        var searchQuery = attrs.searchQuery;

        //tree template
        var template =
          '<ul>' +
            '<li data-ng-repeat="node in ' + treeModel + ' | filter:' + searchQuery + ' ">' +
              '<i class="collapsed" data-ng-class="{nopointer: !node.' + nodeChildren + '.length}"' + 'data-ng-show="!node.expanded && !node.fileicon" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
              '<i class="expanded" data-ng-show="node.expanded && !node.fileicon" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
              '<i class="normal" data-ng-show="node.fileicon"></i> ' +
              '<span title="{{node.' + nodeLabel + '}}" data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
              '<div data-ng-show="node.expanded" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + ' data-search-query=' + searchQuery  + '></div>' +
            '</li>' +
          '</ul>';

        //check tree id, tree model
        if( treeId && treeModel ) {

          //root node
          if( attrs.angularTreeview ) {

            //create tree object if not exists
            scope[treeId] = scope[treeId] || {};

            //if node head clicks,
            scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){
              //Collapse or Expand
              if(selectedNode[nodeChildren] !== undefined){
                selectedNode.expanded = !selectedNode.expanded;
              }
              
              scope[treeId].expandedOrCollapsedFolderOrFileNode = selectedNode;
            };

            //if node label clicks,
            scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){
              //remove highlight from previous node
              if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
                scope[treeId].currentNode.selected = undefined;
              }

              //set highlight to selected node
              selectedNode.selected = 'selected';

              //set currentNode
              scope[treeId].currentNode = selectedNode;
            };
          }

          //Rendering template.
          element.html('').append( $compile( template )( scope ) );
        }
      }
    };
  }]);
})( angular );