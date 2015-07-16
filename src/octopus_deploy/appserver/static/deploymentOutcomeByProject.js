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

  var mainSearch = new searchManager({
    id: "deploymentOutcomeByProject",
    search: "sourcetype=octopus:deployment earliest=-3mon@mon | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName, LastModifiedBy as EnvironmentLastModifiedBy ] | join ReleaseId [ search sourcetype=octopus:release | rename Id as ReleaseId, Version as ReleaseVersion] | join ProjectId [ search sourcetype=octopus:project | rename Id as ProjectId, Name as ProjectName]  | join TaskId [ search sourcetype=octopus:task | rename Id as TaskId] | chart count(TaskId) by ProjectName, State",
  });

  var results = mainSearch.data("preview", {});

  results.on("data", function() {
    if (results.hasData()) {

      var series = [];

      var seriesFields = _.filter(results.data().fields, function(i) {
        return !i.indexOf("_") == 0 && i != "ProjectName";
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

          var l = item["ProjectName"];
          var val = item[s.key];

          var i = [];
          i.push(l);
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

        chart = nv.models.multiBarHorizontalChart()
          //.barColor(d3.scale.category20().range())
          .duration(250)
          .margin({
            left: 200
          })
          .stacked(true)
          .color(["#FF0000","#2E92DF"])
          .options({
            transitionDuration: 300,
            useInteractiveGuideline: true
          });


        chart
          .x(function(d) {
            return d[0];
          })
          .y(function(d) {
            return d[1];
          });

        chart.yAxis.tickFormat(function(d) {
          return d3.format('d')(d);
        });

        chart.yAxis
          .axisLabel("Number of Deployments")

        d3.select('#deploymentOutcomeByProjectChart')
          .datum(series)
          .transition()
          .duration(1000)
          .call(chart)
          .each('start', function() {
            setTimeout(function() {
              d3.selectAll('#deploymentOutcomeByProjectChart *').each(function() {
                if (this.__transition__)
                  this.__transition__.duration = 1;
              })
            }, 0)
          });

        nv.utils.windowResize(chart.update);

        return chart;
      });


    }
  });

});
