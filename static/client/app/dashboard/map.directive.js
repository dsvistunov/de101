(function() {
    'use strict';
    angular
        .module('FbDashboardApp')
        .directive('mapChart', mapChart);
    function mapChart($log) {
        var directive = {
            link: link,
            restrict: 'E',
            scope: {
                funs: '=funs'
            }
        };
        return directive;
        function link(scope, element, attrs) {
            var margin = {top: 20, right: 20, bottom: 20, left: 20},
                width = 960 - margin.left - margin.right,
                height = 650 - margin.top - margin.bottom;
            // A watch means that AngularJS watches changes in the variable on the $scope object
            scope.$watch('funs', function(funs) {
                if (!funs) return;
                render_map(funs);
            });
            function render_map(funs_by_region) {
                function get_funs(d) {
                    return funs_by_region.value[d];
                };
                // Find the highest and the lowest fans amount
                var max_funs = d3.max(Object.keys(funs_by_region.value), get_funs);
                var min_funs = d3.min(Object.keys(funs_by_region.value), get_funs);
                var colors = ['#f7fbff', '#deebf7', '#c6dbef','#9ecae1', '#6baed6', '#4292c6','#2171b5', '#08519c', '#08306b'];
                var interval = (max_funs - min_funs) / colors.length;
                // Define the step for changing fill color of a country
                //depending on the likes amount from there
                var svg = d3.select(element[0]).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var projection = d3.geo.mercator() // Let’s use the Mercator projection
                    .center([0, 50]) // Sets the projection’s center to the special location, a two-element array of longitude and latitude
                    .scale(150);
                // Sets the projection’s scale factor
                var path = d3.geo.path().projection(projection);
                // Load world topojson file
                d3.json("../../static/bower_components/topojson/world.json", function(error, world) {
                    if (error) { $log.error(error); return; }
                    var countries = topojson.object(world, world.objects.countries).geometries; // Extract countries data from TopoJSON
                    // Define the div for the tooltip
                    var tooltip = d3.select("body")
                        .append("div")
                        .attr("class", "maptooltip")
                        .style("position", "absolute")
                        .style("z-index", "10")
                        .style("visibility", "hidden")
                        .style("width", 200)
                        .style("height", "auto")
                        .style("background-color", "#dbddd7")
                        .style("border", "solid")
                        .style("border-radius", 10+"px")
                        .style("border-color","#eaece6")
                        .style("padding", 20+"px")
                        .style("opacity", 0.9)
                        .style("color", "red");

                    var convToCountryName = {
                        4: "Afghanistan", 8: "Albania", 10: "Antarctica", 12: "Algeria", 16: "American Samoa",
                        20: "Andorra", 24: "Angola", 28: "Antigua and Barbuda", 31: "Azerbaijan", 32: "Argentina",
                        36: "Australia", 40: "Austria", 44: "Bahamas", 48: "Bahrain", 50: "Bangladesh",
                        51: "Armenia", 52: "Barbados", 56: "Belgium", 60: "Bermuda", 64: "Bhutan",
                        68: "Plurinational State of Bolivia", 70: "Bosnia and Herzegovina", 72: "Botswana",
                        74: "Bouvet Island", 76: "Brazil", 84: "Belize", 86: "British Indian Ocean Territory",
                        90: "Solomon Islands", 92: "Virgin Islands, British", 96: "Brunei Darussalam", 100: "Bulgaria",
                        104: "Myanmar", 108: "Burundi", 112: "Belarus", 116: "Cambodia", 120: "Cameroon",
                        124: "Canada", 132: "Cabo Verde", 136: "Cayman Islands", 140: "Central African Republic",
                        144: "Sri Lanka", 148: "Chad", 152: "Chile", 156: "China", 158: "Taiwan, Province of China",
                        162: "Christmas Island", 166: "Cocos (Keeling) Islands", 170: "Colombia",174: "Comoros",
                        175: "Mayotte", 178: "Congo", 180: "Democratic Republic of the Congo", 184: "Cook Islands",
                        188: "Costa Rica", 191: "Croatia", 192: "Cuba", 196: "Cyprus", 203: "Czechia", 204: "Benin",
                        208: "Denmark", 212: "Dominica", 214: "Dominican Republic", 218: "Ecuador", 222: "El Salvador",
                        226: "Equatorial Guinea", 231: "Ethiopia", 232: "Eritrea", 233: "Estonia", 234: "Faroe Islands",
                        238: "Falkland Islands (Malvinas)", 239: "South Georgia and the South Sandwich Islands",
                        242: "Fiji", 246: "Finland", 248: "Åland Islands", 250: "France", 254: "French Guiana",
                        258: "French Polynesia", 260: "French Southern Territories", 262: "Djibouti", 266: "Gabon",
                        268: "Georgia", 270: "Gambia", 275: "State of Palestine", 276: "Germany", 288: "Ghana",
                        292: "Gibraltar", 296: "Kiribati", 300: "Greece", 304: "Greenland", 308: "Grenada",
                        312: "Guadeloupe", 316: "Guam", 320: "Guatemala", 324: "Guinea", 328: "Guyana", 332: "Haiti",
                        334: "Heard Island and McDonald Islands", 336: "Holy See", 340: "Honduras", 344: "Hong Kong",
                        348: "Hungary", 352: "Iceland", 356: "India", 360: "Indonesia", 364: "Islamic Republic of Iran",
                        368: "Iraq", 372: "Ireland", 376: "Israel", 380: "Italy", 384: "Côte d'Ivoire", 388: "Jamaica",
                        392: "Japan", 398: "Kazakhstan", 400: "Jordan", 404: "Kenya", 408: "Democratic People's Republic of Korea",
                        410: "Republic of Korea", 414: "Kuwait", 417: "Kyrgyzstan", 418: "Lao People's Democratic Republic",
                        422: "Lebanon", 426: "Lesotho", 428: "Latvia", 430: "Liberia", 434: "Libya", 438: "Liechtenstein",
                        440: "Lithuania", 442: "Luxembourg", 446: "Macao", 450: "Madagascar", 454: "Malawi",
                        458: "Malaysia", 462: "Maldives", 466: "Mali", 470: "Malta", 474: "Martinique", 478: "Mauritania",
                        480: "Mauritius", 484: "Mexico", 492: "Monaco", 496: "Mongolia", 498: "Republic of Moldova",
                        499: "Montenegro", 500: "Montserrat", 504: "Morocco", 508: "Mozambique", 512: "Oman",
                        516: "Namibia", 520: "Nauru", 524: "Nepal", 528: "Netherlands", 531: "Curaçao", 533: "Aruba",
                        534: "Sint Maarten (Dutch part)", 535: "Bonaire, Sint Eustatius and Saba",
                        540: "New Caledonia", 548: "Vanuatu", 554: "New Zealand", 558: "Nicaragua", 562: "Niger",
                        566: "Nigeria", 570: "Niue", 574: "Norfolk Island", 578: "Norway", 580: "Northern Mariana Islands",
                        581: "United States Minor Outlying Islands", 583: "Federated States of Micronesia",
                        584: "Marshall Islands", 585: "Palau", 586: "Pakistan", 591: "Panama", 598: "Papua New Guinea",
                        600: "Paraguay", 604: "Peru", 608: "Philippines", 612: "Pitcairn", 616: "Poland", 620: "Portugal",
                        624: "Guinea-Bissau", 626: "Timor-Leste", 630: "Puerto Rico", 634: "Qatar", 638: "Réunion",
                        642: "Romania", 643: "Russian Federation", 646: "Rwanda", 652: "Saint Barthélemy",
                        654: "Saint Helena, Ascension and Tristan da Cunha", 659: "Saint Kitts and Nevis", 660: "Anguilla",
                        662: "Saint Lucia", 663: "Saint Martin (French part)", 666: "Saint Pierre and Miquelon",
                        670: "Saint Vincent and the Grenadines", 674: "San Marino", 678: "Sao Tome and Principe",
                        682: "Saudi Arabia", 686: "Senegal", 688: "Serbia", 690: "Seychelles", 694: "Sierra Leone",
                        702: "Singapore", 703: "Slovakia", 704: "Viet Nam", 705: "Slovenia", 706: "Somalia",
                        710: "South Africa", 716: "Zimbabwe", 724: "Spain", 728: "South Sudan", 729: "Sudan", 732: "Western Sahara",
                        740: "Suriname", 744: "Svalbard and Jan Mayen", 748: "Swaziland", 752: "Sweden", 756: "Switzerland",
                        760: "Syrian Arab Republic", 762: "Tajikistan", 764: "Thailand", 768: "Togo", 772: "Tokelau",
                        776: "Tonga", 780: "Trinidad and Tobago", 784: "United Arab Emirates", 788: "Tunisia",
                        792: "Turkey", 795: "Turkmenistan", 796: "Turks and Caicos Islands", 798: "Tuvalu", 800: "Uganda",
                        804: "Ukraine", 807: "The former Yugoslav Republic of Macedonia", 818: "Egypt", 826: "United Kingdom",
                        831: "Guernsey", 832: "Jersey", 833: "Isle of Man", 834: "United Republic of Tanzania",
                        840: "United States of America", 850: "Virgin Islands, U.S.", 854: "Burkina Faso", 858: "Uruguay",
                        860: "Uzbekistan", 862: "Bolivarian Republic of Venezuela", 876: "Wallis and Futuna", 882: "Samoa",
                        887: "Yemen", 894: "Zambia"
                    };

                    // Render all countries
                    svg.selectAll(".country")
                        .data(countries)
                        .enter().append("path")
                        .attr("d", path)
                        .classed('country', true)
                        .attr("fill", function(d) {
                            if(d.id in funs_by_region.value) { // Fill countries depending on the fans amount
                                var i = Math.floor((funs_by_region.value[d.id] - min_funs) / interval);
                                return colors[i > colors.length - 1 ? colors.length - 1 : i];
                            }else {
                                return '#90EE90'
                            }
                            })
                        .on("mouseover", function(d, i){
                            return tooltip
                                .style("visibility", "visible")
                                .style("left", (d3.event.pageX)+"px")
                                .style("top", (d3.event.pageY)-100+"px")
                                .html("<strong>"+convToCountryName[d.id.toString()]+"</strong>"+"<br/><ins>"+funs_by_region.value[d.id]+"</ins>");
                        })
                        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
                });
                var domaine = function () {
                        var intervals = [];
                        var i = colors.length - 2;
                        for (i; i > 0; i--){
                            var begin = Math.floor(interval * i);
                            var end = Math.floor(interval * (i + 0.9));
                            intervals.push(begin + ' - ' + end)
                        }
                        intervals.unshift(">" + Math.floor(interval * 8));
                        intervals.push("<" + Math.floor(interval * 0.9));
                        return intervals
                    };
                var color = d3.scale.ordinal()
                    .domain(domaine())
                    .range(['#08306b', '#08519c', '#2171b5', '#4292c6','#6baed6', '#9ecae1', '#c6dbef', '#deebf7', '#f7fbff']);

                var legend = svg.append('svg')
                    .selectAll('g')
                    .data(color.domain())
                    .enter()
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', function(d, i) {
                        var x = -20;
                            var y = (i * 5)+400;
                        return 'translate(' + x + ',' + y + ')';
                    });

                legend.append('circle')
                    .attr('cx', 40)
                    .attr('cy', function (d, i) {
                        return i+0.5+'em'
                    })
                    .attr('r', '0.6em')
                    .attr('fill', color)
                    .style('stroke', 'black');

                legend.append('text')
                    .attr('x', 60)
                    .attr('y', function (d, i) {
                            return i+0.5+'em'
                    })
                    .text(function(d) { return d; });

                legend.selectAll('svg')
                    .attr('transform', 'translate(0,400)');


                var rect = svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 380)
                    .attr("height", 200)
                    .attr("width", 200)
                    .style("stroke", "black")
                    .style("fill", "none")
                    .style("stroke-width", 1);
                }
            }
        }
})();