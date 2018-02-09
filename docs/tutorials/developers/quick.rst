.. _quick:


============================================
GET-IT quick bootstrap of development server
============================================

This guide is supposed to work for Ubuntu 16.04 which is the current LTS but the same can be applied to different developer machines like MacOs or Windows.

GET-IT is an upstream `geonode-project <https://github.com/GeoNode/geonode-project>`_ which tightly depends from a `GeoNode <https://github.com/GeoNode/geonode>`_ installation.

It is stronly recommended to use a virtual environment for developing GET-IT. It's up to your preferred way to build and maintain it.
Our suggestions are to use `pyenv <https://github.com/pyenv/pyenv>`_ or the modern human usable `Pipenv <https://github.com/pypa/pipenv>`_ for managing python virtual environment.

Install GeoNode in development mode
===================================

Requirements
------------

Install these required ubuntu packages: ::

    sudo apt-get update
    sudo apt-get install python-virtualenv python-dev libxml2 libxml2-dev libxslt1-dev zlib1g-dev libjpeg-dev libpq-dev libgdal-dev git default-jdk

Make sure to being initially within a clean virtual environment for development: ::

    pyenv activate starterkit

Install Java 8 (needed by latest GeoServer from 2.9 and above): ::

    sudo apt-add-repository ppa:webupd8team/java
    sudo apt-get update
    sudo apt-get install oracle-java8-installer

Install the GDAL package: ::

    sudo apt-get install gdal-bin

Clone GeoNode source code
-------------------------

Move to your development root folder: ::

    cd ~/development

Clone the version 2.7.x of GeoNode: ::

    git clone -b 2.7.x https://github.com/GeoNode/geonode

Install GeoNode
---------------

**Make sure to be within your python virtualenv environment for all next steps.**

Install geonode and its dependencies: ::

    pip install -e geonode && pip install -r geonode/requirements.txt
    pip install pygdal==1.11.3.3

Setup GeoNode
-------------

Start GeoNode setup. This will install GeoServer within a Jetty application container: ::

    cd geonode && paver setup

Migrate the database schema: ::

    python manage.py migrate

Configure initial data of GeoNode for development: ::

    python manage.py loaddata geonode/base/fixtures/initial_data.json

Create an administrative accounts. At least one `admin` user has to exist: ::

    python manage.py createsuperuser
    Username: admin
    Email address: admin@starterkit.org
    Password: admin

Configure basic oauth2 mechanism for GeoNode and GeoServer: ::

    python manage.py loaddata geonode/base/fixtures/default_oauth_apps.json


Start GeoServer in development mode
-----------------------------------

Run GeoServer with the command: ::

    paver start_geoserver

Install GET-IT in development mode
==================================

Clone GET-IT source code
------------------------

Move to your development root folder: ::

    cd ~/development

Clone the master version of GET-IT: ::

    git clone https://github.com/SP7-Ritmare/starterkit.git

Install GET-IT
--------------

Install GET-IT and its dependencies: ::

    pip install -r requirements.txt

Start GET-IT
------------

Run GET-IT server in development mode: ::

    python manage.py runserver 0.0.0.0:8000
