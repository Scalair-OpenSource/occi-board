/*global console:true*/
/*global _:true*/
/*global root:true*/
/*global module:true*/
/*global exports:true*/
/*global define:true*/
/*global PNotify:true*/

/**
 * Object: console
 * Create a global console object to debug in browser that do not have one!
 */
if (typeof console === 'undefined') {
  console = {
    error: function () {
    },

    log: function () {
    },

    info: function () {
    }
  };
}

/**
 * Namespace: cloud
 * This object contains all facilities to create CloudSystem® web app.
 *
 * Dependencies:
 * jQuery - http://www.jquery.com/
 * sugar - http://sugarjs.com/
 * Bootstrap 2 - http://getbootstrap.com/2.3.2/index.html
 * Awesome font - http://fortawesome.github.com/Font-Awesome/
 * validity - http://validity.thatscaptaintoyou.com/
 * pnotify - http://pinesframework.org/pnotify/
 *
 * Example:
 * A full usage will be like the following piece of code.
 * | registerCloudI18N(cloud);
 * | registerCloudFormat(cloud);
 * | registerCloudDatePicker(cloud);
 * | registerCloudGrid(cloud);
 * | registerCloudInput(cloud);
 * | registerCloudPrint(cloud);
 * | cloud.modules = new CloudModule();
 */
(function (root, undefined) {

  var lib = {
    version: '1.0.0',
    major: 1,
    minor: 0,
    build: 0,
    copyright: '2012© Scalair Cloud Library'
  };

  /*
   * You can use templating for string and include {variables}.
   * The variableName are enclosed by brakets.
   *
   * @Example:
   * cloud.assign("The {key} is {value}.", { value: 42, key: "infinite" });
   * will return "The infinite is 42."
   */
  var SCALAIR_INTERPOLATE_DELIMITER = lib.SCALAIR_INTERPOLATE_DELIMITER = /{([\s\S]+?)}/g;

  /*
   * Regular expressions cache
   */
  var regexp = lib.regexp = {
    isFloat: new RegExp(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/)
  };

  // Generic status
  var STATUS = lib.STATUS = {
    UNKNOWN: -1,
    SUCCESS: Number(true),
    OK: Number(true),
    FAILED: Number(false),
    WARNING: 10,
    CRITICAL: 20,
    ERROR: 30
  };

  var CRUD_ACTIONS = lib.CRUD_ACTIONS = {
    // One letter only!
    CREATE: 'C',
    READ: 'R',
    UPDATE: 'U',
    DELETE: 'D',
    ALL: ['C', 'R', 'U', 'D'],
    /*
     * @see http://fortawesome.github.com/Font-Awesome/
     */
    ICONS: {
      'C': 'icon-plus-sign icon-large fa fa-plus-square',
      'R': 'icon-wrench icon-large fa fa-wrench',
      'U': 'icon-edit icon-large fa fa-edit',
      'D': 'icon-trash icon-large fa fa-trash-o'
    },
    // This help will be translated later with @see parent.__
    HELP: {
      'C': 'crud-action-add',
      'R': 'crud-action-refresh',
      'U': 'crud-action-modify',
      'D': 'crud-action-delete'
    },
    /*
     * @see http://en.wikipedia.org/wiki/Create,_read,_update_and_delete
     */
    VERBS: {
      'C': 'POST',
      'R': 'GET',
      'U': 'PUT',
      'D': 'DELETE'
    }
  };

  var effectDuration = lib.effectDuration = 3000;
  var loaderNotification = lib.loaderNotification = false;
  var LOADER_DURATION = lib.LOADER_DURATION = 1500; // Milliseconds
  var NOTIFICATION_DURATION = lib.NOTIFICATION_DURATION = 1500; // Milliseconds
  var NOTIFICATION_DURATION_INFO = lib.NOTIFICATION_DURATION_INFO = 5000; // Milliseconds
  var PASSWORD_ALLOWED_CHARS = lib.PASSWORD_ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz@_-+*&#$£€%!:;.?,<>(){}[]'.split('');
  var FLIP_DURATION = lib.FLIP_DURATION = 250; // Milliseconds
  var SLIDE_DURATION = lib.SLIDE_DURATION = 300; // Milliseconds

  /*
   * Internal values
   */
  var _chrono = 0;

  /**
   * Method: resetChrono
   * This method reset the chrono to zero, you need to startChrono to use it again.
   *
   * Parameters:
   * toConsole - Set this boolean to true to display a message in browser console. Default is true.
   *   */
  var resetChrono = lib.resetChrono = function (toConsole) {
    _chrono = 0;
    if (toConsole === undefined || toConsole) {
      console.log('[chrono] Reset!');
    }
  };

  /**
   * Method: startChrono
   * This method store the current date/time and returns it.
   *
   * Parameters:
   * config.toConsole - Set this boolean to true to display a message in browser console. Default is true.
   *
   * Returns:
   * Current date/time.
   */
  var startChrono = lib.startChrono = function (config) {

    config = $.extend({
      id: '',
      toConsole: true
    }, config);

    _chrono = moment();
    if (config.toConsole) {
      console.log('[chrono] Start {' + config.id + '}:', _chrono);
    }
    return _chrono;
  };

  /**
   * Method: stopChrono
   * This method returns the delay from last startChrono call.
   *
   * Parameters:
   * config.toConsole - Set this boolean to true to display a message in browser console. Default is true.
   *
   * Returns:
   * Delay from last call of startChrono method in milliseconds.
   * It returns 0 (zero) if method startChrono was not called at least once before.
   */
  var stopChrono = lib.stopChrono = function (config) {
    if (_chrono === 0) {
      return 0;
    }
    config = $.extend({
      id: '',
      toConsole: true
    }, config);
    var n = moment();
    if (config.toConsole) {
      console.log('[chrono] Stop {' + config.id + '}:', n, ' (duration: ', n - _chrono, 'ms)');
    }
    return n - _chrono;
  };

  /**
   * method: currentChrono
   * This method returns the delay from last chrono and restart the chrono.
   *
   * Parameters:
   * config.toConsole - Set this boolean to true to display a message in browser console. Default is true.
   *
   * Returns:
   * Current date/time.
   */
  var currentChrono = lib.currentChrono = function (config) {
    stopChrono(config);
    return startChrono(config);
  };

  /**
   * Method: getScreenSize
   * Return the size of the screen in pixels. It returns { width: 0, height: 0 } if it cannot retrieve it!
   *
   * Example:
   * For a full HD monitor, this will return an object { width: 1920, height: 1080 }
   */
  var getScreenSize = lib.getScreenSize = function () {
    try {
      return {
        width: screen.width,
        height: screen.height
      };
    }
    catch (e) {
      return {
        width: 0,
        height: 0
      };
    }
  };

  /**
   * Functions that returns true if argument is a valid one. We use domEl as a
   * parameter so that we're compatible with jQuery Validity plugins.
   *
   * Example:
   *   $.validity.start();
   *   $('#product-add-ref').require().assert(isValid.reference, ERROR_REFERENCE);
   *   var result = $.validity.end();
   *   return result.valid;
   */
  var isValid = lib.isValid = {
    /*
     * A valid name begins must not contains punctuations
     */
    name: function (domEl) {
      var el = $(domEl).val().trim();
      return el.length > 0 && !(/([;,:=+])/).test(el);
    },

    /*
     * A valid login contains lowercase letter and/or numbers
     */
    login: function (domEl) {
      var el = $(domEl).val().trim();
      var regex = /([a-z0-9]*)/g;

      return (el.length > 0) && regex.test(el);
    },

    /*
     * Space is not allowed in passwords
     */
    password: function (domEl) {
      var el = $(domEl).val();
      for (var i = 0; i < el.length; i++) {
        if (PASSWORD_ALLOWED_CHARS.indexOf(el[i]) < 0) {
          return false;
        }
      }
      return true;
    },

    /*
     * International phone number
     */
    phone: function (domEl) {
      var el = $(domEl).val();

      return (/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/).test(el);
    },

    /*
     * No space allowed
     */
    reference: function (domEl) {
      var el = $(domEl).val();
      return el.length > 0 && el.indexOf(' ') < 0;
    },

    /*
     * Currency
     */
    currency: function (domEl) {
      var el = $(domEl).val();
      return !isNaN(parseFloat(el)) && parseFloat(el) >= 0;
    },

    /*
     * Count
     */
    count: function (domEl) {
      var el = $(domEl).val();
      return !isNaN(parseInt(el, 10)) && parseInt(el, 10) > 0;
    }
  };

  var createTinyID = lib.createTinyID = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  /**
   * Method: createGUID
   * Random id generator.
   */
  var createGUID = lib.createGUID = function () {
    return (createTinyID()+createTinyID()+'-'+createTinyID()+'-'+createTinyID()+'-'+createTinyID()+'-'+createTinyID()+createTinyID()+createTinyID());
  };

  /**
   * Method: createShortID
   * Random short id generator.
   */
  var createShortID = lib.createShortID = function () {
    return (createTinyID()+'-'+createTinyID());
  };

  /**
  * Notification use the jQuery pnotify plugin.
  */
  var notify = lib.notify = {
    info: function (msg) {
      new PNotify({
        title: false,
        text: msg,
        delay: NOTIFICATION_DURATION_INFO,
        sticker: false,
        //~ sticker: true,
        //~ sticker_hover: false,   // Pause button is always visible
        closer_hover: false,    // Close button is always visible
        mouse_reset: false,     // Mouse hover does not prevent from hiding
        type: 'info'
      });
    },

    success: function (msg) {
      new PNotify({
        title: false,
        text: msg,
        delay: NOTIFICATION_DURATION,
        sticker: false,
        closer_hover: false,    // Close button is always visible
        mouse_reset: false,     // Mouse hover does not prevent from hiding
        type: 'success'
      });
    },

    error: function (msg) {
      new PNotify({
        title: false,
        text: msg,
        hide: false, // Errors need to be closed manually
        sticker: false,
        closer_hover: false,    // Close button is always visible
        mouse_reset: false,     // Mouse hover does not prevent from hiding
        type: 'error'
      });
    }
  };

  var error = lib.error = {
    /*
     * This return the error given by server (500). Formated as follow:
     *  /error type/error code.
     * @return {Object} This object contains the followings:
     *  {Integer} code  The error code as a number. If none, then 0/zero,
     *  {String} type   The type of the error from error type list. This string
     * is converted to lowercase.
     *
     * Example :
     *  xhr.responseText = 'Internal Server Error. Redirecting to /dberror/11000'
     *  Returns { code: 11000, type: 'dberror' }
     */
    getFromXHR: function (xhr) {
      var err = {
        code: 0,
        type: '',
        msg: ''
      };

      if (xhr) {
        switch (xhr.status) {
        case 500:
          err.code = 500;
          err.type = 'generic error';
          err.msg = xhr.responseText;
          break;
        case 460:
          var jsonXHR;
          try {
            jsonXHR = JSON.parse(xhr.responseText);
          }
          catch (e) {
            jsonXHR = {};
          }

          err.code = jsonXHR.code || xhr.responseText;
          err.msg = xhr.responseText;
          break;

        default:
          err.code = xhr.statusCode();
          err.type = xhr.statusText;
          err.msg = xhr.responseText;
        }
      }

      return err;
    },

    /*
     * Return true if the error from server tell us it's a duplicated key.
     * @return {Boolean}  True for duplicated key.
     *
     * Duplicate violation is returned as error 11000 and 11001 by MongoDB.
     * @See http://www.mongodb.org/display/DOCS/Error+Codes
     */
    isDuplicate: function (xhr) {
      var m = error.getFromXHR(xhr).msg;
      return m.match(/11000/) !== null || m.match(/11001/) !== null;
    },

    /*
     * Return true if the error from server tell us it's a field is of wrong
     * type. Example, the server received a string instead of a number.
     * @return {Boolean}  True for wrong type.
     * @ See node server documentation
     */
    isWrongType: function (xhr) {
      return [1000].find(error.getFromXHR(xhr).code);
    },

    getXHRErrorMessage: function (jqXHR, textStatus, errorThrown) {
      if (error.isDuplicate(jqXHR)) {
        return parent.__('Already exists in database!');
      }
      else if (error.isWrongType(jqXHR)) {
          return parent.__('One field contains erroneous entry!');
      }
      else {
        if (errorThrown !== undefined) {
          var err = '';
          if (_.isString(errorThrown)) {
            err = errorThrown;
          }
          else if (_.isObject(errorThrown)) {
            $.each(errorThrown, function (key, value) {
              if (errorThrown.hasOwnProperty(key)) {
                err += key + ': ' + value + '\n';
              }
            });
          }

          if (jqXHR.responseText && jqXHR.responseText.length) {
            err += '\n' + jqXHR.responseText;
          }

          if (err.trim() !== '') {
            return err;
          }
          else {
            console.error(jqXHR.statusText + ' ' + jqXHR.state());
            if (this.type && this.url) {
              console.error(this.type + ' ' + this.url);
            }
          }
        }
        else if (jqXHR !== undefined) {
          return parent.__('Server raise an error: {error}', { error: error.getFromXHR(jqXHR).msg });
        }
        else {
          return parent.__('Server raise an error!');
        }
      }
    },

    genericHandler: function (jqXHR, textStatus, errorThrown) {
      var err = error.getXHRErrorMessage(jqXHR, textStatus, errorThrown);
      if (err) {
        notify.error(err);
      }
    }
  };

  var isXhrSuccess = lib.isXhrSuccess = function (jqXHR) {
    return (jqXHR.status === 200 || jqXHR.status === 201);
  };

  var security = lib.security = {
    /**
     * This method return the string after removal of script tags.
     */
    xssSanitize: function (str) {
      if (_.isString(str)) {
        return str.stripTags('script');
      }
      else {
        return str;
      }
    },

    /**
     * This method returns the strenght in percent for a given password.
     * 0% is very weak and 100% is extremely strong.
     */
    passwordStrength: function (pwd) {
      var score = 0;

      if (!pwd) {
        return score;
      }

      // Award every unique letter until 5 repetitions
      var letters = {};
      for (var i = 0; i < pwd.length; i++) {
        letters[pwd[i]] = (letters[pwd[i]] || 0) + 1;
        score += 5.0 / letters[pwd[i]];
      }

      // Bonus points for mixing it up
      var variations = {
        digits: /\d/.test(pwd),
        lower: /[a-z]/.test(pwd),
        upper: /[A-Z]/.test(pwd),
        nonWords: /\W/.test(pwd)
      };

      var variationCount = 0;
      for (var check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0;
      }
      score += (variationCount - 1) * 10;

      return score;
    },

    /**
     * Return an object that contains a bootstrap stacked bar, the score and caption according to password strength
     */
    passwordMeter: function (pwd) {
      var bar = '<div class="bar bar-danger" style="width: 40%;"></div>'; // Weak is the default
      var caption = parent.__('Weak');
      var score = security.passwordStrength(pwd);
      if (score > 40) {
        bar += '<div class="bar bar-warning" style="width: 20%;"></div>';
        caption = parent.__('Medium');
      }
      if (score > 60) {
        bar += '<div class="bar bar-info" style="width: 20%;"></div>';
        caption = parent.__('Good');
      }
      if (score > 80) {
        bar += '<div class="bar bar-success" style="width: 20%;"></div>';
        caption = parent.__('Excellent');
      }

      return {
        bar: '<div class="progress password-bar">' + bar + '</div>',
        score: score,
        caption: caption
      };
    },

    /**
     * This event handler can be used to a strength meter near the passwords.
     * Bind it to a keyup event on password input fields.
     * @example:
     *  $('#user-form [class=password]').on('keyup', { form: '#user-form' }, refreshStrengthMeter);
     * All input of password in form id="user-form" will refresh a bar like:
     * <div class="controls">
     *   <input type="password" class="password" id="password">
     *   <span class="help-inline">
     *     <span id="password-bar"></span><span id="password-caption"></span>
     *   </span>
     * </div>
     */
    onRefreshStrengthMeter: function (ev) {
      var meter = security.passwordMeter($(this).val());
      $(ev.data.form).find('#password-bar').html(meter.bar);
      $(ev.data.form).find('#password-caption').html(meter.caption);
    },

    passwordCreate: function (len) {
      var p = '';
      var length = len || 8;

      // Create simple password from A-Z and 1-9 (no zero)
      for (var i = 0; i < length; i++) {
        p += PASSWORD_ALLOWED_CHARS[_.random(35)];
      }

      return p;
    },

    attachRandomGenerator: function (form, link) {
      $(form + ' ' + link).on('click', function (ev) {
        ev.preventDefault();
        var pwd = security.passwordCreate();
        var inputs = $(this).attr('for').split(' '); // Input(s) that will received
        inputs.each(function (input) {
          $(form + ' #' + input).val(pwd).keydown().keyup();
        });
      });
    }
  };

  /**
   * Method: setTimeout
   * Call original window.setTimeout with context applied for "this".
   *
   * Example:
   * | cloud.setTimeout.call(this, refreshTiles, REFRESH_DELAY);
   */
  var setTimeout = lib.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
    var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
    return window.setTimeout(vCallback instanceof Function ? function () {

      // console.log('setTimeout:', vCallback.toString());

      vCallback.apply(oThis, aArgs);
    } : vCallback, nDelay);
  };

  var setInterval = lib.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
    var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
    return window.setInterval(vCallback instanceof Function ? function () {

      // console.log('setInterval:', vCallback.toString());

      vCallback.apply(oThis, aArgs);
    } : vCallback, nDelay);
  };

  /**
   * Method: parseURL
   * This method extract all data from the given URL and returns an hash object.
   *
   * Parameters:
   * url - The URL to parse.
   *
   * Example:
   * Calling parseURL('http://localhost:3000/main?m=quotations') will returns the following:
   * | {
   * |  anchor: "",
   * |  authority: "localhost:3000",
   * |  directory: "/main",
   * |  file: "",
   * |  host: "localhost",
   * |  password: "",
   * |  path: "/main",
   * |  port: "3000",
   * |  protocol: "http",
   * |  query: "id=42&name=john",
   * |  queryKey: {
   * |    query: "42",
   * |    user: "PID"
   * |  },
   * |  id: "42",
   * |  name: "john",
   * |  relative: "/main?id=42&name=john",
   * |  source: "http://localhost:3000/main?id=42&name=john",
   * |  user: "",
   * |  userInfo: ""
   * | }
   */
  var parseURL = lib.parseURL = function (url) {
    var o = {
      strictMode: false,
      key: [
        "source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"
      ],
      q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    };
    var m   = o.parser[o.strictMode ? "strict" : "loose"].exec(url);
    var uri = {};
    var i   = 14;

    while (i--) {
      uri[o.key[i]] = m[i] || "";
    }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) {
        uri[o.q.name][$1] = $2;
      }
    });

    return uri;
  };

  /**
   * Method: getHashCode
   * Create a simple hash from a string.
   *
   * Parameters:
   * s - The string to compute the hash from.
   *
   * Example:
   *
   */
  var getHashCode = lib.getHashCode = function(s) {
    return (s.split('').reduce(function (a, b) {
      a = ( (a << 5) - a) + b.charCodeAt(0);
      return a&a;
    })).hex();
  };

  /**
   * Example:
   * alert(crc32('test').toString(16));//D87F7E0C
   * alert(crc32('test', 0x04c11db7, 0, 0xFFFFFFFF).toString(16));//6C45EEF
   * alert(crc32('test', 0x04c11db7, 0xFFFFFFFF, 0).toString(16));//278081F3
   * alert(crc32('test', 0x04c11db7, 0, 0).toString(16));//F93BA110
   */

  var crc32 = lib.crc32 = function (s) {
    s = String(s);

    var polynomial = arguments.length < 2 ? 0x04C11DB7 : arguments[1];
    var initialValue = arguments.length < 3 ? 0xFFFFFFFF : arguments[2];
    var finalXORValue = arguments.length < 4 ? 0xFFFFFFFF : arguments[3];
    var crc = initialValue;
    var table = [], i, j, c;

    function reverse(x, n) {
      var b = 0;
      while (n) {
        b = b * 2 + x % 2;
        x /= 2;
        x -= x % 1;
        n--;
      }
      return b;
    }

    for (i = 255; i >= 0; i--) {
      c = reverse(i, 32);

      for (j = 0; j < 8; j++) {
        c = ((c * 2) ^ (((c >>> 31) % 2) * polynomial)) >>> 0;
      }

      table[i] = reverse(c, 32);
    }

    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c > 255) {
        throw new RangeError();
      }
      j = (crc % 256) ^ c;
      crc = ((crc / 256) ^ table[j]) >>> 0;
    }

    return (crc ^ finalXORValue) >>> 0;
  };

  /*
   * Disable AJAX caching. Especially for I.E. that is boring with that!
   */
  $.ajaxSetup({ cache: false });

  /*
   * --- Module Definition ---
   *
   * We define a global variable "cloud".
   *
   * Export cloud for CommonJS. If being loaded as an AMD module, define it as such.
   * Otherwise, just add `cloud` to the global object
   */
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lib;
    }
    exports.cloud = lib;
  } else if (typeof define === 'function' && define.amd) {
    // Return the library as an AMD module:
    define([], function() {
      return lib;
    });
  } else {
    // Use lib.noConflict to restore `cloud` back to its original value.
    // Returns a reference to the library's `cloud` object;
    // e.g. `var numbers = lib.noConflict();`
    lib.noConflict = (function(oldCloud) {
      return function() {
        // Reset the value of the root's `cloud` variable:
        root.cloud = oldCloud;
        // Delete the noConflict method:
        lib.noConflict = undefined;
        // Return reference to the library to re-assign it:
        return lib;
      };
    })(root.cloud);

    // Declare library "lib" on the root (global/window) object:
    root.cloud = lib;
  }

  // Root will be `window` in browser or `global` on the server:
})(this);
