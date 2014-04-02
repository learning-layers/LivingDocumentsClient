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
  get: (id, embed) ->
    that = @
    embedString = null
    if embed == null
      embedString = ""
    else
      embedString = embed
    return @$http.get(@basePath + '/user/' + id + embedString,
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString})
    .success (status) ->
      that.$log.debug "Fetching user info from user with id=" + id +
      " and embeddingString=" + embed
      return
  getList: (ids, embed) ->
    that = @
    embedString = null
    if embed == null
      embedString = ""
    else
      embedString = embed
    if (angular.isDefined(ids) && ids.length > 0)
      listString = "{"
      listString.add(ids.shift())
      angular.forEach(ids, (value, key) ->
        listString.add(',value')
      )
      listString.add("}")
      return @$http.get(@basePath + '/user/' + id + embedString,
        headers: {'Authorization':
          that.SecurityService.currentUser.authorizationString})
        .success (status) ->
          that.$log.debug("Received user list modal response")
          return
    else
      return{
        success: (callback) ->
          callback({users:[]})
          return
        error: (callback) ->
          return
      }
    return
  getUserAvatar: (userId) ->
    return @$http.get(@basePath + '/user/' + userId + '/profile/image',
      headers: {'Authorization':
        that.SecurityService.currentUser.authorizationString})
      .success (status) ->
        that.$log.debug "Fetching user avatar"
        return

UserService.$inject = ['SecurityService','$http', '$log']
user.service "UserService", UserService