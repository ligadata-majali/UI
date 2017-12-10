'use strict'

angular.module('kmapp')
    .directive('header', function () {
        var ctrl = function($rootScope, $scope, $state){
            $scope.logout = function(){
                $state.go('login');
            }
        };
        return {
            restrict: 'E',
            templateUrl: 'views/tpl/header.tpl.html',
            controller: ctrl
        }
    })
    .directive('dropdownNormal', function ($rootScope) {
        var ctrl = function ($rootScope, $scope) {

        }

        return {
            restrict: 'E',
            templateUrl: 'views/tpl/dropdown.tpl.html',
            replace: true,
            scope: {
                selectedValue: '=',
                ddlText: '=',
                list: '=',
                hasIcon: '=',
                property: '@',
                ddlvalue: '@',
                placeholder: '@',
                getImageurl: '&',
                ddlChange: '&'
            },
            link: function (scope, element, attrs) {

                scope.isPlaceHolder = true;
                scope.listVisible = false;
                scope.selectedItem = {};

                scope.select = function (item) {
                    scope.isPlaceHolder = false;
                    scope.selectedItem = item;
                    if (scope.ddlvalue !== undefined)
                        scope.selectedValue = item[scope.ddlvalue];
                    else {
                        scope.selectedValue = item;
                    }

                    if (isFunction(scope.ddlChange))
                        scope.ddlChange()(item);
                }

                scope.GetImageUrl = function (item) {
                    try {
                        if (scope.hasIcon)
                            return scope.getImageurl()(item);
                        else {
                            return '';
                        }
                    } catch (ex) {
                        console.log(ex);
                    }
                }

                scope.showIcon = function () {
                    return scope.hasIcon;
                }

                scope.isSelected = function (item) {
                    return item[scope.property] == scope.selectedItem[scope.property];
                }

                $rootScope.$on("documentClicked", function (inner, target) {
                    console.log($(target[0]).is("."))
                });

                scope.$watch("selectedItem", function (value) {
                    try {
                        scope.isPlaceHolder = scope.selectedItem[scope.property] === undefined;
                        scope.display = scope.selectedItem[scope.property];
                    } catch (ex) {

                    }
                });
            }
        }
    })
    .directive('confirmaton', function(){
        return {
            restrict: 'E',
            templateUrl: 'views/tpl/confirmationModal.html',
            scope: {
                title: '=',
                message: '='
            },
            link: function(scope, element, attrs){

            }
        }
    });