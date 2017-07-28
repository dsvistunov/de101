(function() {
    'use strict';
    angular
        .module('FbDashboardApp')
        .directive('barChart', barChart);
    function barChart() {
        return {
            // Link function is responsible for directive rendering
            link: link,
            // Element name (default)
            restrict: 'E',
            scope: {
                // @attr Bind a local scope property to the value of DOM attribute
                // The result is always a string since DOM attributes are strings
                metric: "@metric",
                message: "@message",
                // =attr Set up a bidirectional binding between a local scope property
                // and an expression passed via the attribute
                posts: '=posts'
            },
            controller: function ($scope) {

                var message = $scope.message
            }
        };
        // Link function declared on the next slide
        function link(scope, element, attrs) {
            // $watch service helps as to run code below when posts variable changes
            // In our case when posts loaded from fb api data-service
            scope.$watch('posts', function(posts) {
                if (!posts) return;
                // Chart height, width, margin
                var margin = {top: 20, right: 20, bottom: 50, left: 70},
                    width = 960 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;
                // Ordinal scales have a discrete domain, such as a set of names or categories
                var x = d3.scale.ordinal()
                    // Sets the output range and interval between items
                    .rangeRoundBands([0, width], 0.1, 0.3);
                // Linear scales are the most common scale, and a good default choice
                // to map a continuous input domain to a continuous output range
                var y = d3.scale.linear()
                    // Sets the scale's output range to the specified array of values
                    .range([height, 0]);
                // X scale interval
                x.domain(posts.map(function(d, i) {return i}));
                // Y scale interval
                y.domain([0, d3.max(posts, function(d) {return d[scope.metric]})]);
                // Remove previous graph if exist
                d3.select(element[0]).selectAll("*").remove();
                // Create svg element with given height, width inside directive
                var svg = d3.select(element[0]).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                        // setup chart margin
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                // Continue on the next slide
                // Draw bars
                svg.selectAll(".bar")
                    .data(posts)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d, i) {return x(i)})
                        // locate all bars in the bottom
                    .attr("y", function(d) {return y(0)})
                        // set bar width and height to zero
                    .attr("width", 0)
                    .attr("height", 0)
                    .transition()
                        // transition time
                    .duration(10000)
                    // transition ends with this attrs
                    .attr("y", function(d) {return y(d[scope.metric])})
                    .attr("width", x.rangeBand())
                    .attr("height", function(d) {return height - y(d[scope.metric])});
                // Define x labels
                var labels = [
                    'First', 'Second', "Third", "Fourth", 'Fifth',
                    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'
                    ];
                // Define x axis
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickFormat(function(d, i) {
                        return labels[i] + ' bar';
                        });
                // Define y axis
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .innerTickSize(-width)
                    .outerTickSize(0)
                    .tickPadding(10);
                // Draw x axis
                svg.append("g")
                    .attr("class", "x axis")
                        // Draw axis on the bottom
                    .attr("transform", "translate(0," + (height + 5) + ")")
                    .call(xAxis);
                // Draw y axis
                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 15)
                    .style("text-anchor", "end")
                    .text(scope.metric + ":");
                var colors = [
                    '#1dd2af', '#2ecc71', '#9b59b6', '#34495e', '#f1c40f',
                    '#c0392b', '#bdc3c7', '#d35400', '#7f8c8d', '#2980b9'
                    ];
                // Select all bars and set fill style based on their index
                svg.selectAll(".bar")
                    .style("fill", function(d, i) {
                        return colors[i];
                        });
                // Select all x axis ticks and move text lower and rotate it 25 degrees clockwise
                svg.selectAll(".x .tick text")
                    .attr("transform", "rotate(-25) translate(-20,0)");
                // Define mouse event handlers
                function mouseover(d) {
                    // Change element opacity to 0.2
                    d3.select(this).style('opacity', 0.2);
                    }
                function mouseout(d) {
                    // Change element opacity back to 1
                    d3.select(this).style('opacity', 1);
                    }
                svg.selectAll(".bar")
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout);
                // Define the div for the tooltip
                var tooltip = d3.select("bar-chart").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
                // Make tooltip hidden
                function tooltip_show(d, i) {
                    tooltip.html(scope.metric + ' : ' + d[scope.metric])
                        // Change element opacity to 0.9
                        .style("opacity", 0.9)
                            // Set tooltip in front of an bar elements
                        .style("z-index", 1)
                            // Move tooltip slightly left
                        .style("left", (x(i) + margin.left - 30) + 'px')
                            // Move tooltip slightly top of the bar
                        .style("top", (y(d[scope.metric]) - 40) + 'px')
                            // Set toopltip width
                        .style("width", (x.rangeBand() + 60) + 'px');
                    }
                function tooltip_hide(d) {
                    // Set tooltip in back of an bar elements
                    tooltip.style("opacity", 0).style("z-index", -1);
                    }
                svg.selectAll(".bar")
                    .on("mouseover", tooltip_show)
                    .on("mouseout", tooltip_hide);
                //Sort
                var ascending = false;
                function sort() {
                    svg.selectAll(".bar")
                        .sort(function (a, b) {
                            if (ascending) {
                                return a[scope.metric] - b[scope.metric]
                            }
                            return b[scope.metric] - a[scope.metric]
                        })
                        .transition().duration(3000)
                        .attr("x", function(d, i) { return x(i); });
                    // Rebind bars to the toolbar
                    svg.selectAll(".bar")
                        .on("mouseover", tooltip_show).on("mouseout", tooltip_hide);
                    svg.selectAll(".bartext")
                        .sort(function (a, b) {
                            if (ascending) {
                                return a[scope.metric] - b[scope.metric]
                            }
                            return b[scope.metric] - a[scope.metric]
                        })
                        .transition().duration(3000)
                        .attr("x", function (d, i) { return x(i)+35; });
                    ascending = !ascending;
                    };
                // Create button
                // d3.select("bar-chart").append("button")
                //     .attr("type","button")
                //     .classed("sort", true)
                //     .text(function(d) {
                //         return scope.message;
                //         });
                // // Handle click event on button
                // d3.select("bar-chart .sort").on("click", sort);
                d3.select(".button").on("click", sort);

                var yTextPadding = 10;
                svg.selectAll(".bartext")
                    .data(posts)
                    .enter()
                    .append("text")
                    .attr("class", "bartext")
                    .attr("text-anchor", "middle")
                    .attr("fill", "bluck")
                    .attr("x", function(d, i) {return x(i)})
                    .attr("y", function(d) {return y(0)})
                    .transition()
                    .duration(10000)
                    .attr("x", function(d,i) {
                        return x(i)+x.rangeBand()/2;
                        })
                    .attr("y", function(d,i) {
                        return y(d[scope.metric]) - yTextPadding;
                        })
                    .text(function(d){
                        return d[scope.metric];
                        });
            });
        };
    };
})();