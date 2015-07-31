.. _advanced:

=======================
Advanced administration
=======================


Keep GET-IT up-to-date
----------------------

It's very important to maintain the system updated for security and stability.

To update your system in command line, run::

    $ aptitude update
    $ aptitude full-upgrade

Alternatively, you may use an interactive text interface::

    $ aptitude


Occasionally, you should remove the old kernel versions. Here an automatic script to cleanup (use with caution)::

   echo $(dpkg --list | grep linux-image | awk '{ print $2 }' | sort -V | sed -n '/'`uname -r`'/q;p') $(dpkg --list | grep linux-headers | awk '{ print $2 }' | sort -V | sed -n '/'"$(uname -r | sed "s/\([0-9.-]*\)-\([^0-9]\+\)/\1/")"'/q;p') | xargs sudo apt-get -y purge


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
    sudo cp /usr/lib/jni/* /usr/lib/jvm/java-6-oracle/jre/lib/amd64/
    sudo cp /usr/share/java/{jai_core-1.1.4.jar,jai_codec-1.1.4.jar,jai_imageio-1.2.jar,mlibwrapper_jai-1.1.4.jar,clibwrapper_jiio-1.2.jar} /usr/share/geoserver/WEB-INF/lib/
    sudo /etc/init.d/tomcat7 restart
