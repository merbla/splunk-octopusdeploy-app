require.config({
  paths: {
    d3: '../app/octopus_deploy/bower_components/d3/d3.min',
    calheatmap: '../app/octopus_deploy/bower_components/cal-heatmap/cal-heatmap',
  },
  shim: {
    d3v3: {
      deps: []
    },
    calheatmap: {
      deps: ['d3']
    }
  }
});


require([
  'underscore',
  'util/moment',
  "splunkjs/ready!",
  "splunkjs/mvc/simplexml/ready!",
  "splunkjs/mvc/searchmanager",
  "d3",
  "calheatmap"
], function(_, moment, ready, simpleXmlReady, searchManager, d3, calheatmap) {
// /search = sourcetype="octopus:deployment" | bucket _time span=1d | stats count by _time

var mainSearch = new searchManager({
  id: "deploymentsByHourSearch",
    search: "sourcetype=octopus:deployment | bucket _time span=1d | stats count by _time",
});
  // var mainSearch = splunkjs.mvc.Components.getInstance("deploymentByDay");
  var results = mainSearch.data("preview", {});

  results.on("data", function() {
      if (results.hasData()) {

        var series = [];

        var data = _.pluck(results.collection().models, 'attributes');

        //
        // _time,
        // count
        _.each(data, function(i) {
          i.order = parseInt(i.durationInSecs);
        });

        var calendar = new CalHeatMap();
        calendar.init({
          //  data: "datas-years.json",
          domain: "month",
          subDomain: "x_day",
          range: 3,
          cellsize: 15,
          cellpadding: 3,
          cellradius: 5,
          domainGutter: 15,
          weekStartOnMonday: 0,
          scale: [40, 60, 80, 100]

        });
      }
    }
  );
});
