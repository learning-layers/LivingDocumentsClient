/**
 * Code contributed to the Learning Layers project
 * http://www.learning-layers.eu
 * Development is partly funded by the FP7 Programme of the European
 * Commission under Grant Agreement FP7-ICT-318209.
 * Copyright (c) 2014, Karlsruhe University of Applied Sciences.
 * For a list of contributors see the AUTHORS file at the top-level directory
 * of this distribution.
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
angular.module( 'LivingDocuments.core.classmanager', [
])

.provider('ClassManager', function() {
    var ClassManager = Class.create({
        AbstractClass: Class.create({
            initialize: function() {
            },
            getMethods: function() {
                var methods = [];
                angular.forEach(this, function(value, key) {
                    methods.add(value, key);
                });
                return methods;
            },
            getPrivateMethods: function() {
                var methods = [];
                if (angular.isDefined(this.private)) {
                    angular.forEach(this.private, function(value, key) {
                        methods.add(value, key);
                    });
                }
                return methods;
            },
            getAllDeclaredMethods: function() {
                return this.getMethods().concat(this.getPrivateMethods());  
            }
        }),
        classes: new StringMap(),
        initialize: function() {
            this.classes.set('AbstractClass', this.AbstractClass);
        },
        getRegisteredClass: function(name) {
            return this.classes.get(name);
        },
        registerClass: function(name, Klass) {
            this.classes.set(name, Klass);
        },
        getArgumentsAssoc: function(args) {
            var argsCallee = String(args['callee']);
            var argsNames = argsCallee.substring(argsCallee.indexOf("(")+1, argsCallee.indexOf(")"));
            var argsNamesArray = argsNames.split(",");
            var argsFields = {};
            var i = 0;
            angular.forEach(argsNamesArray, function(value, key) {
                argsFields[value.trim()] = args[i++];
            });
            return argsFields;
        }
    });
    
    this.$get = function() {
        return new ClassManager();
    };
})

;