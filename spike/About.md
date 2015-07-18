#Octopus Deploy App for Splunk

The Octopus Deploy App for Splunk provides a [modular input](http://docs.splunk.com/Documentation/Splunk/6.2.4/AdvancedDev/ModInputsIntro) to ingest data from an [Octopus Deploy](http://octopusdeploy.com/) instance, and a set of dashboards and views to analyse the data.

This app works with Octopus Deploy 2.6+ or 3.0 beta.  You will need an [API Key](http://docs.octopusdeploy.com/display/OD/How+to+create+an+API+key) from your Octopus Server.

Once the data input(s) have been configured, searches can be performed using the following source types:

 - Users : `octopus:user`
 - Tasks : `octopus:task`
 - Events : `octopus:event`
 - Deployments : `octopus:deployment`
 - Releases : `octopus:release`
 - Environments : `octopus:environment`
 - Projects : `octopus:project`
 - Machines : `octopus:machine`
 - Teams : `octopus:team`

The app makes use of the [NodeJS](https://nodejs.org/) Splunk modular inputs capability via HTTP/HTTPS.  

##Prerequisites
 - Splunk Enterprise instance, version 6.2 or later.

#Feedback and Issues

 - [Github Repo](https://github.com/merbla/splunk-octopusdeploy-app)
 - [Issues](https://github.com/merbla/splunk-octopusdeploy-app/issues)

#Attributions

Special Thanks go to the following libraries that make this Splunk App possible.

 - [Octopus Deploy](http://octopusdeploy.com/)


###NodeJS Modular Input
 - [Lodash](https://lodash.com/)
 - [request](https://www.npmjs.com/package/request)
 - [request-promise](https://www.npmjs.com/package/request-promise)

###Dashboard/views
 - [d3](http://d3js.org/)
 - [nvd3](http://nvd3-community.github.io/nvd3/examples/documentation.html)
 - [cal-heatmap](http://kamisama.github.io/)
