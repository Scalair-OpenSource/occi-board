/*global moment:true*/
/*global Class:true*/
/*global cs:true*/
/*global cloud:true*/
/*global __:true*/

/**
 * Method: getClass
 * This method return the tile class according to the given class name.
 *
 * Parameters:
 * className - A string with the name of the class to return. This is case sensitive!
 *
 * Returns:
 * The class of the tile or undefined if none found.
 *
 * Example:
 * var TileClass = $OD.tiles.getClass('BasicTile');
 * var myTile = new TileClass({ ... }); // Instanciate the tile
 */
$OD.tiles.getClass = function (className) {
  var C;

  Object.keys($OD.tiles.classes, function (key, value) {
    if (key === className) {
      C = value;
    }
  });

  return C;
};

/**
 * Method: getClassList
 * Returns the list of available class to instanciate tiles.
 *
 * Returns:
 * An array of string for class names.
 */
$OD.tiles.getRegister = function () {
  return $OD.tiles.reg;
};

/**
 * Method: register
 * Register a tile class so that it appear in the dashboard menu (to add it to the dashboard).
 */
$OD.tiles.register = function (config) {
  if (!config.tileClass) {
    throw 'tileClass is mandatory!';
  }

  if (!config.className) {
    throw 'className is mandatory!';
  }

  if (!config.displayName) {
    throw 'displayName is mandatory!';
  }

  $OD.tiles.reg.push({
    tileClass: config.tileClass,
    className: config.className,
    displayName: config.displayName,
    iconName: config.iconName !== undefined ? config.iconName : 'icon-widget-default.png',
    faName: config.faName !== undefined ? config.faName : 'fa-square-o' // fontawesome icon
  });
};

$OD.tiles.getRegisteredClass = function (className) {
  var c;
  $OD.tiles.reg.each(function (r) {
    if (r.className === className) {
      c = r;
    }
  });

  return c;
};

$OD.tiles.getRegisteredDisplayName = function (className) {
  var c = $OD.tiles.getRegisteredClass(className);
  if (c) {
    return c.displayName;
  }

  return undefined;
};

/**
 * Class: BasicTile
 * A class for a the simplest tile with only a html template to render. This is the ancestor of all tiles. Use it to create yours.
 */
$OD.tiles.classes.BasicTile = Class.extend({

  init: function (config) {
    if (!config) {
      throw 'config is mandatory!';
    }

    if (!config.type) {
      throw 'type is mandatory!';
    }

    if (!config.tmplName) {
      throw 'tmpl is mandatory!';
    }

    this.errorTmpl = $('#basic-error-template').html().compact();
    this.loadingTmpl = $('#loading-tile-template').html().compact();
    this.workingTmpl = $('#content-loading-tile-template').html().compact();

    this.firstRefresh = true;
    this.allowRefresh = true;
    this.forceRefresh = false;
    this.lastRefresh = 0;
    this._lastRefreshMoment = 0;
    this._gentleRedrawHandle = false;

    this.id = config.id || cloud.createGUID();
    this.type = config.type; // The name of the class to instanciate the tile
    this.tmpl = $(config.tmplName).html().compact(); // HTML Template to render the tile
    if (config.sizeX) {
      this.sizeX = config.sizeX;
    }
    else {
      this.sizeX = $(config.tmplName).attr('sizex') || 1; // Width of tile in gridster unit
    }
    this.minSizeX = $(config.tmplName).attr('min-sizex') || this.sizeX; // Minimum width of tile in gridster unit
    this.maxSizeX = $(config.tmplName).attr('max-sizex') || this.sizeX; // Maximum width of tile in gridster unit
    if (config.sizeY) {
      this.sizeY = config.sizeY;
    }
    else {
      this.sizeY = $(config.tmplName).attr('sizey') || 1; // Height of tile in gridster unit
    }
    this.minSizeY = $(config.tmplName).attr('min-sizey') || this.sizeY; // Minimum height of tile in gridster unit
    this.maxSizeY = $(config.tmplName).attr('max-sizey') || this.sizeY; // Maximum height of tile in gridster unit
    this.dataCol = config.dataCol || 1; // Position of tile in gridster unit
    this.dataRow = config.dataRow || 1; // Position of tile in gridster unit
    this.addCls = config.addCls || ''; // Custom CSS class to add to the tile container
    this.cfg = config.cfg || {}; // Custom tile configuration values

    this._isWorking = false;

    this.on = {}; // Callbacks
    this.on.save = config.onSave || function () {}; // Call this when tile needs to save its properties
    this.on.afterRefresh = config.onAfterRefresh || function () {}; // Call this when tile as refreshed its display
    this.addTile = config.addTile || function () {}; // Call this to create a tile on dashboard
    this.onGarbage = config.onGarbage;
  },

  /**
   * Method: getLoadingTile
   * Return the HTML content to display a tile with a loading message.
   */
  getLoadingTile: function () {
    var c = $OD.tiles.getRegisteredClass(this.type);
    return this.loadingTmpl.assign({
      tile_header: c && __(c.displayName) || ''
    }).compact();
  },

  /*
   * Method: expandContent
   * Make content div (div.content) height to resize to tile size, except tile header.
   *
   * Returns:
   * An object with the size { int h, int w } of the content in pixels.
   */
  expandContent: function () {
    var width = 0;
    var height = 0;
    var $content = this.getjQueryEl().find('div.content');
    if ($content) {
      var $header = $content.parent().find('div.header');
      var h = 0;
      if ($header) {
        h = $header.height();
      }
      //~ height = $content.parent().height() - h - 6; // some pixel to give a nice bottom margin
      height = $content.parentsUntil('.gs_w').parent().height() - h - 6; // some pixel to give a nice bottom margin
      $content.height(height);
      width = $content.width();
    }

    return {
      h: height,
      w: width
    };
  },

  /**
   * Method: afterAdd
   * This method is called once, just before this tile is inserted into the grid (and its DOM does not exist yet).
   */
  beforeAdd: function () {},

  /**
   * Method: afterAdd
   * This method is called once, just after this tile is inserted into the grid (and its DOM now exists).
   */
  afterAdd: function () {},

  /**
   * Method: beforeDelete
   * This method is called when a tile is going to be deleted.
   *
   * Returns:
   * true - To delete the tile (default).
   * false - To cancel deletion.
   */
  beforeDelete: function () {
    return true;
  },

  /**
   * Method: getContent
   * Returns the HTML to insert into the grid.
   */
  getContent: function () {
    return this.tmpl.trim();
  },

  /**
   * Method: emptyContent
   */
  emptyContent: function () {
    //
  },

  /**
   * Method: getId
   */
  getId: function () {
    return this.id;
  },

  /**
   * Method: getId$
   * Returns a string containing the identifier of the tile for use in jQuery.
   */
  getId$: function () {
    return '#' + this.id;
  },

  /**
   * Method: getCfg
   */
  getCfg: function () {
    return this.cfg;
  },

  /**
   * Method: getjQueryEl
   */
  getjQueryEl: function () {
    return $('#' + this.id);
  },

  /**
   * Method getSizeX
   * Return the width of a the widget. This is not in pixel, but in grid step.
   */
  getSizeX: function () {
    try {
      return this.getjQueryEl().attr('data-sizex').toNumber();
    }
    catch (e) {
      return 0;
    }
  },

  /**
   * Method getSizeY
   * Return the height of a the widget. This is not in pixel, but in grid step.
   */
  getSizeY: function () {
    try {
      return this.getjQueryEl().attr('data-sizey').toNumber();
    }
    catch (e) {
      return 0;
    }
  },

  /**
   * Method getSize
   * Return the size of a the widget. This is not in pixel, but in grid step.
   */
  getSize: function () {
    try {
      return {
        x: this.getjQueryEl().attr('data-sizex').toNumber(),
        y: this.getjQueryEl().attr('data-sizey').toNumber()
      };
    }
    catch (e) {
      return { x: 0, y: 0 };
    }
  },

  /**
   * Method: getRefreshDelay
   * Return the number of seconds to wait before redrawing the tile
   */
  getRefreshDelay: function () {
    return 60 * 15; // Refresh 15 minutes
  },

  /**
   * Method: setRefreshIn
   * Set the next refresh to occurs in given seconds.
   */
  setRefreshIn: function (sec) {
    this.lastRefresh = Date.create().addSeconds(-this.getRefreshDelay() + sec);
  },

  /**
   * Method: isFirstRefresh
   */
  isFirstRefresh: function () {
    var r = this.firstRefresh;
    this.firstRefresh = false;
    return r;
  },

  /**
   * Method: isRefreshAllowed
   */
  isRefreshAllowed: function () {
    return this.allowRefresh;
  },

  /*
   * Method: isWorking
   */
  isWorking: function () {
    return this._isWorking;
  },

  /*
   * Method: isForceRefresh
   */
  isForceRefresh: function () {
    var fr = this.forceRefresh;
    this.forceRefresh = false;
    return fr;
  },

  /*
   * Remove usual visual consrols
   */
  garbage: function () {
    this.getjQueryEl().find('.select2-container').select2('destroy');
    this.getjQueryEl().find('.mCustomScrollbar').mCustomScrollbar('destroy');
  },

  /*
   * Method: display
   */
  display: function (html) {

    // console.log(moment().format('HH:mm:ss.ss'), this.getId(), ':', this.getCfg());
    // console.log(moment().format('HH:mm:ss.ss'), this.getId(), 'Can display:', $OD.tiles.canRedraw);

    if ($OD.tiles.canRedraw && html) {
      this._lastRefreshMoment = moment();
      if (this.onGarbage) {
        try {
          this.onGarbage();
        }
        catch (e) {}
      }

      this.garbage();
      this.getjQueryEl().empty(); // Remove obsolete DOM
      this.getjQueryEl().html(html);

      if ($OD.userProp.watermark && this.getSizeX() > 1) {
        this.getjQueryEl().find('.widget-title')
        // .removeClass('widget-title-background-watermark')
        .addClass('widget-title-background-watermark');
      }

      this._gentleRedrawHandle = false;
      return true;
    }

    this._gentleRedrawHandle = false;
    return false;
  },

  /*
   * Method: refresh
   */
  refresh: function (config) {
    this.display(this.getContent());
    if (config && config.onAfterRefresh) {
      config.onAfterRefresh();
    }
  },

  gentleRedraw: function() {
    if (!this._gentleRedrawHandle && this.redraw) {
      // console.log(moment().format('HH:mm:ss.sss'), this);
      this.redraw.bind(this).delay(1000); // Force refresh
      this._gentleRedrawHandle = true;
    }
  },

  /**
   * Method: timeSinceLastRefresh
   * Returns the number of milliseconds since last rehresh that produce a result
   */
  getMsSinceLastRefresh: function () {
    return moment().diff(this._lastRefreshMoment);
  },

  itsTimeToRefresh: function (delay) {
    return this.getMsSinceLastRefresh() >= delay;
  },

  /*
   * Method: toggleWorking
   */
  toggleWorking: function (working) {
    if (working !== undefined) {
      this._isWorking = working;
    }
    else {
      this._isWorking = !this._isWorking;
    }

    if (this._isWorking) {
      this.getjQueryEl().find('.content').html(this.workingTmpl);
    }
    else {
      this.getjQueryEl().find('.tile-curtain').fadeOut();
    }
  }

});
