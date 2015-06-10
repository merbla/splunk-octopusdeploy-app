var splunkjs        = require("splunk-sdk");
var ModularInputs   = splunkjs.ModularInputs;

var  deploymentModInput = require('./octopus_deploy_input.js');
ModularInputs.execute(deploymentModInput, module);
