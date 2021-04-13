window.updateDataset = function(item) {
    var legendLi = $(item);
    var chart = $(item).closest(".chart").find(".generalReportChart").data("chart");
    var idx = $(item).data("i");
    var areaChartOptions = chart.options;

    if (legendLi !== null) {
        $(legendLi).toggleClass('switchedOff');
    }
    idx = typeof idx == 'undefined' ? null : idx;
    if (idx !== null) {
        var dataset = chart.data.datasets[idx];
        dataset.hidden = !dataset.hidden;
    }
    var yAxes = {};
    var meta = {};
    $.each(chart.data.datasets, function (index, val) {
        meta = chart.getDatasetMeta(index);
        if (typeof yAxes[meta.yAxisID] == 'undefined') {
            yAxes[meta.yAxisID] = 0;
        }
        if (!val.hidden) {
            yAxes[meta.yAxisID] += 1;
        }
    });

    $(areaChartOptions.scales.yAxes).each(function () {
        if (typeof yAxes[$(this)[0]['id']] == 'undefined') {
            yAxes[$(this)[0]['id']] = 0;
        }
    });

    var yAxesIdx = {};
    $.each(chart.options.scales.yAxes, function (index, val) {
        yAxesIdx[val.id] = index;
    });
    $.each(yAxes, function (index, value) {

        if (value > 0) {
            chart.options.scales.yAxes[yAxesIdx[index]].display = true;
        } else {
            chart.options.scales.yAxes[yAxesIdx[index]].display = false;
        }
    });

    var key;
    var elem = $(item).closest('*[data-url]');
    if (elem.data('url')) {
      var link = document.createElement('a');
      link.href = $(elem).data('url');
      var host = link.host;
      var path = link.pathname;
      key = generateChartKey(idx, host, path);
    } else {
      key = generateChartKey(idx);
    }

    if (key) {
      if (localStorage.getItem(key) === 'true') {
        localStorage.setItem(key, 'false');
      } else {
        localStorage.setItem(key, 'true');
      }
    }
    chart.update();
};

var areaChartOptions = function (defGlobalCurrencyCode) {
    return {
        currencyCode: defGlobalCurrencyCode || '$',
        //Boolean - If we should show the scale at all
        showScale: true,
        //Boolean - Whether grid lines are shown across the chart
        scaleBeginAtZero: false,
        scaleShowGridLines: false,
        //String - Colour of the grid lines
        scaleGridLineColor: "rgba(0,0,0,.05)",
        //Number - Width of the grid lines
        scaleGridLineWidth: 1,
        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,
        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,
        //Boolean - Whether the line is curved between points
        bezierCurve: true,
        //Number - Tension of the bezier curve between points
        bezierCurveTension: 0.3,
        //Boolean - Whether to show a dot for each point
        pointDot: true,
        //Number - Radius of each point dot in pixels
        pointDotRadius: 2,
        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth: 1,
        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius: 20,
        //Boolean - Whether to show a stroke for datasets
        datasetStroke: true,
        //Number - Pixel width of dataset stroke
        datasetStrokeWidth: 1,
        //Boolean - Whether to fill the dataset with a color
        datasetFill: false,
        chart: {height: 250},
        scales: {
            yAxes: [
                {
                    "type": "linear",
                    "id": "axis-1",
                    ticks: {
                        beginAtZero: true,
                    }
                },
                {
                    "type": "linear",
                    "id": "axis-2",
                    "position": "right",
                    ticks: {
                        callback: function (value) {
                            return defGlobalCurrencyCode + ' ' + (Math.round(value * 100) / 100);
                        },
                        beginAtZero: true,
                    },
                    beforeFit: function(axe) {
                        axe.maxWidth = 60;
                    }
                },
                {
                    "type": "linear",
                    "id": "axis-3",
                    "position": "left",
                    ticks: {
                        callback: function (value) {
                            return defGlobalCurrencyCode + ' ' + Math.round(value * 100) / 100;
                        },
                        beginAtZero: true,
                    }
                },
                {
                    "type": "linear",
                    "id": "axis-prc",
                    "position": "right",
                    ticks: {
                        callback: function (value) {
                            return (Math.round(value * 100) / 100) + ', %';
                        },
                        beginAtZero: true,
                    }
                },
                {
                    "type": "linear",
                    "id": "axis-prc-top10",
                    "position": "right",
                    ticks: {
                        callback: function (value) {
                            return (Math.round(value * 100) / 100) + ', %';
                        },
                        suggestedMax: 10,
                        beginAtZero: true,
                    }
                },
                {
                    "type": "linear",
                    "id": "axis-r",
                    "position": "right",
                    ticks: {
                        beginAtZero: true,
                    }
                },
            ]
        },
        legend: {
            display: false
        },
        tooltips: {
            mode: 'point',
            intersect: true,
            displayColors: false,
            bodySpacing: 1,
            titleFontSize: 12,
            bodyFontSize: 12,
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ': ';
                    }
                    label += tooltipItem.yLabel;
                    return label;
                },
            },
        },
        legendCallback: function (chart) {
            var text = [];
            text.push('<ul class="' + chart.id + '-legend a-chart-legend" onclick="updateDataset(this)">');
            for (var i = 0; i < chart.data.datasets.length; i++) {
                var hiddenClass = chart.data.datasets[i].hidden ? 'switchedOff' : '';
                text.push('<li onclick="updateDataset(this)" data-i="' + i + '" class="' +
                          hiddenClass + '"><span style="background-color:' + chart.data.datasets[i].borderColor + '"></span>');
                if (chart.data.datasets[i].label) {
                    text.push(chart.data.datasets[i].label);
                }
                text.push('</li>');
            }
            text.push('</ul>');

            return text.join("");
        },
        //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: false,
        //Boolean - whether to make the chart responsive to window resizing
        responsive: true,
        onHover: function(event, elements){
            var index = null;
            for (var key in elements) {
                if (this.data.labels[elements[key]._index]) {
                    index = this.data.labels[elements[key]._index];
                    break;
                }
            }

            if (index) {
                $('tr[data-index]').removeClass('active');
                $('tr[data-index="' + index + '"]').addClass('active');
            }
        }
    };
};

var generateChartKey = function(id, host, path) {
  host = host ? host : window.location.host;
  path = path ? path : window.location.pathname;
  var urlParse = path.split('/', 4);
  urlParse.forEach(function (item, i) {
    if (urlParse[i] === 'index' || urlParse[i] === "" || urlParse[i] === 'undefined') {
      host += '';
    } else {
      host += '.' + item;
    }
  });

  return id !== null ? 'chart.' + host + '.' + id : false;
};

function setChartEvents()
{
    $(document).off('chart', '.generalReportChart:not(.rendered)');
    $(document).on('chart', '.generalReportChart:not(.rendered)', function () {
        $(this).addClass("rendered");
        var elem = $(this).closest('*[data-url]');
        var dataChart = $(this).data('chart');
        if (elem.data('url')) {
            var link = document.createElement('a');
            link.href = $(elem).data('url');
            var host = link.host;
            var path = link.pathname;
        }
        for (var i = 0; i < dataChart.datasets.length; i++) {
            if (elem.data('url')) {
                var key = generateChartKey(i, host, path);
            } else {
                var key = generateChartKey(i);
            }
            if (localStorage.getItem(key) === null) {
                if (dataChart.datasets[i].hidden) {
                    localStorage.setItem(key, 'false');
                } else {
                    localStorage.setItem(key, 'true');
                }
            } else {
                if (localStorage.getItem(key) === 'false') {
                    dataChart.datasets[i].hidden = true;
                } else {
                    dataChart.datasets[i].hidden = false;
                }
            }
        }
        reportChart = Chart.Line(this.getContext("2d"), {
            data: dataChart,
            options: $.extend(
                {},
                areaChartOptions($(this).data('currency')),
                {zoom: !!dataChart.zoom}
            )
        });
        $(this).data('chart', reportChart);
        $(this).parent().append(reportChart.generateLegend());
        $(this).parent().find('ul:first').trigger('click').trigger('click');

        $(this).on('mouseout', function(){
            $('tr[data-index]').removeClass('active');
        });

        if (dataChart.zoom) {
            var reset = $(
                '<button type="button" class="btn btn-sm btn-default pull-right" disabled>' +
                '<i class="far fa-sync"></i> Reset' +
                '</button>'
            );

            reset.on('click', function () {
                reset.attr('disabled', true).removeClass('btn-primary').addClass('btn-default');
                reportChart.resetZoom();
            });

            $(this).on('chart:zoom', function () {
                reset.attr('disabled', false).removeClass('btn-default').addClass('btn-primary');
            });

            $(this).parent().parent().append($('<div class="box-footer"></div>').append(reset));
        }

        $('[data-index]').hover(
            function(){
                if (reportChart.tooltip._active == undefined) {
                    reportChart.tooltip._active = [];
                }
                var dataIndex = reportChart.data.labels.indexOf($(this).data('index'));

                if (dataIndex !== -1) {
                    var activeElements = reportChart.tooltip._active;
                    var requestedElem = reportChart.getDatasetMeta(0).data[dataIndex];

                    for (var i = 0; i < activeElements.length; i++) {
                        if (requestedElem._index == activeElements[i]._index) {
                            return;
                        }
                    }

                    activeElements.push(requestedElem);
                    reportChart.tooltip._active = activeElements;
                    reportChart.tooltip.update(true);
                    reportChart.draw();
                }
            },
            function(){
                reportChart.tooltip._active = [];
                reportChart.tooltip.update(true);
                reportChart.draw();
            }
        );
    });
    setTimeout(function() {
        $('.generalReportChart:not(.rendered)').trigger('chart')
    }, 0);
}

$(document).ready(function () {
    setChartEvents();
});