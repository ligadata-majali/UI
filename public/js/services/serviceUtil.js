'use strict'

angular.module('kmapp')
    .factory('serviceUtil', ['$rootScope', '$uibModal',
        function ($rootScope, $uibModal) {
            return {
                openConfirmation: function (title, message, callback) {

                    var modalInstance = $uibModal.open({
                        animation: true,
                        backdrop: 'static',
                        keyboard  : false,
                        templateUrl: 'views/tpl/confirmationModal.html',
                        windowClass: 'confirmationModal',
                        size: 'sm',
                        controller: 'confirmationModalCtrl',
                        resolve: {
                            passedObj: {
                                title: title,
                                message: message
                            }
                        }
                    });
                    modalInstance.result.then(function (confirmResult) {
                        callback(confirmResult);
                    }, function (result) {
                        callback(result);
                    });
                },
                languageImage: function (project) {
                    try {
                        if (project.language === "python") {
                            return "img/icons_python_blue.png";
                        }
                        if (project.language === "pmml") {
                            return "img/icons_pmml_blue.png";
                        }
                        if (project.language === "java") {
                            return "img/icons_java_blue.png";
                        }
                        if (project.language === "scala") {
                            return "img/icons_scala_blue.png";
                        }
                        return "img/icons_scala_blue.png";
                    } catch (ex) {
                        //alert(ex);
                    }
                }
            }
        }])
    .controller('confirmationModalCtrl', function ($scope, $uibModalInstance, passedObj) {
        $scope.title = passedObj.title;
        $scope.message = passedObj.message;

        $scope.ok = function () {
            $uibModalInstance.close(true);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss(false);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss(false);
        };
    });