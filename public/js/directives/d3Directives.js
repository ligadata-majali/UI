'use strict'
angular.module('kmapp')
    .directive('areaChart', ['$filter', function ($filter) {
        return {
            restrict: 'E',
            template: '<div class="d3area"></div>',
            replace: true,
            scope: {
                data: '=',
                filterName: '@',
                interval: '=',
                modelsNumber: '@'
            },
            link: function (scope, element, attrs) {

                var margin = {
                        top: 45,
                        right: 50,
                        bottom: 50,
                        left: 70
                    },
                    width = attrs.width - margin.left,
                    height = attrs.height - margin.top - margin.bottom;


                var svg;


                scope.$watchCollection(function () {
                    return [$filter('json')(scope.data), scope.filterName];
                }, function (oo, nn) {
                    var newFilter = false;
                    if (oo[1] !== nn[1]) {
                        newFilter = true;
                    }
                    if (!scope.data) return;


                    element.html("");

                    var n = scope.data.length;
                    var x = d3.scale.linear()
                        .domain([1, n - 1])
                        .range([0, width]);
                    var y;

                    function roundAccuracy(num, acc)
                    {
                        var factor=Math.pow(10,acc);
                        return Math.round(num*factor)/factor;
                    }


                    var maxYLimit = roundAccuracy(maxY,-3)?roundAccuracy(maxY,-3):500; //maxY is a global variable from smoothie.js
                    y = d3.scale.linear()
                        .domain([0, maxYLimit])
                        .range([height, 0]);

                    var maxVal = 0;
                    try {
                        maxVal = parseFloat(scope.data[scope.data.length - 1].y);
                        maxVal = formatNumber(parseInt(maxVal));
                    } catch (ex) {
                        maxVal = 0;
                    }
                    var ticks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
                    //var ticks = [55,50,45,40,35,30,25,20,15,10,5,0];
                    var xAxis = d3.svg.axis()
                        .scale(
                            d3.scale.linear()
                                .domain([1, n - 1])
                                .range([width - 24, 0])
                        )
                        .tickValues(ticks)
                        .tickFormat(function (value, index) {
                            if (value < 60) {
                                return "00:" + padLeft(value, 2);
                            }
                            else
                                return "01:00";
                        })
                        ;

                    var yTicks = scope.modelsNumber >= 1 ? [maxYLimit/4, maxYLimit/2, maxYLimit/4 * 3, maxYLimit] : [];

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .tickValues(yTicks)
                        .tickFormat(function (value, index) {
                            return value;
                        })
                        .orient("left");
                    var svgWidth = width + margin.left + margin.right + 70;
                    svg = d3.select(element.get(0))
                        .append("svg")
                        .attr("width", svgWidth)
                        .attr("height", height + margin.top + margin.bottom + 100)
                        .append("g")
                        .attr("transform", "translate(" + parseInt(margin.left - 10) + "," + margin.top + ")");


                    var maxGradientVal = d3.max(scope.data, function (d) {
                        return d.y;
                    });

                    maxGradientVal = maxGradientVal ? maxGradientVal : 535;


                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(34," + parseInt(height + 10) + ")")
                        .call(xAxis)
                        .append("text")
                        .style("text-anchor", "end")
                        .attr("class", "xTitle")
                        .text("SECONDS").attr("transform", "translate(-37,18)");
                    var recProcessed = 160;

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(0)")
                        .attr("y", -39)
                        .attr("dy", ".71em")
                        .attr("x", recProcessed)
                        .attr("class", "yLeftTitle")
                        .style("text-anchor", "end")
                        .text("RECORDS PROCESSED/SEC");

                    function area(h) {
                        //http://jsfiddle.net/meetamit/G3QER/1/
                        var yy = d3.scale.linear()
                            .domain([0, maxYLimit])
                            .range([-163, -163 + h]);
                        return d3.svg.area().interpolate("basis")
                            .x(function (d, i) {
                                return x(i) + 33;
                            })
                            .y0(height)
                            .y1(function (d) {
                                return -yy(d.y);
                            });
                    }

                    var filter = svg.append("defs")
                        .append("filter")
                        .attr("id", "blur")
                        .append("feGaussianBlur")
                        .attr("stdDeviation", 0.5);

                    svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", 720)
                        .attr("height", 163)
                        .attr("transform", "translate(22,0)")
                    ;

                    var a1 = area(0);
                    var a2 = area(height);


                    var line = function (h) {
                        var yy = d3.scale.linear()
                            .domain([0, maxYLimit])
                            .range([-163, -163 + h]);
                        return d3.svg.line().interpolate("basis")
                            .x(function (d, i) {
                                return x(i) + 33;
                            })
                            .y(function (d) {
                                return -yy(d.y);
                            });
                    };
                    var l1 = line(0);
                    var l2 = line(height);

                    svg.select('.y.axis').selectAll('g.tick')
                        .selectAll('text')
                        .style("text-anchor", "start")
                        .style("width","40px")
                        .attr('x', -18);

                    svg.select('.y.axis').selectAll('g.tick')
                        .insert('line')
                        .attr('x1', 22)
                        .attr('y1', 0)
                        .attr('x2', attrs.width - 50)
                        .attr('y2', 0)
                        .style("stroke", "#848484")
                        .style("stroke-opacity", "1")
                        .style("stroke-width", 1)
                        .style("z-index", "200");


                    var counterPosition;
                    switch (String(maxVal).length) {
                        case 1:
                            counterPosition = width - margin.left + 55;
                            break;
                        case 2:
                            counterPosition = width - margin.left + 40;
                            break;
                        case 3:
                            counterPosition = width - margin.left + 20;
                            break;
                        case 4:
                            counterPosition = width - margin.left  ;
                            break;
                        case 5:
                            counterPosition = width - margin.left -  20;
                            break;
                    }
                    // counterPosition = width - margin.left - 20;

                        svg.append("text")
                            .attr("class", "d3Value")
                            .attr("y", -13)
                            .attr("x", counterPosition)
                            .style("text-anchor", "right")
                            .style("text-align","right")
                            .text(maxVal);


                    svg.append("line")
                        .attr("x1", attrs.width - 50)
                        .attr("y1", -40)
                        .attr("x2", attrs.width - 50)
                        .attr("y2", 164)
                        .style("stroke", "#FF6600")
                        .style("stroke-width", 1)
                        .style("z-index", "200"); // orange vertical line

                    var fo = svg.append('foreignObject')
                        .attr({
                            'x': -56,
                            'y': 118,

                        });

                    var div = fo.append('xhtml:div')
                        .attr({
                            'class': 'bottomGlowLine'
                        });
                }, true); // end of scope.$watch
            }
        }

    }])
    .directive('sunburstChart', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'views/tpl/sunburstchart.html',
            replace: true,
            scope: {
                data: '=',
                fillArea: '&'
            },
            link: function (scope, element, attrs, rootScope) {

                var isFirstTime = true;
                var width = attrs.width;
                var height = attrs.height;
                var radius = (Math.min(width, height) / 2);

                var colors = {
                    "selected": "#00CCCC",
                    "unselected": "#333333"
                };

                var color = d3.scale.ordinal()
                    .range(["#009933", "#CCCC33", "#237283", "#CC3366", "#CC6633"]);

                var x, y, arc, partition;

                // Keep track of the node that is currently being displayed as the root.
                var node;

                scope.$watch('data', function (root, old) {
                    if (!root || scope.data.children.length == 0) {
                        return;
                    }

                    root = scope.data;
                    d3.select(".sunburstChart").select("svg").remove();

                    x = d3.scale.linear()
                        .range([0, 2 * Math.PI]);

                    y = d3.scale.sqrt()
                        .range([0, radius]);

                    partition = d3.layout.partition()
                        .sort(null)
                        .value(function (d) {
                            return 1;
                        });

                    var radiusAdjustments = [0, -5, -1];
                    arc = d3.svg.arc()
                        .startAngle(function (d) {
                            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                        })
                        .endAngle(function (d) {
                            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                        })
                        .innerRadius(function (d) {
                            var n = 0;
                            if (d.parent) {
                                n = radiusAdjustments[d.parent.depth];
                            }
                            return Math.max(0, y(d.y)) + n;
                        })
                        .outerRadius(function (d) {
                            return Math.max(0, y(d.y + d.dy)) + (radiusAdjustments[d.depth]) - 2;
                        });


                    var svg = d3.select(".sunburstChart").append("svg")
                        .attr("width", parseInt(width) + 15)
                        .attr("height", parseInt(height) + 15)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");


                    scope.depth = 0;

                    node = root;
                    var path = svg.datum(root).selectAll("path")
                        .data(partition.nodes)
                        .enter().append("path")
                        .attr("d", arc)
                        .style("cursor", "pointer")
                        .style("fill", function (d) {
                            if (d.depth == 0)
                                return "transparent";
                            else if (d.depth == 1)
                                return color((d.children ? d : d.parent).name);
                            else if (d.depth == 2)
                                return d.selection == "unselected" ? colors[d.selection] : color((d.children ? d : d.parent).name);
                        })
                        .style("stroke", "#171717")
                        //  return color((d.children ? d : d.parent).name); })
                        .on("click", click)
                        .each(stash);


                    GetDepth0(root);

                    function GetDepth0(data) {
                        scope.selectedProjectsNo = 0;
                        scope.TotalProjects = data.children ? data.children.length : 0;
                        scope.selectedModelsNo = 0;

                        scope.TotalModels = 0;

                        _.each(data.children, function (item) {
                            var projectFlag = false;
                            scope.TotalModels += item.children.length;
                            _.each(item.children, function (child) {
                                if (child.selection == "selected") {
                                    scope.selectedModelsNo += 1;
                                    projectFlag = true;
                                }
                            });
                            if (projectFlag)
                                scope.selectedProjectsNo += 1;
                        });
                    }

                    var animationDuration;

                    function click(d) {
                        animationDuration = isFirstTime ? 0 : 500;
                        node = d;
                        path.transition()
                            .duration(animationDuration)
                            .attrTween("d", arcTweenZoom(d));
                        scope.depth = d.depth;
                        if (d.depth == 0) {
                            GetDepth0(d);
                            scope.fillArea()(0, 0);
                        } else if (d.depth == 1) {
                            scope.selectedProjectName = d.name;
                            scope.fillArea()(d.id, 0);
                        } else if (d.depth == 2) {
                            scope.selectedModelName = d.displayName;
                            var currentDate = moment(Date.now());
                            var createdAt = moment(d.createdAt);
                            scope.selectedModelAge = currentDate.diff(createdAt, 'minutes');
                            ;
                            scope.tags = d.tags;
                            scope.active = d.status;
                            scope.fillArea()(d.parent.id, d.modelId);
                        }
                    }

                    var partitionNodes = partition.nodes(root);
                    var d = _.filter(partitionNodes, function (n) {
                        return n.depth === 2;
                    })[0];
                    animationDuration = 0;
                    if (isFirstTime) {
                        click(d);
                        setTimeout(function () {
                            d = _.filter(partitionNodes, function (n) {
                                return n.depth === 1;
                            })[0];
                            animationDuration = 250;
                            click(d);
                            setTimeout(function () {
                                d = _.filter(partitionNodes, function (n) {
                                    return n.depth === 0;
                                })[0];
                                animationDuration = 250;
                                click(d);
                                setTimeout(function () {
                                    animationDuration = 250;
                                    scope.isInitialized = true;
                                    scope.$apply();
                                }, 500);
                            }, 500);
                        }, 500);
                        isFirstTime = false;
                    }
                });

                d3.select(self.frameElement).style("height", height + "px");

                // Setup for switching data: stash the old values for transition.
                function stash(d) {
                    d.x0 = d.x;
                    d.dx0 = d.dx;
                }

                // When switching data: interpolate the arcs in data space.
                function arcTweenData(a, i) {
                    var oi = d3.interpolate({
                        x: a.x0,
                        dx: a.dx0
                    }, a);

                    function tween(t) {
                        var b = oi(t);
                        a.x0 = b.x;
                        a.dx0 = b.dx;
                        return arc(b);
                    }

                    if (i == 0) {
                        // If we are on the first arc, adjust the x domain to match the root node
                        // at the current zoom level. (We only need to do this once.)
                        var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
                        return function (t) {
                            x.domain(xd(t));
                            return tween(t);
                        };
                    } else {
                        return tween;
                    }
                }

                // When zooming: interpolate the scales.
                function arcTweenZoom(d) {
                    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                        yd = d3.interpolate(y.domain(), [d.y, 1]),
                        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                    return function (d, i) {
                        return i ? function (t) {
                            return arc(d);
                        } : function (t) {
                            x.domain(xd(t));
                            y.domain(yd(t)).range(yr(t));
                            return arc(d);
                        };
                    };
                }


            } // end of link
        }
    })
    .directive("barChart", function () {
        return {
            restrict: 'E',
            template: '<div></div>',
            replace: true,
            scope: {
                data: '='
            },
            link: function (scope, element, attrs) {
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 70,
                        left: 40
                    },
                    width = attrs.width - margin.left - margin.right,
                    height = attrs.height - margin.top - margin.bottom;

                scope.$watchCollection('data | json', function () {
                    if (!scope.data) return;
                    $("#" + attrs.id).html("");
                    var maxY = _.max(scope.data, function (item) {
                        return item.y;
                    }).y;
                    var svg = d3.select("#" + attrs.id)
                        .append("svg")
                        .attr("width", width)
                        .attr("height", attrs.height);
                    if (scope.data.length > 0) {
                        svg.selectAll("rect")
                            .data(scope.data)
                            .enter()
                            .append("rect")
                            .attr("x", function (d, i) {
                                return width - (i * (7));
                            })
                            .attr("y", function (d) {
                                return Math.abs(maxY - d.y); //Height minus data value
                            })
                            .attr("width", 5)
                            .attr("fill", "teal")
                            .attr("height", function (d) {
                                return d.y;
                            });
                    }

                });
            }
        }
    })
    .directive("barChart2", function () {
        return {
            template: '<div></div>',
            replace: true,
            scope: {
                data: '='
            },
            link: function (scope, element, attrs) {
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 40
                    },
                    width = attrs.width,
                    height = attrs.height;
                var y = d3.scale.linear()
                    .range([height, 0]);

                scope.$watchCollection('data | json', function () {
                    if (!scope.data) return;
                    var tempArr = scope.data.slice(40, 59);
                    $("#" + attrs.id).html("");
                    var chart = d3.select("#" + attrs.id)
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    y.domain([0, d3.max(tempArr, function (d) {
                        return d.y;
                    })]);
                    var barWidth = width / scope.data.length;

                    var bar = chart.selectAll("g")
                        .data(tempArr)
                        .enter().append("g");
                    //.attr("transform", function(d, i) { return "translate(" + width - (i * 6) + ",0)"; });
                    try {
                        bar.append("rect")
                            .attr("x", function (d, i) {
                                return (i * (7));
                            })
                            .attr("fill", "#009999")
                            .attr("y", function (d) {
                                return y(d.y);
                            })
                            .attr("height", function (d) {
                                return Math.abs(d.y);
                            })
                            .attr("width", 5);
                    } catch (ex) {

                    }


                });
            }
        }
    });
