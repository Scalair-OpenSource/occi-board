/*global Modernizr:false*/
/*global cloud:false*/
/*global __:false*/
/*global registerCloudI18N:false*/

/*global CloudModule:false*/
/*global console:false*/

/**
 * Namespace: $OD
 * This namespace for Occiware Dashboard.
 */
var $OD = {};

/*
 * Init application libraries
 */
$(document).ready(function() {
  try { registerCloudI18N(cloud); } catch (e) { console.log(e); }
});
