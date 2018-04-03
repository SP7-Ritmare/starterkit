#!/bin/bash
set -e

/usr/local/bin/invoke update >> /usr/src/app/invoke.log

source $HOME/.override_env

echo DATABASE_URL=$DATABASE_URL
echo GEODATABASE_URL=$GEODATABASE_URL
echo SITEURL=$SITEURL
echo ALLOWED_HOSTS=$ALLOWED_HOSTS
echo GEOSERVER_PUBLIC_LOCATION=$GEOSERVER_PUBLIC_LOCATION

/usr/local/bin/invoke prepare >> /usr/src/app/invoke.log
echo "prepare task done"

python manage.py loaddata /tmp/mdtools_services_metadata_docker.json --settings=geosk.settings

