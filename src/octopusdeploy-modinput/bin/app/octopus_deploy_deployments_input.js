var splunkjs        = require("splunk-sdk");
var ModularInputs   = splunkjs.ModularInputs;

var  deploymentModInput = require('./octopus_deploy_deployments.js');
ModularInputs.execute(deploymentModInput, module);
