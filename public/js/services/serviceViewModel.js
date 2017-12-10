'use strict'

angular.module('kmapp')
    .factory('serviceViewModel', ['$interval', 'serviceData',
        function ($interval, serviceData) {
            var service = {};
            var modelArrays = {};
            var filterArrays = {};
            var models = [];
            var filter;
            var filteredModels = [];
            var lowestTotal, highestTotal;
            var openedModels = [];

            service.addOpenedModel = function (model) {
                openedModels.push(model);
            };

            service.removeOpenedModel = function (model) {
                openedModels = _.without(openedModels, _.findWhere(openedModels, {id: model.id}));
            };

            service.getOpenedModels = function () {
                return openedModels;
            };

            service.reset = function () {
                modelArrays = {};
                filterArrays = {};
                models = [];
                filter = null;
                filteredModels = [];
            };

            service.setModels = function (modelsArg) {
                angular.copy(modelsArg, models);
            };
            service.getModels = function () {
                return models;
            };
            service.getProjects = function () {
                return _.uniq(_.map(models, function (item) {
                    return item.projectName;
                }));
            };

            service.addNewModel = function (model) {
                if (!models) {
                    models = [];
                }
                models.push(model);

                var arr = new Array(60).fill({x: 0, y: 0});
                modelArrays[model.id] = arr;
            };

            service.deleteModel = function (model) {
                models = _.without(models, _.findWhere(models, {id: model.id}));
                delete modelArrays[model.id];
            };

            service.createModelAndFilterArrays = function (minuteData, filters) {
                service.createModelArrays(minuteData);
                service.createFilterArrays(minuteData, filters);
            };

            service.createModelArrays = function (minuteData) {
                angular.copy(minuteData, modelArrays);
            };

            service.createFilterArrays = function (minuteData, filters) {
                _.each(filters, function (filter, filterName) {
                    var filterArray = [];
                    if (models.length == 0)
                        return;
                    var filteredModels = _.filter(models, filter);
                    var modelLength = modelArrays[Object.keys(modelArrays)[0]].length;
                    _.each(_.range(0, modelLength), function (i) {
                        filterArray[i] = {
                            y: _.chain(filteredModels)
                                .map(function (model) {
                                    return modelArrays[model.id][i].y
                                })
                                .reduce(function (y, sum) {
                                    return y + sum;
                                }, 0)
                                .value()
                        };
                    });
                    filterArrays[filterName] = [];

                    angular.copy(filterArray, filterArrays[filterName]);
                });
            };
            service.getModelArrays = function () {
                return modelArrays;
            };
            service.getFilterArrays = function () {
                return filterArrays;
            };

            service.updateModelArrays = function (momentData, filters) {
                // increment model age
                if (models.length == 0)
                    return;
                _.each(models, function (item) {
                    if (item.status == "Active") {
                        var currentDate = moment(Date.now());
                        var createdAt = moment(item.createdAt);
                        item.age = currentDate.diff(createdAt, 'seconds');
                    }
                });
                _.each(modelArrays, function (modelArray, id) {
                    var t = momentData[id];
                    if (!t) {
                        t = {x: 0, y: 0, z: 0};
                    }
                    angular.copy(modelArray.concat(t), modelArrays[id]);
                });

                _.each(filters, function (filter, filterName) {
                    var filteredModels = _.filter(models, filter);
                    var modelLength = modelArrays[Object.keys(modelArrays)[0]].length;
                    var i = modelLength - 1;
                    filterArrays[filterName][i] = {
                        y: _.chain(filteredModels)
                            .map(function (model) {
                                return modelArrays[model.id][i].y
                            })
                            .reduce(function (y, sum) {
                                return y + sum;
                            }, 0)
                            .value()
                    };
                });
                _.each(modelArrays, function (modelArray, id) {
                    updateModelTotalAndRecordsInValue(modelArray, id);
                    updateModelPercentagRecordsOutValue(modelArray, id);
                });
            };
            service.setFilter = function (filterName, filterFunction) {
                filter = filterFunction;
                if (!modelArrays)
                    return;
                if (_.contains(["highest", "high", "mid", "low", "lowest"], filterName)) {
                    _.each(modelArrays, function (modelArray, name) {
                        updateModelTotalAndRecordsInValue(modelArray, name);
                    });
                    var filterObject = {};
                    filterObject[filterName] = filter;

                    service.createFilterArrays(modelArrays, filterObject);
                }
                angular.copy(_.filter(models, filter), filteredModels);
            };
            service.getFilteredModels = function () {
                return filteredModels;
            };

            service.shiftModelArrays = function () {
                _.each(modelArrays, function (modelArray, id) {
                    modelArray = modelArray.slice(1);
                    angular.copy(modelArray, modelArrays[id]);
                });



                _.each(filterArrays, function (filterArray, id) {
                    filterArray.shift();
                });
            };
            $interval(function () {
                serviceData.updateLastMinuteData(modelArrays, function (response) {});
            }, 10000);

            service.setModelSelection = function (filterName) {
                _.each(service.getModels(), function (item) {
                    switch (filterName) {
                        case 'active':
                            if (item.status === 'Active')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'inactive':
                            if (item.status === 'Inactive')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'lastHour':
                            if (item.age <= 3600)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'last24Hours':
                            if (item.age <= 86400)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'last7Days':
                            if (item.age == 604800)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'last30Days':
                            if (item.age == 259200)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'plus30Days':
                            if (item.age > 259200)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';

                            break;
                        case 'java':
                            if (item.language.toUpperCase().contains(filterName.toUpperCase()))
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'pmml':
                            if (item.language.toUpperCase().contains(filterName.toUpperCase()))
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'scala':
                            if (item.language.toUpperCase().contains(filterName.toUpperCase()))
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'python':
                            if (item.language.toUpperCase().contains(filterName.toUpperCase()))
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'rec20':
                            if (item.percentage <= 20)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'rec40':
                            if (item.percentage > 20 && item.percentage <= 40)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'rec60':
                            if (item.percentage > 40 && item.percentage <= 60)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'rec80':
                            if (item.percentage > 60 && item.percentage <= 80)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'rec100':
                            if (item.percentage > 80 && item.percentage <= 100)
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'highest':
                            if (item.recordsInRank == 'highest')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'high':
                            if (item.recordsInRank == 'high')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'mid':
                            if (item.recordsInRank == 'mid')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'low':
                            if (item.recordsInRank == 'low')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                        case 'lowest':
                            if (item.recordsInRank == 'lowest')
                                item.selection = 'selected';
                            else
                                item.selection = 'unselected';
                            break;
                    }
                });
            };
            service.prepareDataTree = function (nodes, groupingOptions) {
                var lastGrouping = groupingOptions[groupingOptions.length - 1];
                var objectTree = {};
                _.each(nodes, function (vertex) {
                    var attrObj = objectTree;
                    _.each(groupingOptions, function (attr) {
                        var initObj = attr === lastGrouping ? {
                            size: 0,
                            vertex: vertex
                        } : {
                            size: 0
                        };
                        var attrVal = vertex[attr];
                        if (_.isUndefined(attrVal)) {
                            attrVal = 'Others';
                        }
                        attrObj[attrVal] = attrObj[attrVal] || initObj;
                        attrObj[attrVal].size = attrObj[attrVal].size + 1;
                        attrObj = attrObj[attrVal];
                    });
                });
                var resultTree = {
                    name: 'projects',
                    children: [],
                    value: nodes.length,
                    deepest: 0,
                    level: 0
                };

                function traverseTree(tree, objectTree, groupingOptions, depth) {
                    if (depth > resultTree.deepest) {
                        resultTree.deepest = depth;
                    }
                    _.each(objectTree, function (attrObj, attrName) {
                        if (attrName != 'size' && attrName != 'vertex') {
                            var subTree = {
                                name: attrName,
                                children: [],
                                size: attrObj.size,
                                attr: groupingOptions[0]
                            };
                            if (attrObj && attrObj.vertex) {
                                angular.extend(subTree, attrObj.vertex);
                            }
                            tree.children.push(subTree);
                            traverseTree(subTree, attrObj, groupingOptions.slice(1), depth + 1);
                        }
                    });
                }

                traverseTree(resultTree, objectTree, groupingOptions, 0);
                return resultTree;
            };

            function updateModelPercentagRecordsOutValue(modelArray, id) {
                var totalModelsOut = 0;
                _.each(modelArrays, function (modelObj) {
                    totalModelsOut = totalModelsOut + _.reduce(modelObj, function (num, item) {
                            return item.z + num;
                        }, 0);
                });

                var totalSingleModelOut = _.reduce(modelArray, function (num, t) {
                    return t.z + num;
                }, 0);

                var model = _.findWhere(models, {id: parseInt(id)});

                model.percentage = (totalSingleModelOut / totalModelsOut) * 100;
            }

            function updateModelTotalAndRecordsInValue(modelArray, id) {
                var ranks = ['highest', 'high', 'mid', 'low', 'lowest'];
                try {
                    var model = _.filter(models, function (m) {
                        return m.id.toString() === id
                    })[0];
                    var total = _.reduce(modelArray, function (t, item) {
                        return item.y + t;
                    }, 0);
                    model.total = total;
                    if (models.length <= 5) {
                        _.chain(models)
                            .sortBy('total')
                            .reverse()
                            .map(function (m, i) {
                                m.recordsInRank = ranks[i];
                            })
                            .value();
                    } else {
                        lowestTotal = _.min(models, function (m) {
                            return m.total;
                        }).total;
                        highestTotal = _.max(models, function (m) {
                            return m.total;
                        }).total;
                        var step = (highestTotal - lowestTotal) / 5;
                        var t = Math.floor((model.total - lowestTotal) / step);
                        t = Math.min(t, ranks.length - 1);
                        model.recordsInRank = ranks[t];
                    }
                } catch (ex) {
                    console.log(ex);
                }
            };
            return service;
        }]);