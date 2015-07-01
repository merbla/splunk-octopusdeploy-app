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
    var releasesCheckpointFilePath  = getFileName(checkpointDir, apikey, "Releases");
    var environmentsCheckpointFilePath  = getFileName(checkpointDir, apikey, "Environments");
    var projectsCheckpointFilePath  = getFileName(checkpointDir, apikey, "Projects");
    var machinesCheckpointFilePath  = getFileName(checkpointDir, apikey, "Machines");

    //Events that we only want in index once
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, eventsCheckpointFilePath, getEventsPaged, mapFromOctoEvent);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, deploymentsCheckpointFilePath, getDeploymentsPaged, mapFromOctoDeployment);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, releasesCheckpointFilePath, getReleasesPaged, mapFromOctoRelease);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, tasksCheckpointFilePath, getTasksPaged, mapFromOctoTask);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, usersCheckpointFilePath, getUsersPaged, mapFromOctoUser);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, environmentsCheckpointFilePath, getEnvironmentsPaged, mapFromOctoEnvironment);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, projectsCheckpointFilePath, getProjectsPaged, mapFromOctoProject);
    streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, machinesCheckpointFilePath, getMachinesPaged, mapFromOctoMachine);

    //Status like reports that change over time (Dashboard etc)


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

getProjectsPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/projects");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getMachinesPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/machines");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getDeploymentsPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/deployments");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getReleasesPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/releases");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getUsersPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/users");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getTasksPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/tasks");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
  .catch(onError);

  //TODO: Return promise
}

getEnvironmentsPaged = function(host, apikey, uri, onComplete, onError){

  if(!uri){
    var options = getOptions(host, apikey, "api/environments");
  }
  else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
  .then(onComplete)
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


mapFromOctoProject = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:project",
        data: octoEvent,
        time: Date.parse(octoEvent.LastModifiedOn)
    });

    return splunkEvent;
}

mapFromOctoEvent = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:event",
        data: octoEvent,
        time: Date.parse(octoEvent.Occurred)
    });

    return splunkEvent;
}

mapFromOctoMachine = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:machine",
        data: octoEvent,
        time: Date.parse(octoEvent.LastModifiedOn)
    });

    return splunkEvent;
}

mapFromOctoDeployment = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:deployment",
        data: octoEvent,
        time: Date.parse(octoEvent.Created)
    });

    return splunkEvent;
}

mapFromOctoEnvironment = function (host, octoEvent){

    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:environment",
        data: octoEvent,
        time: Date.parse(octoEvent.LastModifiedOn)
    });

    return splunkEvent;
}

mapFromOctoUser = function (host, octoEvent){

    var date = Date.parse(octoEvent.LastModifiedOn);

    if(!octoEvent.LastModifiedOn){
      now = new Date();
      date = JSON.parse(JSON.stringify(now));
    }

    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:user",
        data: octoEvent,
        time: date
    });

    return splunkEvent;
}

mapFromOctoRelease = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:release",
        data: octoEvent,
        time: Date.parse(octoEvent.Assembled)
    });

    return splunkEvent;
}

mapFromOctoTask = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:task",
        data: octoEvent,
        time: Date.parse(octoEvent.CompletedTime)
    });

    return splunkEvent;
}

streamOctoStuff  = function(name, singleInput, eventWriter, done, checkpointDir, checkpointFilePath, getIt, mapIt) {

    var uri = null;
    var working = true;

    var host = singleInput.octopusDeployHost;
    var key = singleInput.apikey;

    Async.whilst(
        function() {
            return working;
        },
        function(callback) {
            try {
                var alreadyIndexed= 0;
                var checkpointFileNewContents = "";
                var errorFound = false;

                getIt(host, key, uri, function(data){

                    var checkpointFileContents = checkFile(checkpointFilePath);

                    for (var i = 0; i < data.Items.length && !errorFound; i++) {

                        var octoEvent = data.Items[i];

                        Logger.info(name, modName + ": Checking for Id - " + octoEvent.Id);

                        if (checkpointFileContents.indexOf(octoEvent.Id + "\n") < 0) {
                            try {


                                var evt = mapIt(host, octoEvent);
                                Logger.info(name, modName + ": Event - " + evt + " " + evt.time);

                                eventWriter.writeEvent(evt);

                                checkpointFileNewContents += octoEvent.Id + "\n";
                                Logger.info(name, modName + ": Indexed " + octoEvent.Id);
                            }
                            catch (e) {
                                errorFound = true;
                                working = false; // Stop streaming if we get an error.
                                Logger.error(name, e.message);
                                fs.appendFileSync(checkpointFilePath, checkpointFileNewContents); // Write to the checkpoint file
                                done(e);
                                return;
                            }
                        }
                        else {
                            Logger.info(name, modName + " : Already Indexed Id " + octoEvent.Id);
                            alreadyIndexed++;
                        }
                    };

                    fs.appendFileSync(checkpointFilePath, checkpointFileNewContents); // Write to the checkpoint file

                    if (alreadyIndexed > 0) {
                        Logger.info(name, modName + ": Skipped " + alreadyIndexed.toString() + " items already indexed  from " + host + uri);
                    }

                    alreadyIndexed = 0;


                    if(data && data.Links && data.Links["Page.Next"]){
                        var nextUri = data.Links["Page.Next"];

                        Logger.info(name, modName +": Found more items to process :  " + nextUri);
                        uri = nextUri;
                    }
                    else{
                        Logger.info(name, modName + ": Nothing more to index!");

                        working = false
                        done();
                    }

                    callback();
                });

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
