/**
* DashboardController
*
* @description :: Server-side logic for managing dashboards
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {



  /**
  * `DashboardController.themes()`
  */
  themes: function (req, res) {
    return res.json([
      {"id":"cs","name":"CloudSystem©","widgetsLayout":{"baseHeight":260,"baseWidth":260,"marginHorizontal":4,"marginVertical":4}},{"id":"cs-dark","name":"CloudSystem® Dark","widgetsLayout":{"baseHeight":260,"baseWidth":260,"marginHorizontal":4,"marginVertical":4}},
      {"id":"cs-dark-bf","name":"CloudSystem® Dark (big font)","widgetsLayout":{"baseHeight":260,"baseWidth":260,"marginHorizontal":4,"marginVertical":4}},
      {"id":"cs-light-bf","name":"CloudSystem® Light (big font)","widgetsLayout":{"baseHeight":260,"baseWidth":260,"marginHorizontal":4,"marginVertical":4}}
    ]);
  }
};
