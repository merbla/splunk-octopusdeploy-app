require.config({
  paths: {
    lodash: '../app/octopus_deploy/bower_components/lodash/lodash.min',
    d3v3: '../app/octopus_deploy/bower_components/d3/d3.min',
    nvd3: '../app/octopus_deploy/bower_components/nvd3/build/nv.d3.min',
  },
  shim: {
    lodash: {
      deps: []
    },
    d3v3: {
      deps: []
    },
    nvd3: {
      deps: ['d3v3']
    }
  }
});

// workaround for nvd3 using global d3
define('d3.global', ['d3v3'], function(_) {
  d3 = _;
});

require([
  'underscore',
  'util/moment',
  "splunkjs/ready!",
  "splunkjs/mvc/simplexml/ready!",
  "splunkjs/mvc/searchmanager",
  "d3v3",
  "nvd3",
  "lodash"
], function(_, moment, ready, simpleXmlReady, searchManager, d3, nv1, __) {

  //Load v3
  require("nvd3");

  var mainSearch = splunkjs.mvc.Components.getInstance("durationGroupedSearch");

  var results = mainSearch.data("preview", {});

  results.on("data", function() {
    if (results.hasData()) {

      var series = [];

      var seriesFields = _.filter(results.data().fields, function(i) {
        return !i.indexOf("_") == 0;
      });

      var data = _.pluck(results.collection().models, 'attributes');

      _.each(seriesFields, function(f) {
        var item = {};
        item.key = f;
        item.values = [];
        series.push(item);
      })

      _.each(series, function(s) {
        _.each(data, function(item) {

          var t = item["_time"];
          var val = item[s.key];

          var i = [];
          i.push(new Date(t));
          i.push(parseInt(val));

          s.values.push(i);
        });
      });

      var chart;

      var chart;
      nv.addGraph(function() {
        chart = nv.models.historicalBarChart();
        
        chart
          .margin({
            left: 100,
            bottom: 100
          })
          .useInteractiveGuideline(true)
          .duration(250);

        chart.xAxis
          .axisLabel("Time (s)")
          .tickFormat(d3.format(',.1f'));

        chart.yAxis
          .axisLabel('Voltage (v)')
          .tickFormat(d3.format(',.2f'));

        chart.showXAxis(true);

        d3.select('#test1')
          .datum(sinData())
          .transition()
          .call(chart);

        nv.utils.windowResize(chart.update);

        chart.dispatch.on('stateChange', function(e) {
          nv.log('New State:', JSON.stringify(e));
        });
        return chart;
      });


    }
  });

});
