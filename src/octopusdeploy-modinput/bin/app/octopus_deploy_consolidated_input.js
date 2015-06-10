var fs              = require("fs");
var path            = require("path");
var splunkjs        = require("splunk-sdk");
var request         = require("request")
var Async           = splunkjs.Async;
var ModularInputs   = splunkjs.ModularInputs;
var Logger          = ModularInputs.Logger;
var Event           = ModularInputs.Event;
var Scheme          = ModularInputs.Scheme;
var Argument        = ModularInputs.Argument;
var utils           = ModularInputs.utils;

var modName = "OCTOPUS DEPLOY MODINPUT";

exports.getScheme = function() {
    var scheme = new Scheme("Octopus Deploy Events");

    scheme.description = "Streams events from Octopus Deploy.";
    scheme.useExternalValidation = true;
    scheme.useSingleInstance = false; // Set to false so an input can have an optional interval parameter.

    scheme.args = [

        new Argument({
            name: "octopusDeployHost",
            dataType: Argument.dataTypeString,
            description: "The  endpoint of Octopus Deploy (e.g. https://myOctopusServer/)",
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

    Logger.info(modName +  ": Validating Settings for Host:"+ host);

    try {

        if (host && host.length > 0 && apikey.length > 0) {

            validateOctoSettings(host, apikey, function(error, response, body){
                if(error){
                     done(new Error(error));
                }
                else{
                    done();
                }
            });
        }
    }
    catch (e) {
        done(e);
    }
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

                var eventsToWrite = {};

                Async.parallel([
                   function(complete) {

                      getEventsPaged(host, key, uri, function(events){

                        for (var i = 0; i < events.Items.length && !errorFound; i++) {

                            var octoEvent = events.Items[i];

                            try {
                                var evt = mapOctoEvent(host, octoEvent);
                            }
                            catch (e) {
                                errorFound = true;
                                working = false; // Stop streaming if we get an error.
                                Logger.error(name, e.message);
                                complete(e);
                                return;
                            }

                        };

                        complete(null, events);
                      });
                    },
                   function(complete) {
                     getDeploymentsPaged(host, key, uri, function(deployments){
                       done(null, deployments);
                     });
                   },
                   function(complete) {
                     getTasksPaged(host, key, uri, function(tasks){
                       done(null, tasks);
                     })
                   }],
                   function(err, events, deployments, tasks) {

                   }
                );



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


function validateOctoSettings(host, apikey, onComplete){

    var options = {
        baseUrl: host,
        uri: "api/users/me",
        headers: {
            'X-Octopus-ApiKey' : apikey
        }
    };

    function callback(error, response, body) {
        onComplete(error, response, body);
    }

    request(options, callback);
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

mapOctoEvent = function (host, octoEvent){
    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus:event",
        data: octoEvent, // Have Splunk index our event data as JSON, if data is an object it will be passed through JSON.stringify()
        time: Date.parse(octoEvent.Occurred) // Set the event timestamp to the time of the commit.
    });

    return splunkEvent;
}


mapToEvent = function (host, octoEvent){

    //TODO: Change to map in node

    var splunkEvent = new Event({
        stanza: host,
        sourcetype: "octopus_deploy_event",
        data: octoEvent, // Have Splunk index our event data as JSON, if data is an object it will be passed through JSON.stringify()
        time: Date.parse(octoEvent.Occurred) // Set the event timestamp to the time of the commit.
    });

    return splunkEvent;
}

getEventsPaged = function(host, apikey, uri, onComplete, onError){

    if(!uri){
        uri = "api/events";
    }

    Logger.debug(modName +  ": Getting events for Host:"+ host + " Uri: " +uri);

    var options = {
        baseUrl: host,
        uri: uri,  // e.g. api/events?skip=30&user=
        headers: {
            'X-Octopus-ApiKey' : apikey
        }
    };

    function callback(error, response, body) {

        if(error){
            Logger.err(modName + ": An error occured calling host:"+ host + " Uri: " +uri)
            onError(error);
        }

        var data = JSON.parse(body);

        if(data){
            Logger.info(modName + " : Found " + data.Items.length + " events")
            onComplete(data);
        }
        else{
            Logger.err(modName + " There was an issue converting JSON")
        }

    }

    request(options, callback);
};



getDeploymentsPaged = function(host, apikey, uri, onComplete, onError){
    if(!uri){
        uri = "api/deployments";
    }

    Logger.debug(modName +  ": Getting deployments for Host:"+ host + " Uri: " +uri);

    var options = {
        baseUrl: host,
        uri: uri,  // e.g. api/deployments?skip=30&user=
        headers: {
            'X-Octopus-ApiKey' : apikey
        }
    };

    function callback(error, response, body) {

        if(error){
            Logger.err(modName + ": An error occured calling host:"+ host + " Uri: " +uri)
            onError(error);
        }

        var data = JSON.parse(body);

        if(data){
            Logger.info(modName + " : Found " + data.Items.length + " deployments")
            onComplete(data);
        }
        else{
            Logger.err(modName + " There was an issue converting JSON")
        }
    }

    request(options, callback);

};

getTasksPaged = function(host, apikey, uri, onComplete, onError){
    if(!uri){
        uri = "api/tasks";
    }

    Logger.debug(modName +  ": Getting tasks for Host:"+ host + " Uri: " +uri);

    var options = {
        baseUrl: host,
        uri: uri,  // e.g. api/tasks?skip=30&user=
        headers: {
            'X-Octopus-ApiKey' : apikey
        }
    };

    function callback(error, response, body) {

        if(error){
            Logger.err(modName + ": An error occured calling host:"+ host + " Uri: " +uri)
            onError(error);
        }

        var data = JSON.parse(body);

        if(data){
            Logger.info(modName + " : Found " + data.Items.length + " tasks")
            onComplete(data);
        }
        else{
            Logger.err(modName + " There was an issue converting JSON")
        }

    }

    request(options, callback);

};
