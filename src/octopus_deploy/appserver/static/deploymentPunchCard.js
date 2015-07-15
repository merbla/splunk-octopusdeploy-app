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

  var mainSearch = new searchManager({
    id: "deploymentsByHourSearch",
    search: "sourcetype=octopus:deployment | bucket _time span=1d | stats count by _time",
  });

  var results = mainSearch.data("preview", {});

  results.on("data", function() {
    if (results.hasData()) {

      var series = [];

      var data = _.pluck(results.collection().models, 'attributes');

      _.each(data, function(i) {
        var item = {};
        item.date = new Date(moment(i._time).toDate()).getTime() / 1000;
        item.value = parseInt(i.count);

        series.push(item);

      });

      var parser = function(data) {
        var stats = {};
        for (var d in data) {
          var x = data[d].value;
          if (x != "undefined" && x != undefined) {
            stats[data[d].date] = data[d].value;
          }
        }
        return stats;
      };

      var parsed = parser(series);

      var now = new Date();

      var startDate = moment()
        .subtract(11, 'month')
        .toDate();

      var calendar = new CalHeatMap();
      calendar.init({
        start: startDate,
        data: parsed,
        domain: "month",
        subDomain: "x_day",
        range: 12,
        cellsize: 40,
        domainGutter: 15,
        //weekStartOnMonday: 0,
        scale: [1, 10, 30, 50],
      });
    }
  });
});
