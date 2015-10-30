var isFunction = function(o) {
    return typeof o == 'function';
};


var bind,
    slice = [].slice,
    proto = Function.prototype,
    featureMap;

featureMap = {
    'function-bind': 'bind'
};

function has(feature) {
    var prop = featureMap[feature];
    return isFunction(proto[prop]);
}

// check for missing features
if (!has('function-bind')) {
    // adapted from Mozilla Developer Network example at
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    bind = function bind(obj) {
        var args = slice.call(arguments, 1),
            self = this,
            nop = function() {
            },
            bound = function() {
                return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
            };
        nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
        bound.prototype = new nop();
        return bound;
    };
    proto.bind = bind;
}

var Immutable = require('immutable');

/**
 * ES5 polyfills for PhantomJS
 */
require('core-js/es5');
global.Intl = require("intl");
require("intl/locale-data/jsonp/en.js");

/**
 * Create a set of webpack module ids for our project's modules, excluding
 * tests. This will be used to clear the module cache before each test.
 */
var projectContext = require.context('../app', true, /^((?!spec).)*.jsx?$/);
var projectModuleIds = Immutable.Set(
    projectContext.keys().map(module => (
        String(projectContext.resolve(module))
    ))
);

let originalTimeout;
beforeEach(() => {
    /**
     * Clear the module cache before each test. Many of our modules, such as
     * Stores and Actions, are singletons that have state that we don't want to
     * carry over between tests. Clearing the cache makes `require(module)`
     * return a new instance of the singletons. Modules are still cached within
     * each test case.
     */
    var cache = require.cache;
    projectModuleIds.forEach(id => delete cache[id]);

    /**
     * Automatically mock the built in setTimeout and setInterval functions.
     */
    jasmine.clock().install();
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
});

afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    jasmine.clock().uninstall();
});

var context = require.context('../app', true, /.+\.spec\.jsx?$/);
context.keys().forEach(context);
module.exports = context;