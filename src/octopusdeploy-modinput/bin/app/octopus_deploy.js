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

//  - Promises (RX?), spkunkjs async?

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

    exports.events = function(host, apiKey, onComplete){
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

    exports.getDeployments = function(host, apiKey){

    };

    exports.streamEvents = function(name, singleInput, eventWriter, done) {

        // Get the checkpoint directory out of the modular input's metadata.
        var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];

        //octo settings
        var octopusDeployHost = singleInput.octopusDeployHost;
        var apikey = singleInput.apikey;

        var alreadyIndexed = 0;
 
        var page = 1;
        var working = true;

        Async.whilst(
            function() {
                return working;
            },
            function(callback) {
                try {
                    working =false;
 
                }
                catch (e) {
                    callback(e);
                }
            },
            function(err) {
                done(err);
            }
        );
    };

    ModularInputs.execute(exports, module);
})();
