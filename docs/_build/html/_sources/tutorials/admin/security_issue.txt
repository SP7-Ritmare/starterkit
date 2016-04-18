.. _security_issue:

===============
Security issues
===============

Please customize these settings:

Changing DB password of “geonode” user
--------------------------------------

::
$ sudo -u postgres psql --command '\password geonode'

Edit the configuration file to reflect the changes
/etc/starterkit/local_settings.py
* DATABASE_PASSWORD

Changing 52 North SOS Transactional Security Token
---------------------------------------------------

http://demo1.get-it.it/observations/admin/datasource/settings
Edit the configuration file to reflect the changes
/etc/starterkit/local_settings.py
* TRANSACTIONAL_AUTHORIZATION_TOKEN

Keeping cryptography secure
----------------------------

/etc/starterkit/local_settings.py
* SECRET_KEY
