'use strict';
angular.module('kmapp')
    .controller('modelsTableCtrl', ['$rootScope', '$scope',
        '$interval', '$timeout', '$uibModal', 'serviceData', 'serviceViewModel', '$state',
        'Upload', 'serviceRest', 'serviceBase', 'serviceUtil', '$q',
        function ($rootScope, $scope, $interval, $timeout, $uibModal, serviceData, serviceViewModel, $state,
                  Upload, serviceRest, serviceBase, serviceUtil, $q) {
            $scope.currentPage = 1;
            $scope.numberOfModelsPerPage = serviceData.getConfig('modelsPerPage');
            $scope.pageSizeOptions = serviceData.getConfig('pageSizeOptions');

            $scope.currentTabNo = 1;

            $scope.isCurrentTab = function (tabNo) {
                return $scope.currentTabNo == tabNo;
            };

            $scope.setCurrentTab = function (tabNo) {
                $scope.currentTabNo = tabNo;
            };

            $scope.edit = function (item) {
                $scope.prevTabNo = $scope.currentTabNo;
                $scope.currentTabNo = 2;
                item.isEditable = true;
            };

            $scope.cancel = function (item) {
                item.isEditable = false;
                $scope.currentTabNo = $scope.prevTabNo;
            };

            $scope.numberOfPages = function () {
                return Math.ceil($scope.models.length / $scope.numberOfModelsPerPage);
            };
            $scope.pagesArr = function () {
                return _.range(1, $scope.numberOfPages() + 1);
            };
            $scope.setPage = function (num) {
                $scope.currentPage = num;
            };

            $scope.modelsFilter = 'age';
            $scope.modelsFilterStatus = 'desc';
            $scope.updateFilter = function (filterName) {
                $scope.modelsFilter = filterName;
                if ($scope.modelsFilterStatus === 'asc') {
                    $scope.modelsFilterStatus = 'desc';
                } else {
                    $scope.modelsFilterStatus = 'asc';
                }
            }
            $scope.openConfigModal = function (size) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    backdrop: true,
                    templateUrl: 'views/tpl/configModal.html',
                    controller: 'configModalCtrl',
                    windowClass: 'configModal',
                    size: size
                });
                modalInstance.result.then(function (newModel) {
                    try {
                        $interval.cancel(intervalObj);
                        $state.reload();
                    } catch (ex) {
                    }
                }, function () {
                });
            };

            $scope.openAddNewAdapterMessageModal = function (size) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    backdrop: true,
                    templateUrl: 'views/tpl/addNewAdapterMessageModal.html',
                    controller: 'addNewAdapterMessageModalCtrl',
                    windowClass: 'addNewAdapterMessageModal',
                    size: size
                });
                modalInstance.result.then(function (newModel) {
                    try {
                        $interval.cancel(intervalObj);
                        $state.reload();

                    } catch (ex) {
                    }
                }, function () {
                });
            };

            $scope.openAddNewMessageModal = function (size) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    backdrop: true,
                    templateUrl: 'views/tpl/addNewMessageModal.html',
                    controller: 'addNewMessageModalCtrl',
                    windowClass: 'addNewMessageModal',
                    size: size
                });
                modalInstance.result.then(function (newModel) {
                    try {
                        $interval.cancel(intervalObj);
                        $state.reload();

                    } catch (ex) {
                    }
                }, function () {
                });
            };
            $scope.deleteModel = function (item) {
                serviceUtil.openConfirmation('Delete Model', 'Are you sure you want to delete?', function (response) {
                    if (response) {
                        serviceData.deleteModel(item, function (response) {
                            delete $scope.modelArrays[item.id];
                            serviceViewModel.removeOpenedModel(item);
                            serviceViewModel.deleteModel(item);
                            $scope.models = serviceViewModel.getModels();
                            serviceViewModel.createFilterArrays($scope.modelArrays, $scope.filters);
                        });
                    }
                });
            };

            $scope.openAddNewModelModal = function (size) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    backdrop: true,
                    templateUrl: 'views/tpl/addNewModelModal.html',
                    controller: 'addNewModelModalCtrl',
                    windowClass: 'addNewModelModal',
                    size: size,
                    resolve: {
                        projects: function () {
                            if (!$scope.projects || !$scope.projects.length) {
                                $scope.projects = serviceData.getProjects();
                            }
                            return $scope.projects;
                        },
                        addModel: function () {
                            return function (newModel) {
                                serviceData.addNewModel(newModel);
                                serviceViewModel.addNewModel(newModel);
                                $scope.models = serviceViewModel.getModels();
                                serviceViewModel.createFilterArrays($scope.modelArrays, $scope.filters);
                                $scope.setFilter($scope.filterName);
                            }
                        }
                    }
                });

                modalInstance.result.then(function (newModel) {
                    try {
                        $interval.cancel(intervalObj);


                    } catch (ex) {

                    }
                }, function () {

                });
            };
            $scope.updateModelInfo = function (modelItem, fileInfo) {
                $scope.currentTabNo = $scope.prevTabNo;
                var deferred = $q.defer();
                if (fileInfo.fileType == 'xml') {
                    serviceData.updatePmml(fileInfo, modelItem, {tenantid: "tenant1"}, function (response) {
                        console.log(response);
                    });
                } else {
                    if (fileInfo.fileType && fileInfo.fileType != modelItem.language) {
                        serviceBase.showErrorNotification('Update Model', 'Model language does not match with file type');
                        return;
                    } else {
                        serviceData.updateModel(fileInfo, modelItem, {
                                modelconfig: modelItem.configName,
                                tenantid: "tenant1"
                            }, function (response) {
                                modelItem.isEditable = false;
                                if (modelItem.updatedName) {
                                    var length = modelItem.updatedName.split('.').length;
                                    try {
                                        modelItem.version = modelItem.updatedName.split('.')[length - 1];
                                        if (modelItem.version != "") {
                                            modelItem.version = formatModelVersion(modelItem.version);
                                        }
                                    } catch (ex) {

                                    }
                                }
                                deferred.resolve();
                            },
                            function () {
                                deferred.resolve();
                            });
                    }
                }
                return deferred.promise;
            };

            $scope.languageImage = function (project) {
                return serviceUtil.languageImage(project);
            };

            $scope.getModelsAlertConfig = function () {
                var blackListIPs = '';
                serviceData.getModelAlertsConfig(function (response) {
                    return;
                    var result = response.join.split(',');
                    $scope.startHour = result[2].trim();
                    $scope.endHour = result[3].trim();
                    for (var x = 4; x <= result.length - 1; x++) {
                        if (x != result.length - 1) {
                            blackListIPs += result[x].trim() + ",";
                        }
                        else {
                            blackListIPs += result[x].trim();
                        }
                    }
                    $scope.listIPs = blackListIPs;
                });
            };

            //$scope.getModelsAlertConfig();

            $scope.isFilterShown = false;
            $scope.showFilters = function () {
                if (!$scope.isFilterShown) {
                    $scope.isFilterShown = true;
                    $(".nav-models").css({
                        "border-bottom": "1px solid #ddd"
                    });
                    $("#liFilters").addClass("active");
                    $("#dvFilters").collapse("show");
                } else {
                    $("#liFilters").removeClass('active');
                    $(".nav-models").css({
                        "border-bottom": "none"
                    });
                    $scope.isFilterShown = false;
                    $("#dvFilters").collapse("hide");
                }
            };
            var checkStatus = function(){
                serviceData.getKamanjaStatus().then(function (response) {
                    $rootScope.kamanjaStatus = response.data !== "Not Running";
                    $scope.kamanjaStatus =  $rootScope.kamanjaStatus;
                });
            };
            checkStatus();
            $scope.statusIntervalObj = $interval(function () {
                checkStatus();
            }, serviceData.getConfig('statusInterval') * 1000);
            $scope.kamanjaStatusChange = function () {
                $rootScope.kamanjaStatus = $scope.kamanjaStatus;
                if ($rootScope.kamanjaStatus) {
                    serviceData.startKamanja();
                } else {
                    serviceData.stopKamanja();
                }
            }
        }
    ]);
