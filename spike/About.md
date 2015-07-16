#Octopus Deploy App for Splunk

The Octopus Deploy App for Splunk provides a [modular input](http://docs.splunk.com/Documentation/Splunk/6.2.4/AdvancedDev/ModInputsIntro) to ingest data from an [Octopus Deploy](http://octopusdeploy.com/) instance, and a set of dashboards and views to analyse the data.

You will need an [API Key](http://docs.octopusdeploy.com/display/OD/How+to+create+an+API+key) from your Octopus Server.

Once the data input(s) have been configured, searches can be performed using the following source types:

 - Users : `octopus:user`
 - Tasks : `octopus:task`
 - Events : `octopus:event`
 - Deployments : `octopus:deployment`
 - Releases : `octopus:release`
 - Environments : `octopus:environment`
 - Projects : `octopus:project`
 - Machines : `octopus:machine`
 - Teams : `octopus:teams`

The app makes use of the [NodeJS](https://nodejs.org/) Splunk modular inputs capability via HTTP/HTTPS.  

###Prerequisites
 - Splunk Enterprise instance, version 6.2 or later.

###Installing NodeJS components
- Install the app
- Open a terminal window or command prompt, navigate to `$SPLUNK_HOME/etc/apps/octopus_deploy/bin/app`
- `npm install`
- Restart Splunk

##Feedback and Issues

 - [Github Repo](https://github.com/merbla/splunk-octopusdeploy-app)
 - [Issues](https://github.com/merbla/splunk-octopusdeploy-app/issues)

 ##Attributions

 - [Octopus Deploy](http://octopusdeploy.com/)
