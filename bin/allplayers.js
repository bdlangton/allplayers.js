/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/** The drupal namespace. */
var drupal = drupal || {};

/** Determine if we have storage. */
drupal.hasStorage = (typeof(Storage) !== 'undefined');
drupal.hasStorage &= (typeof(JSON) !== 'undefined');

/**
 * Retrieve an item out of local storage.
 *
 * @param {string} key The key for the object to retrieve.
 * @return {object} The object that was retrieved.
 */
drupal.retrieve = function(key) {
  var object = null;

  // Check to see if we have storage.
  if (key && drupal.hasStorage) {

    // Get it out of localStorage.
    if (object = JSON.parse(localStorage.getItem(key))) {

      // Make sure this object hasn't expired.
      if ((new Date()).getTime() > object.expires) {

        // Clear it if it has.
        localStorage.removeItem(key);
        object = {};
      }
    }
  }

  return object;
};

/**
 * Store an object with an expiration.
 *
 * @param {string} key The key for the object to store.
 * @param {object} object They object to store.
 * @param {number} expires The expiration (in seconds) for this object.
 */
drupal.store = function(key, object, expires) {

  // Default the expiration if it wasn't provided.
  expires = expires || 3600;

  // Make sure we can store.
  if (key && drupal.hasStorage) {

    // Set an expiration date for this object.
    object.expires = (expires * 1000) + (new Date()).getTime();

    // Store this object in localStorage.
    localStorage.setItem(key, JSON.stringify(object));
  }
};

/**
 * Clears an object out of storage.
 *
 * @param {string} key The key for this object to clear.
 */
drupal.clear = function(key) {
  if (key && drupal.hasStorage) {
    localStorage.removeItem(key);
  }
};

/**
 * The Drupal API class.  This is a static class helper
 * to assist in communication between javascript and
 * a Drupal CMS backend.
 *
 * @return {object} The API object.
 */
drupal.api = function() {
  return {

    /** The resource within this endpoint */
    resource: '',
    cacheId: '',

    /** See if we are dealing with jQuery Mobile applications. */
    isMobile: jQuery.hasOwnProperty('mobile'),

    /**
     * The Services API endpoint
     *
     * @this {object} The drupal.api object.
     * @return {string} The services endpoint.
     **/
    endpoint: function() {
      return drupal.endpoint || '';
    },

    /**
     * Helper function to get the Services URL for this resource.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object involved with in this request.
     * @return {string} The path to the API endpoint.
     */
    getURL: function(entity) {
      // If the entity has a valid URI, then use that...
      if (entity && entity.uri) {
        return entity.uri;
      }
      else {

        // Otherwise, build our best guess for the URI of this entity.
        var path = this.endpoint();
        path += this.resource ? ('/' + this.resource) : '';
        path += (entity && entity.id) ? ('/' + entity.id) : '';
        return path;
      }
    },

    /**
     * Called when we are loading or not.
     *
     * @param {boolean} loading If this api is loading something.
     * @this Points to the drupal.api object.
     */
    loading: function(loading) {
      if (this.isMobile) {
        if (loading) {
          jQuery('body').addClass('ui-loading');
        }
        else {
          jQuery('body').removeClass('ui-loading');
        }
      }
    },

    /**
     * API function to act as a generic request for all Service calls.
     *
     * @this {object} The drupal.api object.
     * @param {string} url The URL where the request will go.
     * @param {string} dataType The type of request.  json or jsonp.
     * @param {string} type The type of HTTP request.  GET, POST, PUT, etc.
     * @param {object} data The data to send to the server.
     * @param {function} callback The function callback.
     */
    call: function(url, dataType, type, data, callback) {
      var request = {
        url: url,
        dataType: dataType,
        type: type,
        success: (function(api) {
          return function(data, textStatus) {
            api.loading(false);
            if (textStatus == 'success') {
              if (callback) {
                callback(data);
              }
            }
            else {
              console.log('Error: ' + textStatus);
            }
          };
        })(this),
        error: (function(api) {
          return function(xhr, ajaxOptions, thrownError) {
            api.loading(false);
            console.log(xhr.statusText);
            if (callback) {
              callback(null);
            }
          };
        })(this)
      };

      if (data) {
        request['data'] = data;
      }

      // Show a loading cursor.
      this.loading(true);

      // Make the request.
      jQuery.ajax(request);
    },

    /**
     * API function to get any results from the drupal API.
     *
     * Return the object.
     *
     *  drupal.api.get(entity, function(object) {
     *    console.log(object);
     *  });
     *
     * Return a list of events within an entity.
     *
     *  drupal.api.get(entity, 'events', function(events) {
     *    console.log(events);
     *  });
     *
     * Return a list of nodes with type='page'.
     *
     *  drupal.api.get({}, {type:'page'}, function(object) {
     *
     *  });
     *
     * Return a list of events provided a query within a node.
     *
     *  drupal.api.get(entity, 'events', {month: 6}, functoin(events) {
     *    console.log(events);
     *  });
     *
     *
     * @this {object} The drupal.api object.
     * @param {object} object The object of the item we are getting..
     * @param {string} endpoint An additional endpoint to add onto the resource.
     * @param {object} query key-value pairs to add to the query of the URL.
     * @param {function} callback The callback function.
     * @param {boolean} cache cache/get the results in/from localStorage.
     */
    get: function(object, endpoint, query, callback, cache) {
      // Normalize the arguments based on the different schemes of calling this.
      var type = (typeof endpoint);
      if (type === 'object') {
        callback = query;
        query = endpoint;
        endpoint = '';
      }
      else if (type === 'function') {
        callback = endpoint;
        endpoint = '';
      }

      // Get the url for this object.
      var url = this.getURL(object);
      url += (endpoint) ? ('/' + endpoint) : '';
      url += '.jsonp';
      url += query ? ('?' + decodeURIComponent(jQuery.param(query, true))) : '';

      // See if we should cache the result.
      if (cache) {
        this.cacheId = url.replace(/[^A-z0-9\-]/g, '');
        var storage = drupal.retrieve(this.cacheId);
        if (storage && (storage.url === url)) {
          callback(storage.data);
          return;
        }
      }

      // No cache exists, so make the server call.
      this.call(url, 'jsonp', 'GET', null, (function(api) {
        return function(data) {

          // Store this in cache...
          if (cache) {
            drupal.store(api.cacheId, {
              url: url,
              data: data
            });
          }

          // Store the result.
          callback(data);
        }
      })(this));
    },

    /**
     * API function to perform an action.
     *
     * @this {object} The drupal.api object.
     * @param {string} action The action to perform.
     * @param {object} object The entity object to set.
     * @param {function} callback The callback function.
     */
    execute: function(action, object, callback) {
      var url = this.getURL(object) + '/' + action;
      this.call(url, 'json', 'POST', object, callback);
    },

    /**
     * API function to save the value of an object using Services.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The entity object to set.  If the object does not
     * have an ID, then this will create a new entity, otherwise, it will simply
     * update the existing resource.
     *
     * @param {function} callback The callback function.
     *
     */
    save: function(object, callback) {
      var type = object.id ? 'PUT' : 'POST';
      this.call(this.getURL(object), 'json', type, object, callback);
    },

    /**
     * API function to remove an object on the server.
     *
     * @this {object} The drupal.api object.
     * @param {object} object The entity object to delete.
     * @param {function} callback The callback function.
     */
    remove: function(object, callback) {

      // Remove the storage if the cacheID exists.
      if (this.cacheId) {
        drupal.clear(this.cacheId);
      }

      // Call to delete the resource.
      this.call(this.getURL(object), 'json', 'DELETE', null, callback);
    }
  };
};
// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @class The base entity class to store the data that is common to all
 * drupal entities whether it be groups, events, users, etc.
 *
 * @param {object} object The entity object.
 * @param {function} callback The callback function to get the object.
 * @param {object} options Options used to govern functionality.
 */
drupal.entity = function(object, callback, options) {

  // Set the options.
  this.options = jQuery.extend({
    store: true,
    expires: 3600
  }, (typeof options === 'undefined') ? {} : options);

  // If the object is valid, then set it...
  if (object) {
    this.properties = {};
    this.set(object);
  }

  // If the callback is valid, then load it...
  if (callback) {
    this.load(callback);
  }
};

/**
 * Returns an index of entities.
 *
 * @param {object} object The object to create for each entity.
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.entity.index = function(object, query, callback, options) {

  // Set the default options.
  options = jQuery.extend({
    store: true
  }, options || {});

  // Don't require a query...
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  // Get the list of entities.
  var instance = new object({});
  instance.api.get({}, instance.getQuery(query), function(entities) {
    if (entities) {
      var i = entities.length;
      while (i--) {
        entities[i] = new object(entities[i], null, options);
      }
    }
    if (callback) {
      callback(entities);
    }
  }, options.store);
};

/**
 * Sets the defaults for an entities properties, and also defines
 * what the public properties are when GET is performed on this
 * object.
 *
 * @param {object} defaults The defaults for the properties being set.
 * @param {object} object The object used to set the properties.
 */
drupal.entity.prototype.setProperties = function(defaults, object) {
  if (defaults) {
    for (var name in defaults) {
      this[name] = object[name] || this[name] || defaults[name];
      this.properties[name] = name;
    }
  }
};

/**
 * Update an object.
 *
 * @param {object} object The object which contains the data.
 * @param {function} callback The function to call when it is done updating.
 */
drupal.entity.prototype.update = function(object, callback) {

  // Set the object.
  if (object) {
    this.set(object);
  }

  // Now callback that this object has been updated.
  if (callback) {
    callback.call(this, this);
  }
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.entity.prototype.set = function(object) {

  /** The API for this entity */
  this.api = this.api || null;

  // Set the properties for this entity.
  this.setProperties({
    id: '',
    uri: ''
  }, object);

  /** The name of this entity. */
  this.entityName = 'entity';
};

/**
 * Returns the object in JSON form.
 *
 * @return {object} The object representation of this entity.
 */
drupal.entity.prototype.get = function() {
  var object = {};
  if (this.properties) {
    for (var name in this.properties) {
      object[name] = this[name];
    }
  }
  return object;
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.entity.prototype.getPOST = function() {
  var object = this.get();
  if (!object.id) {
    delete object.id;
  }
  return object;
};

/**
 * Gets the query variables.
 *
 * @param {object} query The query variables.
 * @return {object} The query variables.
 */
drupal.entity.prototype.getQuery = function(query) {
  return query || {};
};

/**
 * Loads and object using the drupal.api.
 *
 * @param {function} callback The callback function when the object is
 * retrieved.
 */
drupal.entity.prototype.load = function(callback) {

  // If this isn't a valid object, then return null...
  if (!this.id) {
    callback(null);
  }

  if (this.api) {

    // Call the API.
    this.api.get(this.get(), {}, (function(entity) {
      return function(object) {

        // If no object is returned, then return null.
        if (!object) {
          callback(null);
        }

        // Update the object.
        entity.update(object, callback);
      };
    })(this), this.options.store);
  }
};

/**
 * Saves this entity.
 *
 * @param {function} callback The function called once entity is saved.
 */
drupal.entity.prototype.save = function(callback) {

  // Check to see if the api is valid.
  if (this.api) {

    // Call the api.
    this.api.save(this.getPOST(), (function(entity) {
      return function(object) {
        entity.update(object, callback);
      };
    })(this));
  }
};

/**
 * Removes an entity
 *
 * @param {function} callback The function called once entity is removed.
 */
drupal.entity.prototype.remove = function(callback) {

  // Only remove if they have an ID.
  if (this.id) {

    // Call the API.
    this.api.remove(this.get(), callback);
  }
};
// The drupal namespace.
var drupal = drupal || {};

/*!
 * Modified from...
 *
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
/**
 * Add a way to store cookies.
 *
 * @param {string} key The key for the cookie.
 * @param {string} value The value of the cookie.
 * @param {object} options The options for the cookie storage.
 * @return {string} The results of the storage.
 */
drupal.cookie = function(key, value, options) {

  // key and at least value given, set cookie...
  if (arguments.length > 1 &&
     (!/Object/.test(Object.prototype.toString.call(value)) ||
      value === null ||
      value === undefined)) {
    options = $.extend({}, options);

    if (value === null || value === undefined) {
      options.expires = -1;
    }

    if (typeof options.expires === 'number') {
      var days = options.expires, t = options.expires = new Date();
      t.setDate(t.getDate() + days);
    }

    value = String(value);

    // use expires attribute, max-age is not supported by IE
    return (document.cookie = [encodeURIComponent(key), '=',
    options.raw ? value : encodeURIComponent(value),
    options.expires ? '; expires=' + options.expires.toUTCString() : '',
    options.path ? '; path=' + options.path : '',
    options.domain ? '; domain=' + options.domain : '',
    options.secure ? '; secure' : ''].join(''));
  }

  // key and possibly options given, get cookie...
  options = value || {};
  var decode = options.raw ? function(s) {
    return s;
  } : decodeURIComponent;

  var pairs = document.cookie.split('; ');
  for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
    if (decode(pair[0]) === key)
      return decode(pair[1] || '');
  }
  return null;
};

/**
 * @constructor
 * @class The system class
 *
 * @param {function} callback The function to be called once the system has
 * connected.
 * @param {object} options Options used to govern functionality.
 */
drupal.system = function(callback, options) {
  drupal.entity.call(this, {}, callback, options);
};

/** Derive from entity. */
drupal.system.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.system.prototype.constructor = drupal.system;

/** Declare the system api. */
drupal.system.api = jQuery.extend(new drupal.api(), {
  resource: 'system'
});

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.system.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'system';

  /** Set the api. */
  this.api = drupal.system.api;

  /** Set current user. */
  this.user = new drupal.user(object.user);
  this.user.setSession(object.session_name, object.sessid);
};

/**
 * Returns the object.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.system.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    user: this.user.get()
  });
};

/**
 * Loads the server.
 *
 * @param {function} callback The callback function.
 */
drupal.system.prototype.load = function(callback) {

  // Connect to the server.
  this.api.execute('connect', null, (function(system) {
    return function(object) {
      system.update(object, callback);
    };
  })(this));
};

/**
 * Get a variable from the server.
 *
 * @param {string} name The variable you wish to retrieve.
 * @param {string} def The default value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.get_variable = function(name, def, callback) {
  this.api.execute('get_variable', {
    name: name,
    'default': def
  }, callback);
};

/**
 * Set a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {string} value The value of the variable.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.set_variable = function(name, value, callback) {
  this.api.execute('set_variable', {
    name: name,
    value: value
  }, callback);
};

/**
 * Delete a variable on the server.
 *
 * @param {string} name The variable you wish to set.
 * @param {function} callback The callback function.
 */
drupal.system.prototype.del_variable = function(name, callback) {
  this.api.execute('del_variable', {
    name: name
  }, callback);
};
// The drupal namespace.
var drupal = drupal || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The node class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
drupal.node = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from entity. */
drupal.node.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.node.prototype.constructor = drupal.node;

/** Declare the node api. */
drupal.node.api = jQuery.extend(new drupal.api(), {
  resource: 'node'
});

/**
 * Returns an index of nodes.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.node.index = function(query, callback, options) {
  drupal.entity.index(drupal.node, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.node.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'node';

  /** Set the api to the drupal.node.api. */
  this.api = drupal.node.api;

  /** Set the ID based on the nid. */
  this.id = object.nid || this.id || 0;

  // Set the properties for this entity.
  this.setProperties({
    nid: 0,
    title: '',
    type: '',
    status: 0,
    uid: 0
  }, object);
};

/**
 * Override the getQuery method of the entity.
 *
 * @param {object} query The query variables.
 * @return {object} The query variables.
 */
drupal.node.prototype.getQuery = function(query) {
  query = drupal.entity.prototype.getQuery.call(this, query);
  if (query.type) {
    query['parameters[type]'] = query.type;
    delete query.type;
  }
  return query;
};
// The drupal namespace.
var drupal = drupal || {};

/** The current logged in user. */
drupal.current_user = null;

/**
 * @constructor
 * @extends drupal.entity
 * @class The user class
 *
 * @param {object} object The user object.
 * @param {function} callback The function to be called once the user has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
drupal.user = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from drupal.entity. */
drupal.user.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.user.prototype.constructor = drupal.user;

/** Declare the user api. */
drupal.user.api = jQuery.extend(new drupal.api(), {
  resource: 'user'
});

/**
 * Returns an index of users.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
drupal.user.index = function(query, callback, options) {
  drupal.entity.index(drupal.user, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.user.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'user';

  /** Set the api. */
  this.api = drupal.user.api;

  /** Set the ID based on the uid. */
  this.id = object.uid || this.id || 0;

  /** Set the password. */
  this.pass = object.pass || this.pass || '';

  // Set the properties for this entity.
  this.setProperties({
    name: '',
    mail: '',
    status: 1
  }, object);
};

/**
 * Sets a user session.
 *
 * @param {string} name The name of the session.
 * @param {string} sessid The session ID.
 */
drupal.user.prototype.setSession = function(name, sessid) {

  /** Set the session id for this user. */
  this.sessid = sessid;

  // Only set the session name if this user is valid and has a session name.
  if (this.id && name) {

    /** Set the session name for this user. */
    this.session_name = name;

    /** Now store this in a cookie for further authentication. */
    drupal.cookie(name, sessid);

    // Now store this user as the 'current' user.
    drupal.current_user = this;
  }
};

/**
 * Login a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.login = function(callback) {
  if (this.api) {
    this.api.execute('login', {
      username: this.name,
      password: this.pass
    }, (function(user) {
      return function(object) {

        // Update this object.
        user.update(object.user);

        // Set the session.
        user.setSession(object.session_name, object.sessid);

        if (callback) {
          callback.call(user, user);
        }
      };
    })(this));
  }
};

/**
 * Register a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.register = function(callback) {
  if (this.api) {
    this.api.execute('register', this.getPOST(), (function(user) {
      return function(object) {
        user.update(object, callback);
      };
    })(this));
  }
};

/**
 * Logout the user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.logout = function(callback) {
  if (this.api) {
    this.api.execute('logout', null, callback);
  }
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.user.prototype.getPOST = function() {

  // Add the password to POST's only.
  var post = drupal.entity.prototype.getPOST.call(this);
  post.pass = this.pass;
  return post;
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @class The date class wraps up the AllPlayers Date-Time object used in
 * several parameters for Event creation, etc.
 *
 * <p><strong>Usage:</strong></p>
 * <pre><code>
 *   var start = new Date('2010-09-01T00:00:00');  // Start on 9-1-2011
 *   var end = new Date('2012-09-20T00:00:00');    // End on 9-20-2012
 *   var repeat = {
 *     interval:1,                            // The repeat interval.
 *     freq:'DAILY',                          // Repeat Daily
 *     until:new Date('2012-09-04T00:00:00'), // Go until 9-4-2012
 *     bymonth: ['1'],                        // January
 *     bymonthday: ['3'],                     // 3rd of the month.
 *     byday: [
 *       'SU' => 'SU',                        // Sunday
 *       '+1MO' => '+1MO',                    // First Monday of the Month
 *       '+2WED' => '+2WED',                  // 2nd Wed of the month
 *     ],
 *     exdate: [
 *       '2011-09-04T00:00:00'                // Except 9-4-2011
 *       '2011-10-03T00:00:00'                // Except 10-3-2011
 *     ],
 *     rdate: [
 *       '2011-09-01T00:00:00'                // Add 9-1-2011
 *       '2011-10-04T00:00:00'                // ADD 10-4-2011
 *     ]
 *   };
 *
 *   // Create a new AllPlayers Date object.
 *   var date = new allplayers.date(start, end, repeat);
 *
 *   // Add additional exceptions.
 *   date.addException('2011-09-10T00:00:00');
 *
 *   // Add additional dates.
 *   date.addRDate('2011-10-10T00:00:00');
 * </code></pre>
 *
 * @param {Date} start The start date.
 * @param {Date} end The end date.
 * @param {object} repeat The repeat rule. In the following form.
 */
allplayers.date = function(start, end, repeat) {

  /**
   * Creates a new date based on a parameter which could be a string, Date
   * object, or nothing...
   *
   * @param {optional} date Either a date string, Date object, or nothing...
   * @return {Date} A JavaScript Date object.
   */
  this.newDate = function(date) {
    if (typeof date === 'string') {
      return new Date(date);
    }
    else if (typeof date === 'object') {
      return date;
    }
    else {
      return new Date();
    }
  };

  /** The start date */
  this.start = this.newDate(start);

  /** The end date */
  this.end = this.newDate(end);

  /** The repeat rule */
  this.repeat = repeat ? {
    interval: (repeat.interval ? repeat.interval : 1),
    freq: (repeat.freq ? repeat.freq : 'DAILY'),
    until: this.newDate(repeat.until),
    bymonth: (repeat.bymonth ? repeat.bymonth : []),
    bymonthday: (repeat.bymonthday ? repeat.bymonthday : []),
    byday: (repeat.byday ? repeat.byday : []),
    exdate: (repeat.exdate ? repeat.exdate : []),
    rdate: (repeat.rdate ? repeat.rdate : [])
  } : null;
};

// Need to fix the Date prototype to allow toISOString.
if (!Date.prototype.toISOString) {
  function padzero(n) {
    return n < 10 ? '0' + n : n;
  }
  function pad2zeros(n) {
    if (n < 100) {
      n = '0' + n;
    }
    if (n < 10) {
      n = '0' + n;
    }
    return n;
  }

  /**
   * Provide a toISOString method to the Date prototype.
   *
   * @return {string} An ISO string representation of the date object.
   */
  Date.prototype.toISOString = function() {
    var ISOString = this.getUTCFullYear() + '-';
    ISOString += padzero(this.getUTCMonth() + 1) + '-';
    ISOString += padzero(this.getUTCDate()) + 'T';
    ISOString += padzero(this.getUTCHours()) + ':';
    ISOString += padzero(this.getUTCMinutes()) + ':';
    ISOString += padzero(this.getUTCSeconds()) + '.';
    ISOString += pad2zeros(this.getUTCMilliseconds()) + 'Z';
    return ISOString;
  };
}

/**
 * Updates the date start and end dates and repeat rule.
 *
 * @param {Date} start The new start date.
 * @param {Date} end The new end date.
 * @param {object} repeat The new repeat rule.
 */
allplayers.date.prototype.update = function(start, end, repeat) {
  this.start = start ? this.newDate(start) : this.start;
  this.end = end ? this.newDate(end) : this.end;
  if (repeat) {
    repeat.until = this.newDate(repeat.until);
    jQuery.extend(this.repeat, repeat);
  }
};

/**
 * Adds a generic new date to repeat rule.
 *
 * @param {string} param The repeat rule parameter to set.
 * @param {optional} date Either a date string, Date object, or nothing...
 */
allplayers.date.prototype.addDate = function(param, date) {

  // Normalize the date parameter.
  date = this.newDate(date);

  // Add this date.
  this.repeat[param].push(date);
};

/**
 * Add's an exception date to the repeat rule.
 *
 * @param {Date} except An exception date to remove from the repeat rule.
 */
allplayers.date.prototype.addException = function(except) {

  // Add an exception.
  this.addDate('except', except);
};

/**
 * Adds an additional date to the repeat rule.
 *
 * @param {Date} addition An additional date to add to the repeat rule.
 */
allplayers.date.prototype.addRDate = function(addition) {

  // Add an addition.
  this.addDate('rdate', addition);
};

/**
 * Returns the object which will be passed to the services API.
 *
 * @return {object} The JSON object representation of this object.
 */
allplayers.date.prototype.get = function() {
  var i = 0;
  var obj = {
    start: this.start.toISOString(),
    end: this.end.toISOString()
  };

  // If there is a repeat rule, then add that to the object.
  if (this.repeat) {
    obj.repeat = {
      interval: this.repeat.interval,
      freq: this.repeat.freq,
      until: this.repeat.until.toISOString(),
      bymonth: this.repeat.bymonth,
      bymonthday: this.repeat.bymonthday,
      byday: this.repeat.byday,
      exdate: [],
      rdate: []
    };

    // Iterate through the exdate and rdate and add the date strings.
    i = this.repeat.exdate.length;
    while (i--) {
      obj.repeat.exdate.push(this.repeat.exdate[i].toISOString());
    }

    i = this.repeat.rdate.length;
    while (i--) {
      obj.repeat.rdate.push(this.repeat.rdate[i].toISOString());
    }
  }

  return obj;
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers event class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.event = function(object, callback, options) {
  drupal.node.call(this, object, callback, options);
};

/** Derive from node. */
allplayers.event.prototype = new drupal.node();

/** Reset the constructor. */
allplayers.event.prototype.constructor = allplayers.event;

/** Declare the event api. */
allplayers.event.api = jQuery.extend(new drupal.api(), {
  resource: 'events'
});

/**
 * Returns an index of events.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
allplayers.event.index = function(query, callback, options) {
  drupal.entity.index(allplayers.event, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.event.prototype.set = function(object) {
  drupal.node.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'event';

  /** Set the api to the drupal.node.api. */
  this.api = allplayers.event.api;

  /** Set the id based on the uuid of the object. */
  this.id = object.uuid || object.id || this.id || '';

  // Set the values for this entity.
  this.setProperties({
    allDay: false,
    gids: [],
    description: '',
    resources: [],
    competitors: {},
    category: 'Other'
  }, object);

  /** The date-time object */
  this.date = new allplayers.date(object.start, object.end);
  this.start = this.date.start;
  this.end = this.date.end;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.event.prototype.get = function() {
  return jQuery.extend(drupal.node.prototype.get.call(this), {
    allDay: this.allDay,
    gids: this.gids,
    description: this.description,
    resources: this.resources,
    competitors: this.competitors,
    category: this.category,
    date_time: this.date.get()
  });
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers event class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.group = function(object, callback, options) {
  drupal.node.call(this, object, callback, options);
};

/** Derive from node. */
allplayers.group.prototype = new drupal.node();

/** Reset the constructor. */
allplayers.group.prototype.constructor = allplayers.group;

/** Declare the event api. */
allplayers.group.api = jQuery.extend(new drupal.api(), {
  resource: (window.location.hostname.indexOf('store') == -1) ?
    'groups' : 'group_stores'
});

/**
 * Returns an index of groups.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
allplayers.group.index = function(query, callback, options) {
  drupal.entity.index(allplayers.group, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.group.prototype.set = function(object) {
  drupal.node.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'group';

  /** Set the api. */
  this.api = allplayers.group.api;

  /** Set the id based on the uuid of the object. */
  this.id = object.uuid || object.id || this.id || '';

  /** See if this group has children. */
  var has_value = object.hasOwnProperty('has_children');
  this.has_children = has_value ? object.has_children : !!this.has_children;

  /** A {@link allplayers.location} object. */
  this.location = object.location || this.location || new allplayers.location();

  // Set the values for this entity.
  this.setProperties({
    activity_level: 0,
    list_in_directory: 0,
    active: false,
    registration_fees_enabled: '',
    approved_for_payment: '',
    accept_amex: '',
    primary_color: '',
    secondary_color: '',
    node_status: 0,
    logo: '',
    url: '',
    groups_above_uuid: [],
    registration_link: '',
    registration_text: ''
  }, object);
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.group.prototype.get = function() {
  return jQuery.extend(drupal.node.prototype.get.call(this), {
    location: this.location.get(),
    activity_level: this.activity_level,
    list_in_directory: this.list_in_directory,
    active: this.active,
    registration_fees_enabled: this.registration_fees_enabled,
    approved_for_payment: this.approved_for_payment,
    accept_amex: this.accept_amex,
    primary_color: this.primary_color,
    secondary_color: this.secondary_color,
    node_status: this.node_status,
    logo: this.logo,
    uri: this.uri,
    url: this.url,
    groups_above_uuid: this.groups_above_uuid,
    registration_link: this.registration_link,
    registration_text: this.registration_text
  });
};

/**
 * Returns the events for this group.
 *
 * @param {object} query An object of the following parameters.
 * <ul>
 * <li><strong>start</strong> - The start date to get the events.</li>
 * <li><strong>end</strong> - The end date to get the events.</li>
 * <li><strong>fields</strong> - The fields to get.</li>
 * <li><strong>limit</strong> - The limit of events to get.</li>
 * <li><strong>offset</strong> - The offset of events for pagination.</li>
 * </ul>
 *
 * @param {function} callback The callback function to get the events.
 */
allplayers.group.prototype.getEvents = function(query, callback) {

  // Get the events within this group.
  this.api.get(this, 'events', query, function(events) {

    // Iterate through the events and create an event object out of them.
    for (var i in events) {
      events[i] = new allplayers.event(events[i]);
    }

    // Call the callback.
    callback(events);
  }, true);
};

/**
 * Returns the upcoming events for this group.
 *
 * @param {object} query An object of the following parameters.
 * <ul>
 * <li><strong>start</strong> - The start date to get the events.</li>
 * <li><strong>end</strong> - The end date to get the events.</li>
 * <li><strong>fields</strong> - The fields to get.</li>
 * <li><strong>limit</strong> - The limit of events to get.</li>
 * <li><strong>offset</strong> - The offset of events for pagination.</li>
 * </ul>
 *
 * @param {function} callback The callback function to get the events.
 */
allplayers.group.prototype.getUpcomingEvents = function(query, callback) {

  // Get the events within this group.
  this.api.get(this, 'events/upcoming', query, function(events) {

    // Iterate through the events and create an event object out of them.
    for (var i in events) {
      events[i] = new allplayers.event(events[i]);
    }

    // Call the callback.
    callback(events);
  }, true);
};

/**
 * Returns a hierachy tree of all the subgroups within this group.
 *
 * @param {object} query The query to add to the subgroups tree call.
 * @param {function} callback The callback function to get the subgroup tree.
 */
allplayers.group.prototype.getGroupTree = function(query, callback) {

  // Get the subgroups tree.
  this.api.get(this, 'subgroups/tree', query, callback, false);
};

/**
 * Provide a tree search.
 *
 * @param {string} query The search string to use when searching.
 * @param {function} callback The callback function for this search.
 */
allplayers.group.prototype.find = function(query, callback) {

  // Search the subgroups.
  this.api.get(this, 'subgroups/find', {'query': query}, callback);
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers event class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.location = function(object, callback, options) {

  // Derive from drupal.entity.
  drupal.entity.call(this, object, callback, options);
};

/** Derive from drupal.entity. */
allplayers.location.prototype = new drupal.entity();

/** Reset the constructor */
allplayers.location.prototype.constructor = allplayers.location;

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.location.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);
  this.setProperties({
    street: 0,
    city: '',
    state: '',
    zip: '',
    country: '',
    latitude: '',
    longitude: ''
  }, object);
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.location.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    street: this.street,
    city: this.city,
    state: this.state,
    zip: this.zip,
    country: this.country,
    latitude: this.latitude,
    longitude: this.longitude
  });
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers product class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.product = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from node. */
allplayers.product.prototype = new drupal.entity();

/** Reset the constructor. */
allplayers.product.prototype.constructor = allplayers.product;

/** Declare the product api. */
allplayers.product.api = jQuery.extend(new drupal.api(), {
  resource: 'products'
});

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.product.prototype.get = function() {
  return jQuery.extend(drupal.node.prototype.get.call(this), {
    uri: this.uri
  });
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.product.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'product';

  /** Set the api. */
  this.api = allplayers.product.api;

  /** Set the id. */
  this.id = '';

  /** A {@link allplayers.location} object. */
  this.location = object.location || this.location || new allplayers.location();
};

/**
 * Returns the product.
 *
 * @param {string} uuid The UUID of the product to retrieve.
 * @param {function} callback The callback function to get the product.
 */
allplayers.product.prototype.getProduct = function(uuid, callback) {
  // Get the product.
  this.uri = 'https://' + window.location.host.replace('www', 'store');
  this.uri += '/api/v1/rest/products';
  this.api.get(this, uuid, '', callback);
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

(function($) {

  /** The default options. */
  var defaults = {
    dialog: '#calendar-dialog-form'
  };

  // Store all the calendar instances.
  allplayers.calendars = {};

  // Add a way to instanciate using jQuery prototype.
  if (!$.fn.allplayers_calendar) {
    $.fn.allplayers_calendar = function(options) {
      return $(this).each(function() {
        if (!allplayers.calendars[$(this).selector]) {
          new allplayers.calendar($(this), options);
        }
      });
    };
  }

  /**
   * @class The AllPlayers calendar JavaScript API
   *
   * <p><strong>Usage:</strong>
   * <pre><code>
   *
   *   // Create a calendar
   *   var player = $("#calendar").apcicalendar({
   *
   *   });
   *
   * </code></pre>
   * </p>
   *
   * @param {object} context The jQuery context.
   * @param {object} options This components options.
   */
  allplayers.calendar = function(context, options) {

    // Make sure we provide default options...
    var _this = this;
    options = $.extend(defaults, options, {
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      editable: true,
      dayClick: function(date, allDay, jsEvent, view) {
        console.log(date);
        console.log(allDay);
        console.log(jsEvent);
        console.log(view);
      },
      eventClick: function(event, jsEvent, view) {
        console.log(event);
        console.log(jsEvent);
        console.log(view);
        //_this.dialog.show().dialog();
      },
      eventDrop: function(event, jsEvent, ui, view) {

        // Save this event.
        event.obj.update(event);
        event.obj.save();
      },
      eventResizeStop: function(event, jsEvent, ui, view) {

        // Save this event.
        event.obj.update(event);
        event.obj.save();
      },
      events: function(start, end, callback) {
        _this.getEvents(start, end, callback);
      }
    });

    /** The calendar dialog to edit events */
    this.dialog = $(options.dialog, context).hide();

    // Store this player instance.
    allplayers.calendars[options.id] = this;

    // TO-DO: MAKE IT SO THAT WE DON'T NEED A GROUP TO GET EVENTS
    this.uuid = '';

    // Create the fullcalendar.
    context.fullCalendar(options);
  };

  allplayers.calendar.prototype.onEventClick = function() {
    console.log('Event has been clicked');
  };

  allplayers.calendar.prototype.getUUID = function(callback) {
    if (this.uuid) {
      callback.call(this);
    }
    else {
      var _this = this;
      var query = {search: 'Spring Soccer 2011'};
      allplayers.api.searchGroups(query, function(groups) {
        _this.uuid = groups[0].uuid;
        callback.call(_this);
      });
    }
  };

  /**
   * Get's all the events in this calendar.
   *
   * @param {Date} start The start timeframe.
   * @param {Date} end The end timeframe.
   * @param {function} callback The callback function to return the events.
   */
  allplayers.calendar.prototype.getEvents = function(start, end, callback) {

    // Format the start and end strings according to the AllPlayers API.
    var startString = start.getFullYear() + '-';
    startString += (start.getMonth() + 1) + '-';
    startString += start.getDate();

    var endString = end.getFullYear() + '-';
    endString += (end.getMonth() + 1) + '-';
    endString += end.getDate();

    this.getUUID(function() {
      allplayers.api.getGroupEvents(this.uuid, {
        start: startString,
        end: endString,
        fields: '*',
        limit: 0,
        offset: 0
      }, function(events) {

        // Iterate through the events and make them allplayers.event's
        var i = events.length;
        while (i--) {
          events[i].id = events[i].uuid;
          events[i].obj = new allplayers.event(events[i]);
        }

        // Add this to the events for the calendar.
        callback(events);
      });
    });
  };

}(jQuery));

/**
 *  moreorless.js - Developed by Travis Tidwell
 *
 *  http://github.com/travist/moreorless.js
 *
 *  Description:  This is an easy to use script that will make any element show
 *  more or less content.
 *
 *  License:  GPL version 3.
 */
(function($) {
  jQuery.fn.moreorless = function(min_height, more_text, less_text) {

    // Default the parameters.
    min_height = min_height || 100;
    more_text = more_text || 'more';
    less_text = less_text || 'less';

    // Iterate over each element.
    this.each(function() {

      // Define all the elements of interest.
      this.element = $(this);
      this.div_height = 0;
      this.forceHeight = false;

      // Create the link.
      if (!this.link) {
        this.link = $(document.createElement('div')).css({cursor: 'pointer'});
        this.link.addClass('moreorless_link');
      }

      // Set the content.
      if (!this.content) {
        this.content = this.element.wrap('<div></div>').parent();
        this.content.addClass('moreorless_content expanded');
      }

      // Create a wrapper.
      if (!this.wrapper) {
        this.wrapper = this.content.wrap('<div></div>').parent();
        this.wrapper.addClass('moreorless_wrapper').css('position', 'relative');
      }

      /**
       * Expands or de-expands the content area.
       *
       * @param {boolean} expand true - Expand, false - Unexpand.
       */
      this.expand = function(expand) {

        // Remove the link.
        this.link.remove();

        // If they wish to expand.
        if (expand) {

          // Set the link to say 'less'
          this.link.html(less_text);

          if (expand != this.div_expanded) {
            // Animate the content, and add the link.
            this.content.addClass('expanded').animate({
              height: this.div_height
            }, (function(content) {
              return function() {
                content.css('overflow', '').height('inherit');
              };
            })(this.content));
          }

          // Only show the link if it is forceHeight.
          if (this.forceHeight) {
            this.content.after(this.link);
          }
        }
        else {

          // Set the link to say 'more'
          this.link.html(more_text);

          // Animate the content and add the link.
          if (expand != this.div_expanded) {
            this.content.removeClass('expanded').animate({
              height: min_height
            }, (function(content) {
              return function() {
                content.css('overflow', 'hidden');
              };
            })(this.content));
          }

          // Add the link.
          this.content.after(this.link);
        }

        // Bind the link to the click event.
        this.link.unbind().bind('click', (function(widget) {
          return function(event) {
            event.preventDefault();
            event.stopPropagation();
            var expand = !widget.content.hasClass('expanded');
            widget.forceHeight = expand;
            widget.expand(expand);
          };
        })(this));

        // Set the state of this DIV.
        this.div_expanded = expand;

        // Return the content.
        return this.content;
      };

      /**
       * Check the height of the content.
       */
      this.checkHeight = function() {
        this.forceHeight = false;
        this.div_height = this.element.height();
        this.expand(this.div_height < min_height);
      };

      // Trigger when resize events occur, but don't trigger to fast.
      var resizeTimer = 0;
      $(window).unbind('resize').bind('resize', (function(widget) {
        return function() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function() {
            widget.checkHeight();
          }, 100);
        };
      })(this));
      this.element.unbind('resize').bind('resize', (function(widget) {
        return function() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function() {
            widget.checkHeight();
          }, 100);
        };
      })(this));

      // Set the element height.
      this.checkHeight();
    });
  };
})(jQuery);
(function($) {

  // The tree select control.
  $.fn.treeselect = function(params) {

    // Setup the default parameters for the tree select control.
    params = $.extend({
      colwidth: 18,               /** The width of the columns. */
      default_value: {},          /** An array of default values. */
      selected: null,             /** Callback when an item is selected. */
      treeloaded: null,           /** Called when the tree is loaded. */
      load: null,                 /** Callback to load new tree's */
      searcher: null,             /** Callback to search a tree */
      deepLoad: false,            /** Performs a deep load */
      onbuild: null,              /** Called when each node is building. */
      postbuild: null,            /** Called when the node is done building. */
      inputName: 'treeselect',    /** The input name. */
      autoSelectChildren: true,   /** Select chldrn when parent is selected. */
      showRoot: false,            /** Show the root item with a checkbox. */
      selectAll: false,           /** If we wish to see a select all. */
      selectAllText: 'Select All' /** The select all text. */
    }, params);

    /** Keep track of all loaded nodes */
    var loadedNodes = {};

    /** Variable for the busy states. */
    var busyloading = 'treebusy-loading';
    var busyloadingall = 'treebusy-loading-all';
    var busyselecting = 'treebusy-selecting';

    /**
     * Constructor.
     */
    var TreeNode = function(nodeparams, root) {

      // Determine if this is a root item.
      this.root = !!root;

      // Setup the parameters.
      nodeparams.title = nodeparams.title || 'anonymous';
      $.extend(this, {
        id: 0,                /** The ID of this node. */
        nodeloaded: false,    /** Flag to see if this node is loaded. */
        allLoaded: false,     /** Flag to see if we have loaded all nodes. */
        value: 0,             /** The input value for this node. */
        title: '',            /** The title of this node. */
        url: '',              /** The URL to this node. */
        has_children: true,   /** Boolean if this node has children. */
        children: [],         /** Array of children. */
        data: {},             /** Additional data to attach to the node. */
        level: 0,             /** The level of this node. */
        odd: false,           /** The odd/even state of this row. */
        checked: false,       /** If this node is checked. */
        busy: false,          /** If this node is busy. */
        display: $(),         /** The display of this node. */
        input: $(),           /** The input display. */
        link: $(),            /** The link display. */
        span: $(),            /** The span display. */
        childlist: $(),       /** The childlist display. */
        exclude: {}           /** An array of nodes to exclude for selection. */
      }, nodeparams);

      // Say that we are a TreeNode.
      this.isTreeNode = true;

      // Determine if a node is loading.
      this.loading = false;

      // The load callback queue.
      this.loadqueue = [];
    };

    /**
     * Set the busy cursor for this node.
     */
    TreeNode.prototype.setBusy = function(state, type) {

      // Make sure the state has changed.
      if (state != this.span.hasClass(type)) {
        this.busy = state;
        if (state) {

          // Set the busy type and treebusy.
          this.span.addClass(type);
          this.span.addClass('treebusy');
        }
        else {

          // Remove the busy type.
          this.span.removeClass(type);

          // Only remove the busy if the busy flags are empty.
          var othertype = (type == busyloading) ? busyselecting : busyloading;
          if (!this.span.hasClass(othertype)) {
            this.span.removeClass('treebusy');
          }
        }

      }
    };

    /**
     * Determines if this node is already loaded.
     */
    TreeNode.prototype.isLoaded = function() {
      var loaded = this.nodeloaded;
      loaded |= loadedNodes.hasOwnProperty(this.id);
      loaded |= !this.has_children;
      loaded |= (this.has_children && this.children.length > 0);
      return loaded;
    };

    /**
     * Loads the current node.
     *
     * @param {function} callback - The callback when the node is loaded.
     */
    TreeNode.prototype.loadNode = function(callback, hideBusy) {

      // If we are loading, then just add this callback to the queue and return.
      if (this.loading) {
        if (callback) {
          this.loadqueue.push(callback);
        }
        return;
      }

      // Trigger the callback when the node is done loading.
      var triggerCallback = function() {

        // Callback that we are loaded.
        if (callback) {
          callback(this);
        }

        // Process the loadqueue.
        for (var i in this.loadqueue) {
          this.loadqueue[i](this);
        }

        // Empty the loadqueue.
        this.loadqueue.length = 0;

        // Say we are not busy.
        if (!hideBusy) {
          this.setBusy(false, busyloading);
        }
      };

      // Say we are loading.
      this.loading = true;

      // Only load if we have not loaded yet.
      if (params.load && !this.isLoaded()) {

        // Make this node busy.
        if (!hideBusy) {
          this.setBusy(true, busyloading);
        }

        // Call the load function.
        params.load(this, (function(treenode) {
          return function(node) {

            // Only perform the merging and build if it hasn't loaded.
            if (!treenode.nodeloaded) {

              // Merge the result with this node.
              treenode = jQuery.extend(treenode, node);

              // Say this node is loaded.
              treenode.nodeloaded = true;

              // Add to the loaded nodes array.
              loadedNodes[treenode.id] = treenode.id;

              // Build the node.
              treenode.build(function() {

                // Callback that we are loaded.
                triggerCallback.call(treenode);
              });
            }
            else {

              // Callback that we are loaded.
              triggerCallback.call(treenode);
            }
          };
        })(this));
      }
      else if (callback) {

        // Just callback since we are already loaded.
        triggerCallback.call(this);
      }

      // Say that we are not loading anymore.
      this.loading = false;
    };

    /**
     * Recursively loads and builds all nodes beneath this node.
     *
     * @param {function} callback Called when the tree has loaded.
     * @param {function} operation Allow someone to perform an operation.
     */
    TreeNode.prototype.loadAll = function(callback, operation, hideBusy, ids) {
      ids = ids || {};

      // Make sure we are loaded first.
      this.loadNode(function(node) {

        // See if an operation needs to be performed.
        if (operation) {
          operation(node);
        }

        // Get our children count.
        var i = node.children.length, count = i;

        // If no children, then just call the callback immediately.
        if (!i || ids.hasOwnProperty(node.id)) {
          if (callback) {
            callback.call(node, node);
          }
          return;
        }

        // Add this to the ids to protect against recursion.
        ids[node.id] = node.id;

        // Make this node busy.
        if (!hideBusy) {
          node.setBusy(true, busyloadingall);
        }

        // Iterate through each child.
        while (i--) {

          // Load recurssion on a separate thread.
          setTimeout((function(index) {
            return function() {

              // Load this childs children...
              node.children[index].loadAll(function() {

                // Decrement the child count.
                count--;

                // If all children are done loading, call the callback.
                if (!count) {

                  // Callback that we are done loading this tree.
                  if (callback) {
                    callback.call(node, node);
                  }

                  // Make this node busy.
                  if (!hideBusy) {
                    node.setBusy(false, busyloadingall);
                  }
                }
              }, operation, hideBusy, ids);
            };
          })(i), 2);
        }
      });
    };

    /**
     * Expands the node.
     */
    TreeNode.prototype.expand = function(state) {
      if (state) {
        this.link.removeClass('collapsed').addClass('expanded');
        this.span.removeClass('collapsed').addClass('expanded');
        this.childlist.show('fast');

        // If this node is checked as including children, go through and select
        // all of it's children.
        if (!params.deepLoad && this.checked && this.include_children) {
          this.include_children = false;
          this.selectChildren(true);
        }
      }
      // Only collapse if they can open it back up.
      else if (this.span.length > 0) {
        this.link.removeClass('expanded').addClass('collapsed');
        this.span.removeClass('expanded').addClass('collapsed');
        this.childlist.hide('fast');
      }

      // If the state is expand, but the children have not been loaded.
      if (state && !this.isLoaded()) {

        // If there are no children, then we need to load them.
        this.loadNode(function(node) {
          if (node.checked) {
            node.selectChildren(node.checked);
          }
          node.expand(true);
        });
      }
    };

    /**
     * Selects all children of this node.
     *
     * @param {boolean} state The state of the selection or array of defaults.
     * @param {function} done Called when we are done selecting.
     */
    TreeNode.prototype.selectChildren = function(state, done, child) {

      // See if the state is a boolean.
      var defaults = (typeof state == 'object');

      // Create a function to call when we are done selecting.
      var doneSelecting = function() {
        if (!child) {

          // If they provided a selected parameter.
          if (params.selected) {
            params.selected(this, true);
          }

          // Say that we are done.
          if (done) {

            done.call(this);
          }
        }
      };

      if (params.deepLoad) {

        // Load all nodes underneath this node.
        this.loadAll(function() {

          // Set this node not busy.
          this.setBusy(false, busyselecting);

          // We are done selecting.
          doneSelecting.call(this);

        }, function(node) {

          var val = state;
          if (defaults) {
            val = state.hasOwnProperty(node.value);
            val |= state.hasOwnProperty(node.id);
          }

          // Select this node.
          node.select(val);
        });
      }
      else {

        // Select the current node.
        this.select(state);
        var name = params.inputName + '-' + this.value;
        $('input[name="' + name + '-include-below"]').attr(
          'name',
          name
        );

        // We should load children if the current node is expanded, or the
        // current node is being deselected and possibly has children selected
        // below them.
        if ((this.root === true) ||
            (state === false && !this.include_children) ||
            (this.link !== undefined && this.link[0] !== undefined &&
             this.link[0].className.indexOf('expanded') !== -1)
           ) {
          this.include_children = false;
          this.expand(state);
          var i = this.children.length;
          while (i--) {

            // Select all the children.
            this.children[i].selectChildren(state, done, true);
          }
        }
        else {
          // Flag this noad as including all children below if it has children.
          if (this.has_children > 0 && state) {
            this.include_children = true;
            $('input[name="' + name + '"]').attr(
              'name',
              name + '-include-below'
            );
          }
        }

        // We are done selecting.
        doneSelecting.call(this);
      }
    };

    /**
     * Selects default values of the TreeNode.
     *
     * @param {boolean} defaults Array of defaults.
     * @param {function} done Called when we are done selecting.
     */
    TreeNode.prototype.selectDefaults = function(defaults, done) {

      var defaultsLeft = Object.keys(defaults).length;

      var defaultsQueue = [];
      defaultsQueue.push(this);

      // Loop through nodes depth first to find the defaults.
      while (defaultsLeft > 0 && defaultsQueue.length > 0) {
        var queueItem = defaultsQueue.shift();
        var state = false;

        // Check if the queued item is listed in the defaults.
        if (defaults.hasOwnProperty(queueItem.value)) {
          delete defaults[queueItem.value];
          state = true;
          defaultsLeft--;
        }
        if (defaults.hasOwnProperty(queueItem.id)) {
          delete defaults[queueItem.id];
          state = true;
          defaultsLeft--;
        }

        // Check if the queued item is listed in the defaults and is flagged to
        // include defaults.
        if (defaults.hasOwnProperty(queueItem.value + '-include-below')) {
          delete defaults[queueItem.value + '-include-below'];
          queueItem.include_children = true;
          state = true;
          defaultsLeft--;
        }
        if (defaults.hasOwnProperty(queueItem.id + '-include-below')) {
          delete defaults[queueItem.id + '-include-below'];
          queueItem.include_children = true;
          state = true;
          defaultsLeft--;
        }

        // Select the queued item.
        queueItem.select(state);

        // Set the input name to the correct value.
        var name = params.inputName + '-' + queueItem.value;
        $('input[name="' + name + '-include-below"]').attr('name', name);
        if (!queueItem.root && state && queueItem.include_children) {
          $('input[name="' + name + '"]').attr('name', name + '-include-below');
        }
        else if (defaultsLeft > 0) {
          // Add this node's children to the queue.
          var i = queueItem.children.length;
          while (i--) {
            defaultsQueue.push(queueItem.children[i]);
          }
        }
        else if (queueItem.root && queueItem.include_children) {

          // Select the root node's children.
          queueItem.selectChildren(true);
        }
      }

      // Say this node is now fully selected.
      if (params.selected) {
        params.selected(this, true);
      }

      // Say we are now done.
      if (done) {
        done.call(this);
      }
    };

    /**
     * Selects a node.
     *
     * @param {boolean} state The state of the selection.
     */
    TreeNode.prototype.select = function(state) {

      // Only check this node if it is a selectable input.
      if (!this.input.hasClass('treenode-no-select')) {

        // Convert state to a boolean.
        state = !!state;

        // Select the element unless the state is false and we are on the root
        // element which isn't unselectable.
        if (state || !this.root || (this.showRoot && this.has_children)) {

          // Set the checked state.
          this.checked = state;

          // Make sure the input is checked accordingly.
          this.input.attr('checked', state);
          $('input[name="' + this.input.attr('name') + '"]').change();

          // Say that this node is selected.
          if (params.selected) {
            params.selected(this);
          }
        }
      }
    };

    /**
     * Build the treenode element.
     */
    TreeNode.prototype.build_treenode = function() {
      var treenode = $();
      treenode = $(document.createElement(this.root ? 'div' : 'li'));
      treenode.addClass('treenode');
      treenode.addClass(this.odd ? 'odd' : 'even');
      return treenode;
    };

    /**
     * Build the input and return.
     */
    TreeNode.prototype.build_input = function(left) {

      // Only add an input if the input name is defined.
      if (params.inputName) {

        // If this node is excluded or has no roles enabled in the group finder,
        // then add a dummy div tag.
        if ((typeof this.exclude[this.id] !== 'undefined') ||
          (params.inputName == 'group_finder' && !this.data.roles_enabled)) {
          this.input = $(document.createElement('div'));
          this.input.addClass('treenode-no-select');
        }
        else {

          // Create the input element.
          this.input = $(document.createElement('input'));

          // Get the value for this input item.
          var value = this.value || this.id;

          // Create the attributes for this input item.
          this.input.attr({
            'type': 'checkbox',
            'value': value,
            'name': params.inputName + '-' + value,
            'checked': this.checked
          }).addClass('treenode-input');

          // Bind to the click on the input.
          this.input.bind('click', (function(node) {
            return function(event) {

              // Set the checked state based on input.
              node.checked = $(event.target).is(':checked');

              // Only expand/collapse and select children if auto select
              // children is enabled.
              if (params.autoSelectChildren) {
                // Expand if deep loading. Collapse if unchecked.
                if (!node.checked || params.deepLoad) {
                  node.expand(node.checked);
                }

                // Call the select method.
                node.selectChildren(node.checked);
              }
            };
          })(this));

          // If this is a root item and we are not showing the root item, then
          // just hide the input.
          if (this.root && !params.showRoot) {
            this.input.hide();
          }
        }

        // Set the input left.
        this.input.css('left', left + 'px');
      }
      return this.input;
    };

    /**
     * Creates a node link.
     */
    TreeNode.prototype.build_link = function(element) {
      element.css('cursor', 'pointer').addClass('collapsed');
      element.bind('click', {node: this}, function(event) {
        event.preventDefault();
        event.data.node.expand($(event.target).hasClass('collapsed'));
      });
      return element;
    };

    /**
     * Build the span +/- symbol.
     */
    TreeNode.prototype.build_span = function(left) {

      // If we are showing the root item or we are not root, and we have
      // children, show a +/- symbol.
      if ((!this.root || this.showRoot) && this.has_children) {
        this.span = this.build_link($(document.createElement('span')).attr({
          'class': 'treeselect-expand'
        }));
        this.span.css('left', left + 'px');
      }
      return this.span;
    };

    /**
     * Build the title link.
     */
    TreeNode.prototype.build_title = function(left) {

      // If there is a title, then build it.
      if ((!this.root || this.showRoot) && this.title) {

        // Create a node link.
        this.nodeLink = $(document.createElement('a')).attr({
          'class': 'treeselect-title',
          'href': this.url,
          'target': '_blank'
        }).css('marginLeft', left + 'px').text(this.title);

        // If this node has children, then it should be a link.
        if (this.has_children) {
          this.link = this.build_link(this.nodeLink.clone());
        }
        else {
          this.link = $(document.createElement('div')).attr({
            'class': 'treeselect-title'
          }).css('marginLeft', left + 'px').text(this.title);
        }
      }

      // Return the link.
      return this.link;
    };

    /**
     * Build the children.
     */
    TreeNode.prototype.build_children = function(done) {

      // Create the childlist element.
      this.childlist = $();

      // If this node has children.
      if (this.children.length > 0) {

        // Create the child list.
        this.childlist = $(document.createElement('ul'));

        // Set the odd state.
        var odd = this.odd;

        // Get the number of children.
        var numChildren = this.children.length;

        // Now if there are children, iterate and build them.
        for (var i in this.children) {

          // Make sure the child is a valid object in the list.
          if (this.children.hasOwnProperty(i)) {

            // Alternate the odd state.
            odd = !odd;

            // Create a new TreeNode for this child.
            this.children[i] = new TreeNode($.extend(this.children[i], {
              level: this.level + 1,
              odd: odd,
              checked: this.checked,
              exclude: this.exclude
            }));

            // Set timeout to help with recursion.
            setTimeout((function(treenode, index) {
              return function() {

                // Add the child tree to the list.
                treenode.children[index].build(function(child) {

                  // Decrement the number of children loaded.
                  numChildren--;

                  // Append the child to the list.
                  treenode.childlist.append(child.display);

                  // If there are no more chlidren, then say we are done.
                  if (!numChildren) {
                    done.call(treenode, treenode.childlist);
                  }
                });
              };
            })(this, i), 2);
          }
        }
      }
      else {

        // Call that we are done loading this child.
        done.call(this, this.childlist);
      }
    };

    /**
     * Builds the DOM and the tree for this node.
     */
    TreeNode.prototype.build = function(done) {

      // Keep track of the left margin for each element.
      var left = 5, elem = null;

      // Create the list display.
      if (this.display.length == 0) {
        this.display = this.build_treenode();
      }
      else if (this.root) {
        var treenode = this.build_treenode();
        this.display.append(treenode);
        this.display = treenode;
      }

      // Now append the input.
      if ((this.input.length == 0) &&
          (elem = this.build_input(left)) &&
          (elem.length > 0)) {

        // Add the input to the display.
        this.display.append(elem);
        left += params.colwidth;
      }

      // Now create the +/- sign if needed.
      if (this.span.length == 0) {
        this.display.append(this.build_span(left));
        left += params.colwidth;
      }

      // Now append the node title.
      if (this.link.length == 0) {
        this.display.append(this.build_title(left));
      }

      // Called when the node is done building.
      var onDone = function() {

        // See if they wish to alter the build.
        if (params.onbuild) {
          params.onbuild(this);
        }

        // Create a search item.
        this.searchItem = this.display.clone();
        $('.treeselect-expand', this.searchItem).remove();

        // If the search title is not a link, then make it one...
        var searchTitle = $('div.treeselect-title', this.searchItem);
        if (searchTitle.length > 0) {
          searchTitle.replaceWith(this.nodeLink);
        }

        // See if they wish to hook into the postbuild process.
        if (params.postbuild) {
          params.postbuild(this);
        }

        // Check if this node is excluded, and hide if so.
        if (typeof this.exclude[this.id] !== 'undefined') {
          if ($('.treenode-input', this.display).length == 0) {
            this.display.hide();
          }
        }

        // If they wish to know when we are done building.
        if (done) {
          done.call(this, this);
        }
      };

      // Append the children.
      if (this.childlist.length == 0) {
        this.build_children(function(children) {
          if (children.length > 0) {
            this.display.append(children);
          }
          onDone.call(this);
        });
      }
      else {
        onDone.call(this);
      }
    };

    /**
     * Returns the selectAll text if that applies to this node.
     */
    TreeNode.prototype.getSelectAll = function() {
      if (this.root && this.selectAll) {
        return this.selectAllText;
      }
      return false;
    };

    /**
     * Search this node for matching text.
     *
     * @param {string} text The text to search for.
     * @param {function} callback Called with the results of this search.
     */
    TreeNode.prototype.search = function(text, callback) {
      // If no text was provided, then just return the root children.
      if (!text) {
        if (callback) {
          callback(this.children, false);
        }
      }
      else {

        // Initialize our results.
        var results = {};

        // Convert the text to lowercase.
        text = text.toLowerCase();

        // See if they provided a search endpoint.
        if (params.searcher) {

          // Call the searcher for the new nodes.
          params.searcher(this, text, function(nodes, getNode) {
            var treenode = null;

            // Get the number of nodes.
            var numNodes = nodes.length;

            // If no nodes were returned then return nothing.
            if (nodes.length == 0) {
              callback(results, true);
            }

            for (var id in nodes) {

              // Set the treenode.
              treenode = new TreeNode(getNode ? getNode(nodes[id]) : nodes[id]);

              // Say this node is loaded.
              treenode.nodeloaded = true;

              // Add to the loaded nodes array.
              loadedNodes[treenode.id] = treenode.id;

              // Build the node.
              treenode.build(function() {

                // Decrement the counter.
                numNodes--;

                // Add the node to the results.
                results[id] = treenode;

                // If no more nodes are loading, then callback.
                if (!numNodes) {

                  // Callback with the search results.
                  callback(results, true);
                }
              });
            }
          });
        }
        else {

          // Load all nodes.
          this.loadAll(function(node) {

            // Callback with the results of this search.
            if (callback) {
              callback(results, true);
            }
          }, function(node) {

            // If we are not the root node, and the text matches the title.
            if (!node.root && node.title.toLowerCase().search(text) !== -1) {

              // Add this to our search results.
              results[node.id] = node;
            }
          }, true);
        }
      }
    };

    // Iterate through each instance.
    return $(this).each(function() {

      // Get the tree node parameters.
      var treeParams = $.extend(params, {display: $(this)});

      // Create a root tree node and load it.
      var root = this.treenode = new TreeNode(treeParams, true);

      // Add a select all link.
      var selectAll = root.getSelectAll();
      if (selectAll !== false && !root.showRoot) {

        // See if the select all button should be checked.
        var checked = false;
        var default_value = params.default_value;
        if (default_value.hasOwnProperty(root.value + '-include-below')) {
          checked = true;
        }

        // Create an input that will select all children if selected.
        root.display.append($(document.createElement('input')).attr({
          'type': 'checkbox',
          'checked': checked
        }).bind('click', (function(node) {
          return function(event) {
            node.selectChildren($(event.target).is(':checked'));
          };
        })(root)));

        // If they provided select all text, add it here.
        if (selectAll) {
          var span = $(document.createElement('span')).attr({
            'class': 'treeselect-select-all'
          }).html(selectAll);
          root.display.append(span);
        }
      }

      // Create a loading span.
      var initBusy = $(document.createElement('span')).addClass('treebusy');
      root.display.append(initBusy.css('display', 'block'));

      // Called when the root node is done loading.
      var doneLoading = function() {

        // Remove the init busy cursor.
        initBusy.remove();

        // Call the treeloaded params.
        if (params.treeloaded) {
          params.treeloaded(this);
        }
      };

      // Load the node.
      root.loadNode(function(node) {

        // Check the length of children in this node.
        if (node.children.length == 0) {

          // If the root node does not have any children, then hide.
          node.display.hide();
        }

        // Expand this root node.
        node.expand(true);

        // Select this node based on the default value.
        node.select(node.checked);

        // Set the defaults for all the children.
        var defaults = node.checked;
        if (!jQuery.isEmptyObject(params.default_value)) {
          defaults = params.default_value;
        }

        // If there are defaults, then select the children with them.
        if (defaults) {

          // Select the children based on the defaults.
          if (params.deepLoad) {
            node.selectChildren(defaults, function() {
              doneLoading.call(node);
            });
          }
          else {
            // When not deep loading, use selectDefaults to search for defaults
            // using breadth first check.
            node.selectDefaults(defaults, function() {
              doneLoading.call(node);
            });
          }
        }
        else {
          doneLoading.call(node);
        }
      });

      // If the root element doesn't have children, then hide the treeselect.
      if (!root.has_children) {
        this.parentElement.style.display = 'none';
      }
    });
  };
})(jQuery);
(function($) {

  /**
   * This adds a Chosen style selector for the tree select widget.
   *
   * This widget requires chosen.css.
   */
  $.fn.chosentree = function(params) {

    // Setup the default parameters.
    params = $.extend({
      inputId: 'chosentree-select',     /** The input element ID and NAME. */
      label: '',                        /** The label to add to the input. */
      description: '',                  /** The description for the input. */
      input_placeholder: 'Select Item', /** The input placeholder text. */
      input_type: 'text',               /** Define the input type. */
      autosearch: false,                /** If we would like to autosearch. */
      search_text: 'Search',            /** The search button text. */
      no_results_text: 'No results found', /** Shown when no results. */
      min_height: 100,                  /** The miniumum height. */
      more_text: '+%num% more',         /** The text to show in the more. */
      loaded: null,                     /** Called when all items are loaded. */
      collapsed: true,                  /** If the tree should be collapsed. */
      showtree: false                   /** To show the tree. */
    }, params);

    // Iterate through each instance.
    return $(this).each(function() {

      // Keep track of the treeselect.
      var selector = null;
      var choices = null;
      var search = null;
      var input = null;
      var search_btn = null;
      var label = null;
      var description = null;
      var treeselect = null;
      var treewrapper = null;
      var selectedTimer = 0;
      var root = null;

      // Show or hide the tree.
      var showTree = function(show, tween) {
        tween = tween || 'fast';
        if (show && (root == null || root.has_children)) {
          treewrapper.addClass('treevisible').show('fast');
        }
        else {
          treewrapper.removeClass('treevisible').hide('fast');
        }
      };

      // Create the selector element.
      selector = $(document.createElement('div'));
      selector.addClass('chzntree-container');
      if (params.input_type == 'search') {
        selector.addClass('chzntree-container-single');
        search = $(document.createElement('div'));
        search.addClass('chzntree-search');
      }
      else {
        selector.addClass('chzntree-container-multi');
        choices = $(document.createElement('ul'));
        choices.addClass('chzntree-choices chosentree-choices');
        search = $(document.createElement('li'));
        search.addClass('search-field');
      }

      // If they wish to have a label.
      label = $(document.createElement('label'));
      label.attr({
        'for': params.inputId
      });
      label.text(params.label);

      // If they wish to have a description.
      description = $(document.createElement('div'));
      description.attr({
        'class': 'description'
      });
      description.text(params.description);

      // Create the input element.
      if (params.input_placeholder) {
        input = $(document.createElement('input'));
        input.attr({
          'type': 'text',
          'placeholder': params.input_placeholder,
          'autocomplete': 'off'
        });
        if (!params.showtree && params.collapsed) {
          input.focus(function(event) {
            showTree(true);
          });
        }

        // Add a results item to the input.
        if (params.input_type == 'search') {

          // Need to make room for the search symbol.
          input.addClass('chosentree-search');

          // Perform the search.
          var doSearch = function(inputValue) {

            // We want to make sure we don't try while it is searching...
            // And also don't want to search if the input is one character...
            if (!input.hasClass('searching') && (inputValue.length !== 1)) {

              // Continue if we have a root node.
              if (root) {

                // Say that we are now searching...
                input.addClass('searching');

                // Search the tree node.
                root.search(inputValue, function(nodes, searchResults) {

                  // Say we are no longer searching...
                  input.removeClass('searching');

                  // Iterate over the nodes and append them to the search.
                  var count = 0;
                  root.childlist.children().detach();

                  // Add a class to distinguish if this is search results.
                  if (searchResults) {
                    root.childlist.addClass('chzntree-search-results');
                  }
                  else {
                    root.childlist.removeClass('chzntree-search-results');
                  }

                  // Add class if input checkbox is enabled.
                  if (params.inputName != '') {
                    root.childlist.addClass('input-enabled');
                  }
                  else {
                    root.childlist.removeClass('input-enabled');
                  }

                  // Iterate through our nodes.
                  for (var i in nodes) {
                    count++;

                    // Use either the search item or the display.
                    if (searchResults) {
                      root.childlist.append(nodes[i].searchItem);
                    }
                    else {
                      root.childlist.append(nodes[i].display);
                    }
                  }

                  if (!count) {
                    var txt = '<li>' + params.no_results_text + '</li>';
                    root.childlist.append(txt);
                  }
                });

                // A search was performed.
                return true;
              }
            }

            // A search was not performed.
            return false;
          };

          // If they wish to autosearch.
          if (params.autosearch) {

            // Keep track of a search timeout.
            var searchTimeout = 0;

            // Bind to the input when they type.
            input.bind('input', function inputSearch() {
              if (!doSearch(input.val())) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(inputSearch, 1000);
              }
            });

            // Add the autosearch.
            search.addClass('autosearch');
          }
          else {
            search_btn = $(document.createElement('input'));
            search_btn.attr({
              'type': 'button',
              'value': params.search_text
            });
            search_btn.addClass('button chosentree-search-btn');
            search_btn.bind('click', function(event) {
              event.preventDefault();
              doSearch(input.val());
            });

            // Make sure to do a search.
            jQuery(document).bind('keydown', function(event) {
              if ((event.keyCode == 13) && input.is(':focus')) {
                event.preventDefault();
                doSearch(input.val());
              }
            });

            // Add the autosearch.
            search.addClass('manualsearch');
          }
        }
        else {

          // Add the results class.
          input.addClass('chosentree-results');
        }

        search.append(input);

        // Append the search button if it exists.
        if (search_btn) {
          search.append(search_btn);
        }
      }

      // Creat the chosen selector.
      if (choices) {
        selector.append(label).append(choices.append(search));
      }
      else {
        selector.append(label).append(search);
      }

      treewrapper = $(document.createElement('div'));
      treewrapper.addClass('treewrapper');
      treewrapper.hide();

      // Get the tree select.
      treeselect = $(document.createElement('div'));
      treeselect.addClass('treeselect');

      // Setup the keyevents.
      $(this).keyup(function(event) {
        if (event.which == 27) {
          showTree(false);
        }
      });

      // Add the treeselect widget.
      treewrapper.append(treeselect);
      $(this).append(selector.append(treewrapper));

      // Add the description.
      $(this).append(description);

      // Now declare the treeselect.
      var treeparams = params;

      // Reset the selected callback.
      treeparams.selected = (function(chosentree) {

        // Keep track of the selected nodes.
        var selectedNodes = {};

        // The node callback.
        return function(node, direct) {

          // If this is a valid node.
          if (node.id) {

            // Get the existing choices.
            var selected_choice = $('li#choice_' + node.id, choices);

            // Add the choice if not already added.
            if (node.checked) {

              // If the choice is already selected, remove it.
              if (selected_choice.length != 0) {
                selected_choice.remove();
              }

              // Add this to the selected nodes.
              selectedNodes[node.id] = node;
            }
            else if (!node.checked) {

              // If not selected, then remove the choice.
              selected_choice.remove();
            }
          }

          // If we are done selecting.
          if (direct) {

            // Set the chosentree value.
            chosentree.value = {};

            // Iterate through all the selected nodes.
            for (var id in selectedNodes) {

              // Set the node.
              node = selectedNodes[id];

              // Add to the chosen tree value.
              chosentree.value[id] = node;

              // Get and add a new choice.
              var choice = $(document.createElement('li'));
              choice.addClass('search-choice');
              choice.attr('id', 'choice_' + node.id);

              // Add the node data to this choice.
              choice.eq(0)[0].nodeData = node;

              var span = $(document.createElement('span'));

              // If including children below, add text to the title to say so.
              if (!params.deepLoad && node.include_children) {
                span.text(node.title + ' (All below)');
              }
              else {
                span.text(node.title);
              }

              // Don't allow them to remove the root element unless it is
              // visible and has children.
              if (!node.root || (node.showRoot && node.has_children)) {
                var close = $(document.createElement('a'));
                close.addClass('search-choice-close');
                close.attr('href', 'javascript:void(0)');

                // Bind when someone clicks on the close button.
                close.bind('click', function(event) {

                  // Prevent the default.
                  event.preventDefault();

                  // Get the node data.
                  node = this.parentNode.nodeData;

                  // Remove the choice.
                  $('li#choice_' + node.id, choices).remove();

                  // Deselect this node.
                  node.selectChildren(false);
                });
              }

              // Add this to the choices.
              if (choices) {
                choices.prepend(choice.append(span).append(close));
              }
            }

            if (choices) {
              // Only show the choices if they are not visible.
              if (!choices.is(':visible')) {

                // Show the choices.
                choices.show();
              }

              // Reset the selected nodes.
              selectedNodes = {};

              // Don't show the default value if the root has not children.
              if (input && node.children.length == 0) {
                input.attr({'value': ''});
              }

              // Show more or less.
              if (jQuery.fn.moreorless) {

                // Get how many nodes there are.
                var numNodes = $('li.search-choice', choices).length;

                // Add this to the choices.
                var more_text = params.more_text.replace('%num%', numNodes);
                choices.moreorless(params.min_height, more_text);
                if (!choices.div_expanded) {
                  showTree(true, null);
                }
              }
            }

            // If they wish to know when it is loaded.
            if (treeparams.loaded) {

              // Call our callback with all the nodes.
              treeparams.loaded(nodes);
            }

            // Trigger an event.
            $(chosentree).trigger('treeloaded');
          }
        };
      })(this);

      // Now declare our treeselect control.
      treeselect.treeselect(treeparams);
      root = treeselect.eq(0)[0].treenode;

      // Show the tree by default.
      if (treeparams.showtree || !treeparams.collapsed) {
        showTree(true, null);
      }
    });
  };
})(jQuery);
(function($) {
  // Add the group select widget.
  $.fn.group_select = function(params) {

    // Make sure we have default params.
    params = jQuery.extend({
      uuid: 0,
      depth: 8,
      sortby: 'title',
      sort: 'asc',
      include_group_info: 0,
      include_hidden: 0,
      onRoot: null,
      relative_link: false
    },params);

    // Set the sort direction.
    var dir = (params.sort.toLowerCase() === 'asc') ? -1 : 1;

    // Setup the drupal endpoint.
    drupal.endpoint = drupal.endpoint || '/api/v1/rest';

    return $(this).each(function() {

      /**
       * Converts the drupal return of tree structure to the common
       * treeselect control pattern.
       */
      var getTreeNode = function(node) {
        var treenode = {};
        if (!node) {
          return null;
        }
        var has_children = parseInt(node.has_children);
        treenode.id = node.uuid || params.uuid;
        treenode.value = node.nid;
        treenode.title = node.title;
        treenode.url = node.url;
        treenode.has_children = has_children;
        treenode.data = node;
        treenode.sort = treenode[params.sortby];
        treenode.children = [];
        var child = null;
        for (var id in node.below) {
          if (node.below.hasOwnProperty(id)) {
            if (child = getTreeNode(node.below[id])) {
              treenode.children.push(child);
            }
          }
        }

        // Now sort the children.
        if (treenode.children.length > 0) {
          treenode.children.sort(function(a, b) {
            return (a.sort < b.sort) ? dir : ((a.sort > b.sort) ? -dir : 0);
          });
        }

        return treenode;
      };

      /**
       * Called to load a new treenode.
       */
      params.load = function(treenode, callback) {
        (new allplayers.group({id: treenode.id || params.uuid})).getGroupTree({
          depth: params.depth,
          include_group_info: params.include_group_info,
          include_hidden: params.include_hidden,
          root_uuid: params.root_uuid,
          inclusive: 1,
          path: params.relative_link ? window.location.pathname : ''
        }, function(node) {
          var root = getTreeNode(node);
          if (params.onRoot) {
            params.onRoot(root);
          }
          callback(root);
        });
      };

      /**
       * Called when they search a node.
       */
      params.searcher = function(treenode, query, callback) {
        var id = {id: treenode.id || params.uuid};
        (new allplayers.group(id)).find(query, function(nodes) {
          callback(nodes, getTreeNode);
        });
      };

      // Setup the input ID.
      params.inputId = 'chosentree-select-' + params.uuid;

      // Create the chosentree item.
      $(this).chosentree(params);
    });
  };
})(jQuery);
(function($) {
  // Add the group finder widget.
  $.fn.group_finder = function(params) {

    // Get the root node.
    var rootNode = {};

    // Make sure we have default params.
    params = jQuery.extend({
      deepLoad: 1,
      inputName: '',
      input_placeholder: 'Find subgroups',
      input_type: 'search',
      no_results_text: 'No groups found',
      unavailable_text: 'Unavailable',
      load_extra_info: 0,
      include_group_info: 1,
      show_register_link: 1,
      include_hidden: 0,
      show_url_link: 1,
      showRoot: 0,
      showtree: 1,
      autoSelectChildren: false,
      gotoPath: '',
      gotoText: '',
      gotoClass: 'allplayers-register-link',
      gotoFeature: '',
      onRoot: function(root) {
        rootNode = root;
      },
      onbuild: function(node) {

        // If they wish to include the registration link...
        if (params.include_group_info) {
          if (params.show_register_link) {
            if (!node.has_register_link) {
              node.has_register_link = true;
              if (node.data.roles_enabled) {

                // If on root node, make the register link direct to the first
                // page for registration.
                if (node.root) {
                  node.data.register_link += '/select';
                }

                // Add the documnet URL to the end of the register
                var link = node.data.register_link;
                link += '?destination=';
                link += encodeURIComponent(window.document.URL);
                link += '&from=' + rootNode.id;

                // Add a registration link to the group finder.
                node.link.after($(document.createElement('a')).attr({
                  'class': 'button small allplayers-register-link',
                  href: link
                }).text(node.data.register_text));
              }

              // See if we wish to load all nodes.
              if (params.load_extra_info) {
                var count = 0;
                node.loadAll(function() {
                  // Specify how many children have registration enabled.
                  if (count > 0) {
                    node.link.append($(document.createElement('span')).html(
                      count + ' ' +
                      ((count == 1) ? 'subgroup' : 'subgroups') + ' open'
                    ).attr({
                      'class': 'extra-info'
                    }));
                  }
                  else if (!node.data.roles_enabled) {
                    // Add an unavailable link.
                    node.link.append($(document.createElement('span')).html(
                      params.unavailable_text
                    ).attr({
                      'class': 'extra-info'
                    }));
                  }
                }, function(thisNode) {
                  if (thisNode.id != node.id && thisNode.data.register_link) {
                    count++;
                  }
                }, true);
              }
            }
          }

          // Add a way to provide a generic path.
          if (params.gotoPath && node.data.url && !node.has_goto_link) {

            // Check to see if they have the feature enabled.
            if (
              !params.gotoFeature ||
              (node.data.features && node.data.features[params.gotoFeature])
            ) {
              node.has_goto_link = true;

              // Add the documnet URL to the end of the register
              var link = node.data.url + '/' + params.gotoPath;
              link += '?destination=';
              link += encodeURIComponent(window.document.URL);
              link += '&from=' + rootNode.id;

              // Add a goto link to the group finder.
              node.link.after($(document.createElement('a')).attr({
                'class': params.gotoClass,
                href: link
              }).text(params.gotoText));
            }
          }

          if (params.show_url_link && node.data.url && !node.has_url_link) {
            node.has_url_link = true;
            node.link.after($(document.createElement('a')).attr({
              'class': 'allplayers-url-link',
              href: node.data.url
            }).append($(document.createElement('span')).attr({
              'class': 'ui-icon ui-icon-circle-arrow-e'
            })));
          }
        }
      }
    },params);

    return $(this).each(function() {

      // Create the group_select item.
      $(this).group_select(params);
    });
  };
})(jQuery);

