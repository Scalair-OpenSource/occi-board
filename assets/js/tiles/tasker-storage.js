/*global __:true*/
/*global $OD:true*/

/**
* Class: $OD.tiles.storage.Tasks
* This object allow to retrieve and share alarms with all tiles.
*/
$OD.tiles.storage.Tasks = $OD.tiles.storage.Base.extend({

  init: function (config) {

    this._super(config);
    this._name = 'tasks-storage';

    /**
    * Variable: tasks
    * Array of tasks for current user.
    */
    this.taskList = [];

  },

  /**
  * Method: count
  * Returns the total number of alarms.
  */
  count: function () {
    var self = this;
    return self.taskList.length;
  },

  getTaskById: function (id) {
    var self = this;

    var i = 0;
    var found;
    while (i < self.taskList.length && !found) {
      if (self.taskList[i].id === id) {
        found = self.taskList[i];
      }
      i++;
    }

    return found;
  },

  /**
  * Method: add
  * Add a task to the list.
  *
  * Parameters:
  * config.caption -
  * config.due_date -
  * config.url -
  * config.finished -
  * config.published -
  */
  add: function (config) {
    var self = this;

    $.ajax({
      type: 'POST',
      url: '/task',
      data: {
        _crsf: $OD.CSRF_TOKEN,
        caption: config.caption,
        url: config.url,
        due_date: config.due_date,
        published: config.published,
        finished: false
      },
      success: function (data) {
        if (data && data._id) {
          config.id = data._id;
        }
        self.taskList.add(config, 0);
        if (config.onSuccess) {
          config.onSuccess();
        }
      },
      error: function () {},
      complete: function () {
        self.registerExec();
      }

    });
  },

  /**
  * Method: del
  * Delete a task given its identifier.
  *
  * Parameters:
  * config.id - Identifier of the task to delete.
  * config.onSuccess - Callback if request succeed.
  */
  del: function (config) {
    var self = this;

    $.ajax({
      type: 'DELETE',
      url: '/task',
      data: {
        id: config.id
      },
      success: function () {
        var i = 0;
        while (i < self.taskList.length) {
          if (self.taskList[i].id === config.id) {
            self.taskList.removeAt(i);
          }
          else {
            i++;
          }
        }
        if (config.onSuccess) {
          config.onSuccess();
        }
      },
      error: function () {},
      complete: function () {
        self.registerExec();
      }
    });
  },

  /**
  * Method: delAllFinished
  * Delete all task that are set to finished.
  *
  * Parameters:
  * config.onSuccess - Callback if request succeed.
  */
  delAllFinished: function (config) {
    var self = this;

    $.ajax({
      type: 'DELETE',
      url: '/task/finished',
      data: {},
      success: function () {
        var i = 0;
        while (i < self.taskList.length) {
          if (self.taskList[i].finished) {
            self.taskList.removeAt(i);
          }
          else {
            i++;
          }
        }
        if (config.onSuccess) {
          config.onSuccess();
        }
      },
      error: function () {},
      complete: function () {
        self.registerExec();
      }
    });
  },

  /**
  * Method: setFinished
  * Finish/unfinish a task given its identifier.
  *
  * Parameters:
  * config.id - Identifier of the task to finished/unfinished.
  * config.onSuccess - Callback if request succeed.
  */
  setFinished: function (config) {
    var self = this;

    var t = self.getTaskById(config.id);
    if (t) {
      $.ajax({
        type: 'PUT',
        url: '/task',
        data: {
          id: config.id,
          finished: config.finished
        },
        success: function () {
          t.finished = config.finished;
          if (config.onSuccess) {
            config.onSuccess();
          }
        },
        error: function () {},
        complete: function () {
          self.registerExec();
        }
      });
    }
  },

  /**
  * Method: update
  * Modify a task given its identifier.
  *
  * Parameters:
  * config.id - Identifier of the task to finished/unfinished.
  * config.caption -
  * config.due_date -
  * config.url -
  * config.finished -
  * config.published -
  * config.onSuccess - Callback if request succeed.
  */
  update: function (config) {
    var self = this;

    var t = self.getTaskById(config.id);
    if (t) {
      $.ajax({
        type: 'PUT',
        url: '/task',
        data: {
          id: config.id,
          caption: config.caption,
          due_date: config.due_date,
          published: config.published,
          finished: config.finished,
          url: config.url
        },
        success: function () {
          if (config.onSuccess) {
            config.onSuccess();
          }
        },
        error: function () {},
        complete: function () {
          self.registerExec();
        }
      });
    }
  },

  /**
  * Method: request
  * Ask the server for alarms. Only the owner of this storage can call this method. If no owner, then the request is executed.
  *
  * Parameters:
  * config.onComplete - Callback when request complete, either successfuly or with error. This is always called.
  * config.onError - Callback if an error occurs. It will be given a parameter with the error message.
  * config.onSuccess - Callback if request succeed.
  */
  request: function (config) {
    var self = this;

    if (self._owner && config.id !== self._owner) {
      if (config.onSuccess) {
        config.onSuccess();
      }
      if (config.onComplete) {
        config.onComplete();
      }
    }
    else {

      $.ajax({
        type: 'GET',
        url: '/task'
      })
      .done(function (json) {
        if (json && json.records) {
          self.taskList = json.records;
        }

        if (config.onSuccess) {
          config.onSuccess();
        }

        self.registerExec();
      }

      )
      .fail(function() {
        if (config.onError) {
          config.onError(__('Insufficient rights!'));
        }
      })
      .always(function () {
        if (config.onComplete) {
          config.onComplete();
        }
      });

    }
  }

});
