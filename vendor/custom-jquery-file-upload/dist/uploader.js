/*!
 * jQuery UI Widget 1.10.4+amd
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */

(function (factory) {
  if (typeof define === "function" && define.amd) {
    // Register as an anonymous AMD module:
    define(["jquery"], factory);
  } else {
    // Browser globals:
    factory(jQuery);
  }
}(function ($, undefined) {

  var uuid = 0,
    slice = Array.prototype.slice,
    _cleanData = $.cleanData;
  $.cleanData = function (elems) {
    for (var i = 0, elem; (elem = elems[i]) != null; i++) {
      try {
        $(elem).triggerHandler("remove");
        // http://bugs.jquery.com/ticket/8235
      } catch (e) {
      }
    }
    _cleanData(elems);
  };

  $.widget = function (name, base, prototype) {
    var fullName, existingConstructor, constructor, basePrototype,
    // proxiedPrototype allows the provided prototype to remain unmodified
    // so that it can be used as a mixin for multiple widgets (#8876)
      proxiedPrototype = {},
      namespace = name.split(".")[ 0 ];

    name = name.split(".")[ 1 ];
    fullName = namespace + "-" + name;

    if (!prototype) {
      prototype = base;
      base = $.Widget;
    }

    // create selector for plugin
    $.expr[ ":" ][ fullName.toLowerCase() ] = function (elem) {
      return !!$.data(elem, fullName);
    };

    $[ namespace ] = $[ namespace ] || {};
    existingConstructor = $[ namespace ][ name ];
    constructor = $[ namespace ][ name ] = function (options, element) {
      // allow instantiation without "new" keyword
      if (!this._createWidget) {
        return new constructor(options, element);
      }

      // allow instantiation without initializing for simple inheritance
      // must use "new" keyword (the code above always passes args)
      if (arguments.length) {
        this._createWidget(options, element);
      }
    };
    // extend with the existing constructor to carry over any static properties
    $.extend(constructor, existingConstructor, {
      version: prototype.version,
      // copy the object used to create the prototype in case we need to
      // redefine the widget later
      _proto: $.extend({}, prototype),
      // track widgets that inherit from this widget in case this widget is
      // redefined after a widget inherits from it
      _childConstructors: []
    });

    basePrototype = new base();
    // we need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = $.widget.extend({}, basePrototype.options);
    $.each(prototype, function (prop, value) {
      if (!$.isFunction(value)) {
        proxiedPrototype[ prop ] = value;
        return;
      }
      proxiedPrototype[ prop ] = (function () {
        var _super = function () {
            return base.prototype[ prop ].apply(this, arguments);
          },
          _superApply = function (args) {
            return base.prototype[ prop ].apply(this, args);
          };
        return function () {
          var __super = this._super,
            __superApply = this._superApply,
            returnValue;

          this._super = _super;
          this._superApply = _superApply;

          returnValue = value.apply(this, arguments);

          this._super = __super;
          this._superApply = __superApply;

          return returnValue;
        };
      })();
    });
    constructor.prototype = $.widget.extend(basePrototype, {
      // TODO: remove support for widgetEventPrefix
      // always use the name + a colon as the prefix, e.g., draggable:start
      // don't prefix for widgets that aren't DOM-based
      widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
    }, proxiedPrototype, {
      constructor: constructor,
      namespace: namespace,
      widgetName: name,
      widgetFullName: fullName
    });

    // If this widget is being redefined then we need to find all widgets that
    // are inheriting from it and redefine all of them so that they inherit from
    // the new version of this widget. We're essentially trying to replace one
    // level in the prototype chain.
    if (existingConstructor) {
      $.each(existingConstructor._childConstructors, function (i, child) {
        var childPrototype = child.prototype;

        // redefine the child widget using the same prototype that was
        // originally used, but inherit from the new version of the base
        $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
      });
      // remove the list of existing child constructors from the old constructor
      // so the old child constructors can be garbage collected
      delete existingConstructor._childConstructors;
    } else {
      base._childConstructors.push(constructor);
    }

    $.widget.bridge(name, constructor);
  };

  $.widget.extend = function (target) {
    var input = slice.call(arguments, 1),
      inputIndex = 0,
      inputLength = input.length,
      key,
      value;
    for (; inputIndex < inputLength; inputIndex++) {
      for (key in input[ inputIndex ]) {
        value = input[ inputIndex ][ key ];
        if (input[ inputIndex ].hasOwnProperty(key) && value !== undefined) {
          // Clone objects
          if ($.isPlainObject(value)) {
            target[ key ] = $.isPlainObject(target[ key ]) ?
              $.widget.extend({}, target[ key ], value) :
              // Don't extend strings, arrays, etc. with objects
              $.widget.extend({}, value);
            // Copy everything else by reference
          } else {
            target[ key ] = value;
          }
        }
      }
    }
    return target;
  };

  $.widget.bridge = function (name, object) {
    var fullName = object.prototype.widgetFullName || name;
    $.fn[ name ] = function (options) {
      var isMethodCall = typeof options === "string",
        args = slice.call(arguments, 1),
        returnValue = this;

      // allow multiple hashes to be passed on init
      options = !isMethodCall && args.length ?
        $.widget.extend.apply(null, [ options ].concat(args)) :
        options;

      if (isMethodCall) {
        this.each(function () {
          var methodValue,
            instance = $.data(this, fullName);
          if (!instance) {
            return $.error("cannot call methods on " + name + " prior to initialization; " +
              "attempted to call method '" + options + "'");
          }
          if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
            return $.error("no such method '" + options + "' for " + name + " widget instance");
          }
          methodValue = instance[ options ].apply(instance, args);
          if (methodValue !== instance && methodValue !== undefined) {
            returnValue = methodValue && methodValue.jquery ?
              returnValue.pushStack(methodValue.get()) :
              methodValue;
            return false;
          }
        });
      } else {
        this.each(function () {
          var instance = $.data(this, fullName);
          if (instance) {
            instance.option(options || {})._init();
          } else {
            $.data(this, fullName, new object(options, this));
          }
        });
      }

      return returnValue;
    };
  };

  $.Widget = function (/* options, element */) {
  };
  $.Widget._childConstructors = [];

  $.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
      disabled: false,

      // callbacks
      create: null
    },
    _createWidget: function (options, element) {
      element = $(element || this.defaultElement || this)[ 0 ];
      this.element = $(element);
      this.uuid = uuid++;
      this.eventNamespace = "." + this.widgetName + this.uuid;
      this.options = $.widget.extend({},
        this.options,
        this._getCreateOptions(),
        options);

      this.bindings = $();
      this.hoverable = $();
      this.focusable = $();

      if (element !== this) {
        $.data(element, this.widgetFullName, this);
        this._on(true, this.element, {
          remove: function (event) {
            if (event.target === element) {
              this.destroy();
            }
          }
        });
        this.document = $(element.style ?
          // element within the document
          element.ownerDocument :
          // element is window or document
          element.document || element);
        this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
      }

      this._create();
      this._trigger("create", null, this._getCreateEventData());
      this._init();
    },
    _getCreateOptions: $.noop,
    _getCreateEventData: $.noop,
    _create: $.noop,
    _init: $.noop,

    destroy: function () {
      this._destroy();
      // we can probably remove the unbind calls in 2.0
      // all event bindings should go through this._on()
      this.element
        .unbind(this.eventNamespace)
        // 1.9 BC for #7810
        // TODO remove dual storage
        .removeData(this.widgetName)
        .removeData(this.widgetFullName)
        // support: jquery <1.6.3
        // http://bugs.jquery.com/ticket/9413
        .removeData($.camelCase(this.widgetFullName));
      this.widget()
        .unbind(this.eventNamespace)
        .removeAttr("aria-disabled")
        .removeClass(
          this.widgetFullName + "-disabled " +
            "ui-state-disabled");

      // clean up events and states
      this.bindings.unbind(this.eventNamespace);
      this.hoverable.removeClass("ui-state-hover");
      this.focusable.removeClass("ui-state-focus");
    },
    _destroy: $.noop,

    widget: function () {
      return this.element;
    },

    option: function (key, value) {
      var options = key,
        parts,
        curOption,
        i;

      if (arguments.length === 0) {
        // don't return a reference to the internal hash
        return $.widget.extend({}, this.options);
      }

      if (typeof key === "string") {
        // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        options = {};
        parts = key.split(".");
        key = parts.shift();
        if (parts.length) {
          curOption = options[ key ] = $.widget.extend({}, this.options[ key ]);
          for (i = 0; i < parts.length - 1; i++) {
            curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
            curOption = curOption[ parts[ i ] ];
          }
          key = parts.pop();
          if (arguments.length === 1) {
            return curOption[ key ] === undefined ? null : curOption[ key ];
          }
          curOption[ key ] = value;
        } else {
          if (arguments.length === 1) {
            return this.options[ key ] === undefined ? null : this.options[ key ];
          }
          options[ key ] = value;
        }
      }

      this._setOptions(options);

      return this;
    },
    _setOptions: function (options) {
      var key;

      for (key in options) {
        this._setOption(key, options[ key ]);
      }

      return this;
    },
    _setOption: function (key, value) {
      this.options[ key ] = value;

      if (key === "disabled") {
        this.widget()
          .toggleClass(this.widgetFullName + "-disabled ui-state-disabled", !!value)
          .attr("aria-disabled", value);
        this.hoverable.removeClass("ui-state-hover");
        this.focusable.removeClass("ui-state-focus");
      }

      return this;
    },

    enable: function () {
      return this._setOption("disabled", false);
    },
    disable: function () {
      return this._setOption("disabled", true);
    },

    _on: function (suppressDisabledCheck, element, handlers) {
      var delegateElement,
        instance = this;

      // no suppressDisabledCheck flag, shuffle arguments
      if (typeof suppressDisabledCheck !== "boolean") {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      }

      // no element argument, shuffle and use this.element
      if (!handlers) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        // accept selectors, DOM elements
        element = delegateElement = $(element);
        this.bindings = this.bindings.add(element);
      }

      $.each(handlers, function (event, handler) {
        function handlerProxy() {
          // allow widgets to customize the disabled handling
          // - disabled as an array instead of boolean
          // - disabled class as method for disabling individual parts
          if (!suppressDisabledCheck &&
            ( instance.options.disabled === true ||
              $(this).hasClass("ui-state-disabled") )) {
            return;
          }
          return ( typeof handler === "string" ? instance[ handler ] : handler )
            .apply(instance, arguments);
        }

        // copy the guid so direct unbinding works
        if (typeof handler !== "string") {
          handlerProxy.guid = handler.guid =
            handler.guid || handlerProxy.guid || $.guid++;
        }

        var match = event.match(/^(\w+)\s*(.*)$/),
          eventName = match[1] + instance.eventNamespace,
          selector = match[2];
        if (selector) {
          delegateElement.delegate(selector, eventName, handlerProxy);
        } else {
          element.bind(eventName, handlerProxy);
        }
      });
    },

    _off: function (element, eventName) {
      eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
      element.unbind(eventName).undelegate(eventName);
    },

    _delay: function (handler, delay) {
      function handlerProxy() {
        return ( typeof handler === "string" ? instance[ handler ] : handler )
          .apply(instance, arguments);
      }

      var instance = this;
      return setTimeout(handlerProxy, delay || 0);
    },

    _hoverable: function (element) {
      this.hoverable = this.hoverable.add(element);
      this._on(element, {
        mouseenter: function (event) {
          $(event.currentTarget).addClass("ui-state-hover");
        },
        mouseleave: function (event) {
          $(event.currentTarget).removeClass("ui-state-hover");
        }
      });
    },

    _focusable: function (element) {
      this.focusable = this.focusable.add(element);
      this._on(element, {
        focusin: function (event) {
          $(event.currentTarget).addClass("ui-state-focus");
        },
        focusout: function (event) {
          $(event.currentTarget).removeClass("ui-state-focus");
        }
      });
    },

    _trigger: function (type, event, data) {
      var prop, orig,
        callback = this.options[ type ];

      data = data || {};
      event = $.Event(event);
      event.type = ( type === this.widgetEventPrefix ?
        type :
        this.widgetEventPrefix + type ).toLowerCase();
      // the original event may come from any element
      // so we need to reset the target on the new event
      event.target = this.element[ 0 ];

      // copy original event properties over to the new event
      orig = event.originalEvent;
      if (orig) {
        for (prop in orig) {
          if (!( prop in event )) {
            event[ prop ] = orig[ prop ];
          }
        }
      }

      this.element.trigger(event, data);
      return !( $.isFunction(callback) &&
        callback.apply(this.element[0], [ event ].concat(data)) === false ||
        event.isDefaultPrevented() );
    }
  };

  $.each({ show: "fadeIn", hide: "fadeOut" }, function (method, defaultEffect) {
    $.Widget.prototype[ "_" + method ] = function (element, options, callback) {
      if (typeof options === "string") {
        options = { effect: options };
      }
      var hasOptions,
        effectName = !options ?
          method :
          options === true || typeof options === "number" ?
            defaultEffect :
            options.effect || defaultEffect;
      options = options || {};
      if (typeof options === "number") {
        options = { duration: options };
      }
      hasOptions = !$.isEmptyObject(options);
      options.complete = callback;
      if (options.delay) {
        element.delay(options.delay);
      }
      if (hasOptions && $.effects && $.effects.effect[ effectName ]) {
        element[ method ](options);
      } else if (effectName !== method && element[ effectName ]) {
        element[ effectName ](options.duration, options.easing, callback);
      } else {
        element.queue(function (next) {
          $(this)[ method ]();
          if (callback) {
            callback.call(element[ 0 ]);
          }
          next();
        });
      }
    };
  });

}));

/*
 * jQuery Iframe Transport Plugin 1.8.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global define, window, document */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define(['jquery'], factory);
  } else {
    // Browser globals:
    factory(window.jQuery);
  }
}(function ($) {
  'use strict';

  // Helper variable to create unique names for the transport iframes:
  var counter = 0;

  // The iframe transport accepts four additional options:
  // options.fileInput: a jQuery collection of file input fields
  // options.paramName: the parameter name for the file form data,
  //  overrides the name property of the file input field(s),
  //  can be a string or an array of strings.
  // options.formData: an array of objects with name and value properties,
  //  equivalent to the return data of .serializeArray(), e.g.:
  //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
  // options.initialIframeSrc: the URL of the initial iframe src,
  //  by default set to "javascript:false;"
  $.ajaxTransport('iframe', function (options) {
    if (options.async) {
      // javascript:false as initial iframe src
      // prevents warning popups on HTTPS in IE6:
      /*jshint scripturl: true */
      var initialIframeSrc = options.initialIframeSrc || 'javascript:false;',
      /*jshint scripturl: false */
        form,
        iframe,
        addParamChar;
      return {
        send: function (_, completeCallback) {
          form = $('<form style="display:none;"></form>');
          form.attr('accept-charset', options.formAcceptCharset);
          addParamChar = /\?/.test(options.url) ? '&' : '?';
          // XDomainRequest only supports GET and POST:
          if (options.type === 'DELETE') {
            options.url = options.url + addParamChar + '_method=DELETE';
            options.type = 'POST';
          } else if (options.type === 'PUT') {
            options.url = options.url + addParamChar + '_method=PUT';
            options.type = 'POST';
          } else if (options.type === 'PATCH') {
            options.url = options.url + addParamChar + '_method=PATCH';
            options.type = 'POST';
          }
          // IE versions below IE8 cannot set the name property of
          // elements that have already been added to the DOM,
          // so we set the name along with the iframe HTML markup:
          counter += 1;
          iframe = $(
            '<iframe src="' + initialIframeSrc +
              '" name="iframe-transport-' + counter + '"></iframe>'
          ).bind('load', function () {
              var fileInputClones,
                paramNames = $.isArray(options.paramName) ?
                  options.paramName : [options.paramName];
              iframe
                .unbind('load')
                .bind('load', function () {
                  var response;
                  // Wrap in a try/catch block to catch exceptions thrown
                  // when trying to access cross-domain iframe contents:
                  try {
                    response = iframe.contents();
                    // Google Chrome and Firefox do not throw an
                    // exception when calling iframe.contents() on
                    // cross-domain requests, so we unify the response:
                    if (!response.length || !response[0].firstChild) {
                      throw new Error();
                    }
                  } catch (e) {
                    response = undefined;
                  }
                  // The complete callback returns the
                  // iframe content document as response object:
                  completeCallback(
                    200,
                    'success',
                    {'iframe': response}
                  );
                  // Fix for IE endless progress bar activity bug
                  // (happens on form submits to iframe targets):
                  $('<iframe src="' + initialIframeSrc + '"></iframe>')
                    .appendTo(form);
                  window.setTimeout(function () {
                    // Removing the form in a setTimeout call
                    // allows Chrome's developer tools to display
                    // the response result
                    form.remove();
                  }, 0);
                });
              form
                .prop('target', iframe.prop('name'))
                .prop('action', options.url)
                .prop('method', options.type);
              if (options.formData) {
                $.each(options.formData, function (index, field) {
                  $('<input type="hidden"/>')
                    .prop('name', field.name)
                    .val(field.value)
                    .appendTo(form);
                });
              }
              if (options.fileInput && options.fileInput.length &&
                options.type === 'POST') {
                fileInputClones = options.fileInput.clone();
                // Insert a clone for each file input field:
                options.fileInput.after(function (index) {
                  return fileInputClones[index];
                });
                if (options.paramName) {
                  options.fileInput.each(function (index) {
                    $(this).prop(
                      'name',
                      paramNames[index] || options.paramName
                    );
                  });
                }
                // Appending the file input fields to the hidden form
                // removes them from their original location:
                form
                  .append(options.fileInput)
                  .prop('enctype', 'multipart/form-data')
                  // enctype must be set as encoding for IE:
                  .prop('encoding', 'multipart/form-data');
                // Remove the HTML5 form attribute from the input(s):
                options.fileInput.removeAttr('form');
              }
              form.submit();
              // Insert the file input fields at their original location
              // by replacing the clones with the originals:
              if (fileInputClones && fileInputClones.length) {
                options.fileInput.each(function (index, input) {
                  var clone = $(fileInputClones[index]);
                  // Restore the original name and form properties:
                  $(input)
                    .prop('name', clone.prop('name'))
                    .attr('form', clone.attr('form'));
                  clone.replaceWith(input);
                });
              }
            });
          form.append(iframe).appendTo(document.body);
        },
        abort: function () {
          if (iframe) {
            // javascript:false as iframe src aborts the request
            // and prevents warning popups on HTTPS in IE6.
            // concat is used to avoid the "Script URL" JSLint error:
            iframe
              .unbind('load')
              .prop('src', initialIframeSrc);
          }
          if (form) {
            form.remove();
          }
        }
      };
    }
  });

  // The iframe transport returns the iframe content document as response.
  // The following adds converters from iframe to text, json, html, xml
  // and script.
  // Please note that the Content-Type for JSON responses has to be text/plain
  // or text/html, if the browser doesn't include application/json in the
  // Accept header, else IE will show a download dialog.
  // The Content-Type for XML responses on the other hand has to be always
  // application/xml or text/xml, so IE properly parses the XML response.
  // See also
  // https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
  $.ajaxSetup({
    converters: {
      'iframe text': function (iframe) {
        return iframe && $(iframe[0].body).text();
      },
      'iframe json': function (iframe) {
        return iframe && $.parseJSON($(iframe[0].body).text());
      },
      'iframe html': function (iframe) {
        return iframe && $(iframe[0].body).html();
      },
      'iframe xml': function (iframe) {
        var xmlDoc = iframe && iframe[0];
        return xmlDoc && $.isXMLDoc(xmlDoc) ? xmlDoc :
          $.parseXML((xmlDoc.XMLDocument && xmlDoc.XMLDocument.xml) ||
            $(xmlDoc.body).html());
      },
      'iframe script': function (iframe) {
        return iframe && $.globalEval($(iframe[0].body).text());
      }
    }
  });

}));

/*
 * jQuery File Upload Plugin 5.40.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, window, document, location, Blob, FormData */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      'jquery.ui.widget'
    ], factory);
  } else {
    // Browser globals:
    factory(window.jQuery);
  }
}(function ($) {
  'use strict';

  // Detect file input support, based on
  // http://viljamis.com/blog/2012/file-upload-support-on-mobile/
  $.support.fileInput = !(new RegExp(
    // Handle devices which give false positives for the feature detection:
    '(Android (1\\.[0156]|2\\.[01]))' +
      '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
      '|(w(eb)?OSBrowser)|(webOS)' +
      '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
  ).test(window.navigator.userAgent) ||
    // Feature detection for all other devices:
    $('<input type="file">').prop('disabled'));

  // The FileReader API is not actually used, but works as feature detection,
  // as some Safari versions (5?) support XHR file uploads via the FormData API,
  // but not non-multipart XHR file uploads.
  // window.XMLHttpRequestUpload is not available on IE10, so we check for
  // window.ProgressEvent instead to detect XHR2 file upload capability:
  $.support.xhrFileUpload = !!(window.ProgressEvent && window.FileReader);
  $.support.xhrFormDataFileUpload = !!window.FormData;

  // Detect support for Blob slicing (required for chunked uploads):
  $.support.blobSlice = window.Blob && (Blob.prototype.slice ||
    Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

  // The fileupload widget listens for change events on file input fields defined
  // via fileInput setting and paste or drop events of the given dropZone.
  // In addition to the default jQuery Widget methods, the fileupload widget
  // exposes the "add" and "send" methods, to add or directly send files using
  // the fileupload API.
  // By default, files added via file input selection, paste, drag & drop or
  // "add" method are uploaded immediately, but it is possible to override
  // the "add" callback option to queue file uploads.
  $.widget('blueimp.fileupload', {

    options: {
      // The drop target element(s), by the default the complete document.
      // Set to null to disable drag & drop support:
      dropZone: $(document),
      // The paste target element(s), by the default the complete document.
      // Set to null to disable paste support:
      pasteZone: $(document),
      // The file input field(s), that are listened to for change events.
      // If undefined, it is set to the file input fields inside
      // of the widget element on plugin initialization.
      // Set to null to disable the change listener.
      fileInput: undefined,
      // By default, the file input field is replaced with a clone after
      // each input field change event. This is required for iframe transport
      // queues and allows change events to be fired for the same file
      // selection, but can be disabled by setting the following option to false:
      replaceFileInput: true,
      // The parameter name for the file form data (the request argument name).
      // If undefined or empty, the name property of the file input field is
      // used, or "files[]" if the file input name property is also empty,
      // can be a string or an array of strings:
      paramName: undefined,
      // By default, each file of a selection is uploaded using an individual
      // request for XHR type uploads. Set to false to upload file
      // selections in one request each:
      singleFileUploads: true,
      // To limit the number of files uploaded with one XHR request,
      // set the following option to an integer greater than 0:
      limitMultiFileUploads: undefined,
      // The following option limits the number of files uploaded with one
      // XHR request to keep the request size under or equal to the defined
      // limit in bytes:
      limitMultiFileUploadSize: undefined,
      // Multipart file uploads add a number of bytes to each uploaded file,
      // therefore the following option adds an overhead for each file used
      // in the limitMultiFileUploadSize configuration:
      limitMultiFileUploadSizeOverhead: 512,
      // Set the following option to true to issue all file upload requests
      // in a sequential order:
      sequentialUploads: false,
      // To limit the number of concurrent uploads,
      // set the following option to an integer greater than 0:
      limitConcurrentUploads: undefined,
      // Set the following option to true to force iframe transport uploads:
      forceIframeTransport: false,
      // Set the following option to the location of a redirect url on the
      // origin server, for cross-domain iframe transport uploads:
      redirect: undefined,
      // The parameter name for the redirect url, sent as part of the form
      // data and set to 'redirect' if this option is empty:
      redirectParamName: undefined,
      // Set the following option to the location of a postMessage window,
      // to enable postMessage transport uploads:
      postMessage: undefined,
      // By default, XHR file uploads are sent as multipart/form-data.
      // The iframe transport is always using multipart/form-data.
      // Set to false to enable non-multipart XHR uploads:
      multipart: true,
      // To upload large files in smaller chunks, set the following option
      // to a preferred maximum chunk size. If set to 0, null or undefined,
      // or the browser does not support the required Blob API, files will
      // be uploaded as a whole.
      maxChunkSize: undefined,
      // When a non-multipart upload or a chunked multipart upload has been
      // aborted, this option can be used to resume the upload by setting
      // it to the size of the already uploaded bytes. This option is most
      // useful when modifying the options object inside of the "add" or
      // "send" callbacks, as the options are cloned for each file upload.
      uploadedBytes: undefined,
      // By default, failed (abort or error) file uploads are removed from the
      // global progress calculation. Set the following option to false to
      // prevent recalculating the global progress data:
      recalculateProgress: true,
      // Interval in milliseconds to calculate and trigger progress events:
      progressInterval: 100,
      // Interval in milliseconds to calculate progress bitrate:
      bitrateInterval: 500,
      // By default, uploads are started automatically when adding files:
      autoUpload: true,

      // Error and info messages:
      messages: {
        uploadedBytes: 'Uploaded bytes exceed file size'
      },

      // Translation function, gets the message key to be translated
      // and an object with context specific data as arguments:
      i18n: function (message, context) {
        message = this.messages[message] || message.toString();
        if (context) {
          $.each(context, function (key, value) {
            message = message.replace('{' + key + '}', value);
          });
        }
        return message;
      },

      // Additional form data to be sent along with the file uploads can be set
      // using this option, which accepts an array of objects with name and
      // value properties, a function returning such an array, a FormData
      // object (for XHR file uploads), or a simple object.
      // The form of the first fileInput is given as parameter to the function:
      formData: function (form) {
        return form.serializeArray();
      },

      // The add callback is invoked as soon as files are added to the fileupload
      // widget (via file input selection, drag & drop, paste or add API call).
      // If the singleFileUploads option is enabled, this callback will be
      // called once for each file in the selection for XHR file uploads, else
      // once for each file selection.
      //
      // The upload starts when the submit method is invoked on the data parameter.
      // The data object contains a files property holding the added files
      // and allows you to override plugin options as well as define ajax settings.
      //
      // Listeners for this callback can also be bound the following way:
      // .bind('fileuploadadd', func);
      //
      // data.submit() returns a Promise object and allows to attach additional
      // handlers using jQuery's Deferred callbacks:
      // data.submit().done(func).fail(func).always(func);
      add: function (e, data) {
        if (e.isDefaultPrevented()) {
          return false;
        }
        if (data.autoUpload || (data.autoUpload !== false &&
          $(this).fileupload('option', 'autoUpload'))) {
          data.process().done(function () {
            data.submit();
          });
        }
      },

      // Other callbacks:

      // Callback for the submit event of each file upload:
      // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

      // Callback for the start of each file upload request:
      // send: function (e, data) {}, // .bind('fileuploadsend', func);

      // Callback for successful uploads:
      // done: function (e, data) {}, // .bind('fileuploaddone', func);

      // Callback for failed (abort or error) uploads:
      // fail: function (e, data) {}, // .bind('fileuploadfail', func);

      // Callback for completed (success, abort or error) requests:
      // always: function (e, data) {}, // .bind('fileuploadalways', func);

      // Callback for upload progress events:
      // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

      // Callback for global upload progress events:
      // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

      // Callback for uploads start, equivalent to the global ajaxStart event:
      // start: function (e) {}, // .bind('fileuploadstart', func);

      // Callback for uploads stop, equivalent to the global ajaxStop event:
      // stop: function (e) {}, // .bind('fileuploadstop', func);

      // Callback for change events of the fileInput(s):
      // change: function (e, data) {}, // .bind('fileuploadchange', func);

      // Callback for paste events to the pasteZone(s):
      // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

      // Callback for drop events of the dropZone(s):
      // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

      // Callback for dragover events of the dropZone(s):
      // dragover: function (e) {}, // .bind('fileuploaddragover', func);

      // Callback for the start of each chunk upload request:
      // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

      // Callback for successful chunk uploads:
      // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

      // Callback for failed (abort or error) chunk uploads:
      // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

      // Callback for completed (success, abort or error) chunk upload requests:
      // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

      // The plugin options are used as settings object for the ajax calls.
      // The following are jQuery ajax settings required for the file uploads:
      processData: false,
      contentType: false,
      cache: false
    },

    // A list of options that require reinitializing event listeners and/or
    // special initialization code:
    _specialOptions: [
      'fileInput',
      'dropZone',
      'pasteZone',
      'multipart',
      'forceIframeTransport'
    ],

    _blobSlice: $.support.blobSlice && function () {
      var slice = this.slice || this.webkitSlice || this.mozSlice;
      return slice.apply(this, arguments);
    },

    _BitrateTimer: function () {
      this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
      this.loaded = 0;
      this.bitrate = 0;
      this.getBitrate = function (now, loaded, interval) {
        var timeDiff = now - this.timestamp;
        if (!this.bitrate || !interval || timeDiff > interval) {
          this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
          this.loaded = loaded;
          this.timestamp = now;
        }
        return this.bitrate;
      };
    },

    _isXHRUpload: function (options) {
      return !options.forceIframeTransport &&
        ((!options.multipart && $.support.xhrFileUpload) ||
          $.support.xhrFormDataFileUpload);
    },

    _getFormData: function (options) {
      var formData;
      if ($.type(options.formData) === 'function') {
        return options.formData(options.form);
      }
      if ($.isArray(options.formData)) {
        return options.formData;
      }
      if ($.type(options.formData) === 'object') {
        formData = [];
        $.each(options.formData, function (name, value) {
          formData.push({name: name, value: value});
        });
        return formData;
      }
      return [];
    },

    _getTotal: function (files) {
      var total = 0;
      $.each(files, function (index, file) {
        total += file.size || 1;
      });
      return total;
    },

    _initProgressObject: function (obj) {
      var progress = {
        loaded: 0,
        total: 0,
        bitrate: 0
      };
      if (obj._progress) {
        $.extend(obj._progress, progress);
      } else {
        obj._progress = progress;
      }
    },

    _initResponseObject: function (obj) {
      var prop;
      if (obj._response) {
        for (prop in obj._response) {
          if (obj._response.hasOwnProperty(prop)) {
            delete obj._response[prop];
          }
        }
      } else {
        obj._response = {};
      }
    },

    _onProgress: function (e, data) {
      if (e.lengthComputable) {
        var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
          loaded;
        if (data._time && data.progressInterval &&
          (now - data._time < data.progressInterval) &&
          e.loaded !== e.total) {
          return;
        }
        data._time = now;
        loaded = Math.floor(
          e.loaded / e.total * (data.chunkSize || data._progress.total)
        ) + (data.uploadedBytes || 0);
        // Add the difference from the previously loaded state
        // to the global loaded counter:
        this._progress.loaded += (loaded - data._progress.loaded);
        this._progress.bitrate = this._bitrateTimer.getBitrate(
          now,
          this._progress.loaded,
          data.bitrateInterval
        );
        data._progress.loaded = data.loaded = loaded;
        data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
          now,
          loaded,
          data.bitrateInterval
        );
        // Trigger a custom progress event with a total data property set
        // to the file size(s) of the current upload and a loaded data
        // property calculated accordingly:
        this._trigger(
          'progress',
          $.Event('progress', {delegatedEvent: e}),
          data
        );
        // Trigger a global progress event for all current file uploads,
        // including ajax calls queued for sequential file uploads:
        this._trigger(
          'progressall',
          $.Event('progressall', {delegatedEvent: e}),
          this._progress
        );
      }
    },

    _initProgressListener: function (options) {
      var that = this,
        xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
      // Accesss to the native XHR object is required to add event listeners
      // for the upload progress event:
      if (xhr.upload) {
        $(xhr.upload).bind('progress', function (e) {
          var oe = e.originalEvent;
          // Make sure the progress event properties get copied over:
          e.lengthComputable = oe.lengthComputable;
          e.loaded = oe.loaded;
          e.total = oe.total;
          that._onProgress(e, options);
        });
        options.xhr = function () {
          return xhr;
        };
      }
    },

    _isInstanceOf: function (type, obj) {
      // Cross-frame instanceof check
      return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    },

    _initXHRData: function (options) {
      var that = this,
        formData,
        file = options.files[0],
      // Ignore non-multipart setting if not supported:
        multipart = options.multipart || !$.support.xhrFileUpload,
        paramName = $.type(options.paramName) === 'array' ?
          options.paramName[0] : options.paramName;
      options.headers = $.extend({}, options.headers);
      if (options.contentRange) {
        options.headers['Content-Range'] = options.contentRange;
      }
      if (!multipart || options.blob || !this._isInstanceOf('File', file)) {
        options.headers['Content-Disposition'] = 'attachment; filename="' +
          encodeURI(file.name) + '"';
      }
      if (!multipart) {
        options.contentType = file.type || 'application/octet-stream';
        options.data = options.blob || file;
      } else if ($.support.xhrFormDataFileUpload) {
        if (options.postMessage) {
          // window.postMessage does not allow sending FormData
          // objects, so we just add the File/Blob objects to
          // the formData array and let the postMessage window
          // create the FormData object out of this array:
          formData = this._getFormData(options);
          if (options.blob) {
            formData.push({
              name: paramName,
              value: options.blob
            });
          } else {
            $.each(options.files, function (index, file) {
              formData.push({
                name: ($.type(options.paramName) === 'array' &&
                  options.paramName[index]) || paramName,
                value: file
              });
            });
          }
        } else {
          if (that._isInstanceOf('FormData', options.formData)) {
            formData = options.formData;
          } else {
            formData = new FormData();
            $.each(this._getFormData(options), function (index, field) {
              formData.append(field.name, field.value);
            });
          }
          if (options.blob) {
            formData.append(paramName, options.blob, file.name);
          } else {
            $.each(options.files, function (index, file) {
              // This check allows the tests to run with
              // dummy objects:
              if (that._isInstanceOf('File', file) ||
                that._isInstanceOf('Blob', file)) {
                formData.append(
                  ($.type(options.paramName) === 'array' &&
                    options.paramName[index]) || paramName,
                  file,
                  file.uploadName || file.name
                );
              }
            });
          }
        }
        options.data = formData;
      }
      // Blob reference is not needed anymore, free memory:
      options.blob = null;
    },

    _initIframeSettings: function (options) {
      var targetHost = $('<a></a>').prop('href', options.url).prop('host');
      // Setting the dataType to iframe enables the iframe transport:
      options.dataType = 'iframe ' + (options.dataType || '');
      // The iframe transport accepts a serialized array as form data:
      options.formData = this._getFormData(options);
      // Add redirect url to form data on cross-domain uploads:
      if (options.redirect && targetHost && targetHost !== location.host) {
        options.formData.push({
          name: options.redirectParamName || 'redirect',
          value: options.redirect
        });
      }
    },

    _initDataSettings: function (options) {
      if (this._isXHRUpload(options)) {
        if (!this._chunkedUpload(options, true)) {
          if (!options.data) {
            this._initXHRData(options);
          }
          this._initProgressListener(options);
        }
        if (options.postMessage) {
          // Setting the dataType to postmessage enables the
          // postMessage transport:
          options.dataType = 'postmessage ' + (options.dataType || '');
        }
      } else {
        this._initIframeSettings(options);
      }
    },

    _getParamName: function (options) {
      var fileInput = $(options.fileInput),
        paramName = options.paramName;
      if (!paramName) {
        paramName = [];
        fileInput.each(function () {
          var input = $(this),
            name = input.prop('name') || 'files[]',
            i = (input.prop('files') || [1]).length;
          while (i) {
            paramName.push(name);
            i -= 1;
          }
        });
        if (!paramName.length) {
          paramName = [fileInput.prop('name') || 'files[]'];
        }
      } else if (!$.isArray(paramName)) {
        paramName = [paramName];
      }
      return paramName;
    },

    _initFormSettings: function (options) {
      // Retrieve missing options from the input field and the
      // associated form, if available:
      if (!options.form || !options.form.length) {
        options.form = $(options.fileInput.prop('form'));
        // If the given file input doesn't have an associated form,
        // use the default widget file input's form:
        if (!options.form.length) {
          options.form = $(this.options.fileInput.prop('form'));
        }
      }
      options.paramName = this._getParamName(options);
      if (!options.url) {
        options.url = options.form.prop('action') || location.href;
      }
      // The HTTP request method must be "POST" or "PUT":
      options.type = (options.type ||
        ($.type(options.form.prop('method')) === 'string' &&
          options.form.prop('method')) || ''
        ).toUpperCase();
      if (options.type !== 'POST' && options.type !== 'PUT' &&
        options.type !== 'PATCH') {
        options.type = 'POST';
      }
      if (!options.formAcceptCharset) {
        options.formAcceptCharset = options.form.attr('accept-charset');
      }
    },

    _getAJAXSettings: function (data) {
      var options = $.extend({}, this.options, data);
      this._initFormSettings(options);
      this._initDataSettings(options);
      return options;
    },

    // jQuery 1.6 doesn't provide .state(),
    // while jQuery 1.8+ removed .isRejected() and .isResolved():
    _getDeferredState: function (deferred) {
      if (deferred.state) {
        return deferred.state();
      }
      if (deferred.isResolved()) {
        return 'resolved';
      }
      if (deferred.isRejected()) {
        return 'rejected';
      }
      return 'pending';
    },

    // Maps jqXHR callbacks to the equivalent
    // methods of the given Promise object:
    _enhancePromise: function (promise) {
      promise.success = promise.done;
      promise.error = promise.fail;
      promise.complete = promise.always;
      return promise;
    },

    // Creates and returns a Promise object enhanced with
    // the jqXHR methods abort, success, error and complete:
    _getXHRPromise: function (resolveOrReject, context, args) {
      var dfd = $.Deferred(),
        promise = dfd.promise();
      context = context || this.options.context || promise;
      if (resolveOrReject === true) {
        dfd.resolveWith(context, args);
      } else if (resolveOrReject === false) {
        dfd.rejectWith(context, args);
      }
      promise.abort = dfd.promise;
      return this._enhancePromise(promise);
    },

    // Adds convenience methods to the data callback argument:
    _addConvenienceMethods: function (e, data) {
      var that = this,
        getPromise = function (args) {
          return $.Deferred().resolveWith(that, args).promise();
        };
      data.process = function (resolveFunc, rejectFunc) {
        if (resolveFunc || rejectFunc) {
          data._processQueue = this._processQueue =
            (this._processQueue || getPromise([this])).pipe(
              function () {
                if (data.errorThrown) {
                  return $.Deferred()
                    .rejectWith(that, [data]).promise();
                }
                return getPromise(arguments);
              }
            ).pipe(resolveFunc, rejectFunc);
        }
        return this._processQueue || getPromise([this]);
      };
      data.submit = function () {
        if (this.state() !== 'pending') {
          data.jqXHR = this.jqXHR =
            (that._trigger(
              'submit',
              $.Event('submit', {delegatedEvent: e}),
              this
            ) !== false) && that._onSend(e, this);
        }
        return this.jqXHR || that._getXHRPromise();
      };
      data.abort = function () {
        if (this.jqXHR) {
          return this.jqXHR.abort();
        }
        this.errorThrown = 'abort';
        that._trigger('fail', null, this);
        return that._getXHRPromise(false);
      };
      data.state = function () {
        if (this.jqXHR) {
          return that._getDeferredState(this.jqXHR);
        }
        if (this._processQueue) {
          return that._getDeferredState(this._processQueue);
        }
      };
      data.processing = function () {
        return !this.jqXHR && this._processQueue && that
          ._getDeferredState(this._processQueue) === 'pending';
      };
      data.progress = function () {
        return this._progress;
      };
      data.response = function () {
        return this._response;
      };
    },

    // Parses the Range header from the server response
    // and returns the uploaded bytes:
    _getUploadedBytes: function (jqXHR) {
      var range = jqXHR.getResponseHeader('Range'),
        parts = range && range.split('-'),
        upperBytesPos = parts && parts.length > 1 &&
          parseInt(parts[1], 10);
      return upperBytesPos && upperBytesPos + 1;
    },

    // Uploads a file in multiple, sequential requests
    // by splitting the file up in multiple blob chunks.
    // If the second parameter is true, only tests if the file
    // should be uploaded in chunks, but does not invoke any
    // upload requests:
    _chunkedUpload: function (options, testOnly) {
      options.uploadedBytes = options.uploadedBytes || 0;
      var that = this,
        file = options.files[0],
        fs = file.size,
        ub = options.uploadedBytes,
        mcs = options.maxChunkSize || fs,
        slice = this._blobSlice,
        dfd = $.Deferred(),
        promise = dfd.promise(),
        jqXHR,
        upload;
      if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
        options.data) {
        return false;
      }
      if (testOnly) {
        return true;
      }
      if (ub >= fs) {
        file.error = options.i18n('uploadedBytes');
        return this._getXHRPromise(
          false,
          options.context,
          [null, 'error', file.error]
        );
      }
      // The chunk upload method:
      upload = function () {
        // Clone the options object for each chunk upload:
        var o = $.extend({}, options),
          currentLoaded = o._progress.loaded;
        o.blob = slice.call(
          file,
          ub,
          ub + mcs,
          file.type
        );
        // Store the current chunk size, as the blob itself
        // will be dereferenced after data processing:
        o.chunkSize = o.blob.size;
        // Expose the chunk bytes position range:
        o.contentRange = 'bytes ' + ub + '-' +
          (ub + o.chunkSize - 1) + '/' + fs;
        // Process the upload data (the blob and potential form data):
        that._initXHRData(o);
        // Add progress listeners for this chunk upload:
        that._initProgressListener(o);
        jqXHR = ((that._trigger('chunksend', null, o) !== false && $.ajax(o)) ||
          that._getXHRPromise(false, o.context))
          .done(function (result, textStatus, jqXHR) {
            ub = that._getUploadedBytes(jqXHR) ||
              (ub + o.chunkSize);
            // Create a progress event if no final progress event
            // with loaded equaling total has been triggered
            // for this chunk:
            if (currentLoaded + o.chunkSize - o._progress.loaded) {
              that._onProgress($.Event('progress', {
                lengthComputable: true,
                loaded: ub - o.uploadedBytes,
                total: ub - o.uploadedBytes
              }), o);
            }
            options.uploadedBytes = o.uploadedBytes = ub;
            o.result = result;
            o.textStatus = textStatus;
            o.jqXHR = jqXHR;
            that._trigger('chunkdone', null, o);
            that._trigger('chunkalways', null, o);
            if (ub < fs) {
              // File upload not yet complete,
              // continue with the next chunk:
              upload();
            } else {
              dfd.resolveWith(
                o.context,
                [result, textStatus, jqXHR]
              );
            }
          })
          .fail(function (jqXHR, textStatus, errorThrown) {
            o.jqXHR = jqXHR;
            o.textStatus = textStatus;
            o.errorThrown = errorThrown;
            that._trigger('chunkfail', null, o);
            that._trigger('chunkalways', null, o);
            dfd.rejectWith(
              o.context,
              [jqXHR, textStatus, errorThrown]
            );
          });
      };
      this._enhancePromise(promise);
      promise.abort = function () {
        return jqXHR.abort();
      };
      upload();
      return promise;
    },

    _beforeSend: function (e, data) {
      if (this._active === 0) {
        // the start callback is triggered when an upload starts
        // and no other uploads are currently running,
        // equivalent to the global ajaxStart event:
        this._trigger('start');
        // Set timer for global bitrate progress calculation:
        this._bitrateTimer = new this._BitrateTimer();
        // Reset the global progress values:
        this._progress.loaded = this._progress.total = 0;
        this._progress.bitrate = 0;
      }
      // Make sure the container objects for the .response() and
      // .progress() methods on the data object are available
      // and reset to their initial state:
      this._initResponseObject(data);
      this._initProgressObject(data);
      data._progress.loaded = data.loaded = data.uploadedBytes || 0;
      data._progress.total = data.total = this._getTotal(data.files) || 1;
      data._progress.bitrate = data.bitrate = 0;
      this._active += 1;
      // Initialize the global progress values:
      this._progress.loaded += data.loaded;
      this._progress.total += data.total;
    },

    _onDone: function (result, textStatus, jqXHR, options) {
      var total = options._progress.total,
        response = options._response;
      if (options._progress.loaded < total) {
        // Create a progress event if no final progress event
        // with loaded equaling total has been triggered:
        this._onProgress($.Event('progress', {
          lengthComputable: true,
          loaded: total,
          total: total
        }), options);
      }
      response.result = options.result = result;
      response.textStatus = options.textStatus = textStatus;
      response.jqXHR = options.jqXHR = jqXHR;
      this._trigger('done', null, options);
    },

    _onFail: function (jqXHR, textStatus, errorThrown, options) {
      var response = options._response;
      if (options.recalculateProgress) {
        // Remove the failed (error or abort) file upload from
        // the global progress calculation:
        this._progress.loaded -= options._progress.loaded;
        this._progress.total -= options._progress.total;
      }
      response.jqXHR = options.jqXHR = jqXHR;
      response.textStatus = options.textStatus = textStatus;
      response.errorThrown = options.errorThrown = errorThrown;
      this._trigger('fail', null, options);
    },

    _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
      // jqXHRorResult, textStatus and jqXHRorError are added to the
      // options object via done and fail callbacks
      this._trigger('always', null, options);
    },

    _onSend: function (e, data) {
      if (!data.submit) {
        this._addConvenienceMethods(e, data);
      }
      var that = this,
        jqXHR,
        aborted,
        slot,
        pipe,
        options = that._getAJAXSettings(data),
        send = function () {
          that._sending += 1;
          // Set timer for bitrate progress calculation:
          options._bitrateTimer = new that._BitrateTimer();
          jqXHR = jqXHR || (
            ((aborted || that._trigger(
              'send',
              $.Event('send', {delegatedEvent: e}),
              options
            ) === false) &&
              that._getXHRPromise(false, options.context, aborted)) ||
              that._chunkedUpload(options) || $.ajax(options)
            ).done(function (result, textStatus, jqXHR) {
              that._onDone(result, textStatus, jqXHR, options);
            }).fail(function (jqXHR, textStatus, errorThrown) {
              that._onFail(jqXHR, textStatus, errorThrown, options);
            }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
              that._onAlways(
                jqXHRorResult,
                textStatus,
                jqXHRorError,
                options
              );
              that._sending -= 1;
              that._active -= 1;
              if (options.limitConcurrentUploads &&
                options.limitConcurrentUploads > that._sending) {
                // Start the next queued upload,
                // that has not been aborted:
                var nextSlot = that._slots.shift();
                while (nextSlot) {
                  if (that._getDeferredState(nextSlot) === 'pending') {
                    nextSlot.resolve();
                    break;
                  }
                  nextSlot = that._slots.shift();
                }
              }
              if (that._active === 0) {
                // The stop callback is triggered when all uploads have
                // been completed, equivalent to the global ajaxStop event:
                that._trigger('stop');
              }
            });
          return jqXHR;
        };
      this._beforeSend(e, options);
      if (this.options.sequentialUploads ||
        (this.options.limitConcurrentUploads &&
          this.options.limitConcurrentUploads <= this._sending)) {
        if (this.options.limitConcurrentUploads > 1) {
          slot = $.Deferred();
          this._slots.push(slot);
          pipe = slot.pipe(send);
        } else {
          this._sequence = this._sequence.pipe(send, send);
          pipe = this._sequence;
        }
        // Return the piped Promise object, enhanced with an abort method,
        // which is delegated to the jqXHR object of the current upload,
        // and jqXHR callbacks mapped to the equivalent Promise methods:
        pipe.abort = function () {
          aborted = [undefined, 'abort', 'abort'];
          if (!jqXHR) {
            if (slot) {
              slot.rejectWith(options.context, aborted);
            }
            return send();
          }
          return jqXHR.abort();
        };
        return this._enhancePromise(pipe);
      }
      return send();
    },

    _onAdd: function (e, data) {
      var that = this,
        result = true,
        options = $.extend({}, this.options, data),
        files = data.files,
        filesLength = files.length,
        limit = options.limitMultiFileUploads,
        limitSize = options.limitMultiFileUploadSize,
        overhead = options.limitMultiFileUploadSizeOverhead,
        batchSize = 0,
        paramName = this._getParamName(options),
        paramNameSet,
        paramNameSlice,
        fileSet,
        i,
        j = 0;
      if (limitSize && (!filesLength || files[0].size === undefined)) {
        limitSize = undefined;
      }
      if (!(options.singleFileUploads || limit || limitSize) || !this._isXHRUpload(options)) {
        fileSet = [files];
        paramNameSet = [paramName];
      } else if (!(options.singleFileUploads || limitSize) && limit) {
        fileSet = [];
        paramNameSet = [];
        for (i = 0; i < filesLength; i += limit) {
          fileSet.push(files.slice(i, i + limit));
          paramNameSlice = paramName.slice(i, i + limit);
          if (!paramNameSlice.length) {
            paramNameSlice = paramName;
          }
          paramNameSet.push(paramNameSlice);
        }
      } else if (!options.singleFileUploads && limitSize) {
        fileSet = [];
        paramNameSet = [];
        for (i = 0; i < filesLength; i = i + 1) {
          batchSize += files[i].size + overhead;
          if (i + 1 === filesLength ||
            ((batchSize + files[i + 1].size + overhead) > limitSize) ||
            (limit && i + 1 - j >= limit)) {
            fileSet.push(files.slice(j, i + 1));
            paramNameSlice = paramName.slice(j, i + 1);
            if (!paramNameSlice.length) {
              paramNameSlice = paramName;
            }
            paramNameSet.push(paramNameSlice);
            j = i + 1;
            batchSize = 0;
          }
        }
      } else {
        paramNameSet = paramName;
      }
      data.originalFiles = files;
      $.each(fileSet || files, function (index, element) {
        var newData = $.extend({}, data);
        newData.files = fileSet ? element : [element];
        newData.paramName = paramNameSet[index];
        that._initResponseObject(newData);
        that._initProgressObject(newData);
        that._addConvenienceMethods(e, newData);
        result = that._trigger(
          'add',
          $.Event('add', {delegatedEvent: e}),
          newData
        );
        return result;
      });
      return result;
    },

    _replaceFileInput: function (input) {
      var inputClone = input.clone(true);
      $('<form></form>').append(inputClone)[0].reset();
      // Detaching allows to insert the fileInput on another form
      // without loosing the file input value:
      input.after(inputClone).detach();
      // Avoid memory leaks with the detached file input:
      $.cleanData(input.unbind('remove'));
      // Replace the original file input element in the fileInput
      // elements set with the clone, which has been copied including
      // event handlers:
      this.options.fileInput = this.options.fileInput.map(function (i, el) {
        if (el === input[0]) {
          return inputClone[0];
        }
        return el;
      });
      // If the widget has been initialized on the file input itself,
      // override this.element with the file input clone:
      if (input[0] === this.element[0]) {
        this.element = inputClone;
      }
    },

    _handleFileTreeEntry: function (entry, path) {
      var that = this,
        dfd = $.Deferred(),
        errorHandler = function (e) {
          if (e && !e.entry) {
            e.entry = entry;
          }
          // Since $.when returns immediately if one
          // Deferred is rejected, we use resolve instead.
          // This allows valid files and invalid items
          // to be returned together in one set:
          dfd.resolve([e]);
        },
        dirReader;
      path = path || '';
      if (entry.isFile) {
        if (entry._file) {
          // Workaround for Chrome bug #149735
          entry._file.relativePath = path;
          dfd.resolve(entry._file);
        } else {
          entry.file(function (file) {
            file.relativePath = path;
            dfd.resolve(file);
          }, errorHandler);
        }
      } else if (entry.isDirectory) {
        dirReader = entry.createReader();
        dirReader.readEntries(function (entries) {
          that._handleFileTreeEntries(
              entries,
              path + entry.name + '/'
            ).done(function (files) {
              dfd.resolve(files);
            }).fail(errorHandler);
        }, errorHandler);
      } else {
        // Return an empy list for file system items
        // other than files or directories:
        dfd.resolve([]);
      }
      return dfd.promise();
    },

    _handleFileTreeEntries: function (entries, path) {
      var that = this;
      return $.when.apply(
          $,
          $.map(entries, function (entry) {
            return that._handleFileTreeEntry(entry, path);
          })
        ).pipe(function () {
          return Array.prototype.concat.apply(
            [],
            arguments
          );
        });
    },

    _getDroppedFiles: function (dataTransfer) {
      dataTransfer = dataTransfer || {};
      var items = dataTransfer.items;
      if (items && items.length && (items[0].webkitGetAsEntry ||
        items[0].getAsEntry)) {
        return this._handleFileTreeEntries(
          $.map(items, function (item) {
            var entry;
            if (item.webkitGetAsEntry) {
              entry = item.webkitGetAsEntry();
              if (entry) {
                // Workaround for Chrome bug #149735:
                entry._file = item.getAsFile();
              }
              return entry;
            }
            return item.getAsEntry();
          })
        );
      }
      return $.Deferred().resolve(
        $.makeArray(dataTransfer.files)
      ).promise();
    },

    _getSingleFileInputFiles: function (fileInput) {
      fileInput = $(fileInput);
      var entries = fileInput.prop('webkitEntries') ||
          fileInput.prop('entries'),
        files,
        value;
      if (entries && entries.length) {
        return this._handleFileTreeEntries(entries);
      }
      files = $.makeArray(fileInput.prop('files'));
      if (!files.length) {
        value = fileInput.prop('value');
        if (!value) {
          return $.Deferred().resolve([]).promise();
        }
        // If the files property is not available, the browser does not
        // support the File API and we add a pseudo File object with
        // the input value as name with path information removed:
        files = [
          {name: value.replace(/^.*\\/, '')}
        ];
      } else if (files[0].name === undefined && files[0].fileName) {
        // File normalization for Safari 4 and Firefox 3:
        $.each(files, function (index, file) {
          file.name = file.fileName;
          file.size = file.fileSize;
        });
      }
      return $.Deferred().resolve(files).promise();
    },

    _getFileInputFiles: function (fileInput) {
      if (!(fileInput instanceof $) || fileInput.length === 1) {
        return this._getSingleFileInputFiles(fileInput);
      }
      return $.when.apply(
          $,
          $.map(fileInput, this._getSingleFileInputFiles)
        ).pipe(function () {
          return Array.prototype.concat.apply(
            [],
            arguments
          );
        });
    },

    _onChange: function (e) {
      var that = this,
        data = {
          fileInput: $(e.target),
          form: $(e.target.form)
        };
      this._getFileInputFiles(data.fileInput).always(function (files) {
        data.files = files;
        if (that.options.replaceFileInput) {
          that._replaceFileInput(data.fileInput);
        }
        if (that._trigger(
          'change',
          $.Event('change', {delegatedEvent: e}),
          data
        ) !== false) {
          that._onAdd(e, data);
        }
      });
    },

    _onPaste: function (e) {
      var items = e.originalEvent && e.originalEvent.clipboardData &&
          e.originalEvent.clipboardData.items,
        data = {files: []};
      if (items && items.length) {
        $.each(items, function (index, item) {
          var file = item.getAsFile && item.getAsFile();
          if (file) {
            data.files.push(file);
          }
        });
        if (this._trigger(
          'paste',
          $.Event('paste', {delegatedEvent: e}),
          data
        ) !== false) {
          this._onAdd(e, data);
        }
      }
    },

    _onDrop: function (e) {
      e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
      var that = this,
        dataTransfer = e.dataTransfer,
        data = {};
      if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
        e.preventDefault();
        this._getDroppedFiles(dataTransfer).always(function (files) {
          data.files = files;
          if (that._trigger(
            'drop',
            $.Event('drop', {delegatedEvent: e}),
            data
          ) !== false) {
            that._onAdd(e, data);
          }
        });
      }
    },

    _onDragOver: function (e) {
      e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
      var dataTransfer = e.dataTransfer;
      if (dataTransfer && $.inArray('Files', dataTransfer.types) !== -1 &&
        this._trigger(
          'dragover',
          $.Event('dragover', {delegatedEvent: e})
        ) !== false) {
        e.preventDefault();
        dataTransfer.dropEffect = 'copy';
      }
    },

    _initEventHandlers: function () {
      if (this._isXHRUpload(this.options)) {
        this._on(this.options.dropZone, {
          dragover: this._onDragOver,
          drop: this._onDrop
        });
        this._on(this.options.pasteZone, {
          paste: this._onPaste
        });
      }
      if ($.support.fileInput) {
        this._on(this.options.fileInput, {
          change: this._onChange
        });
      }
    },

    _destroyEventHandlers: function () {
      this._off(this.options.dropZone, 'dragover drop');
      this._off(this.options.pasteZone, 'paste');
      this._off(this.options.fileInput, 'change');
    },

    _setOption: function (key, value) {
      var reinit = $.inArray(key, this._specialOptions) !== -1;
      if (reinit) {
        this._destroyEventHandlers();
      }
      this._super(key, value);
      if (reinit) {
        this._initSpecialOptions();
        this._initEventHandlers();
      }
    },

    _initSpecialOptions: function () {
      var options = this.options;
      if (options.fileInput === undefined) {
        options.fileInput = this.element.is('input[type="file"]') ?
          this.element : this.element.find('input[type="file"]');
      } else if (!(options.fileInput instanceof $)) {
        options.fileInput = $(options.fileInput);
      }
      if (!(options.dropZone instanceof $)) {
        options.dropZone = $(options.dropZone);
      }
      if (!(options.pasteZone instanceof $)) {
        options.pasteZone = $(options.pasteZone);
      }
    },

    _getRegExp: function (str) {
      var parts = str.split('/'),
        modifiers = parts.pop();
      parts.shift();
      return new RegExp(parts.join('/'), modifiers);
    },

    _isRegExpOption: function (key, value) {
      return key !== 'url' && $.type(value) === 'string' &&
        /^\/.*\/[igm]{0,3}$/.test(value);
    },

    _initDataAttributes: function () {
      var that = this,
        options = this.options,
        clone = $(this.element[0].cloneNode(false));
      // Initialize options set via HTML5 data-attributes:
      $.each(
        clone.data(),
        function (key, value) {
          var dataAttributeName = 'data-' +
            // Convert camelCase to hyphen-ated key:
            key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          if (clone.attr(dataAttributeName)) {
            if (that._isRegExpOption(key, value)) {
              value = that._getRegExp(value);
            }
            options[key] = value;
          }
        }
      );
    },

    _create: function () {
      this._initDataAttributes();
      this._initSpecialOptions();
      this._slots = [];
      this._sequence = this._getXHRPromise(true);
      this._sending = this._active = 0;
      this._initProgressObject(this);
      this._initEventHandlers();
    },

    // This method is exposed to the widget API and allows to query
    // the number of active uploads:
    active: function () {
      return this._active;
    },

    // This method is exposed to the widget API and allows to query
    // the widget upload progress.
    // It returns an object with loaded, total and bitrate properties
    // for the running uploads:
    progress: function () {
      return this._progress;
    },

    // This method is exposed to the widget API and allows adding files
    // using the fileupload API. The data parameter accepts an object which
    // must have a files property and can contain additional options:
    // .fileupload('add', {files: filesList});
    add: function (data) {
      var that = this;
      if (!data || this.options.disabled) {
        return;
      }
      if (data.fileInput && !data.files) {
        this._getFileInputFiles(data.fileInput).always(function (files) {
          data.files = files;
          that._onAdd(null, data);
        });
      } else {
        data.files = $.makeArray(data.files);
        this._onAdd(null, data);
      }
    },

    // This method is exposed to the widget API and allows sending files
    // using the fileupload API. The data parameter accepts an object which
    // must have a files or fileInput property and can contain additional options:
    // .fileupload('send', {files: filesList});
    // The method returns a Promise object for the file upload call.
    send: function (data) {
      if (data && !this.options.disabled) {
        if (data.fileInput && !data.files) {
          var that = this,
            dfd = $.Deferred(),
            promise = dfd.promise(),
            jqXHR,
            aborted;
          promise.abort = function () {
            aborted = true;
            if (jqXHR) {
              return jqXHR.abort();
            }
            dfd.reject(null, 'abort', 'abort');
            return promise;
          };
          this._getFileInputFiles(data.fileInput).always(
            function (files) {
              if (aborted) {
                return;
              }
              if (!files.length) {
                dfd.reject();
                return;
              }
              data.files = files;
              jqXHR = that._onSend(null, data).then(
                function (result, textStatus, jqXHR) {
                  dfd.resolve(result, textStatus, jqXHR);
                },
                function (jqXHR, textStatus, errorThrown) {
                  dfd.reject(jqXHR, textStatus, errorThrown);
                }
              );
            }
          );
          return this._enhancePromise(promise);
        }
        data.files = $.makeArray(data.files);
        if (data.files.length) {
          return this._onSend(null, data);
        }
      }
      return this._getXHRPromise(false, data && data.context);
    }

  });

}));

/*
 * jQuery File Upload Processing Plugin 1.3.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, window */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      './jquery.fileupload'
    ], factory);
  } else {
    // Browser globals:
    factory(
      window.jQuery
    );
  }
}(function ($) {
  'use strict';

  var originalAdd = $.blueimp.fileupload.prototype.options.add;

  // The File Upload Processing plugin extends the fileupload widget
  // with file processing functionality:
  $.widget('blueimp.fileupload', $.blueimp.fileupload, {

    options: {
      // The list of processing actions:
      processQueue: [
        /*
         {
         action: 'log',
         type: 'debug'
         }
         */
      ],
      add: function (e, data) {
        var $this = $(this);
        data.process(function () {
          return $this.fileupload('process', data);
        });
        originalAdd.call(this, e, data);
      }
    },

    processActions: {
      /*
       log: function (data, options) {
       console[options.type](
       'Processing "' + data.files[data.index].name + '"'
       );
       }
       */
    },

    _processFile: function (data, originalData) {
      var that = this,
        dfd = $.Deferred().resolveWith(that, [data]),
        chain = dfd.promise();
      this._trigger('process', null, data);
      $.each(data.processQueue, function (i, settings) {
        var func = function (data) {
          if (originalData.errorThrown) {
            return $.Deferred()
              .rejectWith(that, [originalData]).promise();
          }
          return that.processActions[settings.action].call(
            that,
            data,
            settings
          );
        };
        chain = chain.pipe(func, settings.always && func);
      });
      chain
        .done(function () {
          that._trigger('processdone', null, data);
          that._trigger('processalways', null, data);
        })
        .fail(function () {
          that._trigger('processfail', null, data);
          that._trigger('processalways', null, data);
        });
      return chain;
    },

    // Replaces the settings of each processQueue item that
    // are strings starting with an "@", using the remaining
    // substring as key for the option map,
    // e.g. "@autoUpload" is replaced with options.autoUpload:
    _transformProcessQueue: function (options) {
      var processQueue = [];
      $.each(options.processQueue, function () {
        var settings = {},
          action = this.action,
          prefix = this.prefix === true ? action : this.prefix;
        $.each(this, function (key, value) {
          if ($.type(value) === 'string' &&
            value.charAt(0) === '@') {
            settings[key] = options[
              value.slice(1) || (prefix ? prefix +
                key.charAt(0).toUpperCase() + key.slice(1) : key)
              ];
          } else {
            settings[key] = value;
          }

        });
        processQueue.push(settings);
      });
      options.processQueue = processQueue;
    },

    // Returns the number of files currently in the processsing queue:
    processing: function () {
      return this._processing;
    },

    // Processes the files given as files property of the data parameter,
    // returns a Promise object that allows to bind callbacks:
    process: function (data) {
      var that = this,
        options = $.extend({}, this.options, data);
      if (options.processQueue && options.processQueue.length) {
        this._transformProcessQueue(options);
        if (this._processing === 0) {
          this._trigger('processstart');
        }
        $.each(data.files, function (index) {
          var opts = index ? $.extend({}, options) : options,
            func = function () {
              if (data.errorThrown) {
                return $.Deferred()
                  .rejectWith(that, [data]).promise();
              }
              return that._processFile(opts, data);
            };
          opts.index = index;
          that._processing += 1;
          that._processingQueue = that._processingQueue.pipe(func, func)
            .always(function () {
              that._processing -= 1;
              if (that._processing === 0) {
                that._trigger('processstop');
              }
            });
        });
      }
      return this._processingQueue;
    },

    _create: function () {
      this._super();
      this._processing = 0;
      this._processingQueue = $.Deferred().resolveWith(this)
        .promise();
    }

  });

}));

/*
 * jQuery File Upload Image Preview & Resize Plugin 1.7.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, window, Blob */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      'load-image',
      'load-image-meta',
      'load-image-exif',
      'load-image-ios',
      'canvas-to-blob',
      './jquery.fileupload-process'
    ], factory);
  } else {
    // Browser globals:
    factory(
      window.jQuery,
      window.loadImage
    );
  }
}(function ($, loadImage) {
  'use strict';

  // Prepend to the default processQueue:
  $.blueimp.fileupload.prototype.options.processQueue.unshift(
    {
      action: 'loadImageMetaData',
      disableImageHead: '@',
      disableExif: '@',
      disableExifThumbnail: '@',
      disableExifSub: '@',
      disableExifGps: '@',
      disabled: '@disableImageMetaDataLoad'
    },
    {
      action: 'loadImage',
      // Use the action as prefix for the "@" options:
      prefix: true,
      fileTypes: '@',
      maxFileSize: '@',
      noRevoke: '@',
      disabled: '@disableImageLoad'
    },
    {
      action: 'resizeImage',
      // Use "image" as prefix for the "@" options:
      prefix: 'image',
      maxWidth: '@',
      maxHeight: '@',
      minWidth: '@',
      minHeight: '@',
      crop: '@',
      orientation: '@',
      forceResize: '@',
      disabled: '@disableImageResize'
    },
    {
      action: 'saveImage',
      quality: '@imageQuality',
      type: '@imageType',
      disabled: '@disableImageResize'
    },
    {
      action: 'saveImageMetaData',
      disabled: '@disableImageMetaDataSave'
    },
    {
      action: 'resizeImage',
      // Use "preview" as prefix for the "@" options:
      prefix: 'preview',
      maxWidth: '@',
      maxHeight: '@',
      minWidth: '@',
      minHeight: '@',
      crop: '@',
      orientation: '@',
      thumbnail: '@',
      canvas: '@',
      disabled: '@disableImagePreview'
    },
    {
      action: 'setImage',
      name: '@imagePreviewName',
      disabled: '@disableImagePreview'
    },
    {
      action: 'deleteImageReferences',
      disabled: '@disableImageReferencesDeletion'
    }
  );

  // The File Upload Resize plugin extends the fileupload widget
  // with image resize functionality:
  $.widget('blueimp.fileupload', $.blueimp.fileupload, {

    options: {
      // The regular expression for the types of images to load:
      // matched against the file type:
      loadImageFileTypes: /^image\/(gif|jpeg|png|svg\+xml)$/,
      // The maximum file size of images to load:
      loadImageMaxFileSize: 10000000, // 10MB
      // The maximum width of resized images:
      imageMaxWidth: 1920,
      // The maximum height of resized images:
      imageMaxHeight: 1080,
      // Defines the image orientation (1-8) or takes the orientation
      // value from Exif data if set to true:
      imageOrientation: false,
      // Define if resized images should be cropped or only scaled:
      imageCrop: false,
      // Disable the resize image functionality by default:
      disableImageResize: true,
      // The maximum width of the preview images:
      previewMaxWidth: 80,
      // The maximum height of the preview images:
      previewMaxHeight: 80,
      // Defines the preview orientation (1-8) or takes the orientation
      // value from Exif data if set to true:
      previewOrientation: true,
      // Create the preview using the Exif data thumbnail:
      previewThumbnail: true,
      // Define if preview images should be cropped or only scaled:
      previewCrop: false,
      // Define if preview images should be resized as canvas elements:
      previewCanvas: true
    },

    processActions: {

      // Loads the image given via data.files and data.index
      // as img element, if the browser supports the File API.
      // Accepts the options fileTypes (regular expression)
      // and maxFileSize (integer) to limit the files to load:
      loadImage: function (data, options) {
        if (options.disabled) {
          return data;
        }
        var that = this,
          file = data.files[data.index],
          dfd = $.Deferred();
        if (($.type(options.maxFileSize) === 'number' &&
          file.size > options.maxFileSize) ||
          (options.fileTypes && !options.fileTypes.test(file.type)) || !loadImage(
          file,
          function (img) {
            if (img.src) {
              data.img = img;
            }
            dfd.resolveWith(that, [data]);
          },
          options
        )) {
          return data;
        }
        return dfd.promise();
      },

      // Resizes the image given as data.canvas or data.img
      // and updates data.canvas or data.img with the resized image.
      // Also stores the resized image as preview property.
      // Accepts the options maxWidth, maxHeight, minWidth,
      // minHeight, canvas and crop:
      resizeImage: function (data, options) {
        if (options.disabled || !(data.canvas || data.img)) {
          return data;
        }
        options = $.extend({canvas: true}, options);
        var that = this,
          dfd = $.Deferred(),
          img = (options.canvas && data.canvas) || data.img,
          resolve = function (newImg) {
            if (newImg && (newImg.width !== img.width ||
              newImg.height !== img.height ||
              options.forceResize)) {
              data[newImg.getContext ? 'canvas' : 'img'] = newImg;
            }
            data.preview = newImg;
            dfd.resolveWith(that, [data]);
          },
          thumbnail;
        if (data.exif) {
          if (options.orientation === true) {
            options.orientation = data.exif.get('Orientation');
          }
          if (options.thumbnail) {
            thumbnail = data.exif.get('Thumbnail');
            if (thumbnail) {
              loadImage(thumbnail, resolve, options);
              return dfd.promise();
            }
          }
          // Prevent orienting the same image twice:
          if (data.orientation) {
            delete options.orientation;
          } else {
            data.orientation = options.orientation;
          }
        }
        if (img) {
          resolve(loadImage.scale(img, options));
          return dfd.promise();
        }
        return data;
      },

      // Saves the processed image given as data.canvas
      // inplace at data.index of data.files:
      saveImage: function (data, options) {
        if (!data.canvas || options.disabled) {
          return data;
        }
        var that = this,
          file = data.files[data.index],
          dfd = $.Deferred();
        if (data.canvas.toBlob) {
          data.canvas.toBlob(
            function (blob) {
              if (!blob.name) {
                if (file.type === blob.type) {
                  blob.name = file.name;
                } else if (file.name) {
                  blob.name = file.name.replace(
                    /\..+$/,
                    '.' + blob.type.substr(6)
                  );
                }
              }
              // Don't restore invalid meta data:
              if (file.type !== blob.type) {
                delete data.imageHead;
              }
              // Store the created blob at the position
              // of the original file in the files list:
              data.files[data.index] = blob;
              dfd.resolveWith(that, [data]);
            },
            options.type || file.type,
            options.quality
          );
        } else {
          return data;
        }
        return dfd.promise();
      },

      loadImageMetaData: function (data, options) {
        if (options.disabled) {
          return data;
        }
        var that = this,
          dfd = $.Deferred();
        loadImage.parseMetaData(data.files[data.index], function (result) {
          $.extend(data, result);
          dfd.resolveWith(that, [data]);
        }, options);
        return dfd.promise();
      },

      saveImageMetaData: function (data, options) {
        if (!(data.imageHead && data.canvas &&
          data.canvas.toBlob && !options.disabled)) {
          return data;
        }
        var file = data.files[data.index],
          blob = new Blob([
            data.imageHead,
            // Resized images always have a head size of 20 bytes,
            // including the JPEG marker and a minimal JFIF header:
            this._blobSlice.call(file, 20)
          ], {type: file.type});
        blob.name = file.name;
        data.files[data.index] = blob;
        return data;
      },

      // Sets the resized version of the image as a property of the
      // file object, must be called after "saveImage":
      setImage: function (data, options) {
        if (data.preview && !options.disabled) {
          data.files[data.index][options.name || 'preview'] = data.preview;
        }
        return data;
      },

      deleteImageReferences: function (data, options) {
        if (!options.disabled) {
          delete data.img;
          delete data.canvas;
          delete data.preview;
          delete data.imageHead;
        }
        return data;
      }

    }

  });

}));

/*
 * jQuery File Upload Audio Preview Plugin 1.0.3
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, window, document */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      'load-image',
      './jquery.fileupload-process'
    ], factory);
  } else {
    // Browser globals:
    factory(
      window.jQuery,
      window.loadImage
    );
  }
}(function ($, loadImage) {
  'use strict';

  // Prepend to the default processQueue:
  $.blueimp.fileupload.prototype.options.processQueue.unshift(
    {
      action: 'loadAudio',
      // Use the action as prefix for the "@" options:
      prefix: true,
      fileTypes: '@',
      maxFileSize: '@',
      disabled: '@disableAudioPreview'
    },
    {
      action: 'setAudio',
      name: '@audioPreviewName',
      disabled: '@disableAudioPreview'
    }
  );

  // The File Upload Audio Preview plugin extends the fileupload widget
  // with audio preview functionality:
  $.widget('blueimp.fileupload', $.blueimp.fileupload, {

    options: {
      // The regular expression for the types of audio files to load,
      // matched against the file type:
      loadAudioFileTypes: /^audio\/.*$/
    },

    _audioElement: document.createElement('audio'),

    processActions: {

      // Loads the audio file given via data.files and data.index
      // as audio element if the browser supports playing it.
      // Accepts the options fileTypes (regular expression)
      // and maxFileSize (integer) to limit the files to load:
      loadAudio: function (data, options) {
        if (options.disabled) {
          return data;
        }
        var file = data.files[data.index],
          url,
          audio;
        if (this._audioElement.canPlayType &&
          this._audioElement.canPlayType(file.type) &&
          ($.type(options.maxFileSize) !== 'number' ||
            file.size <= options.maxFileSize) &&
          (!options.fileTypes ||
            options.fileTypes.test(file.type))) {
          url = loadImage.createObjectURL(file);
          if (url) {
            audio = this._audioElement.cloneNode(false);
            audio.src = url;
            audio.controls = true;
            data.audio = audio;
            return data;
          }
        }
        return data;
      },

      // Sets the audio element as a property of the file object:
      setAudio: function (data, options) {
        if (data.audio && !options.disabled) {
          data.files[data.index][options.name || 'preview'] = data.audio;
        }
        return data;
      }

    }

  });

}));

/*
 * jQuery File Upload Video Preview Plugin 1.0.3
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, window, document */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      'load-image',
      './jquery.fileupload-process'
    ], factory);
  } else {
    // Browser globals:
    factory(
      window.jQuery,
      window.loadImage
    );
  }
}(function ($, loadImage) {
  'use strict';

  // Prepend to the default processQueue:
  $.blueimp.fileupload.prototype.options.processQueue.unshift(
    {
      action: 'loadVideo',
      // Use the action as prefix for the "@" options:
      prefix: true,
      fileTypes: '@',
      maxFileSize: '@',
      disabled: '@disableVideoPreview'
    },
    {
      action: 'setVideo',
      name: '@videoPreviewName',
      disabled: '@disableVideoPreview'
    }
  );

  // The File Upload Video Preview plugin extends the fileupload widget
  // with video preview functionality:
  $.widget('blueimp.fileupload', $.blueimp.fileupload, {

    options: {
      // The regular expression for the types of video files to load,
      // matched against the file type:
      loadVideoFileTypes: /^video\/.*$/
    },

    _videoElement: document.createElement('video'),

    processActions: {

      // Loads the video file given via data.files and data.index
      // as video element if the browser supports playing it.
      // Accepts the options fileTypes (regular expression)
      // and maxFileSize (integer) to limit the files to load:
      loadVideo: function (data, options) {
        if (options.disabled) {
          return data;
        }
        var file = data.files[data.index],
          url,
          video;
        if (this._videoElement.canPlayType &&
          this._videoElement.canPlayType(file.type) &&
          ($.type(options.maxFileSize) !== 'number' ||
            file.size <= options.maxFileSize) &&
          (!options.fileTypes ||
            options.fileTypes.test(file.type))) {
          url = loadImage.createObjectURL(file);
          if (url) {
            video = this._videoElement.cloneNode(false);
            video.src = url;
            video.controls = true;
            data.video = video;
            return data;
          }
        }
        return data;
      },

      // Sets the video element as a property of the file object:
      setVideo: function (data, options) {
        if (data.video && !options.disabled) {
          data.files[data.index][options.name || 'preview'] = data.video;
        }
        return data;
      }

    }

  });

}));

/*
 * jQuery File Upload Validation Plugin 1.1.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global define, window */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      './jquery.fileupload-process'
    ], factory);
  } else {
    // Browser globals:
    factory(
      window.jQuery
    );
  }
}(function ($) {
  'use strict';

  // Append to the default processQueue:
  $.blueimp.fileupload.prototype.options.processQueue.push(
    {
      action: 'validate',
      // Always trigger this action,
      // even if the previous action was rejected:
      always: true,
      // Options taken from the global options map:
      acceptFileTypes: '@',
      maxFileSize: '@',
      minFileSize: '@',
      maxNumberOfFiles: '@',
      disabled: '@disableValidation'
    }
  );

  // The File Upload Validation plugin extends the fileupload widget
  // with file validation functionality:
  $.widget('blueimp.fileupload', $.blueimp.fileupload, {

    options: {
      /*
       // The regular expression for allowed file types, matches
       // against either file type or file name:
       acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
       // The maximum allowed file size in bytes:
       maxFileSize: 10000000, // 10 MB
       // The minimum allowed file size in bytes:
       minFileSize: undefined, // No minimal file size
       // The limit of files to be uploaded:
       maxNumberOfFiles: 10,
       */

      // Function returning the current number of files,
      // has to be overriden for maxNumberOfFiles validation:
      getNumberOfFiles: $.noop,

      // Error and info messages:
      messages: {
        maxNumberOfFiles: 'Maximum number of files exceeded',
        acceptFileTypes: 'File type not allowed',
        maxFileSize: 'File is too large',
        minFileSize: 'File is too small'
      }
    },

    processActions: {

      validate: function (data, options) {
        if (options.disabled) {
          return data;
        }
        var dfd = $.Deferred(),
          settings = this.options,
          file = data.files[data.index],
          fileSize;
        if (options.minFileSize || options.maxFileSize) {
          fileSize = file.size;
        }
        if ($.type(options.maxNumberOfFiles) === 'number' &&
          (settings.getNumberOfFiles() || 0) + data.files.length >
            options.maxNumberOfFiles) {
          file.error = settings.i18n('maxNumberOfFiles');
        } else if (options.acceptFileTypes && !(options.acceptFileTypes.test(file.type) ||
          options.acceptFileTypes.test(file.name))) {
          file.error = settings.i18n('acceptFileTypes');
        } else if (fileSize > options.maxFileSize) {
          file.error = settings.i18n('maxFileSize');
        } else if ($.type(fileSize) === 'number' &&
          fileSize < options.minFileSize) {
          file.error = settings.i18n('minFileSize');
        } else {
          delete file.error;
        }
        if (file.error || data.files.error) {
          data.files.error = true;
          dfd.rejectWith(this, [data]);
        } else {
          dfd.resolveWith(this, [data]);
        }
        return dfd.promise();
      }

    }

  });

}));

/*
 * jQuery File Upload AngularJS Plugin 2.2.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, angular */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define([
      'jquery',
      'angular',
      './jquery.fileupload-image',
      './jquery.fileupload-audio',
      './jquery.fileupload-video',
      './jquery.fileupload-validate'
    ], factory);
  } else {
    factory();
  }
}(function () {
  'use strict';

  angular.module('blueimp.fileupload', [])

    // The fileUpload service provides configuration options
    // for the fileUpload directive and default handlers for
    // File Upload events:
    .provider('fileUpload', function () {

      var scopeEvalAsync = function (expression) {
          var scope = angular.element(this)
            .fileupload('option', 'scope');
          // Schedule a new $digest cycle if not already inside of one
          // and evaluate the given expression:
          scope.$evalAsync(expression);
        },
        addFileMethods = function (scope, data) {
          var files = data.files,
            file = files[0];
          angular.forEach(files, function (file, index) {
            file._index = index;
            file.$state = function () {
              return data.state();
            };
            file.$processing = function () {
              return data.processing();
            };
            file.$progress = function () {
              return data.progress();
            };
            file.$response = function () {
              return data.response();
            };
          });
          file.$submit = function () {
            if (!file.error) {
              return data.submit();
            }
          };
          file.$cancel = function () {
            return data.abort();
          };
        },
        $config;
      $config = this.defaults = {
        handleResponse: function (e, data) {
          var files = data.result && data.result.files;
          if (files) {
            data.scope.replace(data.files, files);
          } else if (data.errorThrown ||
            data.textStatus === 'error') {
            data.files[0].error = data.errorThrown ||
              data.textStatus;
          }
        },
        add: function (e, data) {
          if (e.isDefaultPrevented()) {
            return false;
          }
          var scope = data.scope,
            filesCopy = [];
          angular.forEach(data.files, function (file) {
            filesCopy.push(file);
          });
          scope.$apply(function () {
            addFileMethods(scope, data);
            var method = scope.option('prependFiles') ?
              'unshift' : 'push';
            Array.prototype[method].apply(scope.queue, data.files);
          });
          data.process(function () {
            return scope.process(data);
          }).always(function () {
            scope.$apply(function () {
              addFileMethods(scope, data);
              scope.replace(filesCopy, data.files);
            });
          }).then(function () {
            if ((scope.option('autoUpload') ||
              data.autoUpload) &&
              data.autoUpload !== false) {
              data.submit();
            }
          });
        },
        progress: function (e, data) {
          if (e.isDefaultPrevented()) {
            return false;
          }
          data.scope.$apply();
        },
        done: function (e, data) {
          if (e.isDefaultPrevented()) {
            return false;
          }
          var that = this;
          data.scope.$apply(function () {
            data.handleResponse.call(that, e, data);
          });
        },
        fail: function (e, data) {
          if (e.isDefaultPrevented()) {
            return false;
          }
          var that = this,
            scope = data.scope;
          if (data.errorThrown === 'abort') {
            scope.clear(data.files);
            return;
          }
          scope.$apply(function () {
            data.handleResponse.call(that, e, data);
          });
        },
        stop: scopeEvalAsync,
        processstart: scopeEvalAsync,
        processstop: scopeEvalAsync,
        getNumberOfFiles: function () {
          var scope = this.scope;
          return scope.queue.length - scope.processing();
        },
        dataType: 'json',
        autoUpload: false
      };

      /**
       * Create field data object
       * @type {{}}
       */
      var fieldData = {};

      /**
       * Add field Data to field data object with fieldname
       * @param fieldName
       * @param fileData
       */
      var addFieldData = function addFieldData(fieldName, fileData) {
        fieldData[fieldName].push(fileData);
      };

      /**
       * Remove field data
       * @param fieldName
       * @param fileId
       */
      var removeFieldData = function removeFieldData(fieldName, fileId) {
        angular.forEach(fieldData[fieldName], function (value, key) {
          if (value && value._id) {
            if (value._id === fileId) {
              fieldData[fieldName].splice(key, 1);
            }
          }
        });
      };

      /**
       * Register the field
       * @param fieldName
       * @param fieldData
       * @todo prefill with existing data
       */
      var registerField = function registerField(fieldName) {
        if (!fieldData[fieldName]) {
          fieldData[fieldName] = [];
        }
      };

      this.$get = [
        function () {
          return {
            fieldData: fieldData,
            defaults: $config,
            addFieldData: addFieldData,
            removeFieldData: removeFieldData,
            registerField: registerField
          };
        }
      ];
    })

    // Format byte numbers to readable presentations:
    .provider('formatFileSizeFilter', function () {
      var $config = {
        // Byte units following the IEC format
        // http://en.wikipedia.org/wiki/Kilobyte
        units: [
          {size: 1000000000, suffix: ' GB'},
          {size: 1000000, suffix: ' MB'},
          {size: 1000, suffix: ' KB'}
        ]
      };
      this.defaults = $config;
      this.$get = function () {
        return function (bytes) {
          if (!angular.isNumber(bytes)) {
            return '';
          }
          var unit = true,
            i = 0,
            prefix,
            suffix;
          while (unit) {
            unit = $config.units[i];
            prefix = unit.prefix || '';
            suffix = unit.suffix || '';
            if (i === $config.units.length - 1 || bytes >= unit.size) {
              return prefix + (bytes / unit.size).toFixed(2) + suffix;
            }
            i += 1;
          }
        };
      };
    })

    // The FileUploadController initializes the fileupload widget and
    // provides scope methods to control the File Upload functionality:
    .controller('FileUploadController', [
      '$scope', '$element', '$attrs', '$window', 'fileUpload',
      function ($scope, $element, $attrs, $window, fileUpload) {
        var uploadMethods = {
          progress: function () {
            return $element.fileupload('progress');
          },
          active: function () {
            return $element.fileupload('active');
          },
          option: function (option, data) {
            if (arguments.length === 1) {
              return $element.fileupload('option', option);
            }
            $element.fileupload('option', option, data);
          },
          add: function (data) {
            return $element.fileupload('add', data);
          },
          send: function (data) {
            return $element.fileupload('send', data);
          },
          process: function (data) {
            return $element.fileupload('process', data);
          },
          processing: function (data) {
            return $element.fileupload('processing', data);
          }
        };
        $scope.disabled = !$window.jQuery.support.fileInput;
        $scope.queue = $scope.queue || [];
        $scope.clear = function (files) {
          var queue = this.queue,
            i = queue.length,
            file = files,
            length = 1;
          if (angular.isArray(files)) {
            file = files[0];
            length = files.length;
          }
          while (i) {
            i -= 1;
            if (queue[i] === file) {
              return queue.splice(i, length);
            }
          }
        };
        $scope.replace = function (oldFiles, newFiles) {
          var queue = this.queue,
            file = oldFiles[0],
            i,
            j;
          for (i = 0; i < queue.length; i += 1) {
            if (queue[i] === file) {
              for (j = 0; j < newFiles.length; j += 1) {
                queue[i + j] = newFiles[j];
              }
              return;
            }
          }
        };
        $scope.applyOnQueue = function (method) {
          var list = this.queue.slice(0),
            i,
            file;
          for (i = 0; i < list.length; i += 1) {
            file = list[i];
            if (file[method]) {
              file[method]();
            }
          }
        };
        $scope.submit = function () {
          this.applyOnQueue('$submit');
        };
        $scope.cancel = function () {
          this.applyOnQueue('$cancel');
        };
        // Add upload methods to the scope:
        angular.extend($scope, uploadMethods);
        // The fileupload widget will initialize with
        // the options provided via "data-"-parameters,
        // as well as those given via options object:
        $element.fileupload(angular.extend(
            {scope: $scope},
            fileUpload.defaults
          )).on('fileuploadadd', function (e, data) {
          data.scope = $scope;
        }).on('fileuploadfail', function (e, data) {
          if (data.errorThrown === 'abort') {
            return;
          }
          if (data.dataType &&
            data.dataType.indexOf('json') === data.dataType.length - 4) {
            try {
              data.result = angular.fromJson(data.jqXHR.responseText);
            } catch (ignore) {
            }
          }
        }).on([
          'fileuploadadd',
          'fileuploadsubmit',
          'fileuploadsend',
          'fileuploaddone',
          'fileuploadfail',
          'fileuploadalways',
          'fileuploadprogress',
          'fileuploadprogressall',
          'fileuploadstart',
          'fileuploadstop',
          'fileuploadchange',
          'fileuploadpaste',
          'fileuploaddrop',
          'fileuploaddragover',
          'fileuploadchunksend',
          'fileuploadchunkdone',
          'fileuploadchunkfail',
          'fileuploadchunkalways',
          'fileuploadprocessstart',
          'fileuploadprocess',
          'fileuploadprocessdone',
          'fileuploadprocessfail',
          'fileuploadprocessalways',
          'fileuploadprocessstop'
        ].join(' '), function (e, data) {
          if ($scope.$emit(e.type, data).defaultPrevented) {
            e.preventDefault();
          }
        }).on('remove', function () {
          // Remove upload methods from the scope,
          // when the widget is removed:
          var method;
          for (method in uploadMethods) {
            if (uploadMethods.hasOwnProperty(method)) {
              delete $scope[method];
            }
          }
        });
        // Observe option changes:
        $scope.$watch(
          $attrs.fileUpload,
          function (newOptions) {
            if (newOptions) {
              $element.fileupload('option', newOptions);
            }
          }
        );
      }
    ])

    // Provide File Upload progress feedback:
    .controller('FileUploadProgressController', [
      '$scope', '$attrs', '$parse',
      function ($scope, $attrs, $parse) {
        var fn = $parse($attrs.fileUploadProgress),
          update = function () {
            var progress = fn($scope);

            if (!progress || !progress.total) {
              return;
            }
            $scope.num = Math.floor(
              progress.loaded / progress.total * 100
            );
          };
        update();
        $scope.$watch(
          $attrs.fileUploadProgress + '.loaded',
          function (newValue, oldValue) {
            if (newValue !== oldValue) {
              update();
            }
          }
        );
      }
    ])

    // Display File Upload previews:
    .controller('FileUploadPreviewController', [
      '$scope', '$element', '$attrs',
      function ($scope, $element, $attrs) {
        $scope.$watch(
          $attrs.fileUploadPreview + '.preview',
          function (preview) {
            $element.empty();
            if (preview) {
              $element.append(preview);
            }
          }
        );
      }
    ])

    .directive('fileUpload', function () {
      return {
        controller: 'FileUploadController',
        scope: true
      };
    })

    .directive('fileUploadProgress', function () {
      return {
        controller: 'FileUploadProgressController',
        scope: true
      };
    })

    .directive('fileUploadPreview', function () {
      return {
        controller: 'FileUploadPreviewController'
      };
    })

    // Enhance the HTML5 download attribute to
    // allow drag&drop of files to the desktop:
    .directive('download', function () {
      return function (scope, elm) {
        elm.on('dragstart', function (e) {
          try {
            e.originalEvent.dataTransfer.setData(
              'DownloadURL',
              [
                'application/octet-stream',
                elm.prop('download'),
                elm.prop('href')
              ].join(':')
            );
          } catch (ignore) {
          }
        });
      };
    });

}));
/*
 * jQuery File Upload Plugin Angular JS Example 1.2.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global angular */

(function () {
  'use strict';
  var app = angular.module('uploadModule', [
    'blueimp.fileupload'
  ]);

  app.directive('ngUploadForm', ['$rootScope', 'fileUpload', function () {
      return {
        restrict: 'EA',
        templateUrl: './templates/fileform.html',
        scope: {
          allowed: '@',
          url: '@',
          autoUpload: '@',
          sizeLimit: '@',
          ngModel: '=',
          name: '@'
        },
        controller: function ($rootScope, $scope, $element, fileUpload) {
          $scope.$on('fileuploaddone', function (e, data) {
            fileUpload.addFieldData($scope.name, data._response.result.files[0].result);
          });

          $scope.options = {
            url: $scope.url,
            dropZone: $element,
            maxFileSize: $scope.sizeLimit,
            autoUpload: $scope.autoUpload
          };
          $scope.loadingFiles = false;

          if (!$scope.queue) {
            $scope.queue = [];
          }

          var generateFileObject = function generateFileObjects(objects) {
            angular.forEach(objects, function (value, key) {
              var fileObject = {
                name: value.filename,
                size: value.length,
                url: value.url,
                thumbnailUrl: value.url,
                deleteUrl: value.url,
                deleteType: 'DELETE',
                result: value
              };

              if (fileObject.url && fileObject.url.charAt(0) !== '/') {
                fileObject.url = '/'+fileObject.url;
              }

              if (fileObject.deleteUrl && fileObject.deleteUrl.charAt(0) !== '/') {
                fileObject.deleteUrl = '/'+fileObject.deleteUrl;
              }

              if (fileObject.thumbnailUrl && fileObject.thumbnailUrl.charAt(0) !== '/') {
                fileObject.thumbnailUrl = '/'+fileObject.thumbnailUrl;
              }

              $scope.queue[key] = fileObject;
            });
          };
          fileUpload.registerField($scope.name);
          $scope.filequeue = fileUpload.fieldData[$scope.name];

          $scope.$watchCollection('filequeue', function (newval) {
            generateFileObject(newval);
          });
        }
      };
    }])
    .controller('FileDestroyController', ['$rootScope', '$scope', '$http', 'fileUpload', function ($rootScope, $scope, $http, fileUpload) {
      var file = $scope.file,
        state;

      if ($scope.$parent && $scope.$parent.$parent && $scope.$parent.$parent.$parent.name) {
        $scope.fieldname = $scope.$parent.$parent.$parent.name;
      }

      if (!fileUpload.fieldData[$scope.name]) {
        fileUpload.fieldData[$scope.name] = [];
      }

      $scope.filequeue = fileUpload.fieldData;

      if (file.url) {
        file.$state = function () {
          return state;
        };
        file.$destroy = function () {
          state = 'pending';
          return $http({
            url: file.deleteUrl,
            method: file.deleteType
          }).then(
            function () {
              state = 'resolved';
              fileUpload.removeFieldData($scope.fieldname, file.result._id);
              $scope.clear(file);
            },
            function () {
              state = 'rejected';
              fileUpload.removeFieldData($scope.fieldname, file.result._id);
              $scope.clear(file);
            }
          );


        };
      } else if (!file.$cancel && !file._index) {
        file.$cancel = function () {
          $scope.clear(file);
        };
      }
    }
    ]);
})();