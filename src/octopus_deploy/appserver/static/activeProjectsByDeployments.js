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
    id: "activeProjectsByDeploymentsSearch",
    search: "sourcetype=octopus:deployment | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | join ProjectId [ search sourcetype=octopus:project | rename Id as ProjectId, Name as ProjectName ] | timechart count(DeploymentId)  span=1day by ProjectName",
  });

  var results = mainSearch.data("preview", {});

  results.on("data", function() {
    if (results.hasData()) {

      var series = [];

      var seriesFields = _.filter(results.data().fields, function(i) {
        return !i.indexOf("_") == 0;
      });

       var d = _.pluck(results.collection().models, 'attributes');

      _.each(seriesFields, function(f) {
        var item = {};
        item.key = f;
        item.values = [];
        series.push(item);
      })

      _.each(series, function(s) {

        _.each(d, function(item) {

          // var t = _.propertyOf(item)("_time");
          // var val = _.propertyOf(item)(s.key);

          var t = item["_time"];
          var val = item[s.key];

          var i = [];

          i.push(new Date(t));
          i.push(parseInt(val));

          s.values.push(i);

        });
      });

      console.log(series);




    var colors = d3.scale.category20();

    var keyColor = function(d, i) {return colors(d.key)};

    var chart;

    nv.addGraph(function() {


        chart = nv.models.stackedAreaChart()
            .useInteractiveGuideline(true)
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                //return 100;
                return d[1];
            })
            //.controlLabels({stacked: "Stacked"})
            .color(keyColor)
            .duration(300);

        // chart.xAxis.tickFormat(function(d) {
        //     return d3.time.format('%b')(d))
        // });
//d3.format("d")(20);
        chart.yAxis.tickFormat(function(d){
        var asd=
            d3.format('d')(d);

return asd
        });



        chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });


//   var dialAngle = ((360/subComponentsCount)*(parseInt(subComponentId.charAt(subComponentId.length-1))))-offsetAngle;


        d3.select('#activeProjectsByDeploymentsChart')
            .datum(series)
            .transition()
            .duration(1000)
            .call(chart)
            .each('start', function() {
                setTimeout(function() {
                    d3.selectAll('#activeProjectsByDeploymentsChart *').each(function() {
                        if(this.__transition__)
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
