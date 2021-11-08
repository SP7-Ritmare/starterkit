.. _managing_layers.layers:

=====================
Managing layers
=====================

Read the `GeoNode <http://geonode.org/>`_ documentation to learn how to `manage layers <http://docs.geonode.org/en/master/tutorials/users/managing_layers/index.html>`_.

Load layers from the back-office in a Docker environment
========================================================

It is supposed the Starterkit stack has been already started
and all containers are up and running.
Let's imagine we want to load a shapefile already bundled as zip file,
for example namely `ne_50m_admin_0_countries.zip`.

Move the layer to the GeoServer container
-----------------------------------------

Use the following command from the machine where the Docker daemon
is running: ::

    docker cp ne_50m_admin_0_countries.zip geoserver4starterkit:/geoserver_data/data/data/geonode/

Organize your layers in sub-folders
-----------------------------------

It is not mandatory but highly suggested to store your layers in different sub-folders each with the same name of the layer: ::

    docker exec -it django4starterkit /bin/bash -c "/usr/bin/unzip -d /geoserver_data/data/data/geonode/ne_50m_admin_0_countries /geoserver_data/data/data/geonode/ne_50m_admin_0_countries.zip

Publish the layer in GeoServer
------------------------------

Login as administrator and perform the following operations: ::

- load the shapefile as new store in the `geonode` workspace to GeoServer
- publish the layer within the `geonode` workspace from the previously create store
- create a new style in the `geonode` workspace with the **same name** of that assigned to the layer

Run the updatelayers command
----------------------------

Run the following command from the machine where the Docker daemon
is running: ::

    docker exec -it django4starterkit /bin/bash -c "/usr/src/app/scripts/docker/misc/docker_geonode_updatelayers.sh"
