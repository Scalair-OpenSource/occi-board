/*global cloud:true*/
/*global __:true*/
/*global cs:true*/
/*global moment:true*/

/**
 * Namespace: $OD.tiles
 * This namespace contains all stuff to manage tiles for CloudSystem® application.
 *
 * Content:
 * $OD.tiles - Object that store registered tiles, class of tiles and shared data. You will seldom need to use it.
 * $OD.tiles.classes.BasicTile - Class to use for ancestor of custom classes.
 */
$OD.tiles = {
  /*
   * Var: $OD.tiles.reg
   * Register the published tile class
   */
  reg: [], // The register that contains tiles class
  classes: {}, // The tile classes library
  storage: {}, // The common storage shared by tiles
  canRedraw: true// Allow widgets to draw themselves
};

/**
 * Functions that offers facilities shared between tiles
 */
$OD.tiles.lib = {

  /**
   * Method: displayBadge
   * Return HTML content for a count badge. It returns an empty string if count = 0 (zero).
   */
  displayBadge: function (count, customCls) {
    if (count) {
      return '<span class="badge ' + (customCls || '') + '">' + count + '</span>';
    }
    else {
      return '';
    }
  }

};
