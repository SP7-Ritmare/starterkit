.. _scratch:


===============================
Installing GET-IT from scratch
===============================

Before starting installation read the :ref:`server` page.

If you just want to install GET-IT, it is recommended to use Ubuntu 12.04.

**Prerequisites:**

1. GeoNode (version 2.0.x)
2. 52°North SOS (version 4.0.0 or 4.x)

GeoNode Installation
--------------------

Install geonode from PPA in Ubuntu 12.04::

    $ sudo apt-get install python-software-properties

    $ sudo add-apt-repository ppa:geonode/release

    $ sudo apt-get update

    $ sudo apt-get install geonode

Setup the IP address and create a superuser:

    $ sudo geonode-updateip 127.0.0.1

    $ geonode createsuperuser

52°North SOS Installation
-------------------------
Follow the instructions (for SOS version 4.x) at
https://wiki.52north.org/bin/view/SensorWeb/SensorObservationServiceIVDocumentation#Installation

PostgreSQL and PostGIS (currently at version 9.1 and 2.0) are already installed by default in GeoNode. For this reason it is not necessary to make a new installation. An update of the current version of Java it is necessary, 52°North requires Java runtime environment (JRE) 7.0 or higher:

    $ java -version
    
    $ sudo add-apt-repository ppa:webupd8team/java
    
    $ sudo apt-get update
    
    $ sudo apt-get install oracle-java7-installer
    
    $ java -version

Just a note: GET-IT expects to find a webapp named "observations".
So, before "Install and configure Tomcat", rename the 52n-sos-webapp.war into observations.war.

After the deploy of war file, in the http://127.0.0.1:8080/observations you can check the installation of the SOS admin, create a new PostgreSQL database using the PostGIS template created during the PostGIS installation.

    $ sudo su - postgres
    
    $ psql -U <user>
    
    $ CREATE DATABASE <db_name>;
    
    $ \connect <db_name>;
    
    $ CREATE EXTENSION postgis;
    
If return error like *could not open extension control file "/usr/share/postgresql/9.1/extension/postgis.control": No such file or directory*, please exit to the PostgreSQL DB and to the user, execute:

    $ sudo apt-get install postgis postgresql-9.X-postgis-scripts

after retry the commands above.
Check extensions:

    $ \dx
    
Navigate to the http://127.0.0.1:8080/observations and complete the installation process. Follow the steps on the screen to configure your SOS instance (you don't have to do this if you've build the preconfigured webapp). More information about the settings can be found in the Configure/Administrate the SOS section of this page.
Before to start copy user (DATABASE_USER) and password (DATABASE_PASSWORD) of the PostgreSQL:

    $ nano /etc/geonode/local_settings.py
    
Complete the installation follow the steps and finally set the user and password. 

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

Domain Name
-----------
To let GET-IT work properly you need to use a right domain name, See the page :ref:`domain_name` to learn how to change it.

Security
--------
It's important for your server security follow instruction on the page: :ref:`security_issue`


