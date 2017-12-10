'use strict';
angular.module('kmapp')
    .directive('viewModel', ['$filter', 'serviceUtil', function ($filter, serviceUtil) {
        return {
            restrict: 'A',
            templateUrl: 'views/tpl/viewModel.html',
            scope: {
                item: '=',
                modelArrays: '=',
                deleteModel: '='
            },
            link: function (scope, element, attrs) {
                scope.deleteModelOpen = function (item) {
                    serviceUtil.openConfirmation('Delete Model', 'Are you sure you want to delete?', function (response) {
                        if (response) {
                            scope.deleteModel(item);
                        }
                    });
                };
            }
        }
    }])
    .directive('modelChart', ['$filter', 'serviceUtil', function ($filter, serviceUtil) {
        return {
            restrict: 'A',
            templateUrl: 'views/tpl/chartModel.html',
            scope: {
                item: '=',
                modelArrays: '=',
                blackIPs: '='
            },
            link: function (scope, element, attrs) {

            }
        }
    }])
    .directive('viewThresholdAlerts', function (serviceRest) {
        return {
            restrict: 'A',
            templateUrl: 'views/tpl/viewThresholdAlerts.html',
            scope: {
                item: '=',
                listips: '=',
                startHour: '=',
                endHour: '='
            }
        }
    })
    .directive('editThresholdAlerts', function () {
        return {
            restrict: 'A',
            templateUrl: 'views/tpl/editThresholdAlerts.html',
            scope: {
                item: '=',
                listips: '=',
                updateBlackListIps: '=',
                updateThresholdtime: '=',
                startHour: '=',
                endHour: '='
            },
            link: function (scope, element, attrs) {

                scope.updateIPs = function () {
                    scope.item.isEditableThreshold = false;
                    scope.updateBlackListIps(scope.listips);
                };

                scope.addIPadress = function(){
                    scope.listips.push("");
                };

                scope.updateThresholdTime = function () {
                    scope.item.isEditableThreshold = false;
                    scope.updateThresholdtime(scope.startHour, scope.endHour);
                }
            }
        }
    })
    .directive('modelDescription', ['$filter', 'serviceUtil', function ($filter, serviceUtil) {
        return {
            restrict: 'A',
            templateUrl: 'views/tpl/descriptionModel.html',
            scope: {
                item: '=',
                modelArrays: '=',
                cancel: '='
            }
        }
    }])
    .directive('editModel', ['$filter', 'serviceUtil', function ($filter, serviceUtil) {
        return {
            restrict: 'A',
            templateUrl: 'views/tpl/editModel.html',
            scope: {
                item: '=',
                updateModelInfo: '=',
                cancelUpdate: '='
            },
            link: function (scope, element, attrs) {
                scope.getReplacedOriginalName = function (originalName) {
                    var regex = new RegExp(',', 'g');
                    return originalName.split('.').join('');
                };
                scope.acceptedLanguages = {java: '.java', scala: '.scala', kpmml: '.kpmml', xml: '.xml'};
                scope.languageImage = function (project) {
                    return serviceUtil.languageImage(project);
                };
                scope.setSelectedFileToUpdate = function (file, event) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        scope.editedFileUpload = e.target.result;
                    };
                    reader.readAsText(file);
                    scope.fileType = file.name.split('.')[1];
                };
                scope.updateModel = function (item) {
                    var fileInfo = {
                        fileData: scope.editedFileUpload,
                        fileType: scope.fileType
                    };
                    scope.uploading = true;
                    scope.updateModelInfo(item, fileInfo).then(function () {
                        scope.uploading = false;
                    });
                };

                scope.cancelOperation = function (item) {
                    scope.cancelUpdate(item);
                };

            }
        }
    }
    ]).directive('alerts', ['serviceData', function (serviceData) {
    return {
        restrict: 'A',
        templateUrl: 'views/tpl/alerts.html',
        scope: {
            item: '='
        },
        link: function (scope, element, attrs) {
          scope.showAlertInfo = false;
          scope.alerts = _.map(scope.item.alerts, function(alert){
            var data = alert.split(':');
            var out = [];

              var alertDate = moment(data.slice(0, 2).join(':')).format('DD-MM-YYYY');
              var title = alertDate + " " + data.slice(3).join('').trim().split(' ').splice(0, 4).join(' ');
              var content = data.slice(3).join('');
              return {
                title: title,
                content: content
              }
          });
        }
    }
}
]);
