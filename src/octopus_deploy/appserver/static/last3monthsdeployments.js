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

  d3.selection.prototype.watchTransition = function(renderWatch){
      var args = [this].concat([].slice.call(arguments, 1));
      return renderWatch.transition.apply(renderWatch, args);
  };

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

  d3.selection.prototype.watchTransition = function(renderWatch){
      var args = [this].concat([].slice.call(arguments, 1));
      return renderWatch.transition.apply(renderWatch, args);
  };


  // sourcetype="octopus:deployment"
  // | rename Id as DeploymentId
  // | join EnvironmentId [ search sourcetype="octopus:environment" | rename Id as EnvironmentId, Name as EnvironmentName ]
  // | join ProjectId [ search sourcetype="octopus:project" | rename Id as ProjectId, Name as ProjectName ]
  // | timechart count(DeploymentId)  span=1month by EnvironmentName


  var mainSearch = new searchManager({
    id: "last3MonthDeployment",
    search: "sourcetype=octopus:deployment earliest=-90d@d latest=now | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | join ProjectId [ search sourcetype=octopus:project | rename Id as ProjectId, Name as ProjectName ] | timechart count(DeploymentId)  span=1month by EnvironmentName",
  });

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

      var colors = d3.scale.category20();

      var keyColor = function(d, i) {
        return colors(d.key)
      };

      var chart;

      nv.addGraph(function() {
        chart = nv.models.multiBarChart()
        //  .useInteractiveGuideline(true)
          .color(keyColor)
          .duration(300)
          .rotateLabels(-45)
          .groupSpacing(0.1)

        .x(function(d) {
            return d[0];
          })
          .y(function(d) {
            return d[1];
          })
          .reduceXTicks(false)
          .staggerLabels(true);

        chart.xAxis
          .showMaxMin(false);

        chart.yAxis
          .axisLabel("Deployments")
          .axisLabelDistance(-5);

        chart.yAxis.tickFormat(function(d) {
          return d3.format('d')(d);
        });

        chart.xAxis.tickFormat(function(d) {
          return d3.time.format('%B')(new Date(d))
        });

        d3.select('#last3monthsDeploymentsChart')
          .datum(series)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });


    }
  });

});
