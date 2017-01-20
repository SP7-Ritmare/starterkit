.. _domain_name:


=================================
Choosing the “right” Domain Name
=================================

To let GET-IT work, you cannot use the IP address in configuration files, you need to set a domain name.

* Keep “OGC Endpoints” persistent and alive (for remote users and cascading services)
* Stable URIs/URLs as semantic web “best practice”
* GET-IT uses Domain Name as default prefix for different resources URIs (i.e. Sensors, Offerings)

Updating Domain Name
---------------------

To update the domain name of your server use the following command: ::

$ sudo sk-updateip [domain name] # utility for assign a domain name to the GET-IT

Example: $ sudo sk-updateip demo1.get-it.it
