/**
 * Generic purpose service to offer facility for low-level tasks.
 */

/* global sails:false */

module.exports = {

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
      result = {
        name: name.name,
        message: name.message,
        level: 'error',
        htmlMessage: name.message
      };
    }
    else {
      result = {
        name: name,
        message: message,
        level: level || 'error',
        htmlMessage: htmlMessage || message
      };
    }

    if (noLog === undefined || !noLog) {
      sails.log.error('[' + result.name + ']', result.message);
    }

    return result;
  }
};
