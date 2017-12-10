'use strict'

angular.module('kmapp')
    .factory('serviceBase', ['$rootScope', '$resource', '$http', 'toastrConfig', 'toastr',
        function ($rootScope, $resource, $http, toastrConfig, toastr) {

            toastrConfig.closeButton = true;
            toastrConfig.progressBar = true;
            toastrConfig.newestOnTop = true;
            toastrConfig.positionClass = 'toast-top-center-modified';
            //toastrConfig.showDuration = 0;
            //toastrConfig.hideDuration = 1000;
            toastrConfig.showEasing = "easeOutBounce";
            toastrConfig.hideEasing = "easeOutBounce";
            //toastrConfig.maxOpened = 1;
            toastrConfig.preventDuplicates = false;
            toastrConfig.timeOut = 7000;
            toastrConfig.showDuration = 0;
            toastrConfig.hideDuration = 0;
            toastrConfig.extendedTimeOut = 0;

            var baseService = {};

            baseService.showSuccessNotification = function (title, msg) {
                if (title)
                    toastr.success(msg, title);
                else {
                    toastr.success(msg);
                }
            }

            baseService.showErrorNotification = function (title, msg) {
                if (title)
                    toastr.error(msg, title);
                else {
                    toastr.error(msg);
                }
            }

            baseService.showWarningNotification = function (title, msg) {
                if (title)
                    toastr.warning(msg, title);
                else {
                    toastr.warning(msg);
                }
            }

            baseService.showInfoNotification = function (title, msg) {
                if (title)
                    toastr.info(msg, title);
                else {
                    toastr.info(msg);
                }
            }

            baseService.HttpRequest = {};

            baseService.HttpRequest.Get = function (Obj, callback) {
                _.each($http.defaults.headers.common, function(val, key, obj){
                   if(key != "Accept"){
                       delete $http.defaults.headers.common[key];
                   }
                });
                if (Obj.headers) {
                    _.each(_.keys(Obj.headers), function (key) {
                        $http.defaults.headers.common[key] = Obj.headers[key];
                    });
                }
                var resourceObj = ConstructResource(Obj.url, {method: 'GET'});
                var result = resourceObj.get(Obj.data, function () {
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    if (result.error) {
                        baseService.showErrorNotification('', 'Server error');
                    }
                    callback(result);
                }, function (error) {
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    baseService.showErrorNotification('Http', error.message);
                });

            };

            baseService.HttpRequest.Query = function (Obj, callback) {
                _.each($http.defaults.headers.common, function(val, key, obj){
                    if(key != "Accept"){
                        delete $http.defaults.headers.common[key];
                    }
                });
                if (Obj.headers) {
                    _.each(_.keys(Obj.headers), function (key) {
                        $http.defaults.headers.common[key] = Obj.headers[key];
                    });
                }
                var resourceObj = ConstructResource(Obj.url);
                Obj.isArray = false;
                resourceObj.data = Obj.data;
                var result = resourceObj.query(Obj.data, function () {
                    if (result.error) {
                        baseService.showErrorNotification('', 'Server error');
                    }
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    $httpDefaultCache.remove(Obj.url);
                    callback(result);
                }, function (error) {
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    baseService.showErrorNotification('Http', error.message);
                });
            };

            baseService.HttpRequest.Put = function (Obj, callback) {
                _.each($http.defaults.headers.common, function(val, key, obj){
                    if(key != "Accept"){
                        delete $http.defaults.headers.common[key];
                    }
                });
                var resourceObj;
                if (Obj.headers) {
                    _.each(_.keys(Obj.headers), function (key) {
                        $http.defaults.headers.common[key] = Obj.headers[key];
                    });

                }
                resourceObj = ConstructResource(Obj.url, {update: {method: 'PUT', cache: false}});
                //resourceObj.data = Obj.data;
                var result = resourceObj.save(Obj.data).$promise.then(function (res) {
                    if (res.error) {
                        baseService.showErrorNotification('', 'Server error');
                    }
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    callback(res);
                }, function (error) {
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    //alert('Http', error.data);
                });
            };

            baseService.HttpRequest.Save = function (Obj, callback) {
                _.each($http.defaults.headers.common, function(val, key, obj){
                    if(key != "Accept"){
                        delete $http.defaults.headers.common[key];
                    }
                });
                var resourceObj;
                if (Obj.headers) {
                    _.each(_.keys(Obj.headers), function (key) {
                        $http.defaults.headers.common[key] = Obj.headers[key];
                    });

                }
                resourceObj = ConstructResource(Obj.url, {method: 'POST', cache: false});

                var result = resourceObj.save(Obj.data).$promise.then(function (res) {
                    if (res.error) {
                        baseService.showErrorNotification('', 'Server error');
                    }
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    callback(res);
                }, function (error) {
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    //alert('Http', error.data);
                });
            };

            baseService.HttpRequest.delete = function (Obj, callback) {
                _.each($http.defaults.headers.common, function(val, key, obj){
                    if(key != "Accept"){
                        delete $http.defaults.headers.common[key];
                    }
                });
                var resourceObj;
                if (Obj.headers) {
                    _.each(_.keys(Obj.headers), function (key) {
                        $http.defaults.headers.common[key] = Obj.headers[key];
                    });
                }
                resourceObj = ConstructResource(Obj.url, {method: 'DELETE', cache: false});
                var result = resourceObj.delete(Obj.data).$promise.then(function (res) {
                    if (res.error) {
                        baseService.showErrorNotification('Delete', res.error);
                    }
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                    callback(res);
                }, function (error) {
                    if (Obj.headers) {
                        _.each(_.keys(Obj.headers), function (key) {
                            delete $http.defaults.headers.common[key];
                        });
                    }
                });
            };

            var ConstructResource = function (url) {
                return $resource(url);
            }

            return baseService;
        }])
    .factory('HttpRequest', ['$resource', function ($resource, url) {
        return $resource(url);
    }]);