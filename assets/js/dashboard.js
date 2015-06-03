/* global Modernizr:false */
/* global cloud:false */
/* global __:false */
/* global $OD:false */

var Dashboard = function () {

  // var GRIDSTER_CONTAINER = '.gridster ul';
  // var GRIDSTER_TILES = '.gridster li.gs_w';
  // var WIDGET_TRASH_ICON = '.widget-trash';
  // var $WIDGET_TRASH_ICON_TMPL = $('#widget-trash-icon-template').html();
  // var DURATION_DASHBOARD_REFRESH_ANIMATION = 8000; // milliseconds

  var loadingDashboardCountDown = 10; // 10 steps
  var COUNT_DOWN_UNIT = 2000;           // of 2 seconds
  var tmplTileLoading;
  var loaded = true;
  var WIDGETS_DEFAULT = {
      baseHeight: 260,
      baseWidth: 260,
      marginHorizontal: 4,
      marginVertical: 4
  };
  var widgetsLayout = WIDGETS_DEFAULT; // Current widgets layout properties
  var isFullScreen = false;
  var gridster;

  var init = function () {
    for (var i = 0; i < loadingDashboardCountDown; i++) {
      $('#cloudsystem-loading').append('<i id="cloudsystem-loading-' + (loadingDashboardCountDown - i) + '" class="fa fa-cloud cloud-disabled"></i> ');
    }

    /*
    * Hide controls before displaying anything
    */
    $('#dashboard-show-header').hide();
    //~ $('#fullscreen-toggle-link').hide();

    tmplTileLoading = $('#loading-tile-template').html();

    //~ resizeTilesGrid();
    /*
    $(GRIDSTER_CONTAINER).on('click', WIDGET_TRASH_ICON, function (ev) {
      ev.preventDefault();
      var p = $(ev.target).parents();
      if (p && p.length > 0) {
        var widget = false;
        $.each(p, function (i, el) {
          if (!widget && $(el).is('li')) {
            widget = $(el);
          }
        });
        if (widget) {
          var tile = getTileById(widget.attr('id'));
          if (!tile) {
            gridster.remove_widget(widget);
            return;
          }

          var confirmed = tile.beforeDelete();
          if (confirmed) {
            removeTile(widget.attr('id'), function () {
              gridster.remove_widget(widget);
            });
          }
        }
      }
    });
    */
  };

  var resizeTilesGrid = function () {

  };

  var addTile = function (tile) {

  };

  var createTile = function (tile) {

  };

  var startCloudSystemManager = function () {

  };

  var toggleFullscreen = function (save) {
    $('div.gridster').toggleClass('dashboard-margins');
    $('#dashboard-header').slideToggle();
    isFullScreen = !isFullScreen;
    if (save) {
      saveTiles();
    }
  };

  var saveTiles = function (callback) {

    var data = {
      dashboard: {
        widgets: gridster.serialize(),
        fullscreen: isFullScreen
      }
    };

    if ($OD.currentTheme) {
      data.dashboard.theme = $OD.currentTheme;
    }

    $.ajax({
      type: 'POST',
      url: 'preferences/save',
      data: data,
      complete: function () {},
      success: function () {
        if (callback !== undefined) {
          callback(true);
        }
        if ($OD.currentTheme !== $OD.previousTheme) {
          reload();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        cloud.error.genericHandler(jqXHR, textStatus, errorThrown);
        if (callback !== undefined) {
          callback(false);
        }
      }
    });
  };

  var reload = function () {

  };

  var load = function () {
    $.ajax({
      url: 'preferences/load',
      dataType: 'json'
    })
    .done(function (prefs) {
            $('#updating-indicator').fadeIn('fast');

            if (!prefs || !prefs.dashboard || !prefs.dashboard.widgets || prefs.dashboard.widgets.length === 0) {

                resizeTilesGrid(); // apply theme to tile grid

                /*
                 * No dashboard exists in user preferences so use a default tile set
                 */
                addTile(createTile({
                    class: $OD.tiles.classes.DateTimeCalendar,
                    attr: {
                        dataCol: 1,
                        dataRow: 1
                    }
                }));
                addTile(createTile({
                    class: $OD.tiles.classes.Tasker,
                    dataCol: 2,
                    dataRow: 1
                }));

                startCloudSystemManager();
            }
            else {
                /*
                 * Apply user dashboard preferences
                 */

                if (prefs.dashboard && prefs.dashboard.theme) {
                    $OD.currentTheme = prefs.dashboard.theme;
                    $OD.previousTheme = prefs.dashboard.theme;
                }
                else {
                    $OD.currentTheme = 'cs';
                    $OD.previousTheme = 'cs';
                }

                $.ajax({
                    type: 'GET',
                    url: '/dashboard/theme/' + $OD.currentTheme,
                    dataType: 'json'
                })
                .done(function (data) {
                    // Use new widget layout if any
                    widgetsLayout = data.widgetsLayout ? data.widgetsLayout : WIDGETS_DEFAULT;
                })
                .always(function () {

                    resizeTilesGrid(); // apply theme to tile grid

                    // It's time to fill grid with tiles
                    var C;
                    prefs['dashboard'].each(function (tile) {
                        // Get which tile class to instanciate
                        C = $OD.tiles.getClass(tile.type);
                        if (C) {
                            try {
                                addTile(createTile({
                                    class: C,
                                    attr: {
                                        sizeX: tile.size_x.toNumber(),
                                        sizeY: tile.size_y.toNumber(),
                                        dataCol: tile.col.toNumber(),
                                        dataRow: tile.row.toNumber(),
                                        cfg: tile.cfg
                                    }
                                }));
                            }
                            catch (e) {
                                console.error('Tile error:', e.message);
                                console.error(e.stack);
                            }
                        }
                    });


                    if (prefs.dashboard && cloud.asBool(prefs.dashboard.fullscreen)) {
                        toggleFullscreen(false);
                    }

                    startCloudSystemManager();

                });

            }

    })
    .fail()
    .always();
  };

  /*
  * This method issue a warning after COUNT_DOWN_UNIT millisecond.
  * A successful connexion MUST cancel this!
  */
  var testTimeOut = function () {
    if ($('#cloudsystem-loading:visible').length === 0) {
      return;
    }

    $('#cloudsystem-loading').find('#cloudsystem-loading-' + loadingDashboardCountDown).removeClass('cloud-disabled');

    if (loadingDashboardCountDown <= 0 && !loaded) {
      cloud.notify.error(__('CloudSystem® dashboard server does not respond.'));
      $('#loader-message').html(__('Dashboard not available!'));
    }
    else {
      loadingDashboardCountDown--;
      cloud.setTimeout.call(this, testTimeOut, COUNT_DOWN_UNIT);
    }
  };

  return {
    init: init,
    load: load,
    testTimeOut: testTimeOut
  };

};


$(document).ready(function() {

  cloud.loadLocales($('html').attr('lang'), function () {
    if (!navigator.cookieEnabled) {
      cloud.notify.error( __('You must allow cookie for this application to work!'));
    }

    if (!Modernizr.fontface || !Modernizr.cssgradients || !Modernizr.borderradius || !Modernizr.boxshadow || !Modernizr.opacity || !Modernizr.cssanimations || !Modernizr.canvas || !Modernizr.csstransforms || !Modernizr.csstransforms3d || !Modernizr.csstransitions) {
      cloud.notify.info( __('To take full advantage of this application, you should use a more recent browser.'));
    }

    /*
    * Localization
    */
    $OD.timeZoneName = cloud.getTimeZoneName();

    /*
    * DASHBOARD
    */
    var dashboard = new Dashboard();

    dashboard.init();
    dashboard.testTimeOut();

    /*
    * Create Singletons objects shared by all tiles
    */
    if ($OD.tiles && $OD.tiles.storage) {
      if ($OD.tiles.storage.Tasks) {
        $OD.tiles.storage.tasks = new $OD.tiles.storage.Tasks();
      }

      if ($OD.tiles.storage.Tickets) {
        $OD.tiles.storage.tickets = new $OD.tiles.storage.Tickets();
      }

      dashboard.load();

    }
    else {
      dashboard.load();
    }
  });
});
