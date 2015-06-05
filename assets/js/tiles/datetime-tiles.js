/*global moment:true*/
/*global cloud:true*/
/*global __:true*/
/*global $OD:true*/

/**
 * Class: DateTimeCalendar
 * A class for a medium sized date/time tile. It's a flip tile that have a setup form at its back.
 */
$OD.tiles.classes.DateTimeCalendar = $OD.tiles.classes.BasicTile.extend({

  init: function (config) {

    config = $.extend(config, {
      type: 'DateTimeCalendar',
      tmplName: '#datetime-medium-tile'
    });

    this._super(config);

    this.tmplCalendar = '<div class="controls">' +
      '<div class="clndr-previous-button"><i class="fa fa-chevron-circle-left"></i></div><div class="month"><%= month %> <%= year %></div><div class="clndr-next-button"><i class="fa fa-chevron-circle-right"></i></div>' +
      '</div>' +
      '<div class="days-container">' +
      '  <div class="days">' +
      '    <div class="headers">' +
      '      <% _.each(daysOfTheWeek, function(day) { %><div class="day-header"><%= day %></div><% }); %>' +
      '    </div>' +
      '    <% _.each(days, function(day) { %><div class="<%= day.classes %>" id="<%= day.id %>"><%= day.day %></div><% }); %>' +
      '  </div>' +
      '  <div class="events">' +
      '    <div class="headers">' +
      '      <div class="x-button"><i class="fa fa-reply"></i></div>' +
      '      <div class="event-header">' + __('Events') + '</div>' +
      '    </div>' +
      '    <div class="widget-scrollbar events-list">' +
      '      <% _.each(eventsThisMonth, function(event) { %>' +
      '        <div class="event <%= event.type %>">' +
      '          <a href="<%= event.url %>"><%= moment(event.date).format("ll") %> <i class="fa fa-long-arrow-right"></i> <%= event.title %></a>' +
      '        </div>' +
      '      <% }); %>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    // this.tmplCalendar = '<div class="controls">' +
    //   '<div class="clndr-previous-button"><i class="fa fa-chevron-circle-left"></i></div><div class="month"><%= month %> <%= year %></div><div class="clndr-next-button"><i class="fa fa-chevron-circle-right"></i></div>' +
    //   '</div>' +
    //   '<div class="days-container">' +
    //   '  <div class="days">' +
    //   '    <div class="headers">' +
    //   '      <% _.each(daysOfTheWeek, function(day) { %><div class="day-header"><%= day %></div><% }); %>' +
    //   '    </div>' +
    //   '    <% _.each(days, function(day) { %><div class="<%= day.classes %>" id="<%= day.id %>"><%= day.day %></div><% }); %>' +
    //   '  </div>' +
    //   '  <div class="events">' +
    //   '    <div class="headers">' +
    //   '      <div class="x-button"><i class="fa fa-reply"></i></div>' +
    //   '      <div class="event-header">' + __('Events') + '</div>' +
    //   '    </div>' +
    //   '    <div class="widget-scrollbar events-list">' +
    //   '      <% _.each(eventsThisMonth, function(event) { %>' +
    //   '        <div class="event <%= event.type %>">' +
    //   '          <a href="<%= event.url %>"><%= moment(event.date).format("ll") %> <i class="fa fa-long-arrow-right"></i> <%= event.title %></a>' +
    //   '        </div>' +
    //   '      <% }); %>' +
    //   '    </div>' +
    //   '  </div>' +
    //   '</div>';
    //
    // Templates for recto/verso. this is a flipping tile
    this.recto = $('#datetime-medium-tile-recto').html();
    this.verso = $('#datetime-medium-tile-verso').html();
    this.cfg.displayHour = cloud.asBool(this.cfg.displayHour);
    this.$calendar = false; // Calendar instance done at first rendering

    this.tasks = $OD.tiles.storage.tasks; // Get a reference to shared tasks storage
    this.events = [];
  },

  getRefreshDelay: function () {
    return 5 * 60; // Refresh 5 minute
  },

  getContent: function () {
    var self = this;

    return cloud.assign(self.tmpl, {
      panel: cloud.assign(self.recto, {
        date_short: moment().format('LL'),
        date_tooltip: moment().format('LLLL'),
        hiddenhour: self.cfg.displayHour ? '' : 'hide'
      })
    }).trim();
  },

  redraw: function () {
    var self = this;

    self.display(self.getContent());

    /*
     * Create the calendar and feed it with the events
     */
    var $calendarContainer = $('#' + self.getId() + ' .clndr-calendar');
    if (self.$calendar) {
      delete(self.$calendar);
    }
    self.$calendar = $calendarContainer.clndr({
      template: self.tmplCalendar,
      events: [],
      adjacentDaysChangeMonth: false, // otherwise conflict with click on event!
      forceSixRows: true,
      clickEvents: {
        click: function(target) {
          if(target.events.length) {
            self.allowRefresh = false; // Do not allow refresh
            var daysContainer = $calendarContainer.find('.days-container');
            daysContainer.toggleClass('show-events', true, function () {
              if (self.on.afterRefresh) {
                self.on.afterRefresh(self.getId());
              }
            });
            $calendarContainer.find('.x-button').click( function() {
              daysContainer.toggleClass('show-events', false);
              self.allowRefresh = true; // Allow refresh
            });
          }
        }
      }
    });

    if (self.$calendar) {
      self.$calendar.setEvents(self.events);
    }
  },

  refresh: function () {
    var self = this;

    $.ajax({
      type: 'GET',
      url: '/task/events',
      dataType: 'json',
      success: function (json) {
        if (json && json.records) {
          self.events = json.records;
        }
        self.redraw();
      },
      complete: function () {
        self.redraw();
      }
    });
  },

  afterAdd: function () {
    var self = this;

    /*
     * Click on date/time to display current month in calendar
     */
    self.getjQueryEl().on('click', '#datetime', function () {
      if (self.$calendar) {
        self.$calendar.setMonth(moment().month());
        self.$calendar.setYear(moment().year());
      }
    });

    /*
     * Display setup tile
     */
    self.getjQueryEl().on('click', '#datetime-medium-tile-recto-setup-button', function (ev) {

      self.allowRefresh = false; // Do not allow refresh

      ev.preventDefault();
      self.getjQueryEl().find('.flipbox').flippy({
        verso: self.verso,
        direction: 'left',
        noCSS: false,
        duration: cloud.FLIP_DURATION,
        onFinish: function () {
          // Restore setup properties when animation start to display setup panel (aka verso)
          cloud.checkbox.set('#' + self.id + ' input#display-time', self.cfg.displayHour);
        },
        onReverseFinish: function () {
          // Setup is done, apply it!
          self.redraw();
        }
      });
    });

    /*
     * Setup is done
     */
    self.getjQueryEl().on('click', '#datetime-medium-tile-verso-done-button', function (ev) {
      ev.preventDefault();

      self.cfg.displayHour = cloud.checkbox.isChecked('#' + self.id + ' input#display-time');
      self.on.save();

      self.getjQueryEl().find('.flipbox').flippyReverse();

      self.allowRefresh = true; // Allow refresh
    });

    // Stay aware about tasks refresh
    self.tasks.register(self.getId(), self, self.refresh);
  }

});

$OD.tiles.register({
  tileClass: $OD.tiles.classes.DateTimeCalendar,
  className: 'DateTimeCalendar',
  displayName: 'Calendar',
  faName: 'fa-clock-o'
});
