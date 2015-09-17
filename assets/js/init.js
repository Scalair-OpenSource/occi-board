/*global console:false*/
/*global cloud:false*/
/*global registerCloudI18N:false*/
/*global registerCloudFormat:false*/
/*global registerCloudInput:false*/
/*global registerCloudREST:false*/

/**
 * Namespace: $OD
 * This namespace for Occiware Dashboard.
 */
if ($OD === undefined) {
  var $OD = {};
}

/*
 * Init application libraries
 */
$(document).ready(function() {
  try { registerCloudI18N(cloud); } catch (e) { console.log(e); }
  try { registerCloudFormat(cloud); } catch (e) { console.log(e); }
  try { registerCloudInput(cloud); } catch (e) { console.log(e); }
  try { registerCloudREST(cloud); } catch (e) { console.log(e); }

  // Get a CSRF token for this session
  cloud.getCSRFToken(function (token) {
      $OD.CSRF_TOKEN = token;
  });
});
