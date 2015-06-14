var fs              = require("fs");
var path            = require("path");
var splunkjs        = require("splunk-sdk");
var request         = require("request");
var rp              = require('request-promise');
var Async           = splunkjs.Async;
var ModularInputs   = splunkjs.ModularInputs;
var Logger          = ModularInputs.Logger;
var Event           = ModularInputs.Event;
var Scheme          = ModularInputs.Scheme;
var Argument        = ModularInputs.Argument;
var utils           = ModularInputs.utils;
var octoApi         = require("./octopus_deploy_api.js")

var modName = "OCTOPUS_DEPLOY_MODINPUT";

exports.getScheme = function() {
    var scheme = new Scheme("Octopus Deploy Events");

    scheme.description = "Streams events from Octopus Deploy.";
    scheme.useExternalValidation = true;
    scheme.useSingleInstance = false; // Set to false so an input can have an optional interval parameter.

    scheme.args = [

        new Argument({
            name: "octopusDeployHost",
            dataType: Argument.dataTypeString,
            description: "The endpoint of Octopus Deploy (e.g. https://myOctopusServer/)",
            requiredOnCreate: true,
            requiredOnEdit: true
        }),
        new Argument({
            name: "apikey",
            dataType: Argument.dataTypeString,
            description: "The Octopus Deploy API access token.",
            requiredOnCreate: true,
            requiredOnEdit: true
        })

    ];

    return scheme;
};

exports.validateInput = function(definition, done) {

    var host = definition.parameters.octopusDeployHost;
    var apikey = definition.parameters.apikey;

    Logger.info(modName +  ": Validating Octopus Deploy settings for Host:"+ host);

    var options = getOptions(host, apikey, "api/users/me");

    rp(options)
    .then(function(response){
      done();
    })
    .catch(function(error){
      done(error);
    });
};

exports.streamEvents = function(name, singleInput, eventWriter, done) {

    var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];

    var alreadyIndexed = 0;
    var uri = null;
    var working = true;

    Logger.info(name, modName + " Starting stream events for :");

    var host = singleInput.octopusDeployHost;
    var key = singleInput.apikey;

    Async.whilst(
        function() {
            return working;
        },
        function(callback) {
            try {

                var checkpointFilePath  = path.join(checkpointDir, key + ".txt");
                var checkpointFileNewContents = "";
                var errorFound = false;

                var checkpointFileContents = checkFile(checkpointFilePath);

            }
            catch (e) {
                callback(e);
            }
        },
        function(err) {
            // We're done streaming.
            done(err);
        }
    );
};

checkFile = function(checkpointFilePath){

    var checkpointFileContents = "";

    try {
        checkpointFileContents = utils.readFile("", checkpointFilePath);
    }
    catch (e) {
        fs.appendFileSync(checkpointFilePath, "");
    }
    return checkpointFileContents;
}

getOptions = function(host, apikey, resourcePath){

  url = host + "/" + resourcePath;

  var options = {
      uri : url,
      method : 'GET',
      headers: {
          'X-Octopus-ApiKey' : apikey
      },
      json:true
  };

  return options;

}

getMe = function(host, apikey, onComplete, onError){

  var options = getOptions(host, apikey, "api/users/me");

  rp(options)
  .then(function(response){
    onComplete(response);
  })
  .catch(function(error){
    done(error);
  });
}
