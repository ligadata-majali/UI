'use strict'
angular.module('kmapp', ['ui.router', 'ngResource', 'ui.bootstrap', 'ngFileUpload',
        'toastr', 'ngAnimate', 'toggleCheckbox'])
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise(function ($injector, $location) {
                var $state = $injector.get("$state");
                if ($location.$$path == "" || $location.$$path == "/") {
                    $state.go("main.circleAndChartAndModelsTable");
                } else {
                    $state.go("404");
                }
            });
            $stateProvider
                .state("main", {
                    abstract: true,
                    controller: 'mainCtrl',
                    templateUrl: 'views/main.html',
                    data: {
                        requireLogin: true
                    }
                })
                .state("main.circleAndChartAndModelsTable", {
                    url: "/",
                    views: {
                        'circleAndChart': {
                            controller: 'circleAndChartCtrl',
                            templateUrl: 'views/tpl/circleAndChart.html',
                            data: {
                                requireLogin: true
                            }
                        },
                        'modelsTable': {
                            controller: 'modelsTableCtrl',
                            templateUrl: 'views/tpl/modelsTable.html',
                            data: {
                                requireLogin: true
                            }
                        }
                    }
                })
                .state("login", {
                    url: '/login',
                    templateUrl: "views/login.html",
                    controller: 'loginCtrl',
                    data: {
                        requireLogin: false
                    }
                })
                .state("404", {
                    url: '/404',
                    templateUrl: 'views/404.html',
                    data: {
                        requireLogin: false
                    }
                });
        }])
    .run(['$rootScope', '$state', '$window', 'authenticationService',
        function ($rootScope, $state, $window, authenticationService) {
            $rootScope.preventDefault = true;

            $rootScope.globals = {
                authenticated: false
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

                var requireLogin = toState.data.requireLogin;
                if (requireLogin) {

                    if (!authenticationService.isloggedIn()) {
                        if ($rootScope.preventDefault === true) {
                            event.preventDefault();
                        }
                        $state.transitionTo('login');
                    } else {
                        $rootScope.globals = {
                            authenticated: true
                        };
                        $rootScope.preventDefault = false;

                    }
                }
            });
        }])
    .filter('removeSpaces', [function () {
        return function (string) {
            if (!angular.isString(string)) {
                return string;
            }
            return string.replace(/[\s]/g, '');
        };
    }]);
//
// setTimeout(function(){
//     $('.actionButtons.glyphicon.glyphicon-menu-hamburger').click();
//     setTimeout(function(){
//         $('.descriptionLink').click();
//         setTimeout(function(){
//             $('.thresholdActionButtons').click();
//         },200);
//     },200);
// },2000);