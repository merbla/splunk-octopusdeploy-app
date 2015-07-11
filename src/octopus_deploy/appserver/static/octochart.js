
require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
        "splunkjs/mvc/d3chart/d3/fisheye": {
            deps: ["splunkjs/mvc/d3chart/d3/d3.v2"],
            exports: "d3.fisheye"
        },
        "splunkjs/mvc/d3chart/d3/nv.d3": {
            deps: ["splunkjs/mvc/d3chart/d3/d3.v2", "splunkjs/mvc/d3chart/d3/fisheye"],
            exports: "nv"
        }
    }
});

define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('../mvc');
    var BaseSplunkView = require("../basesplunkview");
    var d3 = require("./d3/d3.v2");
    var Messages = require("../messages");
    var nv = require("./d3/nv.d3");

    require("css!./d3chart.css");
    require("css!./d3/nv.d3.css");
    var D3ChartClass = {
        template: '<svg></svg>'
    };

    var D3ChartView = BaseSplunkView.extend({
        className: "splunk-d3chart",
        options: {
            data: "preview",
            type: "lineChart",
            setup: null
        },

        initialize: function() {
            this.configure();
            this.settings.on("change:type", this._recreateChart, this);
            this.settings.on("change:setup", this.updateChart, this);

            this.chart = null;

            this.bindToComponentSetting('managerid', this.onManagerChange, this);

            // If we don't have a manager by this point, then we're going to
            // kick the manager change machinery so that it does whatever is
            // necessary when no manager is present.
            if (!this.manager) {
                this.onManagerChange(mvc.Components, null);
            }
        },

        onManagerChange: function(managers, manager) {
            if (this.manager) {
                this.manager.off(null, null, this);
                this.manager = null;
            }
            if (this.resultsModel) {
                this.resultsModel.off(null, null, this);
                this.resultsModel.destroy();
                this.resultsModel = null;
            }
            this.manager = manager;
            if (!manager) {
                this.message('no-search');
                return;
            }

            // Clear any messages, since we have a new manager.
            this.message("empty");
            this.resultsModel = this.manager.data(this.settings.get("data"), {
                output_mode: "json_cols",
                count: 0
            });
            manager.on("search:start", this.onSearchStart, this);
            manager.on("search:progress", this.onSearchProgress, this);
            manager.on("search:cancelled", this.onSearchCancelled, this);
            manager.on("search:error", this.onSearchError, this);
            this.resultsModel.on("data", this.onDataChanged, this);
            this.resultsModel.on("error", this.onSearchError, this);

            manager.replayLastSearchEvent(this);
        },
        message: function(info) {
            this.chart = null;
            Messages.render(info, this.$el);
        },

        render: function() {
            this.createChart(this.chartData);
            return this;
        },

        _recreateChart: function() {
            this.$el.empty();
            this._viz = this.chart = null;
            this.render();
        },

        createChart: function(data) {
            if (!data) {
                return; // No data to display
            }
            if (this.chart) {
                return; // Already created
            }
            this.$el.html("<svg></svg>");
            var node = this.$("svg").get(0);
            var that = this;
            nv.addGraph(function() {
                try {
                    var chart = nv.models[that.settings.get("type")]();

                    var setup = that.settings.get("setup");
                    if (setup) {
                        setup(chart);
                    }

                    d3.select(node)
                        .datum(data)
                      .transition().duration(500)
                        .call(chart);

                    nv.utils.windowResize(function() {
                        d3.select(node).call(chart);
                    });

                    that.chart = chart;

                    return chart;
                }
                catch (ex) {
                    that.message({
                        level: "error",
                        icon: "warning-sign",
                        message: "There was an error creating the chart."
                    });
                }
            });
        },

        updateChart: function() {
            if (!this.chartData) {
                return;
            }
            var data = this.chartData;

            if (!this.chart) {
                this.createChart(data);
            }
            if (this.chart) {
                var setup = this.settings.get("setup");
                if (setup) {
                    setup(this.chart);
                }

                var svg = this.$("svg").get(0);
                d3.select(svg)
                    .datum(data)
                  .transition().duration(500)
                    .call(this.chart);
            }
        },

        onDataChanged: function() {
            if (!this.resultsModel.hasData()) {
                if (this._isJobDone) {
                    this.message('no-results');
                }
                return;
            }

            var data = this.resultsModel.data();

            var fields = data.fields;
            var columns = data.columns;
            var xValues = columns[0];
            var xModifier = fields[0] === "_time"
                ? function(x) { return d3.time.format.iso.parse(x).valueOf(); }
                : function(x) { return x; };
            var allSeries = [];
            for(var i = 1; i < columns.length; i++) {
                if (fields[i].charAt(0) === "_") {
                    continue;
                }

                var series = {
                    values: [],
                    key: fields[i]
                };

                var column = columns[i];
                for(var j = 0; j < column.length; j++) {
                    series.values.push({
                        x: xModifier(xValues[j]),
                        y: parseFloat(column[j] || 0),
                        size: 1
                    });
                }

                allSeries.push(series);
            }

            if (this.settings.get("type") === "linePlusBarChart") {
                // Make the first n-1 series as bars, the last one
                // is a line.
                _.each(allSeries, function(series, idx) {
                    if (idx < allSeries.length - 1) {
                        series.bar = true;
                    }
                });
            }

            this.chartData = allSeries;
            this.updateChart();
        },
        onSearchProgress: function(properties) {
            properties = properties || {};
            var content = properties.content || {};
            var previewCount = content.resultPreviewCount || 0;
            var isJobDone = this._isJobDone = content.isDone || false;

            if (previewCount === 0 && isJobDone) {
                this.message('no-results');
                return;
            }

            if (previewCount === 0) {
                this.message('waiting');
                return;
            }
        },

        onSearchStart: function() {
            this._isJobDone = false;
            this.message('waiting');
        },

        onSearchCancelled: function() {
            this._isJobDone = false;
            this.message('cancelled');
        },

        onSearchError: function(message, err) {
            this._isJobDone = false;
            var msg = message;
            if (err && err.data && err.data.messages && err.data.messages.length) {
                msg = _(err.data.messages).pluck('text').join('; ');
            }
            this.message({
                level: "error",
                icon: "warning-sign",
                message: msg
            });
        }
    },
    D3ChartClass);

    return D3ChartView;
});
