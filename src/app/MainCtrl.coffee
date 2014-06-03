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

angular.module( "LivingDocuments.maincontroller", [
] )

.directive('applyPie', ($timeout, $rootScope) ->
  return {
  restrict: 'A',
  link: (scope, elem, attr) ->
    if (window.PIE)
      if(angular.isUndefined($rootScope.pieEles))
        $rootScope.pieEles = []
      $rootScope.pieEles.push(elem)
    return
  }
)

.controller( 'MainCtrl', ($scope, $rootScope, $timeout, $location, ApplicationState,
                          uuid4, $modal, UserInfoModel, UserInfoListModel, $log) ->

  log = $log.getInstance("MainCtrl")
  $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) ->
    $log.debug('stateChangeSuccess with toState=' + toState.url)
    if ( angular.isDefined( toState.data.pageTitle ) )
      $scope.pageTitle = toState.data.pageTitle + ' | LivingDocuments'
    return
  )

  $scope.slide = ''

  $rootScope.$on('$stateChangeStart', ->
    $scope.slide = $scope.slide || 'slide-left'
    return
  )

  $scope.ApplicationState = ApplicationState
  $scope.pageTitle = ' LivingDocuments'

  $scope.successMessages = []
  $scope.infoMessages = []
  $scope.warningMessages = []
  $scope.errorMessages = []

  $scope.consolelog = (msg) ->
    $log.debug(JSON.stringify(msg))
    return

  ###ImageMessage = Class.create(ClassManager.getRegisteredClass('AbstractClass'), {
    image: {
      src: ''
    }
    initialize: (description) ->
      this.description = description
      this.uuid = uuid4.generate()
      return
    getDescription: ->
      return this.description
    setImage: (newImgSrc) ->
      this.image.src = newImgSrc
      return
    getImage: ->
      return this.image
    toString: ->
      return 'description:' + this.description + ', uuid:' + this.uuid
  })
  $scope.ImageMessage = ImageMessage
  ClassManager.registerClass('ImageMessage', ImageMessage)

  ProgressImageMessage = Class.create(ImageMessage, {
    progress: {
      status: 'In Progress...'
      percentage: 0
    }
    isFinishedListeners: [],
    initialize: (description) ->
      this.description = description
      this.uuid = uuid4.generate()
      return
    getDescription: ->
      return this.description
    setProgressPercentage: (newPercentage) ->
      this.progress.percentage = newPercentage
      return
    fireIsFinished: ->
      this.progress.status = 'Finished'
      angular.forEach(this.isFinishedListeners, (value, key) ->
        value.fireIsFinished()
      )
      return
    registerIsFinishedListener: (isFinishedListener) ->
      this.isFinishedListeners.add(isFinishedListener)
      return
    removeIsFinsihedListener: (isFinishedListener) ->
      this.isFinishedListeners.remove(isFinishedListener)
      return
    toString: ->
      return 'descritption:' + this.description + ', uuid:' + this.uuid
  })
  $scope.ProgressImageMessage = ProgressImageMessage
  ClassManager.registerClass('ProgressImageMessage', ProgressImageMessage)###

  publishMessage = (messageArray, reason) ->
    message = {}
    ###if (reason instanceof ProgressImageMessage)
      progressImageMessage = reason
      message.uuid = progressImageMessage.uuid
      message.progress = progressImageMessage.progress
      message.reason = progressImageMessage.getDescription()
      message.type = 'ProgressImageMessage'
      messageArray.add(message, 0)
      isFinishedListener = fireIsFinished: ->
        progressImageMessage.removeIsFinsihedListener(isFinishedListener)
        messageArray.remove(message)
        return
        progressImageMessage.registerIsFinishedListener(isFinishedListener)
    else if (typeof reason == 'string' || reason instanceof String)
      message = {reason: reason}
      staysForMilliseconds = 4000
      messageArray.add(message, 0)
      $timeout(
        ->
          messageArray.remove(message)
          return
        ,
        staysForMilliseconds
      )###
    return

  $rootScope.$on('success', (ev, reason) ->
    publishMessage($scope.successMessages, reason)
    return
  )

  $rootScope.$on('info', (ev, reason) ->
    publishMessage($scope.infoMessages, reason)
    return
  )

  $rootScope.$on('warning', (ev, reason) ->
    publishMessage($scope.warningMessages, reason)
    return
  )

  $rootScope.$on('error', (ev, reason) ->
    publishMessage($scope.errorMessages, reason)
    return
  )

  $rootScope.$on('openUserProfile', (ev, userId) ->
    log.debug("openUserProfile triggered with userId=" + userId)
    $modal.open(
      {
        templateUrl: 'user/infomodal/infomodal.tpl.html',
        controller: UserInfoModalCtrl,
        resolve: {
          userId: ->
            return userId
          UserInfoModel: ->
            return UserInfoModel
        }
      }
    )
    return
  )

  $rootScope.$on('openUserList', (ev, modalTitle, userIds) ->
    log.debug("openUserList triggered with userIds=" + userIds)
    $modal.open(
      {
        templateUrl: 'user/infolistmodal/infolistmodal.tpl.html',
        controller: UserInfoListModalCtrl,
        resolve: {
          modalTitle: ->
            return modalTitle
        }
        userIds: ->
          return userIds
        UserInfoListModel: ->
          return UserInfoListModel
      }
    )
    return
  )

  if (angular.isDefined($rootScope.pieEles))
    angular.forEach($rootScope.pieEles, (value, key) ->
      window.PIE.attach(value)
      return
    )

  fireResize = ->
    console.log("Fire resize triggered.")
    $rootScope.$emit(
      "window:resize",
      $(window).width(),
      $(window).height()
    )
    $rootScope.$apply(->
      $rootScope.windowInnerWidth = $(window).width()
      $rootScope.windowInnerHeight = $(window).height()
      return
    )
    return

  #calling resize broadcast on resize event
  angular.element(window).resize(fireResize)

  return
)