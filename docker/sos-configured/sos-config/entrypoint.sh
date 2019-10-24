#!/bin/bash
set -e

/usr/local/bin/invoke update >> /tmp/invoke.log

source $HOME/.bashrc
source $HOME/.override_env

/usr/local/bin/invoke updatedb >> /tmp/invoke.log

echo "updatedb task done"

if [ ${IS_FIRST_START} = "true" ]  || [ ${IS_FIRST_START} = "True" ]
then

    /usr/local/bin/invoke updatedbsos >> /tmp/invoke.log
    echo "updatedbsos task done"

else

    echo "dbsos not altered"

fi

# start tomcat
exec catalina.sh run
