#OctopusDeploy App for Splunk

The OctopusDeploy App for Splunk provides a [modular input](http://docs.splunk.com/Documentation/Splunk/6.2.4/AdvancedDev/ModInputsIntro) to ingest data from an [Octopus Deploy](http://octopusdeploy.com/) instance, and a set of dashboards and views to analyse the data.

##Installation/Configuration
The app makes use of the [NodeJS](https://nodejs.org/) Splunk modular inputs.  

###Prerequisites
 - Splunk Enterprise instance, version 6.2 or later.

###Installing NodeJS components
- Install the app
-   Open a terminal window or command prompt, navigate to `$SPLUNK_HOME/etc/apps/octopus_deploy/bin/app`
- `npm install`
- Restart Splunk


##Feedback and Issues

 - [Github Repo](https://github.com/merbla/splunk-octopusdeploy-app)
 - [Issues](https://github.com/merbla/splunk-octopusdeploy-app/issues)
