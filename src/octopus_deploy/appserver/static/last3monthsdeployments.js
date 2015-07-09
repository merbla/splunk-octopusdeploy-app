require([
  'underscore',
  'jquery',
  'splunkjs/mvc/utils',
  'splunkjs/mvc',
  'splunkjs/mvc/d3chart/d3chartview',
  'util/moment',
  "splunkjs/ready!",
  "splunkjs/mvc/searchmanager",
], function(_, $, utils, mvc, D3ChartView, moment, ready, searchManager) {

  var mainSearch = new searchManager({
    id: "last3monthsdeploymentsSearch",
    search: "sourcetype=octopus:deployment | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | timechart count(DeploymentId) span=1month by EnvironmentName",

  });

  // var tableManagerid = mvc.Components.get('last3monthsdeploymentsTable').settings.get('managerid');

  var chart = new D3ChartView({
    "id": "last3monthsdeployments",
    //"managerid": tableManagerid,
    "managerid": mainSearch.id,
    "type": "linePlusBarChart",
    "el": $('#last3monthsdeployments')
  }).render();


  // Total Deployments one side, Total Releases the other



  chart.settings.set("setup", function(chart) {
    chart.margin({
      right: 100,
      left: 80,
      top: 70,
      bottom: 70
    });

    chart.xAxis.axisLabel('');

    chart.xAxis.tickFormat(function(d) {
      var format = d3.time.format("%B");
      return format(new Date(d));
    });

    chart.xAxis.rotateLabels(45);
  });

  // var SearchManager = require("splunkjs/mvc/searchmanager");
  //
  // var mainSearch = new SearchManager({
  //   id: "last3monthsdeploymentsSearch",
  //   search: "sourcetype=octopus:deployment | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | timechart count(DeploymentId) span=1month by EnvironmentName",
  //
  // });


  // var mainSearch = splunkjs.mvc.Components.getInstance(tableManagerid);
  // var mai  nSearch = splunkjs.mvc.Components.getInstance("last3monthsdeploymentsSearch");
  var myResults = mainSearch.data("preview", {});

  myResults.on("data", function() {
    // The full data object
    console.log(myResults.data());

    // Indicates whether the results model has data
    console.log("Has data? ", myResults.hasData());

    // The results rows
    console.log("Data (rows): ", myResults.data().rows);

    // The Backbone collection
    console.log("Backbone collection: ", myResults.collection());
  });


});
