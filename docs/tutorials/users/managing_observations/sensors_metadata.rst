.. _sensors_metadata:

===========================
How create Sensors Metadata
===========================

In order to discover, integrate, and exploit sensor data (and also to presserve them for future needs), we need to accurately record sensor information.

The `Sensor Model Language (SensorML) <https://portal.opengeospatial.org/files/?artifact_id=55939>`_ has been adopted by OGC for developing the SWE framework.

SensorML provides a definition language that supports all details of sensors and sensor-to-platform constellations.

Sensor meta-data creation has been performed by GET-IT metadata editor, called `EDI <http://edidemo.get-it.it>`_, which allows ease and friendly instrument registration (SensorML editing version v1.0 and v2.0) through graphical user interfaces (GUI)
and auto completion facilities linked to vocabularies. Some sections of SensorML have been borrowed from the terms present in RDF, in order to harmonize and semantically enrich the metadata. In particular for the SensorML templates implemented in the EDI:

* Parameters: `P01 <http://vocab.nerc.ac.uk/collection/P01/current>`_ and `P02 <http://vocab.nerc.ac.uk/collection/P02/current>`_ `NERC vocabularies <http://vocab.nerc.ac.uk/>`_ or `EnvThes <http://vocabs.ceh.ac.uk/evn/tbl/envthes.evn>`_

* Units of measure: `P06 <http://vocab.nerc.ac.uk/collection/P06/current>`_ NERC vocabulary or EnvThes

* Sensor types: `P07 <http://vocab.nerc.ac.uk/collection/P07/current>`_ NERC vocabulary

* Manufacturers: FOAF (`Friends Of A Friend <http://www.foaf-project.org>`_) graph version of `Esonet Yellow Pages <http://www.esonetyellowpages.com/>`_.

* Operators, and owners: FOAF (Friends Of A Friend) graph. In this case the graph changed independently from the project to which it refers.

Within EDI template, implemented in GET_IT, we adopted the sensor profile suggested in the OGC document titled "`OGC® Best Practice for Sensor Web Enablement Lightweight SOS Profile for Stationary In-Situ Sensors <https://portal.opengeospatial.org/files/?artifact_id=52803>`_.
To be compliant to this profile every sensors will be modeled as a PhysicalSystem and the following metadata items are mandatory:

* gml:description - short textual description of the sensor or sensor system;

* gml:identifier - unique identifier of the sensor system.

* sml:keywords - terms which help to describe the sensor system and serve for discovery purposes;

* sml:identification - this element contains identifiers of the sensor system;

* sml:classification - this element contains classifiers for the sensor system;

* sml:contacts - this element contains contact information about the operator of the sensor;

* sml:featuresOfInterest - this element contains the real world entity, the feature of interest, which is observed by the sensor system. In case of this profile, the feature of interest is a station and modelled as a SamplingPoint;

* sml:outputs - the outputs of the sensors attached to the sensor system.

Within EDI user interface items in bold are the mandatory ones.

Before insert any observations is necessary to create SensorML by EDI template.

The figure below show the EDI user interface for OGC SensorML v2.0 Lightweight SOS Profile for Stationary In-Situ Sensors.

.. figure:: /EDI_SensorML.png
   :align: center

The video allows to have a idea about the interaction between user and EDI user interface.

.. raw:: html

        <iframe width="560" height="315" src="https://www.youtube.com/embed/OVZxqqEDHm0" frameborder="0" allowfullscreen></iframe>


