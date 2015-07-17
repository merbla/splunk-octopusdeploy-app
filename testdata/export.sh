#Export all types

# Users : octopus:user
# Tasks : octopus:task
# Events : octopus:event
# Deployments : octopus:deployment
# Releases : octopus:release
# Environments : octopus:environment
# Projects : octopus:project
# Machines : octopus:machine
# Teams : octopus:team


curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:user | table index,host,source,sourcetype,_raw' -d output_mode=csv -o user.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:task | table index,host,source,sourcetype,_raw' -d output_mode=csv -o task.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:event | table index,host,source,sourcetype,_raw' -d output_mode=csv -o event.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:deployment | table index,host,source,sourcetype,_raw' -d output_mode=csv -o deployment.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:release | table index,host,source,sourcetype,_raw' -d output_mode=csv -o release.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:environment | table index,host,source,sourcetype,_raw' -d output_mode=csv -o environment.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:project | table index,host,source,sourcetype,_raw' -d output_mode=csv -o project.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:machine | table index,host,source,sourcetype,_raw' -d output_mode=csv -o machine.csv
curl -k -u export:Export123 https://172.16.73.158:8089/services/search/jobs/export --data-urlencode search='search sourcetype=octopus:team | table index,host,source,sourcetype,_raw' -d output_mode=csv -o team.csv
