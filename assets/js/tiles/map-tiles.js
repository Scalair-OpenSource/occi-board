/*global cloud:true*/
/*global __:true*/
/*global $OD:true*/
/*global L:true*/

/**
 * Class: Webpage
 * A tile to display a webpage.
 */
$OD.tiles.classes.Map = $OD.tiles.classes.BasicTile.extend({

  init: function (config) {

    config = $.extend(config, {
      type: 'Map',
      tmplName: '#map-tile'
    });

    this._super(config);

    // Templates for recto/verso. this is a flipping tile
    this.recto = $('#map-tile-recto').html();
    this.verso = $('#map-tile-verso').html();
    this.cfg.map_name = this.cfg.map_name || __('Map');
    this.cfg.map_refresh = this.cfg.map_refresh ? cloud.formatNumber(this.cfg.map_refresh) : 60;
    // Default longitude and latitude are set to Paris
    this.cfg.map_lg = this.cfg.map_lg ? cloud.formatNumber(this.cfg.map_lg) : 2.333;
    this.cfg.map_la = this.cfg.map_la ? cloud.formatNumber(this.cfg.map_la) : 48.833;
    this.current_map_lg = this.cfg.map_lg;
    this.current_map_la = this.cfg.map_la;
    this.cfg.map_zoom = this.cfg.map_zoom ? cloud.formatNumber(this.cfg.map_zoom) : 13;
    this._map = false; // No map
  },

  getRefreshDelay: function () {
    return this.cfg.map_refresh * 60; // in seconds
  },

  getContent: function () {
    var self = this;

    var content = cloud.assign(self.tmpl, {
      panel: cloud.assign(self.recto, {
        id: self.getId(),
        map_name: self.cfg.map_name || __('Web Page'),
        map_page: cloud.assign($('#map-page').html(), {
          id: self.getId()
        })
      })
    });

    cloud.loader.removeAll(self.getjQueryEl());

    return content;
  },

  redrawMap: function () {
    var self = this;

    // Adjust canvas size to tile size
    var size = self.expandContent();
    var $div = $('#' + self.getId() + '-mappage');
    $div.width($div.parent().width() - 16);
    $div.height(size.h - 8);

    self._map = L.map('map-' + self.getId()).setView([cloud.formatNumber(self.current_map_la), cloud.formatNumber(self.current_map_lg)], cloud.formatNumber(self.cfg.map_zoom));

    /*
     * cloudmade API-KEY: 7347a9f0730c4a34bcfa94ea20ee203a
     */
    L.tileLayer('http://{s}.tile.cloudmade.com/7347a9f0730c4a34bcfa94ea20ee203a/997/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    }).addTo(self._map);

    // Add marker for current location
    var marker = L.marker([cloud.formatNumber(self.current_map_la), cloud.formatNumber(self.current_map_lg)]).addTo(self._map);

    /*
     * Bind events
     */
    self._map.on("zoomend", function (e) {
      self.cfg.map_zoom = e.target._zoom;
    });
  },

  redraw: function () {
    var self = this;

    self.display(self.getContent());

    self.redrawMap();

    if (self.on.afterRefresh) {
      self.on.afterRefresh(self.getId());
    }
  },

  refresh: function () {
    var self = this;

    cloud.loader.startInto(self.getjQueryEl().find('#map-title'));
    self.redraw();
  },

  afterAdd: function () {
    var self = this;

    /*
     * Center map on current position
     */
    self.getjQueryEl().on('click', 'div.header #map-tile-recto-compass-button', function (ev) {
      ev.preventDefault();
      cloud.getGeoLocation(function (position) {
        // Success
        self.current_map_lg = position.coords.longitude;
        self.current_map_la = position.coords.latitude;
        self.redraw();
      },
      function () {
        cloud.notify.error(__('Cannot retrieve your position!'));
      });
    });

    /*
     * Display setup tile
     */
    self.getjQueryEl().on('click', 'div.header #map-tile-recto-setup-button', function (ev) {
      ev.preventDefault();

      self.allowRefresh = false; // Do not allow refresh
      cloud.loader.removeAll(self.getjQueryEl());
      self.getjQueryEl().find('.flipbox').flippy({
        verso: cloud.assign(self.verso, { id: self.getId() }),
        direction: 'left',
        duration: cloud.FLIP_DURATION,
        onFinish: function () {
          // Restore setup properties when animation start to display setup panel (aka verso)
          $('#' + self.getId() + ' input#map_name').val(self.cfg.map_name);
          $('#' + self.getId() + ' input#map_lg').val(self.cfg.map_lg);
          $('#' + self.getId() + ' input#map_la').val(self.cfg.map_la);

          self.map_zoom_slider = self.getjQueryEl().find('input#map_zoom').slider({
            min: 1,
            max: 18,
            tooltip: 'always'
          });

          if (self.cfg.map_zoom > 18) {
            self.cfg.map_zoom = 18;
          }
          if (self.cfg.map_zoom < 1) {
            self.cfg.map_zoom = 1;
          }
          self.map_zoom_slider.slider('setValue', self.cfg.map_zoom);

          cloud.select.set('#' + self.getId() + ' select#map_refresh', 'delay_min', self.cfg.map_refresh);
        },
        onReverseFinish: function () {
          // Setup is done, apply it!
          self.refresh();
        }
      });
    });

    /*
     * Setup is done
     */
    self.getjQueryEl().on('click', '#map-tile-verso-done-button', function (ev) {
      ev.preventDefault();
      self.cfg.map_name = $('#' + self.getId() + ' input#map_name').val();
      self.cfg.map_lg = $('#' + self.getId() + ' input#map_lg').val();
      self.cfg.map_la = $('#' + self.getId() + ' input#map_la').val();
      self.current_map_lg = self.cfg.map_lg;
      self.current_map_la = self.cfg.map_la;
      self.cfg.map_zoom = self.map_zoom_slider.slider('getValue');
      self.cfg.map_refresh = cloud.select.get('#' + self.getId() + ' select#map_refresh', 'delay_min');
      self.on.save();
      self.getjQueryEl().find('.flipbox').flippyReverse();
      self.allowRefresh = true; // A refresh
    });

    /*
     * Geo Location
     */
    self.getjQueryEl().on('click', '#map_get_location', function (ev) {
      ev.preventDefault();
      cloud.getGeoLocation(function (position) {
        // Success
        self.getjQueryEl().find('#map_lg').val(position.coords.longitude);
        self.getjQueryEl().find('#map_la').val(position.coords.latitude);
      },
      function () {
        cloud.notify.error(__('Cannot retrieve your position!'));
      });
    });
  }
});
/*
$OD.tiles.register({
  tileClass: $OD.tiles.classes.Map,
  className: 'Map',
  displayName: 'Map',
  faName: 'fa-map-marker'
});
*/
