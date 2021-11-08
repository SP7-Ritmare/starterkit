#!/bin/bash
PIP=/usr/local/bin/pip2

catalina_home=$(ps -ef | grep tomcat | grep java | awk 'BEGIN {RS=" "; FS="="} $1 ~ /-Dcatalina.home/ {print $2}')
sos_dir=/var/lib/tomcat7/webapps/observations/

ubuntu=$(lsb_release -sr)
java=$(java -version 2>&1 | head -1 | awk -F '"' '{print $2}')
psql=$(su - postgres -c "echo 'SELECT version()' | psql -t -U postgres 2>&1 | cut -d' ' -f3")
postgis=$(su - postgres -c 'echo "SELECT PostGIS_full_version()" | psql -t -U postgres geonode | cut -d\" -f2')
python=$(python --version 2>&1 | cut -f2 -d" ")
pycsw=$($PIP list 2>/dev/null | grep pycsw | cut -d"(" -f2 | cut -d")" -f1)
django=$($PIP list 2>/dev/null | grep Django | cut -d"(" -f2 | cut -d")" -f1)
geonode=$($PIP list 2>/dev/null | grep GeoNode | cut -d"(" -f2 | cut -d")" -f1)
starterkit=$($PIP list 2>/dev/null | grep starterkit | cut -d"(" -f2 | cut -d")" -f1)
tomcat=$($catalina_home/bin/version.sh | grep "Server number" | cut -d" " -f 4)
sos=$(cat $sos_dir/version-info.txt | grep "version =" | cut -d" " -f 3 | sed "s/^M//g")
echo {
echo -e '\t'\"ubuntu\": \"$ubuntu\",
echo -e '\t'\"java\": \"$java\",
echo -e '\t'\"postgresql\": \"$psql\",
echo -e '\t'\"postgis\": \"$postgis\",
echo -e '\t'\"python\": \"$python\",
echo -e '\t'\"pycsw\": \"$pycsw\",
echo -e '\t'\"django\": \"$django\",
echo -e '\t'\"geonode\": \"$geonode\",
echo -e '\t'\"starterkit\": \"$starterkit\",
echo -e '\t'\"tomcat\": \"$tomcat\",
echo -e '\t'\"sos\": \"$sos\"
echo }