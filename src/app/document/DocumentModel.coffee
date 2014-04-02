###

  Copyright 2014 Karlsruhe University of Applied Sciences

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

###
documentModel = angular.module( "LivingDocuments.document.model", [
  "LivingDocuments.document.service"
] )

class DocumentModel extends BaseEventDispatcher
  constructor: ($log, @DocumentService, @$rootScope) ->
    @$log = $log.getInstance("DocumentModel")
    @activeDocument = @initActiveDocument()
    @addTag.bind(@)
    @removeTag.bind(@)
    return
  getActiveDocument: ->
    return @activeDocument
  get: (id, embed) ->
    that = @
    documentLoadTask = @DocumentService.get id, embed
    documentLoadTask.success (data) ->
      that.$log.debug "Received document data="
      that.$log.debug data
      that.refreshDocumentModel data.document.id, data.document
      return
    documentLoadTask.error (error) ->
      that.$log.debug "Error receiving document data"
      return
    #$stateParams.item, "?embed=test"
    return
  addTag: (tagname) ->
    that = @
    id = @activeDocument.id
    addTagTask = @DocumentService.addTag(id, tagname)
    addTagTask.success (data) ->
      that.$log.debug("Successfully added tag! id=" + data.id)
      that.activeDocument.tags.add {id:data.id, name: tagname}
      return
    return
  removeTag: (tag) ->
    that = @
    id = @activeDocument.id
    addTagTask = @DocumentService.removeTag(id, tag.name)
    addTagTask.success (data) ->
      that.$log.debug("Successfully added tag! id=" + data.id)
      that.activeDocument.tags.remove tag
      return
    return
  updateSubscriptions: (subscriptionChangeObj) ->
    that = @
    @$log.debug "Changing subscriptions of document with id=" +
      document.id + ", update="
    @$log.debug subscriptionChangeObj
    subscriptionChange = @DocumentService.updateSubscriptions(
      @activeDocument.id, subscriptionChangeObj)
    subscriptionChange.success ->
      that.$log.debug "Subscription change success"
      that.$rootScope.$emit "success", "Successfully updated subscriptions"
      return
    subscriptionChange.error ->
      that.$log.debug "Subscription change error"
      that.$rootScope.$emit "error", "Error updating subscriptions"
      return
    return
  refreshDocumentModel: (id, document) ->
    @$log.debug ">> Updating document model"
    @activeDocument.id = document.id
    @activeDocument.title = document.title
    @activeDocument.owner = document.owner
    if angular.isDefined document.tags
      @activeDocument.tags = document.tags
    if angular.isDefined document.content
      #TODO remove next 2 lines for dev purposes only
      document.content = {
        content: "",
        authors: []
      }
      document.content.authors.push({id: 10, name:'test'})
      @$rootScope.$emit('ReceivedData:document.content',
        document.id, document.content)
    return
  initActiveDocument: ->
    return {
      id: null
      title: "Loading..."
      hasParent: false
      parentId: null
      isAlreadyAddedToUserFolders: false
      userHasSharingRights: false
      subscriptions: {
        all: true
        content: false
        attachment: false
        discussions: false
        comments: false
      }
      owner: {id:-1, displayname:'Loading...'}
      tags: [
      ]
      checkHasSubscriptions: ->
        hasSubscriptions = false
        angular.forEach @subscriptions, (value, key) ->
          if !hasSubscriptions
            if value == true
              hasSubscriptions = true
        return hasSubscriptions
    }

documentModel.factory "DocumentModel",
  ['$log', 'DocumentService', '$rootScope',
    ($log, DocumentService, $rootScope) ->
      return new DocumentModel($log,
        DocumentService, $rootScope)
  ]