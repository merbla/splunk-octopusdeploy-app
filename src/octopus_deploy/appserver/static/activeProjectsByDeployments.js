require.config({
  paths: {
    'lodash': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min',
  },
  shim: {
      "lodash": {
          deps: []
      }
  },
  enforceDefine: true
});


require([
  'underscore',
  'jquery',
  'splunkjs/mvc/utils',
  'splunkjs/mvc',
  'util/moment',
  "splunkjs/ready!",
  "splunkjs/mvc/simplexml/ready!",
  "splunkjs/mvc/searchmanager",
  "lodash"
], function(_, $, utils, mvc, moment, ready, simpleXmlReady, searchManager, _l) {


  var mainSearch = new searchManager({
    id: "activeProjectsByDeploymentsSearch",
    search: "sourcetype=octopus:deployment | rename Id as DeploymentId | join EnvironmentId [ search sourcetype=octopus:environment | rename Id as EnvironmentId, Name as EnvironmentName ] | join ProjectId [ search sourcetype=octopus:project | rename Id as ProjectId, Name as ProjectName ] | timechart count(DeploymentId)  span=1day by ProjectName",
  });


  var results = mainSearch.data("preview", {});

  results.on("data", function() {

    if(results.hasData()){
      var d = _.pluck(results.collection().models, 'attributes');
      console.log(d);

    }

  });
});
