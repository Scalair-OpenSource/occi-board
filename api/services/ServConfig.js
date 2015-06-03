var path = require('path');

module.exports = {

  /**
   * Read and return the server configuration
   * @return {Object}         Javascript object with server configuration
   */
  get: function() {
    return {
      dir_data: path.join(__dirname, '../../data')
    };
  },

  set: function (options) {
    //TODO
    return options;
  }
};
