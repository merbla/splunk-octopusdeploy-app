// Copyright 2015 Matthew Erbs.
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

//TODOs 

//  - Deployments, Audit Logs, Releases


(function() {
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
        var scheme = new Scheme("Octopus Deploy");

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

    mapToEvent=function (stanza, octoEvent){

        //TODO: Change to map in node

        var splunkEvent = new Event({
            stanza: host,
            sourcetype: "octopus_deploy_event",
            data: octoEvent, // Have Splunk index our event data as JSON, if data is an object it will be passed through JSON.stringify()
            time: Date.parse(octoEvent.Occurred) // Set the event timestamp to the time of the commit.
        });

        return splunkEvent;
    }

    processEvents = function(data){

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
                Logger.info(modName + " : Found " + data.Items.length)
                onComplete(data);
            }
            else{
                Logger.err(modName + " There was an issue converting JSON")
            }

        }

        request(options, callback);
        
    };

    getEvents = function(host, apikey, onComplete){

        Logger.debug(modName +  ": Getting events for Host:"+ host);

        var options = {
            baseUrl: host,
            uri: "api/events",
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

    exports.getDeployments = function(host, apiKey){

    };

    exports.streamEvents = function(name, singleInput, eventWriter, done) {

        var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];

        var alreadyIndexed = 0;
        var skipEvents =0;
        var page = 1;
        var working = true;

        Logger.info(modName + " " + name +  ": stream events.");

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

                    getEventsPaged(host, key, null, function(data){

                        Logger.info(modName + " : EventsPaged - Got data");
                        Logger.info(modName + " : EventsPaged - " + data.Items.length);

                        var checkpointFileContents = checkFile(checkpointFilePath);

                        for (var i = 0; i < data.Items.length && !errorFound; i++) {
 
                            var octoEvent = data.Items[i];
                            Logger.info(modName + ": Checking Event Id - " + octoEvent.Id); 


                            if (checkpointFileContents.indexOf(octoEvent.Id + "\n") < 0) {
                                try {

                                    Logger.info(modName + ": Event Id - " + octoEvent.Id + " not found!");

                                    var evt = mapToEvent(host, octoEvent);
                                    eventWriter.writeEvent(evt);

                                    // Append this commit to the string we'll write at the end
                                    checkpointFileNewContents += octoEvent.Id + "\n"; 
                                    Logger.info(modName, "Indexed an Octopus Deploy Event: " + octoEvent.Id);
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
                                alreadyIndexed++;
                            }
                        };

                        fs.appendFileSync(checkpointFilePath, checkpointFileNewContents); // Write to the checkpoint file

                        if (alreadyIndexed > 0) {
                            Logger.info(modName, "Skipped " + alreadyIndexed.toString() + " already indexed Octopus Deploy events from " + host);
                        }

                        skipEvents = skipEvents + 30; //Octo events are paged at 30 items
                        alreadyIndexed = 0;


                        if(data && data.Links && data.Links["Page.Next"]){
                            var nextUri = data.Links["Page.Next"];
                            //More items to process
                            Logger.info(modName, "Found more items to process :  " + nextUri);

                        }
                        else{
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

    ModularInputs.execute(exports, module);
})();
