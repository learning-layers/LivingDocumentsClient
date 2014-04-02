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
userInfomodal = angular.module( "LivingDocuments.user.infomodal", [
  "LivingDocuments.core.baseclass"
  "LivingDocuments.user"
] )

###
>> UserInfoModal Controller
###
class UserInfoModalCtrl extends BaseController
  constructor: ($scope, @userId, @UserInfoModel, @$modalInstance) ->
    super($scope)
    #Trigger user information retrieval in model
    @UserInfoModel.get @userId, ""
    @UserInfoModel.getUserAvatar @userId
    return
  defineScope: ->
    that = @
    #Get reference to the currently active userInfo instance
    # that will then be replaced filled with the user data that
    # belongs to the user id we provided earlier
    # (when we triggered the user retrieval).
    @$scope.userInfo = @UserInfoModel.getActiveUserInfo()
    @$scope.profile = @UserInfoModel.getActiveProfile()
    @$scope.cancel = ->
      that.$modalInstance.dismiss('cancel')
    @$scope.close = ->
      that.$modalInstance.dismiss('close')
    return

UserInfoModalCtrl.$inject =
  ['$scope', 'userId', 'UserInfoModel', '$modalInstance']
userInfomodal.controller( 'UserInfoModalCtrl', UserInfoModalCtrl)

###
>> UserInfoModal Model
###
class UserInfoModel extends BaseEventDispatcher
  constructor: ($log, @UserService) ->
    @$log = $log.getInstance("UserInfoModel")
    #@resetActiveUserInfo is used to set the activeUserInfo instance to
    # the initial state.
    @activeUserInfo = @resetActiveUserInfo()
    @profile = {
      imgSrc: ''
    }
    return
  getActiveUserInfo: ->
    return @activeUserInfo
  getActiveProfile: ->
    return @profile
  get: (id, embed) ->
    that = @
    #Load user from backend -> could be later on also loaded
    # from cache first, and then be updated by backend calls
    userInfoLoadTask = @UserService.get id, embed
    userInfoLoadTask.success (data) ->
      user = data.user
      #If retrieval of user data succeeded update the user info model
      that.updateUserInfoModel user.id, user
      return
    userInfoLoadTask.error (error) ->
      that.$log.error "Error receiving user info data"
      return
    return
  updateUserInfoModel: (id, user) ->
    @$log.debug ">> Updating user info model"
    @$log.debug "Retrieved user info"
    @$log.debug user
    @activeUserInfo.id = id
    @activeUserInfo.displayname = user.displayname
    @activeUserInfo.firstname = user.firstname
    @activeUserInfo.lastname = user.lastname
    return
  resetActiveUserInfo: ->
    return { #This is the initial state of the activeUserInfo instance
      id: null
      firstname: null
      lastname: null
    }
  getUserAvatar: (userId) ->
    that = @
    loadUserAvatarTask = @UserService.getUserAvatar userId
    loadUserAvatarTask.success (success) ->
      that.profile.imgSrc = 'data:' + success.type +
        ';base64,' + success.content
      return
    loadUserAvatarTask.error (error) ->
      that.$log.error "Error receiving user avatar data"
      return
    return
userInfomodal.factory "UserInfoModel",
  ['$log', 'UserService',
    ($log, UserService) ->
      return new UserInfoModel($log, UserService)
  ]