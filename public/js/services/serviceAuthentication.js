'use strict'

angular.module('kmapp')
    .service('authenticationService', ['$window',
        function($window){
            return {
                saveToken: function(token){
                    $window.localStorage['loginToken'] = token;
                },
                getToken: function(){
                    return $window.localStorage['loginToken'];
                },
                logout: function(){
                    $window.localStorage.removeItem('loginToken');
                },
                isloggedIn: function(){
                    var token = this.getToken();
                    var payload;
                    if(token){
                        payload = token.split('.')[1];
                        payload = $window.atob(payload);
                        payload = JSON.parse(payload);
                        return new Date(payload.exp) > new Date(Date.now());
                    }else{
                        return false;
                    }
                }
            }
        }]);