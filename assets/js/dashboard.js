var Dashboard = function () {

  var GRIDSTER_CONTAINER = '.gridster ul';
  var GRIDSTER_TILES = '.gridster li.gs_w';
  var WIDGET_TRASH_ICON = '.widget-trash';
  var $WIDGET_TRASH_ICON_TMPL = $('#widget-trash-icon-template').html().compact();
  var DURATION_DASHBOARD_REFRESH_ANIMATION = 8000; // milliseconds

  function init(config) {
    _prefs = config.preferences;
    _vm = config.managers.VM;
    _orders = config.managers.orders;
    _companies = config.managers.companies;
    _users = config.managers.users;
    _products = config.managers.products;

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
  }

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
