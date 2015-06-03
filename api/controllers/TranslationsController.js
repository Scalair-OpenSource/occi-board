/**
 * TranslationsController
 *
 * @description :: Server-side logic for managing translations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/* global _:false */
/* global FilesDirs:false */

var path = require('path');

module.exports = {
  /**
   * `TranslationsController.loadTranslations()`
   * Load translated messages for the locale from request end return them.
   *
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   *
   * The response will also contains attribute "locale" which value is found in
   * the translation file, or, if none exist, it will be the locale from
   * request. It'a a String like "en" or "fr".
   */
  load: function (req, res) {
    return res.json(_.defaults(FilesDirs.loadJSON(path.join(__dirname, '../../config/locales/', req.locale + '.json')), { locale: req.locale }));
  }
};
