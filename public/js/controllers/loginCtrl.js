'use strict'

angular.module('kmapp')
    .controller('loginCtrl', ['$rootScope', '$scope', '$state', 'serviceBase', 'authenticationService',
        function ($rootScope, $scope, $state, serviceBase, authenticationService) {
            authenticationService.logout();
            $rootScope.globals.authenticated = false;
            $scope.login = function (username, password) {
                serviceBase.HttpRequest.Save({
                    url: '/users/login',
                    data: {username: username, password: password}
                }, function (response) {
                    if (response.success) {
                        authenticationService.saveToken(response.token);
                        $rootScope.globals = {
                            authenticated: true
                        };
                        $state.go('main.circleAndChartAndModelsTable');
                    }else{
                        serviceBase.showErrorNotification('Login', 'Invalid Username or Password!');
                    }
                });
            }
        }]);