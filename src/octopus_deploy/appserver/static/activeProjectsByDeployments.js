require.config({
  paths: {
    'lodash': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
  },
  enforceDefine: true
});

//"//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min"
//


require([
  'lodash',
  'jquery',
  'splunkjs/mvc/utils',
  'splunkjs/mvc',
  'splunkjs/mvc/d3chart/d3chartview',
  'util/moment',
  "splunkjs/ready!",
  "splunkjs/mvc/searchmanager",
], function(_, $, utils, mvc, D3ChartView, moment, ready, searchManager) {


  var c = _.chunk(['a', 'b', 'c', 'd'], 2);

  console.log(c);


  var mainSearch = new searchManager({
    id: "activeProjectsByDeploymentsSearch",
    search: "sourcetype=octopus:deployment | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | join ProjectId [ search sourcetype=octopus:project | rename Id as ProjectId, Name as ProjectName ] | timechart count(DeploymentId)  span=1day by ProjectName",
  });

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
