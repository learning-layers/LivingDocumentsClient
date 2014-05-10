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
userInfolistmodal = angular.module( "LivingDocuments.user.infolistmodal", [
  "LivingDocuments.core.baseclass"
  "LivingDocuments.user"
] )

###
>> UserInfoModal Controller
###
class UserInfoListModalCtrl extends BaseController
  constructor: ($scope, @modalTitle, @userIds,
    @UserInfoListModel, @$modalInstance) ->
    super($scope)
    #Trigger user information retrieval in model
    $scope.loadingUsers = true
    userInfoLoadTask = @UserInfoListModel.get(@userIds, "")
    userInfoLoadTask.then(=>
      $scope.loadingUsers = false
      return
    )
    return
  defineScope: =>
    #Get reference to the currently active userInfo instance
    # that will then be replaced filled with the user data that
    # belongs to the user id we provided earlier
    # (when we triggered the user retrieval).
    @$scope.userInfoList = @UserInfoListModel.getActiveUserInfoList()
    @$scope.modalTitle = @modalTitle
    @$scope.dismiss = @dismiss
    @$scope.cancel = @cancel
    return
  dismiss: =>
    @UserInfoListModel.resetActiveUserInfo()
    @$modalInstance.dismiss('openProfile')
    return
  cancel: =>
    @UserInfoListModel.resetActiveUserInfo()
    @$modalInstance.dismiss('cancel')
UserInfoListModalCtrl.$inject =
  ['$scope', 'modalTitle', 'userIds', 'UserInfoListModel', '$modalInstance']
userInfolistmodal.controller( 'UserInfoListModalCtrl', UserInfoListModalCtrl)

###
>> UserInfoModal Model
###
class UserInfoListModel extends BaseEventDispatcher
  constructor: ($log, @UserService) ->
    @$log = $log.getInstance("UserInfoListModel")
    #@resetActiveUserInfo is used to set the activeUserInfo instance to
    # the initial state.
    @activeUserInfoList = []
    return
  getActiveUserInfoList: =>
    return @activeUserInfoList
  get: (ids, embed) =>
    #Load user from backend -> could be later on also loaded
    # from cache first, and then be updated by backend calls
    userInfoLoadTask = @UserService.getList ids, embed
    userInfoLoadTask.success (data) =>
      @updateUserInfoModel data.users
      return
    userInfoLoadTask.error (error) =>
      @$log.error "Error receiving user info data"
      return
    return userInfoLoadTask
  updateUserInfoModel: (users) =>
    @$log.debug ">> Updating user info list model"
    @$log.debug "Retrieved user info list"
    @activeUserInfoList.add users
    return
  resetActiveUserInfo: =>
    @activeUserInfoList.removeAt(0, @activeUserInfoList.length)
    return

userInfolistmodal.factory "UserInfoListModel",
  ['$log', 'UserService',
    ($log, UserService) ->
      return new UserInfoListModel($log, UserService)
  ]