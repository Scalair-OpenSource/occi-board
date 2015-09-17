/* global Modernizr:false */
/* global moment:false */
/* global _:false */
/* global cloud:false */
/* global __:false */
/* global $OD:false */

var Dashboard = function () {

  var GRIDSTER_CONTAINER = '.gridster ul';
  var GRIDSTER_TILES = '.gridster li.gs_w';
  var WIDGET_TRASH_ICON = '.widget-trash';
  var $WIDGET_TRASH_ICON_TMPL = $('#widget-trash-icon-template').html();
  var DURATION_DASHBOARD_REFRESH_ANIMATION = 8000; // milliseconds
  var EDITOR_GRID_SCALE = 0.6; // Edition of layout reduce scale to 60% of original size
  var REFRESH_DELAY = 10 * 1000; // Test tile refreshing every 2 seconds.
  // var REFRESH_DELAY_KEEP_ALIVE = 60 * 10 * 1000; // Keep session alive.

  var loadingDashboardCountDown = 10; // 10 steps
  var COUNT_DOWN_UNIT = 2000;         // of 2 seconds
  var tmplTileLoading;
  var loaded = true;

  var WIDGETS_DEFAULT = {
    baseHeight: 260,
    baseWidth: 260,
    marginHorizontal: 4,
    marginVertical: 4
  };
  var widgetsLayout = WIDGETS_DEFAULT; // Current widgets layout properties
  var gridster;
  var isFullScreen = false;
  var dndEnabled = false;
  var tileList = [];
  // var refreshHandler = false; // Manage reloading whole page
  var refreshTilesHandler = false; // Manage refreshing tiles
  var _prefs; // Preferences
  var menuPanel;
  var isEditingLayout = false;

  var init = function () {

   this.REFRESH_DELAY_TIME = 2 * 1000;

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

  };

  var initTilesGrid = function (config) {
    $(GRIDSTER_CONTAINER).gridster({
      namespace: GRIDSTER_CONTAINER,
      widget_margins: [widgetsLayout.marginHorizontal, widgetsLayout.marginVertical],
      widget_base_dimensions: [widgetsLayout.baseWidth, widgetsLayout.baseHeight],
      avoid_overlapped_widgets: false,
      min_cols: config.columns,
      extra_cols: 2,
      extra_rows: 2,
      autogrow_cols: true,
      //~max_cols: null,
      serialize_params: function ($w, wgd) {
        /*
        * Serialize this tile
        */
        if (!$w.attr('id')) {
          // Default tiles (without id) are not saved!
          return {};
        }

        var t = getTileById($w.attr('id'));
        if (!t)  {
          return {};
        }

        return {
          id: $w.attr('id'),
          col: $w.attr('data-col'),
          row: $w.attr('data-row'),
          size_x: $w.attr('data-sizex'),
          size_y: $w.attr('data-sizey'),
          max_size_x: wgd.max_size_x,
          max_size_y: wgd.max_size_y,
          min_size_x: wgd.min_size_x,
          min_size_y: wgd.min_size_y,
          type: t.type,
          cfg: t.cfg
        };
      },
      resize: {
        scale: EDITOR_GRID_SCALE,
        enabled: true,
        helper: 'clone',
        handle_append_to: '.header.widget-title:visible',
        stop: function (ev) {
          var t = getTileById($(ev.target).attr('id'));
          if (t) {
            t.refresh();
            t = null;
          }
        }
      },
      draggable: {
        scale: EDITOR_GRID_SCALE,
        start: function (ev) {
          /*
          * User grab a tile
          */
          $(ev.target).addClass('moving');
        },
        stop: function (ev) {
          $(ev.target).removeClass('moving');
        }
      }
    });

    gridster = $(GRIDSTER_CONTAINER).gridster().data('gridster');
  };

  var getTileById = function (id) {
    var tile;

    _.forEach(tileList, function (item) {
      if (item.id === id) {
        tile = item.tile;
      }
    });

    return tile;
  };

  var resizeTilesGrid = function () {
    var width = $('#tile-container').width();
    var columns = Math.floor(width / (widgetsLayout.baseWidth + widgetsLayout.marginHorizontal));
    if (columns < 1) {
      columns = 1;
    }

    initTilesGrid({
      columns: columns
    });
  };

  var addTile = function (tile, forceSave, callback) {
    try {

      tile.beforeAdd();
      var content;

      if (isEditingLayout || tile.isFirstRefresh()) {
        content = tile.getLoadingTile();
      }
      else {
        content = tile.getContent();
      }

      var el = gridster.add_widget('<li id="' + tile.getId() + '" class="gs_w ui-widget-content ' + tile.addCls + '" data-max-sizex="' + tile.maxSizeX + '" data-max-sizey="' + tile.maxSizeY + '" data-min-sizex="' + tile.minSizeX + '" data-min-sizey="' + tile.minSizeY + '">' + content + '</li>', tile.sizeX, tile.sizeY, tile.dataCol, tile.dataRow);

      tileList.push({
        id: tile.getId(),
        tile: tile, // Tile object
        el: el, // Tile element from jQuery
        lastRefresh: 0 // Last refresh timestamp
      });

      tile.afterAdd();
      if (dndEnabled) {
        // If dashboard is editable : Allow tile dnd, tile removal, tile resizing
        el.addClass('movable').removeClass('not-movable');
        gridster.add_resize_handle($(el));
        addTrash(GRIDSTER_TILES);
      }

      if (forceSave) {
        saveTiles(callback);
      }
      else {
        if (callback !== undefined) {
          callback(true);
        }
      }

    }
    catch (e) {
      console.error('Tile error:', e.message);
      console.error(e.stack);
    }
  };

  var addTrash = function (widget) {
    $($WIDGET_TRASH_ICON_TMPL).prependTo(widget); // Inject trash to allow removal of widget
  };

  var removeTrash = function (widget) {
      $(widget).find(WIDGET_TRASH_ICON).fadeOut(function () {
          $(this).remove(); // Remove trash icon
      });
  };

  var createTile = function (config) {
    // Bind callbacks, if not done with given config
    config.attr = $.extend({
      onSave: saveTiles,
      onAfterRefresh: onAfterRefresh,
      addTile: addTile,
      storages: null
    }, config.attr);

    return new config.class(config.attr);

  };

  var removeTile = function (id, onSuccessCallback) {
    var i = 0;

    var item = -1;
    while (i < tileList.length && item === -1) {
      if (tileList[i].id === id) {
        item = i;
      }
      i++;
    }

    if (item >= 0) {
      $('#' + id).fadeOut({
        queue: true,
        complete: function () {
          tileList.removeAt(i);
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        }
      });
    }
  };

  var show = function () {

    resizeTilesGrid();

    $('#connection-identifier-details').text(
      __('Last connection {d} from {address}.', {
        d: moment($OD.user.connection.last).format('LLLL'),
        address: $OD.user.connection.ip
      })
    );

    $('#dashboard-refresh-button').on('click', function () {
      clearTimeout(refreshTilesHandler);
      $('#dashboard-refresh-button').find('i.fa').addClass('fa-spin');

      // $.each(storages, function (name, store) {
      //     if (store.load){
      //         store.load();
      //     }
      // });

      refreshTiles(true, function () {
        cloud.setTimeout.call(this, function () {
          $('#dashboard-refresh-button').find('i.fa').removeClass('fa-spin');
        }, DURATION_DASHBOARD_REFRESH_ANIMATION);
      });
    });

    // Put tile on top of others if hovered by mouse
    $('#tile-container').on('mouseenter', GRIDSTER_TILES, function () {
      $(this).addClass('stay-on-top');
    });
    $('#tile-container').on('mouseleave', GRIDSTER_TILES, function () {
      $(this).removeClass('stay-on-top');
    });

    $('.fullscreen-toggle-action').on('click', function (ev) {
      ev.preventDefault();
      toggleFullscreen(true);
    });


    /*
    * Handle buttons that activate tabs
    */
    if ($('td.tabs').find('button[data-target]').length <= 1) {
      $('td.tabs').hide();
    }
    else {
      // This will display tab when clicked
      $('td.tabs').on('click', 'button[data-target]', function (ev) {
        ev.preventDefault();

        cloud.loader.removeAll($('td.tabs button[data-target]'));
        cloud.loader.startInto(this);

        $(this).parent().find('button[data-target]').removeClass('selected');
        $(this).addClass('selected').tab('show');
      });

      // Exec function when tab is shown - useful to refresh
      $('td.tabs').on('show.bs.tab', 'button[data-target]', function (e) {

        clearTimeout(refreshTilesHandler); // Disable refresh
        $OD.tiles.canRedraw = false;

        switch ($(e.target).attr('data-target')) {
          default:
          $('#dashboard-buttons > div').slideDown();
          cloud.loader.removeAll($('td.tabs button[data-target]'));
          $OD.tiles.canRedraw = true;
          $('#dashboard-refresh-button').click();
          break;
        }
      });
    }

    menuPanel = $.jPanelMenu({
      menu: '#dashboard-menu',
      trigger: '.dashboard-menu-trigger',
      excludedPanelContent: 'style, scripts, #modals',
      openDuration: cloud.SLIDE_DURATION,
      closeDuration: cloud.SLIDE_DURATION / 2,
      closeOnContentClick: false,
      keyboardShortcuts: false,
      openPosition: '240px',
      beforeOpen: populateMenu,
      afterOpen: function () {
        $('.dashboard-menu-trigger.dashboard-radio').addClass('selected');
        $('#tile-grid').animate({
          transform: 'scale(' + EDITOR_GRID_SCALE + ')'
        });
        dndEnable();
        //~ toggleEditorMode();
      },
      afterClose: function () {
        if (isEditingLayout) {
          //~ toggleEditorMode();
          saveTiles(function () {
            dndDisable();
            $('#tile-grid').animate({
              transform: 'scale(1.0)'
            });
            cloud.setTimeout.call(this, refreshTiles, 3000, true); // Let animation finish before refresh
          });
          $('.dashboard-menu-trigger.dashboard-radio').removeClass('selected');
        }
      }
    });

    // Let the dashboard appears smoothly
    dndDisable();

    // Activate dashboard menu
    menuPanel.on();

    cloud.setTimeout.call(this, reload, 60 * 60 * 1000); // Full reload every hour
  };

  var populateMenu = function () {
    var dm = menuPanel.getMenu();

    $('#dashboard-menu-tiles').off('click');

    dm.empty();
    var tmpl = '<legend class="dashboard-menu-trigger"><i class="fa fa-backward" rel="tooltip" title="' + __('Reduce') + '"></i> ' + __('Available widgets') + '</legend>';

    tmpl += '<ul id="dashboard-menu-tiles" class="fa-ul">';

    _.forEach($OD.tiles.getRegister(), function (r) {
      tmpl += '<li class="dashboard-menu-tile" data-tile-class="' + r.className + '"><i class="fa-li fa ' + r.faName + '"></i>' + __(r.displayName) + '<span class="pull-right"><img src="/images/' + r.iconName + '"></span></li>';
    });

    tmpl += '</ul>';
    dm.append(tmpl);

    dm.append('<p class="message"><i class="fa fa-exclamation-circle"></i> ' + __('Widget refresh is paused.') + '</p>');

    dm.append('<legend>' + __('Themes:') + '</legend><div class="theme-chooser"></div>');

    dm.append('<p class="centered"><a href="https://play.google.com/store/apps/details?id=###"><img alt="Get it on Google Play" src="https://developer.android.com/images/brand/fr_generic_rgb_wo_45.png" /></a></p>');

    $('#dashboard-menu-tiles').on('click', '.dashboard-menu-tile', function (ev) {
      ev.preventDefault();

      if ($('#dashboard-menu-tiles').hasClass('disabled')) {
        return;
      }

      $('#dashboard-menu-tiles').addClass('disabled');
      cloud.loader.removeAll($('.dashboard-menu-tile'));
      cloud.loader.startInto(this);

      var C = $OD.tiles.getClass($(this).attr('data-tile-class'));
      if (C) {
        addTile(createTile({
          class: C,
          attr: {
            dataCol: 1,
            dataRow: 1
          }
        }), false, function (){
          cloud.loader.removeAll($('.dashboard-menu-tile'));
          $('#dashboard-menu-tiles').removeClass('disabled');
        });

        refreshTiles();
      }
    });

    $.ajax({
      type: 'GET',
      url: '/dashboard/themes',
      dataType: 'json'
    })
    .done(function (data) {
      // Use new widget layout if any
      widgetsLayout = data.widgetsLayout ? data.widgetsLayout : WIDGETS_DEFAULT;

      var themesDiv = '';
      var i = 0;
      _.forEach(data, function (t) {
        themesDiv += cloud.assign('<div class="radio"><label><input type="radio" name="themeradios" value="{id}" {checked}>{name}</label></div>', {
          id: t.id,
          name: t.name,
          checked: (t.id === $OD.currentTheme || (!$OD.currentTheme && i === 0)) ? 'checked' : ''
        });
        i++;
      });
      if (themesDiv.length > 0) {
        $('div.theme-chooser')
        .append(themesDiv)
        .show();

        $('div.theme-chooser').on('click', 'input[name=themeradios]', function () {
          $OD.currentTheme = $(this).val();
        });
      }
      else {
        $('div.theme-chooser').empty().hide();
      }
    })
    .fail(function () {
      $('div.theme-chooser').empty().hide();
    });
  };

  var dndEnable = function () {

    clearTimeout(refreshTilesHandler); // Disable refresh

    //~ tileList.each(function (t) {
    //~ t.el.find('div.content').empty();
    //~ });


    $('#dashboard-refresh-button').addClass('disabled');
    addTrash(GRIDSTER_TILES);

    // Allow moving tiles
    gridster.enable();

    gridster.enable_resize();
    $(GRIDSTER_CONTAINER).find('li.gs_w').each(function () {
      gridster.add_resize_handle($(this));
    });

    // Draw a trash to remove the widget
    $('#tile-trash-help').show();
    $('#tile-trash').fadeIn();

    dndEnabled = true;
    isEditingLayout = true;

    cloud.notify.info(__('Widget refresh is paused.'));

    // Show what is draggable
    $(GRIDSTER_CONTAINER).find('li.gs_w').addClass('movable').removeClass('not-movable');
    // Do not allow links (tag <a>) from tiles to jump!
    $(GRIDSTER_CONTAINER).find('a').on('click', function (ev) {
      ev.preventDefault();
    });
  };

  var dndDisable = function () {
    $(GRIDSTER_CONTAINER).find('a').off('click');
    $(GRIDSTER_CONTAINER).find('li.gs_w').removeClass('movable').addClass('not-movable');
    dndEnabled = false;
    isEditingLayout = false;
    $('#tile-trash').fadeOut();

    gridster.disable_resize();
    gridster.disable();

    removeTrash(GRIDSTER_TILES);
    $('#dashboard-refresh-button').removeClass('disabled');

    //~ refreshTilesHandler = cloud.setTimeout.call(this, refreshTiles, REFRESH_DELAY); // Enable refresh
  };

  var refreshTiles = function (forceRefresh, callback) {
    if (!dndEnabled) {
      var i = 0;
      var abort = false;
      while (i < tileList.length && !abort) {

        // Adjust size of tile
        tileList[i].tile.expandContent();

        if (tileList[i].tile.refresh) {
          if (tileList[i].tile.isRefreshAllowed() &&
          (tileList[i].tile.getRefreshDelay() !== 0 || forceRefresh || tileList[i].tile.lastRefresh === 0) &&
          (forceRefresh || tileList[i].tile.isForceRefresh() || tileList[i].tile.lastRefresh === 0 || Date.now() - tileList[i].tile.lastRefresh >= tileList[i].tile.getRefreshDelay() * 1000)) {
            try {
              /*
              * FIXME: Remove the following Profiling Code
              */
              //~ var dn = moment();
              //~ console.log('> refresh start at', dn, '(since: ', dn - tileList[i].tile.lastRefresh, 'ms) ->', tileList[i].tile.type, '/', tileList[i].el.attr('id'));

              tileList[i].tile.refresh({
                forceRefresh: forceRefresh,
                gridster: gridster,
                el: tileList[i].el
              });

              var r = 250 * _.random(0, 20);
              tileList[i].tile.lastRefresh = Date.now() + r;

              //~ console.log(tileList[i].tile.type, '->', r);
              //~ console.log('< refresh stop at', moment(tileList[i].tile.lastRefresh), '(duration: ', tileList[i].tile.lastRefresh - dn, 'ms) ->', tileList[i].tile.type, '/', tileList[i].el.attr('id'));

            }
            catch (e) {
              console.error('Tile error:', e.message);
              console.error(e.stack);
            }
          }
        }

        i++;
        abort = dndEnabled; // User want to move tiles, so do not overload the browser with heavy refresh during this action

        $('#loading-dashboard-curtain').fadeOut();
      }

      updateTime();

      if (callback)  {
        callback();
      }

      if (!abort) {
        refreshTilesHandler = cloud.setTimeout.call(this, refreshTiles, REFRESH_DELAY);
      }
    }
  };

    var updateTime = function () {
        $('.hour-display').text(moment().format('LT'));
    };

  var onAfterRefresh = function (id) {

    var item = getTileById(id);

    if (!item) {
      return;
    }

    // Redraw trash, because widget remove it when refreshed!
    if (dndEnabled) {
      addTrash('#' + id);
    }

    // Refresh custom scrollbars
    if (!item.customScrollbar) {
      /*
      * For a tile to use custom scrollbar, the container that will scroll MUST have the following CSS:
      * 1) Give it the class "widget-scrollbar"
      * 2) Set its overflow to hidden or auto.
      */
      $('#' + id).find('.widget-scrollbar').mCustomScrollbar({
        // theme: 'occi',
        theme: 'light',
        autoHideScrollbar: true,
        mouseWheel: true,
        mouseWheelPixels: 'auto',
        contentTouchScroll: true,
        scrollButtons: {
          enable: false
        }
      });
      item.scrollbar = true;
    }
    else {
      $('#' + id).find('.widget-scrollbar').mCustomScrollbar('update');
    }
  };

  var startOcciboard = function () {
    loaded = true;
    show();
    refreshTiles(true);
    updateTime();
    cloud.setInterval.call(this, updateTime, this.REFRESH_DELAY_TIME);
    // keepAlive();
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
      _crsf: $OD.CSRF_TOKEN,
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

      _prefs = prefs;

      if (!prefs || !prefs.dashboard || !prefs.dashboard.widgets || prefs.dashboard.widgets.length === 0) {

        resizeTilesGrid(); // apply theme to tile grid

        /*
        * No dashboard exists in user preferences so use a default tile set
        */
        addTile(createTile({
          class: $OD.tiles.classes.DateTimeCalendar,
          attr: {
            dataCol: 0,
            dataRow: 1
          }
        }));
        addTile(createTile({
          class: $OD.tiles.classes.Tasker,
          dataCol: 1,
          dataRow: 1
        }));

        startOcciboard();
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
          _.forEach(prefs.dashboard.widgets, function (tile) {
            // Get which tile class to instanciate
            C = $OD.tiles.getClass(tile.type);
            if (C) {
              try {
                addTile(createTile({
                  class: C,
                  attr: {
                    sizeX: cloud.formatNumber(tile.size_x),
                    sizeY: cloud.formatNumber(tile.size_y),
                    dataCol: cloud.formatNumber(tile.col),
                    dataRow: cloud.formatNumber(tile.row),
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

          startOcciboard();

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
    if (loadingDashboardCountDown <= 0 && !loaded) {
      cloud.notify.error(__('Dashboard server does not respond.'));
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
