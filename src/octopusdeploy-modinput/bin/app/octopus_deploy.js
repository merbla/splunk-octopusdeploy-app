var splunkjs        = require("splunk-sdk");
var ModularInputs   = splunkjs.ModularInputs;
//
// var eventModInput = require('./octopus_deploy_events.js');
// ModularInputs.execute(eventModInput, module);
//

var  deploymentModInput = require('./octopus_deploy_deployments.js');
ModularInputs.execute(deploymentModInput, module);
