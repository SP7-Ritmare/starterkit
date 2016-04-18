.. _insertobservations:


========================
Examples: Insert observations
========================

.. code:: python

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
