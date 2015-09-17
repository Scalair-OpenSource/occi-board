/**
 * Function: registerCloudREST
 * REST facilities.
 *
 * Usage:
 * | registerCloudREST(cloud);
 */
var registerCloudREST = function (parent) {

    /**
     * Server give us a token that we MUST add to each ajax request. Usually,
     * you will get a CSRF token when starting application.
     * @method getCSRFToken
     */
    parent.getCSRFToken = function (callback) {
        $.getJSON('http://localhost:1337/csrfToken', function (data) {
            parent.CSRF_TOKEN = data._csrf;

            if (callback) {
                callback(parent.CSRF_TOKEN);
            }
        });
    };

};
