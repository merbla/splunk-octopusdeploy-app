require.config({
  paths: {
    lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
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
      //  nvd3: {
      //       /exports: 'nvd3',
      //       deps: ['d3.global']
      //     }
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
  "../app/octopus_deploy/bower_components/nvd3/build/nv.d3.min"
], function(_, moment, ready, simpleXmlReady, searchManager, d3,nv1) {

  var mainSearch = new searchManager({
    id: "activeProjectsByDeploymentsSearch",
    search: "sourcetype=octopus:deployment | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | join ProjectId [ search sourcetype=octopus:project | rename Id as ProjectId, Name as ProjectName ] | timechart count(DeploymentId)  span=1day by ProjectName",
  });
  var nv2 = require("../app/octopus_deploy/bower_components/nvd3/build/nv.d3.min");


  var results = mainSearch.data("preview", {});

  results.on("data", function() {

    if (results.hasData()) {
      var d = _.pluck(results.collection().models, 'attributes');
      console.log(d);

      d3.json(d, function(data) {
        nv.addGraph(function() {
          var chart = nv.models.stackedAreaChart()
            .margin({
              right: 100
            })
            .x(function(d) {
              return d[0]
            }) //We can modify the data accessor functions...
            .y(function(d) {
              return d[1]
            }) //...in case your data is formatted differently.
            .useInteractiveGuideline(true) //Tooltips which show all data points. Very nice!
            .rightAlignYAxis(true) //Let's move the y-axis to the right side.
            .transitionDuration(500)
            .showControls(true) //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
            .clipEdge(true);

          //Format x-axis labels with custom function.
          chart.xAxis
            .tickFormat(function(d) {
              return d3.time.format('%x')(new Date(d))
            });

          chart.yAxis
            .tickFormat(d3.format(',.2f'));

          d3.select('#chart svg')
            .datum(data)
            .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
        });
      })


    }
  });
});
