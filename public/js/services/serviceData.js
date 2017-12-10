'use strict';

angular.module('kmapp')
  .factory('serviceData', ['serviceBase', 'serviceRest', '$q', '$http', '$rootScope', 'authenticationService',
    function(serviceBase, serviceRest, $q, $http, $rootScope, authenticationService) {
      var service = {};
      var models = [];
      var systemConfig = {};
      // Initializing values
      var configData = {
        interval: 1,
        statusInterval: 15,
        alertSMSInterval: 20,
        globalAvgHour: 110,
        globalAvgLast24Hours: 130,
        globalAvgLast7Days: 152,
        globalAvgLast30Days: 155,
        globalAvgPlus30Days: 175,
        modelsPerPage: 5,
        pageSizeOptions: [5, 10, 20],
        projects: ['User Behavior']
      };

      service.reset = function() {

        models = [];
        systemConfig = {};
      };

      service.getConfig = function(configName) {
        return configData[configName];
      };
      service.getModels = function() {
        return models;
      };

      service.addNewModel = function(modelArg) {
        models.push(modelArg);
      };
      service.getProjects = function() {
        return service.getConfig('projects');
      };
      service.fetchSystemConfigs = function() {
        var deferred = $q.defer();
        serviceBase.HttpRequest.Get({
          url: '/config.json',
          data: {}
        }, function(response) {
          deferred.resolve();
          systemConfig = response;
        });
        return deferred.promise;
      };
      service.fetchModels = function() {
        var deferred = $q.defer();
        if (service.getSystemConfig().isServer === 'true') {
          async.waterfall([
            function(callback) {
              serviceBase.HttpRequest.Get({
                url: serviceRest.getModelsUrl(),
                data: {}
              }, function(response) {
                var result = response.APIResults['Result Data'].split(' ')[1].split(':')[1].split(',');
                callback(null, result);
              });
            },
            function(result, finalCallback) {
              var models = [];
              if (result.length == 1 && result[0] == "") {
                finalCallback(null, result);
              } else {
                async.each(result, function(model, callback) {
                  service.getModelDetailedInfo(model, function(response) {
                    var modelObj = {};
                    modelObj.name = model;
                    var modelInfo = JSON.parse(response.APIResults["Result Data"]);
                    modelObj.id = modelInfo.Model.ElementId;
                    models.push(modelObj);
                    callback();
                  });
                }, function(err) {
                  if (err) {
                    serviceBase.showErrorNotification('Model Info', err);
                  } else {
                    finalCallback(null, models);
                  }
                });
              }
            },
            function(result, callback) {
              serviceBase.HttpRequest.Save({
                url: '/getAllModels',
                data: {
                  models: result,
                  token: authenticationService.getToken()
                }
              }, function(response) {
                models = response.models;
                callback(response.models);
              });
            }
          ], function(result) {
            if (result.length > 0)
              service.setServerModels(result);
            deferred.resolve();
          });
        } else {
          serviceBase.HttpRequest.Query({
            url: '/projects.json',
            data: {}
          }, function(response) {
            deferred.resolve();
            models = response;
          });
        }

        return deferred.promise;
      };

      service.setServerModels = function(result) {
        _.each(result, function(item, index) {
          //var elem = item.split('.');
          var length = item.name.split('.').length;
          if (length > 1) {
            item.originalName = item.name;
            try {
              if (item.version != "") {
                item.version = formatModelVersion(item.version);
              }
            } catch (ex) {

            }

            //item.version = padLeft(parseInt(item.name.split('.')[length - 1]), 2);
            item.name = item.name.split('.')[length - 2];
            switch (item.name) {
              case "unknownuseraccess":
                item.displayName = 'Unknown User Access (Rules)';
                break;
              case "outsidenormalbusinesshours":
                item.displayName = "Insider Threat Detector";
                break;
              case "blacklistipaddr":
                item.displayName = "Suspect IP Detector";
                break;
            }
          }
        });
        models = result;
      };
      service.getSystemConfig = function() {
        return systemConfig;
      };

      service.pushNewData = function(serverModels) {
        var values = {};
        var deferred = $q.defer();
        _.each(serverModels, function(model) {
          // console.log(model, models);
          var modelObj = _.findWhere(models, {
            id: parseInt(model.Id)
          });
          //modelObj.out = model.Out;
          if (!modelObj) {
            // console.log("model object is empty", serverModels);
            return;
          }

          try {
            values[modelObj.id] = {
              x: 0,
              y: model.In,
              z: model.Out
            };
          } catch (ex) {
            values[modelObj.id] = {
              x: 0,
              y: 0,
              z: 0
            };
          }

        });
        deferred.resolve(values);
        return deferred.promise;
      };

      service.getNewValues = function() {
        var values = {};
        var deferred = $q.defer();
        _.each(models, function(model) {
          if (model.status == "Active") {
            var y = (Math.random() * (200 - 30) + 30);
            if ($rootScope.kamanjaStatus) {
              y = parseFloat(y.toFixed(3));
            } else {
              y = 0;
            }
            values[model.id] = {
              y: y,
              x: 0
            };
          } else {
            var y = 0;
            values[model.id] = {
              y: y,
              x: 0
            };
          }
        });
        deferred.resolve(values);
        return deferred.promise;
      };
      service.initializeLastMinute = function() {
        var deferred = $q.defer();
        var minute = {};
        _.each(models, function(model) {
          if (model.status !== 'Active') {
            return;
          }
          if (model.lastMinute.length > 0) {
            minute[model.id] = model.lastMinute;
            return;
          }
          var modelMinute = [];
          var i = 0;
          var currentDate = moment(Date.now());
          var createdAt = moment(model.createdAt);
          var age = currentDate.diff(createdAt, 'seconds');
          model.age = currentDate.diff(createdAt, 'minutes');
          if (age < 60) {
            modelMinute = new Array(60).fill({
              x: 0,
              y: 0,
              z: 0
            });
            /*while (i <= age && i < 60) {
             var x = 0;
             var y = (Math.random() * (200 - 30) + 30);
             y = parseFloat(y.toFixed(3));
             modelMinute[i] = {x: x, y: y};
             i = i + service.getConfig('interval');
             }*/
          } else {
            while (i <= age && i < 60) {
              var x = 0;
              var y = 0; //(Math.random() * (200 - 30) + 30);
              y = parseFloat(y.toFixed(3));
              modelMinute.push({
                x: x,
                y: y,
                z: 0
              });
              i = i + service.getConfig('interval');
            }
          }
          minute[model.id] = modelMinute;
        });
        deferred.resolve(minute);
        return deferred.promise;
      };
      service.postMessage = function(data, callback) {
        var postObject = {
          url: service.getConfig('apiUrl') + '/api/message',
          data: data,
          headers: {
            "Content-Type": "application/json"
          }
        };
        serviceBase.HttpRequest.Save(postObject, callback);
      };

      service.deleteModel = function(model, callback) {
        serviceBase.HttpRequest.delete({
          url: serviceRest.deleteModelUrl(model.originalName),
          data: {}
        }, function(response) {
          if (response.APIResults["Status Code"] === 0) {
            models = _.without(models, _.findWhere(models, {
              id: model.id
            }));
            serviceBase.showSuccessNotification('Delete Model', response.APIResults["Result Description"]);
            serviceBase.HttpRequest.Save({
              url: '/deleteModel',
              data: {
                model: model,
                token: authenticationService.getToken()
              }
            }, function(response) {
              if (response.result.error) {
                serviceBase.showErrorNotification('Deleting Model', response.result.error);
              } else {
                callback(response.result);
              }
            });
          } else {
            serviceBase.showErrorNotification('Delete Model', response.APIResults["Result Description"]);
          }
        });
      };

      service.updateModel = function(fileInfo, modelInfo, headerObj, callback, errorCallback) {
        async.waterfall([
          function(callback) {
            if (fileInfo.fileType) {
              serviceBase.HttpRequest.Put({
                  url: serviceRest.uploadModel(fileInfo.fileType),
                  headers: headerObj,
                  data: fileInfo.fileData
                },
                function(response) {
                  if (response.APIResults["Status Code"] === -1) {
                    serviceBase.showErrorNotification('Update {modelName} Model'.format({
                      modelName: fileInfo.fileType.toUpperCase()
                    }), response.APIResults["Result Description"]);
                    errorCallback();
                  } else {
                    serviceBase.showSuccessNotification('{modelName} Model Updated'.format({
                        modelName: fileInfo.fileType.toUpperCase()
                      }),
                      response.APIResults["Result Description"]);
                    callback(response);
                  }
                });
            } else {
              callback(null);
            }
          }
        ], function(result) {
          if (result) {
            modelInfo.updatedName = result.APIResults["Result Description"].split(':')[1];
          }
          serviceBase.HttpRequest.Save({
            url: '/updateModel',
            headers: {},
            data: {
              model: modelInfo,
              token: authenticationService.getToken()
            }
          }, function(response) {
            //modelInfo.name = modelInfo.name.split('.')[modelInfo.name.split('.').length - 2];
            callback(response.result);
          });
        });
      };

      service.updatePmml = function(fileInfo, modelInfo, headerObj, callback) {
        async.waterfall([
          function(callback) {
            serviceBase.HttpRequest.Put({
                url: serviceRest.uploadModel('pmml'),
                headers: {
                  modelconfig: 'system.DecisionTreeIris,0.2.0',
                  tenantid: "tenant1"
                },
                data: fileInfo.fileData
              },
              function(response) {
                if (response.APIResults["Status Code"] === -1) {
                  serviceBase.showErrorNotification('Update PMML', response.APIResults["Result Description"]);
                  callback(null);
                } else {
                  serviceBase.showSuccessNotification('{modelName} Model Updated'.format({
                      modelName: fileInfo.fileType.toUpperCase()
                    }),
                    response.APIResults["Result Description"]);
                  callback(response);
                }
              });
          }
        ], function(result) {
          serviceBase.HttpRequest.Save({
            url: '/updateModel',
            headers: {},
            data: {
              model: modelInfo,
              token: authenticationService.getToken
            }
          }, function(response) {
            callback(response.result);
          });
        });
      };

      service.updateMetaData = function(modelInfo, callback) {
        serviceBase.HttpRequest.Save({
          url: '/updateModel',
          headers: {},
          data: {
            model: modelInfo,
            token: authenticationService.getToken()
          }
        }, function(response) {
          callback(response.result);
        });
      };

      service.addMessage = function(data, callback) {
        //            https://github.com/caolan/async
        async.waterfall([
          function(callback) {
            serviceBase.HttpRequest.Save({
                url: serviceRest.uploadMessage(),
                data: data,
                headers: {
                  tenantid: "tenant1"
                }
              },
              function(response) {
                if (response.APIResults["Status Code"] === -1) {
                  serviceBase.showErrorNotification('Add Message', response.APIResults["Result Description"]);
                  callback(null);
                } else
                  callback(response);
              });
          }
        ], function(result) {
          callback(result);
        });
      };
      service.addAdapterMessage = function(data, callback) {
        async.waterfall([
          function(callback) {
            serviceBase.HttpRequest.Save({
                url: serviceRest.adapterMessageBinding(),
                data: data
              },
              function(response) {
                if (response.APIResults["Status Code"] === -1) {
                  serviceBase.showErrorNotification('Add Adapter Message Binding', response.APIResults["Result Description"]);
                  callback(null);
                } else
                  callback(response);
              });
          }
        ], function(result) {
          callback(result);
        });
      };
      service.addDefinition = function(data, callback) {
        //            https://github.com/caolan/async
        async.waterfall([
          function(callback) {
            serviceBase.HttpRequest.Put({
                url: serviceRest.uploadDefinition(),
                data: data
              },
              function(response) {
                if (response.APIResults["Status Code"] === -1) {
                  serviceBase.showErrorNotification('Upload Model Config', response.APIResults["Result Description"]);
                  callback(response);
                } else {
                  callback(response);
                }
              });
          }
        ], function(result) {
          callback(result);
        });
      };

      service.addModelMetaData = function(model, callback) {
        serviceBase.HttpRequest.Save({
          url: '/addModelMetaData',
          data: {
            model: model,
            token: authenticationService.getToken()
          }
        }, function(response) {
          callback(response.result);
        });

      };

      service.updateLastMinuteData = function(modelArrays, callback) {
        serviceBase.HttpRequest.Save({
          url: '/updateLastMinuteData',
          data: {
            modelArrays: modelArrays,
            token: authenticationService.getToken()
          }
        }, function(response) {
          callback(response.result);
        });
      };

      service.updateAlerts = function(models, callback) {
        serviceBase.HttpRequest.Save({
          url: '/updateAlerts',
          data: {
            models: models,
            token: authenticationService.getToken()
          }
        }, function(response) {
          callback(response.result);
        });
      };

      service.addModel = function(data, fileType, headerObj, callback) {
        //            https://github.com/caolan/async
        async.waterfall([
          function(callback) {
            serviceBase.HttpRequest.Save({
                url: serviceRest.uploadModel(fileType),
                headers: headerObj,
                data: data
              },
              function(response) {
                if (response.APIResults["Status Code"] === -1) {
                  serviceBase.showErrorNotification('Add {modelName} Model'.format({
                    modelName: fileType.toUpperCase()
                  }), response.APIResults["Result Description"]);
                  callback(response);
                } else {
                  serviceBase.showSuccessNotification('Add {modelName} Model'.format({
                      modelName: fileType.toUpperCase()
                    }),
                    response.APIResults["Result Description"]);
                  callback(response);
                }
              });
          }
        ], function(result) {
          callback(result);
        });
      };

      service.addPmml = function(data, fileType, headerObj, callback) {
        //            https://github.com/caolan/async
        async.waterfall([
          function(callback) {
            serviceBase.HttpRequest.Save({
                url: serviceRest.uploadModel('pmml'),
                headers: headerObj,
                data: data
              },
              function(response) {
                if (response.APIResults["Status Code"] === -1) {
                  serviceBase.showErrorNotification('Add PMML Model', response.APIResults["Result Description"]);
                  callback(response);
                } else {
                  serviceBase.showSuccessNotification('Add PMML Model',
                    response.APIResults["Result Description"]);
                  callback(response);
                }
              });
          }
        ], function(result) {
          callback(result);
        });
      };

      service.getModelDetailedInfo = function(modelName, callback) {
        serviceBase.HttpRequest.Get({
          url: serviceRest.getModelDetailedInfo(modelName),
          data: {}
        }, function(response) {
          callback(response);
        });
      };

      service.getModelAlertsConfig = function(callback) {
        serviceBase.HttpRequest.Get({
          url: serviceRest.getAlertsConfig(),
          data: {}
        }, function(response) {
          callback(response);
        });
      };

      service.getAlerts = function(id) {
        if (!models) {
          return [];
        }
        var alerts = {};
        alerts[models[0].id] = [
          "10 Burst detected at this model",
          "15 Burst detected at this model",
          "20 Burst detected at this model"
        ];
        return alerts[models[0].id];
      };
      service.getKamanjaStatus = function() {
        try {
          return $http({
            url: serviceRest.getKamanjaStatus(),
            data: {},
            method: "GET",
            transformResponse: [function(data) {
              // Do whatever you want!
              return data;
            }]
          });
        } catch (ex) {

        }
      };
      service.startKamanja = function() {
        $http({
          url: serviceRest.startKamanja(),
          data: {},
          method: "PUT",
          transformResponse: [function(data) {
            // Do whatever you want!
            return data;
          }]
        });
      };
      service.stopKamanja = function() {
        $http({
          url: serviceRest.stopKamanja(),
          data: {},
          method: "PUT",
          transformResponse: [function(data) {
            // Do whatever you want!
            return data;
          }]
        });
      };
      service.sendAlertEmail = function(email) {
        $.ajax({
          url: 'http://54.176.225.148:9090',
          method: "POST",
          data: email.trim(),
          success: function(result) {}
        });
      };
      service.sendAlertSMS = function(cellPhone, alert) {
        // $http(
        //     {
        //         url: 'http://54.151.8.166:8080/ServicePrototype/SendSms',
        //         data: {
        //             //no: '+14252330960',
        //             // no: '+962797898322',
        //             no:cellPhone,
        //             text: alert,
        //             us: 1
        //         }
        //     }
        // );
        $.ajax({
          url: 'http://54.176.225.148:8080/ServicePrototype/SendSms',
          data: {
            //no: '+14252330960',
            // no: '+962797898322',
            no: cellPhone,
            text: alert,
            us: 1
          },
          success: function(result) {}
        });

      };

      service.getBlackListThreshold = function(callback) {
        serviceBase.HttpRequest.Get({
          url: serviceRest.getThresholdDataUrl(),
          headers: {
            modelname: 'com.kamanja.demo.msgcontainer.BlackListIp'
          },
          data: {}
        }, function(response) {
          callback(response);
        });
      };

      service.saveBlackListThreshold = function(data, callback) {
        serviceBase.HttpRequest.Save({
          url: serviceRest.getThresholdDataUrlForUpdate(),
          headers: {
            modelname: 'com.kamanja.demo.msgcontainer.BlackListIp'
          },
          data: data
        }, function(response) {
          callback(response);
        });
      };

      service.getTimezoneThreshold = function(callback) {
        serviceBase.HttpRequest.Get({
          url: serviceRest.getThresholdDataUrl(),
          headers: {
            modelname: 'com.kamanja.demo.msgcontainer.Timezone'
          },
          data: {}
        }, function(response) {
          callback(response);
        });
      };

      service.saveThresholdTime = function(data, callback) {
        serviceBase.HttpRequest.Save({
          url: serviceRest.getThresholdDataUrlForUpdate(),
          headers: {
            modelname: 'com.kamanja.demo.msgcontainer.Timezone'
          },
          data: data
        }, function(response) {
          callback(response);
        });
      };

      return service;
    }
  ]);
