###

  Code contributed to the Learning Layers project
  http://www.learning-layers.eu
  Development is partly funded by the FP7 Programme of the European
  Commission under Grant Agreement FP7-ICT-318209.
  Copyright (c) 2014, Karlsruhe University of Applied Sciences.
  For a list of contributors see the AUTHORS file at the top-level directory
  of this distribution.

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
user = angular.module( "LivingDocuments.user", [
  "LivingDocuments.core.baseclass",
  "LivingDocuments.user.infomodal",
  "LivingDocuments.user.infolistmodal",
  "LivingDocuments.user.profile"
] )

###
>> User Service
###
class UserService extends BaseService
  constructor: (SecurityService, $http, $log) ->
    super(SecurityService, $http)
    @$log = $log.getInstance("UserService")
  get: (id, embed) =>
    embedString = null
    if embed == null
      embedString = ""
    else
      embedString = embed
      getUserTask = @$http.get(
        @basePath + '/user/' + id + embedString,
        headers: {
          'Authorization': @SecurityService.currentUser.authorizationString
        }
      ).success (status) =>
        @$log.debug "Fetching user info from user with id=" + id +
          " and embeddingString=" + embed
        return
    return getUserTask
  getList: (ids, embed) =>
    if (angular.isDefined(ids) && ids.length > 0)
      listString = ids[0]
      if ids.length > 1
        angular.forEach(ids, (value, key) ->
          if key != 0
            listString = listString + ',' + value
          return
        )
      return @$http.get(
        @basePath + '/user' + '?ids=' + listString,
        headers: {
          'Authorization': @SecurityService.currentUser.authorizationString
        }
      ).success (status) =>
        @$log.debug("Received user list modal response")
        return
    else
      return{
        success: (callback) =>
          callback({users:[]})
          return
        error: (callback) =>
          return
        then: (callback) =>
          callback()
          return
      }
  getUserAvatar: (userId) =>
    getUserAvatarTask = @$http.get(
      @basePath + '/user/' + userId + '/profile/image',
      headers: {
        'Authorization': @SecurityService.currentUser.authorizationString
      }
    ).success (status) =>
      @$log.debug "Fetching user avatar"
      return
    return getUserAvatarTask

UserService.$inject = ['SecurityService','$http', '$log']
user.service "UserService", UserService