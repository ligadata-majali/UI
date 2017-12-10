'use strict'

angular.module('kmapp')
    .factory('serviceRest', ['serviceBase',
        function (serviceBase) {
            var service = {};
            var serverIP = '54.177.36.39';
            var portNo = 8080;
            var socketPortNo = 7080;

            var alerstServer = '54.177.36.39';



            service.uploadMessage = function () {
                return "http://{serverIP}:{portNo}/api/message".format({serverIP: serverIP, portNo: portNo});
            };

            service.uploadDefinition = function () {
                return "http://{serverIP}:{portNo}/api/UploadModelConfig".format({serverIP: serverIP, portNo: portNo});
            };

            service.uploadModel = function (fileType) {
                return "http://{serverIP}:{portNo}/api/model/{type}".format({
                    serverIP: serverIP, portNo: portNo, type: fileType
                });
            };

            service.getModelDetailedInfo = function (modelName) {
                return "http://{serverIP}:{portNo}/api/Model/{modelName}".format({
                    serverIP: serverIP, portNo: portNo, modelName: modelName
                });
            };

            service.getModelsUrl = function () {
                return "http://{serverIP}:{portNo}/api/keys/Model".format({serverIP: serverIP, portNo: portNo});
            };

            service.deleteModelUrl = function (modelName) {
                return "http://{serverIP}:{portNo}/api/model/{modelName}".format({
                    serverIP: serverIP,
                    portNo: portNo,
                    modelName: modelName
                });
            };

            service.adapterMessageBinding = function () {
                return "http://{serverIP}:{portNo}/api/adaptermessagebinding".format({
                    serverIP: serverIP,
                    portNo: portNo
                });
            };

            service.getAlertsConfig = function () {
                return "http://{serverIP}/bofa-service/Config".format({serverIP: alerstServer});
            };

            service.getKamanjaStatus = function () {
                return "http://{serverIP}:{portNo}/MTier/looper/status".format({
                    serverIP: serverIP,
                    portNo: portNo
                });
            };
            service.startKamanja = function () {
                return "http://{serverIP}:{portNo}/MTier/looper/start".format({
                    serverIP: serverIP,
                    portNo: portNo
                });
            };
            service.stopKamanja = function () {
                return "http://{serverIP}:{portNo}/MTier/looper/stop".format({
                    serverIP: serverIP,
                    portNo: portNo
                });
            };

            service.getThresholdDataUrl = function(){
              return "http://{serverIP}:{portNo}/MTier/data/getdata".format({
                  serverIP: serverIP,
                  portNo: portNo
              });
            };

            service.getThresholdDataUrlForUpdate = function(){
                return "http://{serverIP}:{portNo}/MTier/data/loaddata".format({
                    serverIP: serverIP,
                    portNo: portNo
                });
            };

            service.getSocketAlertsUrl = function(){
              return "ws://{serverIP}:{portNo}/v2/broker/?topics=blacklistipaddr,unknownuseraccess,outsidenormalbusinesshours"
                  .format({serverIP: serverIP, portNo: socketPortNo});
            };

            service.getSocketTestMessageEvents = function(){
                return "ws://{serverIP}:{portNo}/v2/broker/?topics=testmessageevents_1"
                    .format({serverIP: serverIP, portNo: socketPortNo});
            };

            return service;
        }]);
