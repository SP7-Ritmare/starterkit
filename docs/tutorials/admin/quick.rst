.. _quick:


==========================
GET-IT quick installation
==========================

Before starting installation read the :ref:`server` page.

GET-IT is distributed as a virtual appliance in "vmdk"(virtual machine disk) format.

A video demo is available `HERE <http://youtu.be/q-QDU-WxRRc>`_ (you can change the settings in YouTube to improve the resolution of the video). 

Download and installation of the Virtual Machine
=================================================

Download the file ''starterkit.vmdk.gz'' using the following `LINK <http://geosk.ve.ismar.cnr.it/static/vm-sk-1.2-213243242/>`_ , we suggest to download the file in the machine where the virtualizer is present.

Normally you can use the "wget" command followed by the url: ::

 wget http://geosk.ve.ismar.cnr.it/static/vm-sk-1.2-213243242/starterkit.vmdk.gz

Extract the file with "gunzip" command: ::

 gunzip starterkit.vmdk.gz

Domain Name
-----------
To let GET-IT work properly you need to use a right domain name, See the page :ref:`domain_name` to learn how to change it.

Security
--------

It's important for your server security follow instruction on the page: :ref:`security_issue`

Update GET-IT
-------------

At the end of the installation it's important to update your GET-IT to the last version available following the steps described in :ref:`update`.






