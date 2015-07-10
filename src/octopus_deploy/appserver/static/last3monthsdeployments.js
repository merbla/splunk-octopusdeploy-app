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

  var chart = new D3ChartView({
    "id": "last3monthsdeployments",
    //"managerid": tableManagerid,
    "managerid": mainSearch.id,
    "type": "stackedAreaChart",
    "el": $('#last3monthsdeployments')
  }).render();

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

    chart.yAxis.axisLabel('No. of Deployments');

    chart.yAxis.tickFormat(d3.format(',.2f'));


  });

});
