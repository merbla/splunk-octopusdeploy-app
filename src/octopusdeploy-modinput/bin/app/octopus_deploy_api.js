'use strict';

var _               = require('lodash');
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

var root = exports || this;

root.getResource = function(host, apikey, resourceUri, onComplete, onError){

  resource = host + "/" + resourceUri;

  var options = {
      uri : resource,
      method : 'GET',
      headers: {
          'X-Octopus-ApiKey' : apikey
      },
      json:true
  };

  rp(options)
  .then(function(response){
    onComplete(response);
  })
  .catch(onError);
}

root.getMe = function(host, apikey, onComplete, onError){

  resource = host + "/" + "api/users/me";

  var options = {
      uri : resource,
      method : 'GET',
      headers: {
          'X-Octopus-ApiKey' : apikey
      },
      json:true
  };

  rp(options)
  .then(function(response){
    onComplete(response);
  })
  .catch(function(error){
    done(error);
  });



}

root.getUsers = function(host, apikey, uri, onComplete, onError){
  // e.g. api/users?skip=30&user=
  if(!uri){
      uri = "api/users";
  }
  root.getResource(host, apikey, uri, onComplete, onError);
}

root.getEvents = function(host, apikey, uri, onComplete, onError){
  // e.g. api/events?skip=30&user=
  if(!uri){
      uri = "api/events";
  }
  root.getResource(host, apikey, uri, onComplete, onError);
}

root.getDeployments= function(host, apikey, uri, onComplete, onError){
  // e.g. api/deployments?skip=30&user=
  if(!uri){
      uri = "api/deployments";
  }
  root.getResource(host, apikey, uri, onComplete, onError);
}

root.getTasks = function(host, apikey, uri, onComplete, onError){
  // e.g. api/users?skip=30&user=
  if(!uri){
      uri = "api/tasks";
  }

  root.getResource(host, apikey, uri, onComplete, onError);
}
