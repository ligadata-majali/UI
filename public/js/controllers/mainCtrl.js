'use strict';
angular.module('kmapp')
    .controller('mainCtrl', ['$rootScope', '$scope',
        '$q', '$interval', '$timeout', '$uibModal', 'serviceData', 'serviceViewModel', '$state',
        'Upload', 'serviceRest', 'serviceBase', 'serviceUtil', 'socketService', 'authenticationService',
        function ($rootScope, $scope, $q, $interval, $timeout, $uibModal, serviceData, serviceViewModel, $state,
                  Upload, serviceRest, serviceBase, serviceUtil, socketService, authenticationService) {

            $rootScope.kamanjaStatus = true; // true means on, false means off
            serviceData.reset();
            serviceViewModel.reset();
            $rootScope.currentValue = 0;
            $scope.intervalObj;

            //getting config
            serviceData.getBlackListThreshold(function (response) {
                try {
                    $scope.blackIPs = response.ips;
                } catch (ex) {
                    $scope.blackIPs = '';
                }
            });
            serviceData.getTimezoneThreshold(function (response) {
                $scope.startHour = response.bizstart;
                $scope.endHour = response.bizend;
            });

            $scope.modelArrays = serviceViewModel.getModelArrays();
            $scope.filterName = 'active';
            $scope.filteredModels = serviceViewModel.getFilteredModels();
            $scope.interval = serviceData.getConfig('interval') * 1000;
            $scope.setFilter = function (filterName) {
                $scope.filterName = filterName;
                serviceViewModel.setFilter(filterName, $scope.filters[filterName]);
                serviceViewModel.setModelSelection(filterName);
                $scope.chartData = $scope.filterArrays[filterName];

                var tree = serviceViewModel.prepareDataTree($scope.models, ["projectName", "name"]);
                $scope.projectData = tree;
            };

            $scope.filters = {
                active: function (model) {
                    return model.status === "Active";
                },
                inactive: function (model) {
                    return model.status === "Inactive";
                },
                lastHour: function (model) {
                    return model.age <= 3600 && model.status === "Active";
                },
                last24Hours: function (model) {
                    return model.age <= 86400 && model.status === 'Active';
                },
                last7Days: function (model) {
                    return model.age == 604800 && model.status === 'Active';
                },
                last30Days: function (model) {
                    return model.age == 259200 && model.status === 'Active';
                },
                plus30Days: function (model) {
                    return model.age > 259200 && model.status === 'Active';
                },
                java: function (model) {
                    return model.language.toUpperCase().contains("JAVA") && model.status === "Active";
                },
                pmml: function (model) {
                    return model.language.toUpperCase().contains("PMML") && model.status === "Active";
                },
                scala: function (model) {
                    return model.language.toUpperCase().contains("SCALA") && model.status === "Active";
                },
                python: function (model) {
                    return model.language.toUpperCase().contains("PYTHON") && model.status === "Active";
                },
                rec20: function (model) {
                    return model.percentage <= 20 && model.status === "Active";
                },
                rec40: function (model) {
                    return model.percentage > 20 && model.percentage <= 40 && model.status === "Active";
                },
                rec60: function (model) {
                    return model.percentage > 40 && model.percentage <= 60 && model.status === "Active";
                },
                rec80: function (model) {
                    return model.percentage > 60 && model.percentage <= 80 && model.status === "Active";
                },
                rec100: function (model) {
                    return model.percentage > 80 && model.percentage <= 100 && model.status === "Active";
                },
                lowest: function (model) {
                    return model.recordsInRank === "lowest";
                },
                low: function (model) {
                    return model.recordsInRank === "low";
                },
                mid: function (model) {
                    return model.recordsInRank === "mid";
                },
                high: function (model) {
                    return model.recordsInRank === "high";
                },
                highest: function (model) {
                    return model.recordsInRank === "highest";
                }
            };

            $scope.filterArrays = serviceViewModel.getFilterArrays();
            $scope.models = serviceViewModel.getModels();
            $scope.filteredModels = serviceViewModel.getFilteredModels();
            serviceData.fetchSystemConfigs().then(function () {
                $rootScope.headerTitle = serviceData.getSystemConfig().headertitle;
                $scope.loadModels();
            });
            $scope.$watch('modelArrays', function (newModels, oldModels) {
            }, true);
            $scope.SelectedProjectName = '';
            $scope.SelectedModelId = 0;
            function ResetSelection() {
                $scope.SelectedProjectName = '';
                $scope.SelectedModelId = 0;
            }

            $scope.openModels = function () {
                _.each(serviceViewModel.getOpenedModels(), function (modelObj) {
                    var model = _.findWhere($scope.models, {id: modelObj.id});
                    model.open = true;
                });
            };

            $interval(function () {
                if ($scope.models && $scope.models.length && $scope.models[0].alerts && $scope.models[0].alerts.length && $rootScope.cellPhone) {
                    var alert = $scope.models[0].alerts[0];
                    serviceData.sendAlertSMS($rootScope.cellPhone, alert);
                }
            }, serviceData.getConfig('alertSMSInterval') * 1000);

            $scope.updateBlackList = function (listIPs) {
                var data = {
                    key: "0",
                    ips: listIPs
                };
                serviceData.saveBlackListThreshold(data, function (response) {
                    console.log(response);
                });
            };

            $scope.updateThresholdTime = function (startHour, endHour) {
                var data = {"key": "0", "bizstart": startHour, "bizend": endHour};
                serviceData.saveThresholdTime(data, function (response) {
                    console.log(response);
                });
            };
            var updateAlertsFlag = true;
            function processSocketData(response) {
                if(!authenticationService.isloggedIn){
                    $state.go('login');
                }
                if (!$rootScope.kamanjaStatus) {
                    // return;
                }

                var socketObj = JSON.parse(response);
                var topic = socketObj.topic;
                console.log("topic = ", topic);
                switch (topic) {
                    case 'testmessageevents_1':
                        var messageObj = JSON.parse(socketObj.message);
                        $rootScope.currentValue = formatNumber(parseInt(messageObj.SystemVolume.In));
                        if (messageObj.ModelCounter.length > 0) {
                            var t=[];
                            _.each(messageObj.ModelCounter,function(a){
                                t.push(a.In);
                            });
                            console.log("%c comming individual values: "+t,'background:yellow;color:green;');
                            serviceData.pushNewData(messageObj.ModelCounter).then(function (momentData) {
                                serviceViewModel.updateModelArrays(momentData, $scope.filters);
                                serviceViewModel.shiftModelArrays();
                            });
                        }
                        break;
                    default:
                        _.each($scope.models,function (model){
                             if (model.name === topic){
                                 model.alerts = model.alerts || [];
                                 model.alerts.unshift(JSON.parse(socketObj.message).alert);
                                 if (model.alerts.length > 5) {
                                     model.alerts.pop();
                                 }
                             }
                        });
                }
                if (updateAlertsFlag) {
                    updateAlertsFlag = false;
                    $timeout(function () {
                        serviceData.updateAlerts($scope.models, function (response) {});
                        updateAlertsFlag = true;
                    }, 15000);
                }
            }

            $scope.loadModels = function () {
                serviceData.fetchModels().then(function () {
                    var models = serviceData.getModels();
                    serviceViewModel.setModels(models);
                    $scope.projects = serviceData.getProjects();
                    var tree = serviceViewModel.prepareDataTree(models, ["projectName", "name"]);
                    $scope.projectData = tree;
                    $scope.setFilter($scope.filterName);

                    serviceData.initializeLastMinute().then(function (minuteData) {
                        serviceViewModel.createModelAndFilterArrays(minuteData, $scope.filters);
                        $scope.chartData = $scope.filterArrays['active'];
                        $scope.openModels();

                        socketService.connectMessageEventsStatus(processSocketData);
                        socketService.connectAlertsStatus(processSocketData);
                        _.each($scope.models,function (model){
                            model.alerts = model.alerts || [];

                        });

                    });
                });
            };

            $scope.SetLanguageTab = function (id) {
                ResetSelection();
                $scope.LanguageId = id;
                _.each($scope.projectData.children, function (project) {
                    _.each(project.children, function (item) {
                        switch (id) {
                            case 1:
                                if (item.tags.toUpperCase().contains("JAVA"))
                                    item.selection = "selected";
                                else
                                    item.selection = "unselected";
                                break;
                            case 2:
                                if (item.tags.toUpperCase().contains("SCALA"))
                                    item.selection = "selected";
                                else
                                    item.selection = "unselected";
                                break;
                            case 3:
                                if (item.tags.toUpperCase().contains("PMML"))
                                    item.selection = "selected";
                                else
                                    item.selection = "unselected";
                                break;
                            case 4:
                                if (item.tags.toUpperCase().contains("PYTHON"))
                                    item.selection = "selected";
                                else
                                    item.selection = "unselected";
                                break;
                        }
                    });
                });
            };

            $scope.isActiveTab = function (filterName) {
                return $scope.filterName === filterName;
            };


            $scope.GetCurrentSystemValue = function () {
                $rootScope.currentValue = 0;
                _.each($scope.ModelsList.projects, function (item) {
                    _.each(item.children, function (child) {
                        if (!child.lastHour)
                            return;
                        if (child.status != "Active")
                            return;
                        $rootScope.currentValue += parseFloat(child.lastHour[0].y);
                    });
                });
                $rootScope.currentValue = formatNumber($rootScope.currentValue);
            };


            function GetModelById(projectId, modelId) {
                var project = _.findWhere($scope.ModelsList.projects, {
                    id: projectId
                });
                var model = _.findWhere(project.children, {
                    modelId: modelId
                });
                return model;
            }

            $scope.openModel = function (model) {
                model.open = true;
                model.isView = true;
                serviceViewModel.addOpenedModel(model);
            };

            $scope.collapseModel = function (model) {
                model.open = false
                serviceViewModel.removeOpenedModel(model);
            };

            $scope.setEditFields = function (modelItem) {
                modelItem.isEditable = true;
            };

            $scope.ShowAddedModel = function (dvId) {
                $timeout(function () {
                    $("#" + dvId).collapse("show");
                    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
                }, 1000);

            };

            $scope.saveNewModel = function (projectId, modelId) {
                $("#dvNew" + modelId + projectId).collapse("hide");
                $("#dvInner" + modelId + projectId).collapse("show");


                var model = _.findWhere($scope.models, {
                    projectName: projectId,
                    id: modelId
                });
                model.tags = $("#tags" + modelId + projectId).val();
                model.description = $("#desc" + modelId + projectId).val();
                model.status = "Active";

                serviceData.updateMetaData(model, function (response) {
                    if (response.error)
                        console.log('problem saving model to db');
                    else
                        console.log('successfully saved model to db');
                });

                var tree = serviceViewModel.prepareDataTree($scope.models, ["projectName", "name"]);
                $scope.projectData = tree;
            };

            $scope.FillLeftCharts = function (_projectId, _modelId) {
                $scope.SelectedProjectName = _projectId;
                $scope.SelectedModelId = _modelId;
            };

            $scope.selectedmodels = 0;

            $scope.isExpanded = false;
            $scope.expandAll = function (elem) {
                _.each($scope.models, function (model) {
                    model.open = true;
                });
                $(".innerDiv").collapse("show");
                $scope.isExpanded = true;
            };

            $scope.collapseAll = function (elem) {
                _.each($scope.models, function (model) {
                    model.open = false;
                });

                $(".innerDiv").collapse("hide");
                $scope.isExpanded = false;
            };

            $scope.FormatAge = function (age) {
                return moment().startOf('day')
                    .seconds(parseInt(age))
                    .format('HH:mm:ss');
            };

            // Filter selection
            $scope.filterTable = {};
            $scope.filterTable.searchBox = "";
            $scope.filterTable.activity = {
                'active': false,
                'inactive': false
            };

            $scope.filterTable.activated = {
                'lastHour': false,
                'last24Hours': false,
                'last7Days': false,
                'last30Days': false,
                'plus30Days': false
            };

            $scope.filterTable.recordsIn = {
                'highest': false,
                'high': false,
                'mid': false,
                'low': false,
                'lowest': false
            };

            $scope.filterTable.recordsOut = {
                'rec20': false,
                'rec40': false,
                'rec60': false,
                'rec80': false,
                'rec100': false
            };

            $scope.filterTable.language = {
                'Java': false,
                'Scala': false,
                'Pmml': false,
                'Python': false
            };

            $scope.filterTable.tags = {
                "tag1": false,
                "tag2": false,
                "tag3": false,
                "tag4": false,
                "tag5": false,
                "tag6": false,
                "tag7": false,
                "tag8": false,
                "tag9": false
            };

        }
    ])
    .filter('ModelsFilter', function ($filter, $rootScope) {
        return function (items, searchFilter) {

            $rootScope.NoSelectedFilters = 0;
            var isSearchFilterEmpty = true;
            angular.forEach(items, function (searchString) {
                if (searchString != null && searchString != "") {
                    isSearchFilterEmpty = false;
                }
            });
            if (!isSearchFilterEmpty) {
                var result = [];
                angular.forEach(items, function (item) {
                    var isFound = false;
                    result.push(item);
                });

                // filtering based on textbox
                /*if (searchFilter.searchBox != "") {
                 result = _.filter(result, function (obj) {
                 return moment.duration(obj.age, "minutes").format("hh:mm:ss").contains(searchFilter.searchBox)
                 || obj.projectName.toLowerCase().contains(searchFilter.searchBox.toLowerCase())
                 || obj.name.toLowerCase().contains(searchFilter.searchBox.toLowerCase())
                 || obj.tags.toLowerCase().contains(searchFilter.searchBox.toLowerCase())
                 || obj.status.toLowerCase().contains(searchFilter.searchBox.toLowerCase());
                 });
                 //return result;
                 }*/

                if (!searchFilter.searchBox && !searchFilter.activity.active && !searchFilter.activity.inactive && !searchFilter.activated.lastHour
                    && !searchFilter.activated.last24Hours && !searchFilter.activated.last7Days && !searchFilter.activated.last30Days
                    && !searchFilter.activated.plus30Days && !searchFilter.recordsOut.rec20 && !searchFilter.recordsOut.rec40
                    && !searchFilter.recordsOut.rec60 && !searchFilter.recordsOut.rec80 && !searchFilter.recordsOut.rec100
                    && !searchFilter.language.Java && !searchFilter.language.Scala && !searchFilter.language.Pmml
                    && !searchFilter.language.Python
                    && !searchFilter.tags.tag1 && !searchFilter.tags.tag2 && !searchFilter.tags.tag3 && !searchFilter.tags.tag4
                    && !searchFilter.tags.tag5 && !searchFilter.tags.tag6 && !searchFilter.tags.tag7 && !searchFilter.tags.tag8
                    && !searchFilter.tags.tag9
                    && !searchFilter.recordsIn.highest && !searchFilter.recordsIn.high && !searchFilter.recordsIn.mid
                    && !searchFilter.recordsIn.low && !searchFilter.recordsIn.lowest) {
                    return result;
                }

                // filtering based on checkboxes selections
                result = _.filter(result, function (obj) {
                    return (obj.status.toLowerCase() == "active" && searchFilter.activity.active) || (obj.status.toLowerCase() == "inactive"
                        && searchFilter.activity.inactive) || (obj.age <= 3600 && searchFilter.activated.lastHour)
                        || (obj.age <= 86400 && searchFilter.activated.last24Hours) || (obj.age == 604800 && searchFilter.activated.last7Days)
                        || (obj.age == 259200 && searchFilter.activated.last30Days) || (obj.age >= 259200 && searchFilter.activated.plus30Days)
                        || (obj.recordsInRank === "highest" && searchFilter.recordsIn.highest)
                        || (obj.recordsInRank === "high" && searchFilter.recordsIn.high)
                        || (obj.recordsInRank === "mid" && searchFilter.recordsIn.mid)
                        || (obj.recordsInRank === "low" && searchFilter.recordsIn.low)
                        || (obj.recordsInRank === "lowest" && searchFilter.recordsIn.lowest)
                        || (parseFloat(obj.percentage) <= 20 && searchFilter.recordsOut.rec20)
                        || (parseFloat(obj.percentage) > 20 && parseFloat(obj.percentage) <= 40 && searchFilter.recordsOut.rec40)
                        || (parseFloat(obj.percentage) > 40 && parseFloat(obj.percentage) <= 60 && searchFilter.recordsOut.rec60)
                        || (parseFloat(obj.percentage) > 60 && parseFloat(obj.percentage) <= 80 && searchFilter.recordsOut.rec80)
                        || (parseFloat(obj.percentage) > 80 && parseFloat(obj.percentage) <= 100 && searchFilter.recordsOut.rec100)
                        || (obj.language.toUpperCase().contains("JAVA") && searchFilter.language.Java) || (obj.language.toUpperCase().contains("SCALA") && searchFilter.language.Scala)
                        || (obj.language.toUpperCase().contains("PMML") && searchFilter.language.Pmml) || (obj.language.toUpperCase().contains("PYTHON") && searchFilter.language.Python)
                        || (obj.tags.toUpperCase().contains("Kamanja".toUpperCase()) && searchFilter.tags.tag1)
                        || (obj.tags.toUpperCase().contains("HBase".toUpperCase()) && searchFilter.tags.tag2)
                        || (obj.tags.toUpperCase().contains("BankD".toUpperCase()) && searchFilter.tags.tag3)
                        || (obj.tags.toUpperCase().contains("R".toUpperCase()) && searchFilter.tags.tag4)
                        || (obj.tags.toUpperCase().contains("csv".toUpperCase()) && searchFilter.tags.tag5)
                        || (obj.tags.toUpperCase().contains("Ahmad".toUpperCase()) && searchFilter.tags.tag6)
                        || (obj.tags.toUpperCase().contains("Greg".toUpperCase()) && searchFilter.tags.tag7)
                        || (obj.tags.toUpperCase().contains("Yousef".toUpperCase()) && searchFilter.tags.tag8)
                        || (obj.tags.toUpperCase().contains("Bill".toUpperCase()) && searchFilter.tags.tag9)
                        || (searchFilter.searchBox);
                });

                if (searchFilter.searchBox != "") {
                    result = _.filter(result, function (obj) {
                        return (obj.tags.toLowerCase().contains(searchFilter.searchBox.toLowerCase()))
                            || (obj.projectName.toLowerCase().contains(searchFilter.searchBox.toLowerCase()))
                            || (obj.name.toLowerCase().contains(searchFilter.searchBox.toLowerCase()))
                            || (moment.duration(obj.age, "minutes").format("hh:mm:ss").contains(searchFilter.searchBox))
                            || (obj.status.toLowerCase().contains(searchFilter.searchBox.toLowerCase()));
                    });
                }

                if (searchFilter.activity.active) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.activity.inactive) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.activated.LastHour) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.activated.last24Hours) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.activated.last7Days) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.activated.last30Days) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.activated.plus30Days) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.recordsOut.rec20) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.recordsOut.rec40) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.recordsOut.rec60) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.recordsOut.rec80) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.recordsOut.rec100) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.language.Java) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.language.Scala) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.language.Pmml) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.language.Python) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag1) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag2) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag3) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag4) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag5) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag6) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag7) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag8) {
                    $rootScope.NoSelectedFilters += 1;
                }

                if (searchFilter.tags.tag9) {
                    $rootScope.NoSelectedFilters += 1;
                }

                return result;
            } else {
                return items;
            }
        }
    })
    .filter('startFrom', function () {
        return function (input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
    });
