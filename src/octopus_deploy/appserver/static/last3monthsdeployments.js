require([
  'underscore',
  'jquery',
  'splunkjs/mvc/utils',
  'splunkjs/mvc',
  'splunkjs/mvc/d3chart/d3chartview',
  'util/moment',
  'splunkjs/mvc/simplexml/ready!'
], function(_, $, utils, mvc, D3ChartView, moment) {


  var tableManagerid = mvc.Components.get('last3monthsdeploymentsTable').settings.get('managerid');

  var chart = new D3ChartView({
    "id": "last3monthsdeployments",
    "managerid": tableManagerid,
    "type": "linePlusBarChart",
    "el": $('#last3monthsdeployments')
  }).render();

  chart.settings.set("setup", function(chart) {
    chart.margin({
      right: 100,
      left: 80,
      top: 70,
      bottom: 70
    });


    chart.xAxis.axisLabel('Yes');

    chart.xAxis.tickFormat(function(d) {
      var format = d3.time.format("%m-%y");
      return format(new Date(d));
    });

    chart.xAxis.rotateLabels(45);
  });
});
