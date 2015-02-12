RITMARE - SP7 - Starter Kit
========================

You should write some docs, it's good for the soul.

Installation
------------

Install geonode from PPA in Ubuntu 12.04::

    $ sudo apt-get install python-software-properties

    $ sudo add-apt-repository ppa:geonode/release

    $ sudo apt-get update

    $ sudo apt-get install geonode

Setup the IP address and create a superuser::

    $ sudo geonode-updateip 127.0.0.1

    $ geonode createsuperuser

Install SK from archive file

    $ sudo pip install starterkit


Usage
-----

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


