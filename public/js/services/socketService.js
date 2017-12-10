'use strict'

angular.module('kmapp')
    .factory('socketService', ['$rootScope', 'serviceRest', 'serviceData',
        function ($rootScope, serviceRest, serviceData) {
            var service = {};
            var wsAelrtsStatus;
            var wsStatus;

            service.connectAlertsStatus = function (callback) {
                var url = serviceRest.getSocketAlertsUrl();
                if ('WebSocket' in window) {
                    wsAelrtsStatus = new WebSocket(url);
                } else if ('MozWebSocket' in window) {
                    wsAelrtsStatus = new MozWebSocket(URL);
                } else {
                    console.log('websocke is not supported');
                    return;
                }
                wsAelrtsStatus.onopen = function () {
                    // console.log('Open Status!');
                };
                wsAelrtsStatus.onmessage = function (event) {
                    callback(event.data);
                    //console.log(event);
                };
                wsAelrtsStatus.onclose = function () {

                    service.disconnectStatus();
                    console.log('Close Status!');
                    service.connectAlertsStatus(callback);
                };
                wsAelrtsStatus.onerror = function (event) {
                    console.log('Error Status!' + event);
                };
            };

            service.checkAlertsSocketState = function () {
                return wsAelrtsStatus.readyState;
            };

            service.disconnectAlertsStatus = function () {
                if (wsAelrtsStatus != null) {
                    wsAelrtsStatus.close();
                    wsAelrtsStatus = null;
                }
                console.log('Disconnect Status!');
            };

            service.connectMessageEventsStatus = function (callback) {
                var url = serviceRest.getSocketTestMessageEvents();
                if ('WebSocket' in window) {
                    wsStatus = new WebSocket(url);
                } else if ('MozWebSocket' in window) {
                    wsStatus = new MozWebSocket(URL);
                } else {
                    console.log('websocke is not supported');
                    return;
                }
                wsStatus.onopen = function () {
                    // console.log('Open Status!');
                };
                wsStatus.onmessage = function (event) {
                    callback(event.data);
                    //console.log(event);
                };
                wsStatus.onclose = function () {

                    service.disconnectStatus();
                    console.log('Close Status!');
                    service.connectMessageEventsStatus(callback);
                };
                wsStatus.onerror = function (event) {
                    console.log('Error Status!' + event);
                };
            };

            service.checkMessageEventsSocketState = function () {
                return wsStatus.readyState;
            };

            service.disconnectStatus = function () {
                if (wsStatus != null) {
                    wsStatus.close();
                    wsStatus = null;
                }
                console.log('Disconnect Status!');
            };

            return service;
        }]);