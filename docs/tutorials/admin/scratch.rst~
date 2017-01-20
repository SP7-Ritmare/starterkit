.. _scratch:

===============================
Installing GET-IT from scratch
===============================

If you just want to install GET-IT, it is recommended to use Ubuntu 12.04.

**Prerequisites:**

1. GeoNode (version 2.0.x)
2. 52 North SOS (version 4.0.0 or 4.1.0)

GeoNode Installation
--------------------

Install geonode from PPA in Ubuntu 12.04::

    $ sudo apt-get install python-software-properties

    $ sudo add-apt-repository ppa:geonode/release

    $ sudo apt-get update

    $ sudo apt-get install geonode

Setup the IP address and create a superuser::

    $ sudo geonode-updateip 127.0.0.1

    $ geonode createsuperuser

52 North SOS Installation
-------------------------
Follow the instructions (for SOS version 4.x) at
https://wiki.52north.org/bin/view/SensorWeb/SensorObservationServiceIVDocumentation#Installation

Just a note: GET-IT expects to find a webapp named "observations".
So, before "Install and configure Tomcat",
rename the 52n-sos-webapp.war into observations.war into observations.war


GET-IT Installation
-------------------

Install SK from archive file

    $ sudo pip install starterkit

Rename the local_settings.py.sample to local_settings.py and edit it's content by setting the SITEURL and SITENAME.

Edit the file /etc/apache2/sites-available/geonode and change the following directive from:

    WSGIScriptAlias / /var/www/geonode/wsgi/geonode.wsgi

to:

    WSGIScriptAlias / /usr/local/lib/python2.7/dist-packages/geosk/wsgi.py # path to geosk/wsgi.py

Restart apache::

    $ sudo service apache2 restart

Edit the templates in geosk/templates, the css and images to match your needs.

Syncdb and collectstatic::

    $ sk syncdb

    $ sk collectstatic

Register a "fully qualified domain name" (FQDN), then configure the starterkit::

    $ sk-updateip your-FQDN


