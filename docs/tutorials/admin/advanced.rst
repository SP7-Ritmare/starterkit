.. _advanced:


=======================
Advanced administration
=======================

Keep your system up-to-date
----------------------------

It's very important to maintain the system updated for security and stability.

To update your system in command line, run::

    $ sudo aptitude update
    $ sudo aptitude full-upgrade

Alternatively, you may use an interactive text interface::

    $ sudo aptitude


Occasionally, you should remove the old kernel versions. Here an automatic script to cleanup (use with caution)::

   echo $(dpkg --list | grep linux-image | awk '{ print $2 }' | sort -V | sed -n '/'`uname -r`'/q;p') $(dpkg --list | grep linux-headers | awk '{ print $2 }' | sort -V | sed -n '/'"$(uname -r | sed "s/\([0-9.-]*\)-\([^0-9]\+\)/\1/")"'/q;p') | xargs sudo apt-get -y purge


.. _update:

Keep GET-IT up-to-date
-----------------------

Starting from **1.2** version, updating GET-IT it's possible in a easy way. The administrator need run a command to update the software to the last version available. 
The command to run with administrator permission is::

  sudo pip install --upgrade --no-deps starterkit
  sudo pip install django-analytical==1.0.0 owslib==0.10.3
  sudo sk  collectstatic --noinput -i externals -i node_modules -i SOSClient
  sudo sk migrate mdtools
  sudo /etc/init.d/apache2 reload

Unfortunately **this update command is not possible if you have a GET-IT version precedent the 1.2a4** (only first two release), in this case you will need to contact your tutor who will provide to contact the GET-IT developement team to update your system. Later you will be able to run the update command by yourself.


Oracle JDK (v. 6) Installation
------------------------------

GeoServer’s speed depends a lot on the chosen Java Runtime Environment
(JRE). For best performance, use Oracle JRE 6 (also known as JRE 1.6)
or newer (http://docs.geoserver.org/2.4.x/en/user/production/java.html).

Installation steps on Ubuntu 12.04 LTS::

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:webupd8team/java
    sudo apt-get update
    sudo apt-get install oracle-java6-installer


Install native JAI and JAI Image I/O extensions
-----------------------------------------------

In order to improve the performance, install the native JAI version in
your JDK/JDE
(see http://docs.geoserver.org/2.4.x/en/user/production/java.html).

Unfortunately, at time of writing the Oracle package is not available
so here an alternative installation procedure Ubuntu 12.04 LTS (with
Oracle JRE 6)::

    sudo apt-get install libjai-core-java libjai-imageio-core-java
    sudo cp /usr/lib/jni/{libclib_jiio.so,libmlib_jai.so} /usr/lib/jvm/java-6-oracle/jre/lib/amd64/
    sudo cp /usr/share/java/{jai_core-1.1.4.jar,jai_codec-1.1.4.jar,jai_imageio-1.2.jar,mlibwrapper_jai-1.1.4.jar,clibwrapper_jiio-1.2.jar} /usr/share/geoserver/WEB-INF/lib/
    sudo /etc/init.d/tomcat7 restart
