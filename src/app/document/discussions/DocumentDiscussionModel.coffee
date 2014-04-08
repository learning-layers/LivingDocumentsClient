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
documentDiscussionModel = angular.module(
  "LivingDocuments.document.discussions.model",
  [
    "LivingDocuments.core.baseclass"
    "LivingDocuments.document.discussion.service"
  ]
)

class DocumentDiscussionModel extends BaseEventDispatcher
  constructor: ($log, @DocumentDiscussionService, @$rootScope) ->
    @$log = $log.getInstance("DocumentDiscussionModel")
    @activeDocumentId = -1
    @activeDiscussions = {
      discussions: []
    }
    @defineListeners()
    return
  defineListeners: ->
    that = @
    @$rootScope.$on('ReceivedData:document',
      (ev, id, document) ->
        that.activeDocumentId = id
        that.activeDiscussions.discussions = []
        @that.$log.debug("Resetted discussions")
        return
    )
    @$rootScope.$on('ReceivedData:document.discussions',
      (ev, id, discussions) ->
        if(
          angular.isDefined(discussions) &&
          discussions != null &&
          discussions.length > 0
        )
          discussions[0].isOpen = true
          that.refreshDocumentDiscussions(id, discussions)
        return
    )
    return
  getActiveDiscussions: ->
    return @activeDiscussions
  refreshDocumentDiscussions: (id, discussions) ->
    @activeDiscussions.discussions = discussions
    return
  createDiscussion: (parentId, title, selection) ->
    return @DocumentDiscussionService.createDiscussion(
      parentId, title, selection
    )
  getUserAvatar: (userId, srcToUpdate) ->
    basePath =
      that.SecurityService.getInitialConfiguration().restServerAddress
    userPath = '/user/' + userId + '/profile/image'
    that.$http(
      {
        method: 'GET',
        url: basePath + userPath,
        headers: {
          'Authorization':
            that.SecurityService.currentUser.authorizationString
        }
      }
    )
    .success (success, status) ->
      srcToUpdate.img = 'data:' + success.type + ';base64,' + success.content
      return
    return

documentDiscussionModel.factory "DocumentDiscussionModel",
  ['$log', 'DocumentDiscussionService', '$rootScope',
    ($log, DocumentDicussionService, $rootScope) ->
      return new DocumentDiscussionModel($log,
        DocumentDicussionService, $rootScope)
  ]