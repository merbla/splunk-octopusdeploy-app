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

      var startDate6 = moment()
        .subtract(11, 'month')
        .toDate();

      var calendar6 = new CalHeatMap();
      calendar6.init({
        itemSelector: "#punchCard6",
        start: startDate6,
        data: parsed,
        domain: "month",
        subDomain: "x_day",
        range: 6,
        cellSize: 20,
        domainGutter: 15,
        legend: [10, 20, 50, 75, 100],
        displayLegend: false,
        subDomainTitleFormat: {
          empty: "0 deployments on {date}",
          filled: "{count} deployments on {date}"
        },
        legendColors :{
          base: "2E92DF"
        }
      });

      var startDate12 = moment()
        .subtract(5, 'month')
        .toDate();

      var calendar12 = new CalHeatMap();
      calendar12.init({
        itemSelector: "#punchCard12",
        start: startDate12,
        data: parsed,
        domain: "month",
        subDomain: "x_day",
        range: 6,
        cellSize: 20,
        domainGutter: 15,
        legend: [10, 20, 50, 75, 100],
        legendCellSize: 20,
        subDomainTitleFormat: {
          empty: "0 deployments on {date}",
          filled: "{count} deployments on {date}"
        },
        legendColors :{
          base: "2E92DF"
        }
      });
    }
  });
});
