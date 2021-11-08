.. _bing_maps_issue:

===============
Bing Maps Issue
===============

From 6th October 2015 the Bing Maps API that are used by default in every GET-IT/GeoNode map are not working anymore.

The effect is that every map cannot be zoomed properly.

In order to remove the dependence from the Bing Maps please follow these instructions:


Remove the references to Bing Maps
---------------------------------


**Remove the Big Maps from default configuration**


Edit the file /etc/starterkit/local_settings.py and comment the lines::

    "name":"naip",
    "group":"background",
    "visibility": False
  # }, {
  #   "source": {"ptype": "gxp_bingsource"},
  #   "name": "AerialWithLabels",
  #   "fixed": True,
  #   "visibility": False,
  #   "group":"background"
  },{
    "source": {"ptype": "gxp_mapboxsource"},
  },



**Remove the Bing Maps references from existing maps**

Launch the ipython console::

  $ sk shell_plus


and type the commands::

  >>> from geonode.maps.models import MapLayer
  >>> MapLayer.objects.filter(name=u'AerialWithLabels').delete()



Use an Bing Maps API key
-----------------------

Alternatively, you should  request your own API key for your site on https://www.bingmapsportal.com and configure properly the Big Maps base layer on /etc/starterkit/local_settings.py es::

  {
    "source": {"ptype": "gxp_bingsource"},
    "name": "AerialWithLabels",
    "fixed": True,
    "visibility": False,
    "group":"background",
    "apiKey": "BING-MAP-API-KEY"
  }
