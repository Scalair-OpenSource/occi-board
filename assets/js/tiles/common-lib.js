/*global cloud:true*/
/*global __:true*/
/*global cs:true*/
/*global moment:true*/

/**
 * Namespace: $od.tiles
 * This namespace contains all stuff to manage tiles for CloudSystem® application.
 *
 * Content:
 * $od.tiles - Object that store registered tiles, class of tiles and shared data. You will seldom need to use it.
 * $od.tiles.classes.BasicTile - Class to use for ancestor of custom classes.
 */
$od.tiles = {
    /*
     * Var: $od.tiles.reg
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
$od.tiles.lib = {

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
