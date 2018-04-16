.. _scratch:


===============================
Installing GET-IT from scratch
===============================

Before starting installation read the :ref:`server` page.

If you just want to install GET-IT, it is recommended to use Ubuntu 16.04

**Prerequisites of virtual machine:**

RAM - 16 GB

Disk space - 50 GB 

Core - 4

Install Docker CE on Ubuntu
===========================

Docker CE is supported on Ubuntu on x86_64 , armhf , s390x (IBM Z), and ppc64le (IBM Power) architectures.

.. warning:: Make sure to check the OS version as one among supported ones

Show your OS details running::
        
    uname -a 

Uninstall old docker versions
-----------------------------

if old versions of Docker binary were installed then uninstall them::

    sudo apt-get remove docker docker-engine docker.io

Install docker
--------------

The package of **Docker CE** is now called ``docker-ce``. Before doing the installation steps please
make sure that the ``apt`` package index has been updated::

    sudo apt-get update

Add packages to allow the use of secure http channel::

    sudo apt-get install \
        apt-transport-https \
        ca-certificates \
        curl \
        software-properties-common

Add the official GPG key from Docker::

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

Run the following command to setup the **stable** repository::

    sudo add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) \
        stable"

Update the package index::

    sudo apt-get update

Install the latest version of the binary or a specific version with the command::

    sudo apt-get install docker-ce  # latest
    
or::
    
    sudo apt-get install docker-ce=<VERSION>  # specific

The docker daemon will start automatically.

Add your user to the ``docker`` group if you want to run docker command without ``sudo`` privileges::

    sudo usermod -aG docker $USER
    source $HOME/.bashrc

Verify the health of your installation by running the sample ``hello-world`` image::

    sudo docker run hello-world

The following message has to be displayed if everything is working properly::

    Hello from Docker!
    This message shows that your installation appears to be working correctly.

    To generate this message, Docker took the following steps:
    1. The Docker client contacted the Docker daemon.
    2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
        (amd64)
    3. The Docker daemon created a new container from that image which runs the
        executable that produces the output you are currently reading.
    4. The Docker daemon streamed that output to the Docker client, which sent it
        to your terminal.

    To try something more ambitious, you can run an Ubuntu container with:
    $ docker run -it ubuntu bash

Install Docker Compose on Ubuntu
================================

Download the latest version of ``docker-compose`` binary::

    sudo curl -L \
    https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` \
    -o /usr/local/bin/docker-compose

Adjust executable permissions to the binary::

    sudo chmod +x /usr/local/bin/docker-compose

Verify the installation::

    docker-compose --version

Running GET-IT stack
=====================

Clone the repository::

    git clone https://github.com/SP7-Ritmare/starterkit.git

Modify configuration files::

    cd starterkit/scripts/docker/env/production/

change GEONODE_LB_HOST_IP variable value with *address IP* or *DNS* of the GET-IT in your server
in the sos.env, django.env, geoserver.env, celery.env 

Launch the stack with the build of GeoNode so any changes you did will be immediately available::

    cd ~/starterkit/
    sudo docker-compose up --build -d

If the network where you want install the GET-IT is protected by proxy, follow this:

    cd ~/starterkit/
    sudo docker-compose build --build-arg HTTPS_PROXY=http://proxy.uns.ac.rs:8080
    sudo -E docker-compose up -d

**The GET-IT is installed correctly!** GET-IT will be available at the ip address of the ``eth0`` interface.
Check IP address with::

    ifconfig -a
