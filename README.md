#Splunk Octopus Deploy App/Add On

A simple add on to stream events from [Octopus Deploy](http://octopusdeploy.com/) to [Splunk](http://www.splunk.com/).

To install, follow the instructions for a NodeJS plugin [here](http://blogs.splunk.com/2014/09/17/new-support-for-authoring-modular-inputs-in-node-js/).

You will need an [API Key](http://docs.octopusdeploy.com/display/OD/How+to+create+an+API+key) from your Octopus Server.

Once that is done, you can search using the following source types:

 - Users : `octopus:user`
 - Tasks : `octopus:task`
 - Events : `octopus:event`
 - Deployments : `octopus:deployment`
 - Releases : `octopus:release`
 - Environments : `octopus:environment`
 - Projects : `octopus:project`
 - Machines : `octopus:machine`
 - Teams : `octopus:team`


###Resources
 - [My Blog Intro](
http://blog.merbla.com/2015/06/25/introducing-the-splunk-add-on-for-octopus-deploy/)
