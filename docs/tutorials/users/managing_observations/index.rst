.. _managing_observations:

=====================
Managing observations
=====================

An Observation is an action whose result is an estimate of the value of some property of the feature-of-interest (i.e. station, animals or tissue), at a specific point in time, obtained using a specified procedure or sensor (After Cox 2008 cited by
INSPIRE Cross Thematic Working Group on Observations & Measurements, 2011). An observation can be associated with a specific sensor that have collected the observation, it may be associated with metadata.

In this section, you will learn how to add new sensor info (metadata of the sensors), to upload new observations, and share these through specific web services: Sensor Observation Services (SOS).

In the GET-IT home page Sensor section is dedicated to managing observation and sensors, the figure below show the different interaction parts for managing observations and sensors.

.. figure:: /../../GETIT_Sensor_Interface.png
   :align: center

Two tabs, **Explore SOS** and **Upload Observations**, are dedicated respectively to:

* show the list of the sensors within local repository and a link with sensor details in order to improve knowledge, provided in XML and in HTML (clicking on Sensor Details green button). More information in :ref:`sensors_metadata` or :ref:`metadata_check`;

* upload observations by friendly user interface. Mere information in :ref:`upload_observations`

Two buttons, in the header, provides to register new sensor and get capabilities of the local Sensors Observations Services (SOS).

All the functionality making SWE pure requests.

.. toctree::
   :maxdepth: 4

   sensors_metadata
   metadata_check
   upload_observations