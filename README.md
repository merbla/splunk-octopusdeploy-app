#Splunk Octopus Deploy App/Add On

A Splunk app to stream events from [Octopus Deploy](http://octopusdeploy.com/) to [Splunk](http://www.splunk.com/).

Get the latest from [Splunk Base](https://splunkbase.splunk.com/app/2859/)

The application is comprised of two main areas, a modular input and a set of dashboard views.

##Modular Input
The modular input that allows data to be integrated from an Octopus Deploy instance.  This utilises the NodeJS modular input SDK and provides the following source types.

- Users : `octopus:user`
- Tasks : `octopus:task`
- Events : `octopus:event`
- Deployments : `octopus:deployment`
- Releases : `octopus:release`
- Environments : `octopus:environment`
- Projects : `octopus:project`
- Machines : `octopus:machine`
- Teams : `octopus:team`

##Dashboard
The dashboard of the app provides four distinct views of the Octopus Deploy data.  This makes use of custom visualisation and saved searches.  This utilises newer versions of the D3, NVD3 libraries to those packaged with Splunk Enterprise 6.2.

###Overview
The overview provides a quick snapshot of what is happening within an Octopus Deploy instance.  This includes a view of active projects, average deployment times for releases and a health check of tentacles.  At a glance anyone in the organisation can understand what has moved to what environment over recent releases.

###Deployments
The deployment view drills into the detail of deployments, highlighting problem projects with failure rates and long deployments.  It also illustrates releases that have taken the longest to make their way from lower environments to production.

###Frequency
The frequency view allows an organisation view its deployment rate over the last twelve months.

###Audit
The audit view allows visibility into the tasks and significant events occuring in the Octopus Deploy instance.  This is included (however not limited to) the creation of new accounts, new projects and releases.  The authorised promotion of a deployment to an environment and the backups of the Octopus Deploy data.

#Installation/Configuration

You will need an [API Key](http://docs.octopusdeploy.com/display/OD/How+to+create+an+API+key) from your Octopus Server.

The latest app can be found on [Splunk Base](https://splunkbase.splunk.com/app/2859/)

###Resources
- [My Blog Intro](
http://blog.merbla.com/2015/06/25/introducing-the-splunk-add-on-for-octopus-deploy/)
