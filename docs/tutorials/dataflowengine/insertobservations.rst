.. _insertobservations:


=========================================
Examples of NRT or RT insert observations
=========================================

The fastest way for inserting new observations within GET-IT is to use the graphical user interface (GUI) (:ref:`upload_observations`) implemented ad-hoc for this purpose. This GUI is specifically developed for users who want to insert data that were prevously collected within spreadsheets or similar files.
A different scenario is the automatic upload from data logger, remote station, etc.: In this case the correct way to insert observation data in GET-IT is directly through the exposed SOS interface, exploiting standard transactional requests of Sensor Web (SWE) and SOS. In particular the SOS accept the insertObservation request to insert standard encoded observations.
The use of XML language ensures a complete OGC-SWE compliance. Below an example of insertObservation request:

.. code-block:: xml

    <sos:InsertObservation service="SOS" version="2.0.0"
        xmlns:sos="http://www.opengis.net/sos/2.0"
        xmlns:swes="http://www.opengis.net/swes/2.0"
        xmlns:swe="http://www.opengis.net/swe/2.0"
        xmlns:sml="http://www.opengis.net/sensorML/1.0.1"
        xmlns:gml="http://www.opengis.net/gml/3.2"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:om="http://www.opengis.net/om/2.0"
        xmlns:sams="http://www.opengis.net/samplingSpatial/2.0"
        xmlns:sf="http://www.opengis.net/sampling/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd http://www.opengis.net/samplingSpatial/2.0 http://schemas.opengis.net/samplingSpatial/2.0/spatialSamplingFeature.xsd">

        <sos:offering>offering:https://www.website.org/procedure/procedureType_B/observations</sos:offering>

        <!-- multiple offerings are possible -->
        <!-- Start of OM_Observation o1 -->
        <sos:observation>
            <om:OM_Observation gml:id="o1">
                <om:type xlink:href="http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement"/>

                <om:phenomenonTime>
                    <gml:TimeInstant gml:id="phenomenonTime_o1">
                        <gml:timePosition>2015-08-27T12:32:16.000+02:00</gml:timePosition>
                    </gml:TimeInstant>
                </om:phenomenonTime>

                <om:resultTime xlink:href="#phenomenonTime_o1"/>

                <om:procedure xlink:href="https://www.website.org/procedure/procedureType_B" xlink:arcrole="http://www.website.org/2.0/sensors"/>

                <om:observedProperty xlink:href="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/"/>

                <om:featureOfInterest>
                    <sams:SF_SpatialSamplingFeature gml:id="sample_o1">
                        <gml:identifier codeSpace="">http://www.website.org/sensors/SSF/SSF_b</gml:identifier>
                        <gml:name>Lago Paione inferiore</gml:name>
                        <sf:type xlink:href="http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint"/>
                        <sf:sampledFeature
                            xlink:title="Lago Paione inferiore"/>
                        <sams:shape>
                            <gml:Point gml:id="p1">
                                <gml:pos srsName="http://www.opengis.net/def/crs/EPSG/0/4326">46.168979 8.18923</gml:pos>
                            </gml:Point>
                        </sams:shape>
                    </sams:SF_SpatialSamplingFeature>
                </om:featureOfInterest>

                <om:result xsi:type="gml:MeasureType" uom="m">0.28</om:result>

            </om:OM_Observation>
        </sos:observation>
        <!-- End of OM_Observation o1 -->

        <!-- Start of OM_Observation o2 -->
        <sos:observation>
            <om:OM_Observation gml:id="o2">
                <om:type xlink:href="http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement"/>
                <om:phenomenonTime xlink:href="#phenomenonTime_o1"/>
                <om:resultTime xlink:href="#phenomenonTime_o1"/>
                <om:procedure xlink:href="https://www.website.org/procedure/procedureType_B" xlink:arcrole="http://www.website.org/2.0/sensors"/>
                <om:observedProperty xlink:href="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/"/>
                <om:featureOfInterest xlink:href="#sample_o1"/>
                <om:result xsi:type="xs:integer">0.12</om:result>
            </om:OM_Observation>
        </sos:observation>
        <!-- End of OM_Observation o2 -->

        <!-- Start of OM_Observation o3 -->
        <sos:observation>
            <om:OM_Observation gml:id="o3">
                <om:type xlink:href="http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement"/>
                <om:phenomenonTime xlink:href="#phenomenonTime_o1"/>
                <om:resultTime xlink:href="#phenomenonTime_o1"/>
                <om:procedure xlink:href="https://www.website.org/procedure/procedureType_B" xlink:arcrole="http://www.website.org/2.0/sensors"/>
                <om:observedProperty xlink:href="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/"/>
                <om:featureOfInterest xlink:href="#sample_o1"/>

                <!-- example of data array -->
                <om:result xsi:type="swe:DataArrayPropertyType">
                <swe:DataArray>
                    <swe:elementCount>
                        <swe:Count>
                            <swe:value>15</swe:value>
                        </swe:Count>
                    </swe:elementCount>
                    <swe:elementType name="defs">
                        <swe:DataRecord>
                            <swe:field name="phenomenonTime">
                                <swe:Time definition="http://www.opengis.net/def/property/OGC/0/PhenomenonTime">
                                    <swe:uom xlink:href="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"/>
                                </swe:Time>
                            </swe:field>
                            <swe:field name="ASLV">
                                <swe:Quantity definition="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/">
                                    <swe:uom code="m"/>
                                </swe:Quantity>
                            </swe:field>
                        </swe:DataRecord>
                    </swe:elementType>
                    <swe:encoding>
                        <swe:TextEncoding tokenSeparator="#" blockSeparator="@"/>
                    </swe:encoding>
                    <swe:values>2012-11-19T13:30:00+02:00#0.15@2012-11-19T13:31:00+02:00#0.15@2012-11-19T13:32:00+02:00#0.85@2012-11-19T13:33:00+02:00#0.5@2012-11-19T13:34:00+02:00#0.9@2012-11-19T13:35:00+02:00#0.7@2012-11-19T13:36:00+02:00#0.5@2012-11-19T13:37:00+02:00#0.6@2012-11-19T13:38:00+02:00#0.5@2012-11-19T13:39:00+02:00#0.4@2012-11-19T13:40:00+02:00#0.34@2012-11-19T13:41:00+02:00#0.25@2012-11-19T13:42:00+02:00#0.79@2012-11-19T13:43:00+02:00#0.56@2012-11-19T13:44:00+02:00#0.25</swe:values>
                </swe:DataArray>
            </om:result>
            </om:OM_Observation>
        </sos:observation>
        <!-- End of OM_Observation o3 -->
    </sos:InsertObservation>

It is possible to further reduce the XML relying insertResultTemplate and insertResult, below the example of both requests.

insertResultTemplate

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <sos:InsertResultTemplate service="SOS" version="2.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:swes="http://www.opengis.net/swes/2.0"
        xmlns:sos="http://www.opengis.net/sos/2.0"
        xmlns:swe="http://www.opengis.net/swe/2.0"
        xmlns:sml="http://www.opengis.net/sensorML/1.0.1"
        xmlns:gml="http://www.opengis.net/gml/3.2"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:om="http://www.opengis.net/om/2.0"
        xmlns:sams="http://www.opengis.net/samplingSpatial/2.0"
        xmlns:sf="http://www.opengis.net/sampling/2.0"
        xmlns:xs="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sosInsertResultTemplate.xsd http://www.opengis.net/om/2.0 http://schemas.opengis.net/om/2.0/observation.xsd  http://www.opengis.net/samplingSpatial/2.0 http://schemas.opengis.net/samplingSpatial/2.0/spatialSamplingFeature.xsd">
        <sos:proposedTemplate>
            <sos:ResultTemplate>
                <swes:identifier>http://www.website.org/test/procedure/procedureType_B/template/1</swes:identifier>

                <sos:offering>offering:https://www.website.org/procedure/procedureType_B/observations</sos:offering>

                <sos:observationTemplate>
                    <om:OM_Observation gml:id="sensor2obsTemplate">
                        <om:type xlink:href="http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement"/>
                        <om:phenomenonTime nilReason="template"/>
                        <om:resultTime nilReason="template"/>
                        <om:procedure xlink:href="https://www.website.org/procedure/procedureType_B"/>
                        <om:observedProperty xlink:href="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/"/>
                        <om:featureOfInterest>
                            <sams:SF_SpatialSamplingFeature gml:id="sample_o1">
                                <gml:identifier codeSpace="">http://www.website.org/sensors/SSF/SSF_b</gml:identifier>
                                <gml:name>Lago Paione inferiore</gml:name>
                                <sf:type xlink:href="http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint"/>
                                <sf:sampledFeature
                                    xlink:title="Lago Paione inferiore"/>
                                <sams:shape>
                                    <gml:Point gml:id="p1">
                                        <gml:pos srsName="http://www.opengis.net/def/crs/EPSG/0/4326">46.168979 8.18923</gml:pos>
                                    </gml:Point>
                                </sams:shape>
                            </sams:SF_SpatialSamplingFeature>
                        </om:featureOfInterest>
                        <om:result/>
                    </om:OM_Observation>
                </sos:observationTemplate>

                <sos:resultStructure>
                    <swe:DataRecord>
                        <swe:field name="phenomenonTime">
                            <swe:Time definition="http://www.opengis.net/def/property/OGC/0/PhenomenonTime">
                                <swe:uom xlink:href="http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"/>
                            </swe:Time>
                        </swe:field>
                        <swe:field name="ASLV">
                            <swe:Quantity definition="http://vocab.nerc.ac.uk/collection/P02/current/ASLV/">
                                <swe:uom code="m"/>
                            </swe:Quantity>
                        </swe:field>
                    </swe:DataRecord>
                </sos:resultStructure>

                <sos:resultEncoding>
                    <swe:TextEncoding tokenSeparator="#" blockSeparator="@"/>
                </sos:resultEncoding>

            </sos:ResultTemplate>
        </sos:proposedTemplate>
    </sos:InsertResultTemplate>

and insertResult

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <sos:InsertResult service="SOS" version="2.0.0"
        xmlns:sos="http://www.opengis.net/sos/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd">

        <sos:template>http://www.website.org/test/procedure/procedureType_B/template/1</sos:template>

        <swe:values>2012-11-19T13:30:00+02:00#0.15@2012-11-19T13:31:00+02:00#0.15@2012-11-19T13:32:00+02:00#0.85@2012-11-19T13:33:00+02:00#0.5@2012-11-19T13:34:00+02:00#0.9@2012-11-19T13:35:00+02:00#0.7@2012-11-19T13:36:00+02:00#0.5@2012-11-19T13:37:00+02:00#0.6@2012-11-19T13:38:00+02:00#0.5@2012-11-19T13:39:00+02:00#0.4@2012-11-19T13:40:00+02:00#0.34@2012-11-19T13:41:00+02:00#0.25@2012-11-19T13:42:00+02:00#0.79@2012-11-19T13:43:00+02:00#0.56@2012-11-19T13:44:00+02:00#0.25</swe:values>
    </sos:InsertResult>

Otherwise the SOS server integrated within GET-IT allows to use JSON for sending requests. In OGC SWE, the JSON "binding" is not yet standardized, but this feature can ease the work of programmers familiar with JSON. Below an example of insertObservations JSON:

.. code-block:: json

  {
    'observation': {
        'featureOfInterest': {
            'geometry': {
                'coordinates': [45.43,
                                12.33],
                'crs': {
                    'properties': {
                        'name': 'EPSG:4326'
                    },
                    'type': 'name'
                },
                'type': 'Point'
            },
            'identifier': {
                'codespace': 'http://www.opengis.net/def/nil/OGC/0/unknown',
                'value': u'http://sp7.irea.cnr.it/featureOfInterest/PuntaSaluteCanaleGiudecca'
            },
            'name': [{
                'codespace': 'http://www.opengis.net/def/nil/OGC/0/unknown',
                'value': u'Laguna di Venezia - Punta Salute Canale della Giudecca'}],
            'sampledFeature': [u'lagunaVenezia002']
        },
        'identifier': {
            'codespace': 'http://www.opengis.net/def/nil/OGC/0/unknown',
            'value': 'record410549'
        },
        'observedProperty': u'http://vocab.nerc.ac.uk/collection/P02/current/ASLV/',
        'phenomenonTime': '2015-01-12T11:40:00+00:00',
        'procedure': u'http://sp7.irea.cnr.it/sensors/mareesk.irea.cnr.it/procedure/SIAPMICROS/DA9000/noSerialNumberDeclared/20140723044959616_PuntaSaluteCanaleGiudecca',
        'result': {
            'uom': u'm', 'value': 0.03
        },
        'resultTime': '2015-01-12T11:40:00+00:00',
        'type': 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'
    },
    'offering': u'offering:http://sp7.irea.cnr.it/sensors/mareesk.irea.cnr.it/procedure/SIAPMICROS/DA9000/noSerialNumberDeclared/20140723044959616_PuntaSaluteCanaleGiudecca/observations',
    'request': 'InsertObservation',
    'service': 'SOS',
    'version': '2.0.0'
   }

The requests should be sent to SOS endpoint that could be found in the GET-IT interface (Services -> SOS e.g. `<http://demo2.get-it.it/about_services/#sos>`_), by client-side URL transfers (e.g. cURL).
