OCTOPUS DEPLOY APP
Version 1.0.0

RELEASE NOTES

(The most up-to-date version of the release notes is available online:
https://github.com/merbla/splunk-octopusdeploy-app/README.md)


WHAT DOES THIS APP DO?
======================

The Octopus Deploy App for Splunk provides a modular input (http://docs.splunk.com/Documentation/Splunk/6.2.4/AdvancedDev/ModInputsIntro) to ingest data from an Octopus Deploy(http://octopusdeploy.com/) instance, and a set of dashboards and views to analyse the data.

The app is available from https://github.com/merbla/splunk-octopusdeploy-app/.


REQUIREMENTS/INSTALLATION
=========================

Here's what you need to get going with the Octopus Deploy.

1. Install Splunk Enterprise
----------------------------

If you haven't already installed Splunk Enterprise, download it at http://www.splunk.com/download. For more information about installing and running Splunk Enterprise and system requirements, see the Installation Manual (http://docs.splunk.com/Documentation/Splunk/latest/Installation).

2. Install the main PAS app
---------------------------

Install Octopus Deploy to the $SPLUNK_HOME/etc/apps folder.

3. Get your data in
-------------------

You will need an API Key(http://docs.octopusdeploy.com/display/OD/How+to+create+an+API+key) from your Octopus Server.

The user will require access permissions in Octopus Deploy to the following API resources.


4. Install dependencies
-----------------------

There are no dependencies


COMMUNITY AND FEEDBACK
======================

Questions, comments, suggestions?

File any issues on GitHub (https://github.com/merbla/splunk-octopusdeploy-app/issues).

Community contributions via pull requests are welcomed!
Twitter: @matthewerbs

LICENSE
=======

The Octopus Deploy App -  is licensed under the Apache License 2.0. Details can be found in the LICENSE file (https://github.com/merbla/splunk-octopusdeploy-app/blob/master/LICENSE).
