/**
 * PreferencesController
 *
 * @description :: Server-side logic for managing preferences
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/* global ServConfig:false */
/* global FilesDirs:false */
/* global ErrExcp:false */

var path = require('path');

var DEFAULT_PREFERENCES = {
  locale: 'en',
  dashboard: {
    widgets: []
  }
};

module.exports = {

  /**
   * `PreferencesController.load()`
   */
  load: function (req, res) {
    var config = ServConfig.get();
    var dest = req.user && req.user.id ? req.user.id : 'global';
    var prefs = FilesDirs.loadJSON(path.join(config.dir_data, dest + '.json'));
    // First time user does not have any prefs yet
    if (ErrExcp.isError(prefs, 'ENOENT') ) {
      prefs = DEFAULT_PREFERENCES;
    }

    return res.json(prefs);
  },


  /**
   * `PreferencesController.save()`
   */
  save: function (req, res) {
    var config = ServConfig.get();
    var dest = req.user && req.user.id ? req.user.id : 'global';

    var result = FilesDirs.saveJSON(req.body, path.join(config.dir_data, dest + '.json'));
    if (result === true) {
      return res.json({
        error: 200
      });
    }
    else {
      return res.json(result);
    }
  }
};
