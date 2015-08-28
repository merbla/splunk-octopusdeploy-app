#Copy to a temp folder
rm ./../../octopus_deploy

cp -r ./octopus_deploy ./../../octopus_deploy

cd ./../../octopus_deploy

#remove Git Files
find . -name ".DS_Store" -print0 | xargs -0 rm -rf
find . -name "._*" -print0 | xargs -0 rm -rf

rm octopus_deploy.tar.gz
tar -czf octopus_deploy.tar.gz octopus_deploy/
ls


# Remember.... chmod -R a+rX *
#cd var/lib/splunk/modinputs/octopus_deploy/
