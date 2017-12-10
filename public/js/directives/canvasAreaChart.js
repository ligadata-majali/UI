'use strict';
angular.module('kmapp')
    .directive('canvasAreaChart', ['$filter', '$rootScope','$timeout',  function ($filter,$rootScope,$timeout) {
        return {
            restrict: 'A',
            scope: {
                data: '=',
                filterName: '@',
                interval: '=',
                modelsNumber: '@',
                state:'@'
            },
            link: function (scope, element, attrs) {
                var height = attrs.height;
                var maxYLimit ;
                var y;
                var divide = 1;
                var isFirstLoad = true;
                var stopAfterDraw = false;
                var series = new TimeSeries();
                var currentMinute;
                var loadMinute = function(minuteData){
                    series.data = [];
                    _.each(minuteData, function (datum, i) {
                        series.append(new Date().getTime()  -  (60000 - i * 1000)  , datum.y/divide);
                    });
                };
                element.bind('animationend webkitAnimationEnd oAnimationEnd', function(){
                    element.css('-webkit-animation', 'none');
                    element.css('-moz-animation', 'none');
                    element.css('animation', 'none');
                });
                // scope.$watch(
                //     function(){
                //         return $rootScope.kamanjaStatus;
                //     },
                //     function(){
                //         if (chart){
                //             if ($rootScope.kamanjaStatus){
                //                 chart.start();
                //                 loadMinute(currentMinute);
                //             } else {
                //                 if (!isFirstLoad) {
                //                     console.log('stop immediately');
                //                     chart.stop();
                //                 } else {
                //                     stopAfterDraw = true;
                //                 }
                //             }
                //         }
                //     }
                // );
                var breakInterval;
                scope.$watchCollection(function () {
                    return [$filter('json')(scope.data), scope.filterName,scope.state];
                }, function (oo, nn) {
                    var newFilter = false;
                    if (oo[2] !== nn[2]){
                        newFilter = true;
                    }
                    if (oo[1] !== nn[1]) {
                        newFilter = true;
                        element.css('-webkit-animation', 'goTaller 1.5s');
                        element.css('-moz-animation', 'goTaller 1.5s');
                        element.css('animation', 'goTaller 1.5s');
                    }
                    // if (oo[0] !== nn[0] && $rootScope.kamanjaStatus) {
                    //     chart.start();
                    //     breakInterval = $timeout(function(){
                    //         chart.stop();
                    //     },3000);
                    // }
                    // var maximumValue = _.max(scope.data?scope.data.slice(50,60):[], function (d) {
                    //     return d.y
                    // }).y;
                    // for (var k = 20000; k > maximumValue; k = k - 1000){
                    //
                    // }
                    // k = k + 1000;
                    // maxYLimit = 2000 * scope.modelsNumber;
                    // maxYLimit = 5000;
                    // y = d3.scale.linear()
                    //     .domain([0, maxYLimit])
                    //     .range([0, height]);
                    if (scope.data && scope.data.length) {
                        if (isFirstLoad || newFilter || !$rootScope.kamanjaStatus) {
                            loadMinute(scope.data);
                            // if (stopAfterDraw){
                            //     console.log('stop after draw');
                            //     setTimeout(function(){
                            //         currentMinute = scope.data;
                            //         chart.stop();
                            //     },0);
                            //     stopAfterDraw = false;
                            // }
                        } else {
                            currentMinute = scope.data;
                            var datum = scope.data[scope.data.length - 1];
                            console.log('%c Calculated result value fed to chart %c' + datum.y, 'color: red;','color: purple; font-size:22px;');
                            series.append(new Date().getTime() , datum.y/divide);
                        }
                        isFirstLoad = false;
                    }
                });
                var chart = new SmoothieChart({
                    millisPerPixel: 73,
                    maxDataSetLength:60,
                    scaleSmoothing: 1,
                    grid: {fillStyle: 'transparent', strokeStyle: 'transparent'},
                    labels:{disabled:true}
                });
                chart.addTimeSeries(series, {
                    lineWidth: 2,
                    strokeStyle: 'rgba(0,255,255,0.4)',
                    fillStyle: 'rgba(245,11,11,0.30)'
                });
                chart.streamTo(element[0], 3000);
            }
        }
    }]);
