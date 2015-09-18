/**
* TaskController
*
* @description :: Server-side logic for managing task
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

/* global Task:false */

var moment = require('moment');

module.exports = {

  /*
  * Return all published tasks with due date not older than one year.
  */
  events: function (req, res) {

    var d = moment().subtract(1, 'year'); // Do not load task older than one year.

    Task.find({
      due_date: { $gt: d },
      $or: [
        // { id_user: req.user.id },
        { published: true }
      ]}, function (err, tasks) {
        return res.json(err ? 500 : 200, err || { total: tasks.length, records: tasks });
      });

  }

};
