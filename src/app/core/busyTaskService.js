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
angular.module( "LivingDocuments.core.busytask", [
    "LivingDocuments.core.classmanager"
])
.service('BusyTaskService', function($rootScope, ClassManager, uuid4) {
    var busyTasks = [];
    var BusyTask = Class.create(ClassManager.getRegisteredClass('AbstractClass'), {
        initialize: function(description) {
            this.description = description;
            this.uuid = uuid4.generate();
        },
        getDescription: function() {
            return this.description;
        },
        toString: function() {
            return 'descritption:' + this.description + ', uuid:' + this.uuid;
        }
    });
    ClassManager.registerClass('BusyTask', BusyTask);

    $rootScope.$on('AddBusyTask', function(ev, busyTask) {
        if (busyTask instanceof BusyTask) {
            busyTasks.add(busyTask);
        }
    });
    $rootScope.$on('RemoveBusyTask', function(ev, busyTask) {
        if (busyTask instanceof BusyTask) {
            busyTasks.remove(busyTask);
        }
    });

    return {
        busyTasks: busyTasks
    };
})

;