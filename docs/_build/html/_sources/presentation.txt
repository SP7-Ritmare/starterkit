.. _presentation:

Short presentation to GET-IT features and its architecture
===========================================================

GET-IT is a software package developed by SP7 researchers - working in different CNR Institutes - expert in Data infrastructure and geospatial services. The software was developed for RITMARE SP7 project.
This documentation wants to help researchers to provide web services to share spatial and observation data following national and international standards.
In particular the documentation is usefull for researcher team and/or institutes of RITMARE project that don't have an adequate data infrastructure.

The apllication was developed starting from open source packages with the addition of packages developed for project needs.
It offers an interface for **data management, sharing, visualisation and** (optionaly) **download** through `OGC <http://www.opengeospatial.org/>`_ standard web services for the following data categories:

	
#. **maps or layers** (spatial data). It permits to public and visualize spatial data (vector or raster). It use the web application GeoNode with customization for project needs. It provides the principal operations: upload data, data storing, styling and sharing data through standard services (WMS, WFS, WCS).
#. **observations** coming from different sensor types (buoys, glider, mooring, meteorological sensors, etc.). It uses an open-source solution based on Sensor Web Enablement (SWE) specifications, like implemented by 52° North (52N) project. It provides the operations to upload observation data, data storing and data management on a Data Base Management System, sharing observation on the web (through standard SOS interface). 
#. **documents** (text files, spreadsheet, images, etc.).

One of the main function of GET-IT is the **metadata editing tool** named :doc:`EDI <glossary/edi>` that permits to create, edit and read metadata about uploaded data (spatial data, observation data and documents) to describe data in a national and international standard way (Repetorio Nazionale dei Dati Territoriali -RNDT-, INSPIRE and SensorML).
Metadata (compiled by this tool) are improved in semantic to increase discovery operations.
	
GET-IT also permits to manage (for every data type uploaded) permission for registered users to:

* visualize	
* edit
* download data

GET-IT is distributed with an open-source license ( `GPL v.3.0 <http://www.gnu.org/copyleft/gpl.html>`_ ) and distributed through a ready to use virtual machine. After installation it provides a user friendly interface, the tools and services that compose a local infrastructure with above-mentioned features.


