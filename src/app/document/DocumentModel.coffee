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
    @activeDocumentLoading
    @addTag
    @removeTag
    return
  getActiveDocument: ->
    return @activeDocument
  get: (id, embed) =>
    return documentLoadTask =
      @DocumentService.get(id, embed)
      .success (data) =>
        @$log.debug "Received document data="
        @$log.debug data
        @refreshDocumentModel data.document.id, data.document
        return
      .error (error) =>
        @$log.debug "Error receiving document data"
        return
  addTag: (tagname) =>
    id = @activeDocument.id
    addTagTask = @DocumentService.addTag(id, tagname)
    addTagTask.success (data) =>
      @$log.debug("Successfully added tag! id=" + data.id)
      @activeDocument.tags.add {id:data.id, name: tagname}
      return
    return
  removeTag: (tag) =>
    id = @activeDocument.id
    addTagTask = @DocumentService.removeTag(id, tag.name)
    addTagTask.success (data) =>
      @$log.debug("Successfully removed tag!")
      @activeDocument.tags.remove tag
      return
    return
  updateSubscriptions: (subscriptionChangeObj) =>
    @$log.debug "Changing subscriptions of document with id=" +
      document.id + ", update="
    @$log.debug subscriptionChangeObj
    subscriptionChange = @DocumentService.updateSubscriptions(
      @activeDocument.id, subscriptionChangeObj)
    subscriptionChange.success =>
      @$log.debug "Subscription change success"
      @$rootScope.$emit "success", "Successfully updated subscriptions"
      return
    subscriptionChange.error =>
      @$log.debug "Subscription change error"
      @$rootScope.$emit "error", "Error updating subscriptions"
      return
    return
  refreshDocumentModel: (id, document) =>
    @$log.debug ">> Updating document model"
    @$rootScope.$emit(
      'ReceivedData:document', document.id, document
    )
    @activeDocument.id = document.id
    @activeDocument.title = document.title
    @activeDocument.owner = document.owner
    @activeDocument.attachmentCount = 0
    if angular.isDefined document.attachmentCount
      @activeDocument.attachmentCount = document.attachmentCount
    if angular.isDefined document.viewers
      @activeDocument.viewers = document.viewers
    @activeDocument.parent_document_id = document.parent_document_id
    if angular.isDefined document.tags
      @activeDocument.tags = document.tags
    if angular.isDefined document.content
      @$rootScope.$emit('ReceivedData:document.content',
        document.id, document.content)
    if angular.isDefined document.discussions
      @$rootScope.$emit('ReceivedData:document.discussions',
        document.id, document.discussions)
    if angular.isDefined document.comments
      @$rootScope.$emit('ReceivedData:document.comments',
        document.id, document.comments)
    return
  initActiveDocument: =>
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
      viewers: [
      ]
      checkHasSubscriptions: =>
        hasSubscriptions = false
        angular.forEach @subscriptions, (value, key) =>
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