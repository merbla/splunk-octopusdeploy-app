var fs = require("fs");
var path = require("path");
var splunkjs = require("splunk-sdk");
var request = require("request");
var rp = require('request-promise');
var Async = splunkjs.Async;
var ModularInputs = splunkjs.ModularInputs;
var Logger = ModularInputs.Logger;
var Event = ModularInputs.Event;
var Scheme = ModularInputs.Scheme;
var Argument = ModularInputs.Argument;
var utils = ModularInputs.utils;
var octoApi = require("./octopus_deploy_api.js")

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

  Logger.info(modName + ": Validating Octopus Deploy settings for Host:" + host);

  getMe(host, apikey,
    function(d) {
      done();
    },
    function(error) {
      done(error)
    }
  );
};

exports.streamEvents = function(name, singleInput, eventWriter, done) {

  var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];

  var alreadyIndexed = 0;
  var uri = null;
  var working = true;

  Logger.info(name, modName + " STARTING streamEvents");

  var host = singleInput.octopusDeployHost;
  var apikey = singleInput.apikey;

  //Files for each type
  var usersCheckpointFilePath = getFileName(checkpointDir, apikey, "Users");
  var eventsCheckpointFilePath = getFileName(checkpointDir, apikey, "Events");
  var deploymentsCheckpointFilePath = getFileName(checkpointDir, apikey, "Deployments");
  var tasksCheckpointFilePath = getFileName(checkpointDir, apikey, "Tasks");
  var releasesCheckpointFilePath = getFileName(checkpointDir, apikey, "Releases");
  var environmentsCheckpointFilePath = getFileName(checkpointDir, apikey, "Environments");
  var projectsCheckpointFilePath = getFileName(checkpointDir, apikey, "Projects");
  var machinesCheckpointFilePath = getFileName(checkpointDir, apikey, "Machines");
  var teamsCheckpointFilePath = getFileName(checkpointDir, apikey, "Teams");

  //Events that we only want in index once
  streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, eventsCheckpointFilePath, getEventsPaged, mapFromOctoEvent, "events");
  streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, deploymentsCheckpointFilePath, getDeploymentsPaged, mapFromOctoDeployment, "deployments");

  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, releasesCheckpointFilePath, getReleasesPaged, mapFromOctoRelease);
  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, tasksCheckpointFilePath, getTasksPaged, mapFromOctoTask);
  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, usersCheckpointFilePath, getUsersPaged, mapFromOctoUser);
  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, environmentsCheckpointFilePath, getEnvironmentsPaged, mapFromOctoEnvironment);
  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, projectsCheckpointFilePath, getProjectsPaged, mapFromOctoProject);
  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, machinesCheckpointFilePath, getMachinesPaged, mapFromOctoMachine);
  // streamOctoStuff(name, singleInput, eventWriter, done, checkpointDir, teamsCheckpointFilePath, getTeamsPaged, mapFromOctoTeam);

  //Status like reports that change over time (Dashboard etc)
  Logger.info(name, modName + " FINISHED streamEvents");

  done();
};

getFileName = function(checkpointDir, apikey, name) {
  var filepath = path.join(checkpointDir, apikey + "_" + name + ".txt");
  return filepath;
}

checkFile = function(checkpointFilePath) {

  var checkpointFileContents = "";

  try {
    checkpointFileContents = utils.readFile("", checkpointFilePath);
  } catch (e) {
    fs.appendFileSync(checkpointFilePath, "");
  }
  return checkpointFileContents;
}

getOptions = function(host, apikey, resourcePath) {

  url = host + "/" + resourcePath;

  var options = {
    uri: url,
    method: 'GET',
    headers: {
      'X-Octopus-ApiKey': apikey
    },
    json: true
  };

  return options;

}

getMe = function(host, apikey, onComplete, onError) {

  var options = getOptions(host, apikey, "api/users/me");

  rp(options)
    .then(function(response) {
      onComplete(response);
    })
    .catch(function(error) {
      onError(error);
    });
}

getEventsPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/events");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getProjectsPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/projects");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getMachinesPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/machines");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getDeploymentsPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/deployments");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getTeamsPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/teams");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getReleasesPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/releases");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getUsersPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/users");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getTasksPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/tasks");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getEnvironmentsPaged = function(host, apikey, uri, onComplete, onError) {

  if (!uri) {
    var options = getOptions(host, apikey, "api/environments");
  } else {
    var options = getOptions(host, apikey, uri);
  }

  rp(options)
    .then(onComplete)
    .catch(onError);

  //TODO: Return promise
}

getResource = function(host, apikey, uri, onComplete, onError) {

  var options = getOptions(host, apikey, uri);

  rp(options)
    .then(function(response) {
      onComplete(response);
    })
    .catch(function(error) {
      onError(error);
    });
}

mapFromOctoProject = function(host, octoEvent) {

  if (octoEvent.LastModifiedOn) {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:project",
      data: octoEvent,
      time: Date.parse(octoEvent.LastModifiedOn)
    });
    return splunkEvent;

  } else {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:project",
      data: octoEvent
    });
    return splunkEvent;
  }
}

mapFromOctoEvent = function(host, octoEvent) {
  if (octoEvent.Occurred) {
    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:event",
      data: octoEvent,
      time: Date.parse(octoEvent.Occurred)
    });

    return splunkEvent;
  } else {
    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:event",
      data: octoEvent
    });

    return splunkEvent;
  }

}

mapFromOctoMachine = function(host, octoEvent) {
  if (octoEvent.LastModifiedOn) {
    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:machine",
      data: octoEvent,
      time: Date.parse(octoEvent.LastModifiedOn)
    });

    return splunkEvent;
  } else {
    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:machine",
      data: octoEvent
    });

    return splunkEvent;
  }
}

mapFromOctoDeployment = function(host, octoEvent) {

  if (octoEvent.Created) {
    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:deployment",
      data: octoEvent,
      time: Date.parse(octoEvent.Created)
    });

    return splunkEvent;
  } else {
    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:deployment",
      data: octoEvent
    });

    return splunkEvent;
  }

}

mapFromOctoTeam = function(host, octoEvent) {

  if (!octoEvent.LastModifiedOn) {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:team",
      data: octoEvent
    });

    return splunkEvent;

  } else {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:team",
      data: octoEvent,
      time: Date.parse(octoEvent.LastModifiedOn)
    });

    return splunkEvent;
  }
}

mapFromOctoEnvironment = function(host, octoEvent) {

  if (octoEvent.LastModifiedOn) {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:environment",
      data: octoEvent,
      time: Date.parse(octoEvent.LastModifiedOn)
    });

    return splunkEvent;
  } else {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:environment",
      data: octoEvent
    });

    return splunkEvent;
  }

}

mapFromOctoUser = function(host, octoEvent) {

  if (!octoEvent.LastModifiedOn) {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:user",
      data: octoEvent
    });

    return splunkEvent;

  } else {

    var date = Date.parse(octoEvent.LastModifiedOn);

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:user",
      data: octoEvent,
      time: date
    });

    return splunkEvent;
  }


}

mapFromOctoRelease = function(host, octoEvent) {

  if (octoEvent.Assembled) {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:release",
      data: octoEvent,
      time: Date.parse(octoEvent.Assembled)
    });

    return splunkEvent;
  } else {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:release",
      data: octoEvent
    });

    return splunkEvent;
  }

}

mapFromOctoTask = function(host, octoEvent) {

  if (octoEvent.CompletedTime) {


    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:task",
      data: octoEvent,
      time: Date.parse(octoEvent.CompletedTime)
    });

    return splunkEvent;

  } else {

    var splunkEvent = new Event({
      stanza: host,
      sourcetype: "octopus:task",
      data: octoEvent
    });

    return splunkEvent;

  }

}

streamOctoStuff = function(name, singleInput, eventWriter, done, checkpointDir, checkpointFilePath, getIt, mapIt, context) {

  Logger.info(name, modName + " STARTING streamOctoStuff " + context)

  var uri = null;
  var working = true;

  var host = singleInput.octopusDeployHost;
  var key = singleInput.apikey;

  while (working) {
    try {
      var alreadyIndexed = 0;
      var checkpointFileNewContents = "";
      var errorFound = false;

      Logger.info(name, modName + " GETTING data for " + context)

      getIt(host, key, uri, function(data) {

        var checkpointFileContents = checkFile(checkpointFilePath);

        for (var i = 0; i < data.Items.length && !errorFound; i++) {

          var octoEvent = data.Items[i];

          Logger.info(name, modName + ": Checking for Id - " + octoEvent.Id);

          if (checkpointFileContents.indexOf(octoEvent.Id + "\n") < 0) {
            try {

              var evt = mapIt(host, octoEvent);
            //  Logger.info(name, modName + ": Event - " + evt + " " + evt.time);

              eventWriter.writeEvent(evt);
              Logger.info(name, modName + " EVENT data for written for " + octoEvent.Id + " time " + evt.time + " " + context);
              //Logger.info(name, modName + ": Indexed " + octoEvent.Id);

              checkpointFileNewContents += octoEvent.Id + "\n";
              fs.appendFileSync(checkpointFilePath, checkpointFileNewContents); // Write to the checkpoint file

            } catch (e) {
              errorFound = true;
              working = false; // Stop streaming if we get an error.
              Logger.info(name, modName + "ERROR found " + context);

              Logger.error(name, e.message);

            }
          } else {
            Logger.info(name, modName + " : Already Indexed Id " + octoEvent.Id);
            alreadyIndexed++;
          }
        };

        if (alreadyIndexed > 0) {
          Logger.info(name, modName + ": Skipped " + alreadyIndexed.toString() + " items already indexed  from " + host + uri);
        }

        alreadyIndexed = 0;

        if (data && data.Links && data.Links["Page.Next"]) {
          var nextUri = data.Links["Page.Next"];

          Logger.info(name, modName + ": Found more items to process :  " + nextUri);
          uri = nextUri;
        } else {
          Logger.info(name, modName + ": Nothing more to index!");
          working = false
        }

        callback();
      });

    } catch (e) {
      Logger.error(name, e.message);
    }

  }
};
