(function() {
    'use strict';
    angular
        .module('FbDashboardApp')
        .controller('DashboardController', DashboardController);
    DashboardController.$inject = ['$scope', 'fb_dataservice'];
    function DashboardController($scope, fb_dataservice) {
        $scope.message = 'Sort descending order';
        $scope.updateMassage = function () {
            if ($scope.message == 'Sort descending order') {
                $scope.message = 'Sort ascending order'
            }
            else {
                $scope.message = 'Sort descending order'
            }
        }
            ;
        $scope.getFbPage = getFbPage;
        // Fetch National Geographic FB page
        $scope.getFbPage(23497828950);
        function getFbPage(page_id) {
            return fb_dataservice.getFbPage(page_id)
                .then(function(data) {
                    // Save results from fb api in fb_page variable
                    $scope.fb_page = data;
                    return $scope.fb_page;
                });
        };
    };
})();
