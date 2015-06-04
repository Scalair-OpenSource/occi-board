/*global console:false*/
/*global cloud:false*/
/*global registerCloudI18N:false*/
/*global registerCloudFormat:false*/

/**
 * Namespace: $OD
 * This namespace for Occiware Dashboard.
 */
if (!$OD) {
  var $OD = {};
}

/*
 * Init application libraries
 */
$(document).ready(function() {
  try { registerCloudI18N(cloud); } catch (e) { console.log(e); }
  try { registerCloudFormat(cloud); } catch (e) { console.log(e); }
});
