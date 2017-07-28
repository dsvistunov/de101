// This is Immediately Invoked Function Expression (IIFE)
// An IIFE removes variables from the global scope which helps avoid variable collisions
(function() {
    'use strict'; // Code should be executed in "strict mode"
    angular
        .module('FbDashboardApp')
        .factory('fb_dataservice', fb_dataservice);
    // The $inject property is an array of service names to inject.
    fb_dataservice.$inject = ['$http', '$log'];
    function fb_dataservice($http, $log) {
        var service = { getFbPage: getFbPage };
        return service;
        function getFbPage(page_id) {
            // The $http service is a function which takes a single argument
            // that is used to generate an HTTP request and returns a promise.
            return $http.get('/api/fb/'+page_id).then(getFBPageComplete).catch(getFBPageFail);

            function getFBPageComplete(response) {
                // Return result if no errors
                return response.data.data;
            }
            function getFBPageFail(error) {
                // Logging errors if something went wrong
                $log.error('XHR Failed for getFbPage('+page_id+'). ' + error.data.error.message);
            }
        }
    }
})();