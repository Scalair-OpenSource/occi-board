/*global moment:true*/
/*global cloud:true*/
/*global __:true*/
/*global cs:true*/

/**
 * Class: Tasker
 * A simple analog clock without user interaction.
 */
$od.tiles.classes.Tasker = $od.tiles.classes.BasicTile.extend({

    init: function (config) {

        config = Object.merge(config, {
            type: 'Tasker',
            tmplName: '#tasker-medium-tile'
        });

        this._super(config);

        this.tmplRecto = $('#tasker-medium-tile-recto').html().compact();
        this.tmplTask = $('#tasker-medium-tile-task').html().compact();

        this.tasks = $od.tiles.storage.tasks; // Get a reference to shared tasks storage
        this.tasks.setOwner(this.getId());
    },

    getRefreshDelay: function () {
        return 60 * 60; // Refresh every hour
    },

    afterAdd: function () {
        var self = this;

        /*
         * Expand form to input a task
         */
        self.getjQueryEl().on('focus', '#task-caption-input', function (ev) {
            ev.preventDefault();

            // Reset inputs
            cloud.input.setDate(self.getjQueryEl().find('#due-date-picker'), null);
            self.getjQueryEl().find('#task-url-input').val('');
            cloud.checkbox.set('#input-publish-' + self.id, false);

            self.getjQueryEl().find('#form-secondary').removeClass('hide').slideDown();
        });

        /*
         * Add a new task
         */
        self.getjQueryEl().on('click', 'button.btn-task-add', function (ev) {
            ev.preventDefault();
            self.getjQueryEl().find('#form-secondary').slideToggle();

            var caption = self.getjQueryEl().find('#task-caption-input').val().trim();
            var due = cloud.input.getDate(self.getjQueryEl().find('#due-date-picker'));
            var url = self.getjQueryEl().find('#task-url-input').val() || '';
            var pub = cloud.checkbox.isChecked('#input-publish-' + self.id);
            if (caption) {
                self.tasks.add({
                    caption: caption,
                    url: url.trim(),
                    due_date: due > 0 ? due : null,
                    finished: false,
                    published: pub,
                    onSuccess: function () {
                        self.redraw();
                    }
                });
            }
        });

        /*
         * Handle link to remove all finished tasks
         */
        self.getjQueryEl().on('click', 'a#remove-finished-tasks', function (ev) {
            ev.preventDefault();

            self.tasks.delAllFinished({
                onSuccess: function () {
                    self.redraw();
                }
            });
        });

        /*
         * Handle checkbox to finish/unfinish a task
         */
        //~ self.getjQueryEl().on('click', '#task-list-' + self.getId() + ' li.task-item', self, self.onToggleFinished);
        self.getjQueryEl().on('click', '#task-list-' + self.getId() + ' .icon-finished', self, self.onToggleFinished);
    },

    onToggleFinished: function (ev) {
        ev.preventDefault();
        var $task = $(this);
        ev.data.tasks.setFinished({
            id: $task.attr('data-task-id'),
            finished: !$task.hasClass('task-finished'),
            onSuccess: function () {
                $task.toggleClass('task-finished');
                $task.parent().toggleClass('task-finished');
            }
        });
    },

    getContent: function () {
        var self = this;

        var taskList = '';
        self.tasks.taskList.each(function (t) {
            taskList += self.tmplTask.assign({
                task_id: t.id,
                task_cls: t.finished ? 'task-finished' : '',
                caption: t.caption,
                tooltip: t.caption,
                url: t.url,
                url_cls: t.url && t.url.length > 0 ? '': 'hide',
                published_cls: t.published ? '': 'hide',
                due_date: t.due_date ? Date.create(t.due_date).toLocaleDateString() : '',
                due_date_cls: t.due_date ? '' : 'hide'
            });
        });

        return self.tmpl.assign({
            panel: self.tmplRecto.assign({
                id: self.getId(),
                tasks: taskList,
                tasks_title: __('Tasks') + $od.tiles.lib.displayBadge(self.tasks.count())
            })
        }).compact();
    },

    redraw: function () {
        var self = this;

        self.display(self.getContent());

        self.getjQueryEl().find('#due-date-picker').datetimepicker({
            locale: cloud.getCurrentLocaleCode(),
            format: 'L',
            minDate: Date.create('2010/01/01'),
            showClear: true,
            showTodayButton: true
        });

        if (self.on.afterRefresh) {
            self.on.afterRefresh(self.getId());
        }

        cloud.attachTooltips(self.getjQueryEl());
    },

    refresh: function () {
        var self = this;

        self.tasks.request({
            id: this.getId(),
            onError: function (msg) {
                //~self.setError(__('No task available!'));
            },
            onComplete: function () {
                self.redraw();
            }
        });
    }

});

$od.tiles.register({
    tileClass: $od.tiles.classes.Tasker,
    className: 'Tasker',
    displayName: 'Tasks',
    faName: 'fa-thumb-tack'
});
