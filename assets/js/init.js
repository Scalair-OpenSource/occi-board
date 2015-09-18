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

    /*
     * Enable AJAX caching. This will prevent jQuery to add _=(timestamp) that
     * breaks SailsJs REST API.
     * Read https://api.jquery.com/jquery.ajax/
     */
    $.ajaxSetup({ cache: true });

    try { registerCloudI18N(cloud); } catch (e) { console.log(e); }
    try { registerCloudFormat(cloud); } catch (e) { console.log(e); }
    try { registerCloudInput(cloud); } catch (e) { console.log(e); }
    try { registerCloudREST(cloud); } catch (e) { console.log(e); }

    // Get a CSRF token for this session
    cloud.getCSRFToken(function (token) {
        $OD.CSRF_TOKEN = token;
    });
});
