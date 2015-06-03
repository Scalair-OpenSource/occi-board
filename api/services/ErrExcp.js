/**
 * Generic purpose service to offer facility for low-level tasks.
 */

/* global sails:false */

var
  LEVEL_WARNING = 'warning',
  LEVEL_ERROR = 'error';

module.exports = {

  LEVEL_WARNING: LEVEL_WARNING,
  LEVEL_ERROR: LEVEL_ERROR,

  /**
   * Create a pseudo exception object useful to return normalized errors.
   * @param {[type]} name    [description]
   * @param {[type]} message   [description]
   * @param {[type]} level     [description] debug|info|warning|error|critical
   * @param {[type]} htmlMessage [description]
   * @param {[type]} noLog     [description]
   *
   * @example:
   * - ErrExcp.create('System Error', 'Error detected. Please contact the system administrator.');
   */
  create: function (name, message, level, htmlMessage, noLog) {
    var result;

    if (name instanceof Error) {
      // Pretty exception
      result = {
        name: name.name,
        code: name.code,
        errno: name.errno,
        message: name.message,
        level: LEVEL_ERROR,
        htmlMessage: name.message
      };
    }
    else {
      result = {
        name: name,
        message: message,
        code: LEVEL_ERROR,
        level: level || LEVEL_ERROR,
        htmlMessage: htmlMessage || message
      };
    }

    if (noLog === undefined || !noLog) {
      sails.log.error('[' + result.name + ']', result.message);
    }

    return { error: result };
  },

  isError: function (data, exceptionName) {
    return (data && data.error && data.error.level && [LEVEL_WARNING, LEVEL_ERROR].indexOf(data.error.level) >= 0) &&
      (exceptionName === undefined || (data.error.code && data.error.code.toUpperCase() === exceptionName));
  }
};
