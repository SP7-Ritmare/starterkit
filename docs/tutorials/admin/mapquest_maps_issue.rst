.. _mapquest_maps_issue:

===============
MapQuest Maps Issue
===============

From July 2016 the MapQuest Open is shutting down and moving to a new model which requires signing up and getting a 'key' to get access to map tiles.

In order to remove the dependence from the MapQuest Maps please follow these instructions:


Remove the references to MapQuest
---------------------------------


**Remove the MapQuest from default configuration**


Edit the file /etc/starterkit/local_settings.py and comment the lines::


  #   "source": {"ptype": "gxp_mapquestsource"},
  #   "name":"osm",
  #   "group":"background",
  #   "visibility": True
  # }, {
  #   "source": {"ptype": "gxp_mapquestsource"},
  #   "name":"naip",
  #   "group":"background",
  #   "visibility": False
  # }, {
  #   "source": {"ptype": "gxp_bingsource"},
  #   "name": "AerialWithLabels",
  #   "fixed": True,
  #   "visibility": False,
  #   "group":"background"
  },{
    "source": {"ptype": "gxp_mapboxsource"},
  },



**Substitute the MapQuest background layer with default OpenStreetMap from existing maps**

Launch the ipython console::

  $ sk shell_plus


and type the commands::

  >>> from geonode.maps.models import MapLayer
  >>> mlayers_osm = MapLayer.objects.filter(name='osm', visibility=True)
  >>> mlayers_naip = MapLayer.objects.filter(name='naip', visibility=True)
  >>> maps_osm = list(mlayers_osm.values_list('map_id', flat=True))
  >>> maps_naip = list(mlayers_naip.values_list('map_id', flat=True))
  >>> mlayers_osm.update(visibility=False)
  >>> mlayers_naip.update(visibility=False)
  >>> MapLayer.objects.filter(name='OpenStreetMap', map_id__in=maps_osm).update(visibility=True)
  >>> MapLayer.objects.filter(name='OpenStreetMap', map_id__in=maps_naip).update(visibility=True)

and, in order to remove all the MapQuest layers from existing maps::

  >>> MapLayer.objects.filter(name='osm').delete()
  >>> MapLayer.objects.filter(name='naip').delete()
