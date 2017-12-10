angular.module('kmapp')
    .controller("configModalCtrl", ["$scope","$rootScope", "$uibModalInstance","serviceData",
        function ($scope,$rootScope, $uibModalInstance,serviceData) {
            $scope.$on('modal.closing', function (event, reason, closed) {
                if ($scope.uploading) {
                    event.preventDefault();
                }
            });

            $scope.closeModal = function () {
                $uibModalInstance.dismiss('Cancel');
            };
            $scope.isCellPhone = $rootScope.isCellPhone;
            $scope.email = $rootScope.email;
            $scope.saveConfig = function(){
                $rootScope.cellPhone = $scope.cellPhone;
                if ($scope.email) {
                    serviceData.sendAlertEmail($scope.email);
                }
                $rootScope.isCellPhone = $scope.isCellPhone;
                $rootScope.email = $scope.email;
                $scope.closeModal();
            }

        }]);
