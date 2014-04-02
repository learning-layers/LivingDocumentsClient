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
angular.module( "LivingDocuments.maincontroller", [
] )
.controller( 'MainCtrl', function ($scope, $rootScope, $timeout, $location, ApplicationState, ClassManager, uuid4, $modal, UserInfoModel, UserInfoListModel, $log) {
    var log = $log.getInstance("MainCtrl");
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        console.log('stateChangeSuccess with toState=' + toState.url);
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | LivingDocuments' ;
        }
    });

    $scope.slide = '';

    $rootScope.$on('$stateChangeStart', function(){
        $scope.slide = $scope.slide || 'slide-left';
    });

    $scope.ApplicationState = ApplicationState;
    $scope.pageTitle = ' LivingDocuments';

    $scope.successMessages = [];
    $scope.infoMessages = [];
    $scope.warningMessages = [];
    $scope.errorMessages = [];

    $scope.consolelog = function(msg) {
        console.log(JSON.stringify(msg));
    };

    var ImageMessage = Class.create(ClassManager.getRegisteredClass('AbstractClass'), {
        image: {
            src: ''
        },
        initialize: function(description) {
            this.description = description;
            this.uuid = uuid4.generate();
        },
        getDescription: function() {
            return this.description;
        },
        setImage: function(newImgSrc) {
            this.image.src = newImgSrc;
        },
        getImage: function() {
            return this.image;
        },
        toString: function() {
            return 'description:' + this.description + ', uuid:' + this.uuid;
        }
    });
    $scope.ImageMessage = ImageMessage;
    ClassManager.registerClass('ImageMessage', ImageMessage);

    var ProgressImageMessage = Class.create(ImageMessage, {
        progress: {
            status: 'In Progress...',
            percentage: 0
        },
        isFinishedListeners: [],
        initialize: function(description) {
            this.description = description;
            this.uuid = uuid4.generate();
        },
        getDescription: function() {
            return this.description;
        },
        setProgressPercentage: function(newPercentage) {
            this.progress.percentage = newPercentage;
        },
        fireIsFinished: function() {
            this.progress.status = 'Finished';
            angular.forEach(this.isFinishedListeners, function(value, key) {
                value.fireIsFinished();
            });
        },
        registerIsFinishedListener: function(isFinishedListener) {
            this.isFinishedListeners.add(isFinishedListener);
        },
        removeIsFinsihedListener: function(isFinishedListener) {
            this.isFinishedListeners.remove(isFinishedListener);
        },
        toString: function() {
            return 'descritption:' + this.description + ', uuid:' + this.uuid;
        }
    });
    $scope.ProgressImageMessage = ProgressImageMessage;
    ClassManager.registerClass('ProgressImageMessage', ProgressImageMessage);

    var publishMessage = function(messageArray, reason) {
        var message = {};
        if (reason instanceof ProgressImageMessage) {
            var progressImageMessage = reason;
            message.uuid = progressImageMessage.uuid;
            message.progress = progressImageMessage.progress;
            message.reason = progressImageMessage.getDescription();
            message.type = 'ProgressImageMessage';
            messageArray.add(message, 0);
            var isFinishedListener = {
                fireIsFinished: function() {
                    progressImageMessage.removeIsFinsihedListener(isFinishedListener);
                    messageArray.remove(message);
                }
            };
            progressImageMessage.registerIsFinishedListener(isFinishedListener);
        } else if (typeof reason == 'string' || reason instanceof String) {
            message = {reason: reason};
            var staysForMilliseconds = 4000;
            messageArray.add(message, 0);
            $timeout(function() {
                messageArray.remove(message);
            }, staysForMilliseconds);
        }
    };

    $rootScope.$on('success', function(ev, reason) {
        publishMessage($scope.successMessages, reason);
    });

    $rootScope.$on('info', function(ev, reason) {
        publishMessage($scope.infoMessages, reason);
    });

    $rootScope.$on('warning', function(ev, reason) {
        publishMessage($scope.warningMessages, reason);
    });

    $rootScope.$on('error', function(ev, reason) {
        publishMessage($scope.errorMessages, reason);
    });

    $rootScope.$on('openUserProfile', function(ev, userId) {
        log.debug("openUserProfile triggered with userId=" + userId);
        $modal.open(
            {
                templateUrl: 'user/infomodal/infomodal.tpl.html',
                controller: UserInfoModalCtrl,
                resolve: {
                    userId: function() {
                        return userId;
                    },
                    UserInfoModel: function() {
                        return UserInfoModel;
                    }
                }
            }
        );
    });
    $rootScope.$on('openUserList', function(ev, modalTitle, userIds) {
        log.debug("openUserList triggered with userIds=" + userIds);
        $modal.open(
            {
                templateUrl: 'user/infolistmodal/infolistmodal.tpl.html',
                controller: UserInfoListModalCtrl,
                resolve: {
                    modalTitle: function() {
                        return modalTitle;
                    },
                    userIds: function() {
                        return userIds;
                    },
                    UserInfoListModel: function() {
                        return UserInfoListModel;
                    }
                }
            }
        );
    });
})

;