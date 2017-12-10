angular.module('kmapp')
    .controller("addNewAdapterMessageModalCtrl", ["$scope", "$uibModalInstance", "Upload", "$timeout",
        "serviceData", "$http", "$q", "serviceBase",
        function ($scope, $uibModalInstance,  Upload, $timeout, serviceData, $http, $q, serviceBase) {
            $scope.listConfig = [];
            $scope.selectedConfig = "";
            $scope.selectedConfigName = "Select Config";
            $scope.$on('modal.closing', function (event, reason, closed) {
                if ($scope.uploading) {
                    event.preventDefault();
                }
            });
            $scope.addAdapterMessage = function () {
                if (!$scope.file) {
                    serviceBase.showErrorNotification("Message file is required.");
                    return;
                }
                $scope.uploading = true;
                if ($scope.file && $scope.file.name) {
                    $scope.upload($scope.file, function (response) {
                        $scope.uploading = false;
                        serviceBase.showSuccessNotification('Message File Uploaded Successfully');
                        $timeout(function () {
                            $scope.$apply();
                        }, 400);
                    }, function () {
                        $scope.uploading = false;
                    });
                } else {
                }
            };

            $scope.upload = function (file, callback, errorCallback) {
                if (!file.$error) {
                    var fileReader = new FileReader();
                    fileReader.readAsText(file);
                    fileReader.onload = function (e) {
                        var data = e.target.result;
                        serviceData.addAdapterMessage(data, function (response) {
                            if (response) {
                                if (response.APIResults["Status Code"] === -1) {
                                    serviceBase.showErrorNotification(response.APIResults["Result Description"]);
                                    errorCallback();
                                    return;
                                }
                                if (response.APIResults["Status Code"] === 0) {
                                    callback(null);
                                    $scope.closeModal();
                                    return;
                                }
                                errorCallback();
                            }
                            else {
                                errorCallback();
                            }

                        });
                    };
                }
            };
            $scope.closeModal = function () {
                $uibModalInstance.dismiss('Cancel');
            };
        }]);