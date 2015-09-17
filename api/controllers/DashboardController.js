/**
 * DashboardController
 *
 * @description :: Server-side logic for managing dashboards
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var THEME_LIGHT = {
    "id": "cs",
    "name": "Occi Light",
    "widgetsLayout": {
        "baseHeight": 260,
        "baseWidth": 260,
        "marginHorizontal": 4,
        "marginVertical": 4
    }
};
var THEME_DARK = {
    "id": "cs-dark",
    "name": "Occi Dark",
    "widgetsLayout": {
        "baseHeight": 260,
        "baseWidth": 260,
        "marginHorizontal": 4,
        "marginVertical": 4
    }
};

module.exports = {

    /**
     * `DashboardController.themes()`
     */
    themes: function(req, res) {
        return res.json([THEME_LIGHT, THEME_DARK]);
    },

    theme: function(req, res) {
        return res.json(THEME_LIGHT);
    }

};
