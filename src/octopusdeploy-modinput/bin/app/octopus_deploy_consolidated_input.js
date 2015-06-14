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

    getMe(host, apikey,
      function(d){
        done();},
      function(error){
        done(error)}
      );
};

exports.streamEvents = function(name, singleInput, eventWriter, done) {

    var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];

    var alreadyIndexed = 0;
    var uri = null;
    var working = true;

    Logger.info(name, modName + " Starting stream events for :");

    var host = singleInput.octopusDeployHost;
    var apikey = singleInput.apikey;

    //Files for each type
    var usersCheckpointFilePath  = getFileName(checkpointDir, apikey, "Users");
    var eventsCheckpointFilePath  = getFileName(checkpointDir, apikey, "Events");
    var deploymentsCheckpointFilePath  = getFileName(checkpointDir, apikey, "Deployments");
    var tasksCheckpointFilePath  = getFileName(checkpointDir, apikey, "Tasks");


    Async.whilst(
        function() {
            return working;
        },
        function(callback) {
            try {

                var checkpointFilePath  = path.join(checkpointDir, key + ".txt");
                var checkpointFileNewContents = "";
                var errorFound = false;




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

getFileName = function(checkpointDir, apikey, name){
  var filepath  = path.join(checkpointDir, apikey + "_" + name + ".txt");
  return filepath;
}

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
    onError(error);
  });
}

getEventsPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/events");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getAllEvents = function(host, apikey, uri, onComplete, onError){

  var options = getOptions(host, apikey, "api/events");

  rp(options)
  .then(function(data){
    
    if(data && data.Links && data.Links["Page.Next"]){
        var nextUri = data.Links["Page.Next"];

        Logger.info(name, modName +": Found more items to process :  " + nextUri);
        uri = nextUri;
    }
    else{
        Logger.info(name, modName + ": No more events!");

        working = false
        done();
    }


  })
  .catch(onError);

  //TODO: Return promise
}


getResource = function(host, apikey, uri, onComplete, onError){

  var options = getOptions(host, apikey, uri);

  rp(options)
  .then(function(response){
    onComplete(response);
  })
  .catch(function(error){
    onError(error);
  });
}
