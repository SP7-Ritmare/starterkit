import json
import logging
import os
import re
import datetime
import docker
import socket

from invoke import run, task

BOOTSTRAP_IMAGE_CHEIP = 'codenvy/che-ip:nightly'


@task
def waitfordbs(ctx):
    print "**************************databases*******************************"
    ctx.run("/usr/bin/wait-for-databases {0}".format('db'), pty=True)


@task
def waitforgeoserver(ctx):
    print "**************************geoserver*******************************"
    while not _rest_api_availability(os.environ['GEOSERVER_LOCATION'] + 'rest'):
        print ("Wait for GeoServer API availability...")
    print "GeoServer is available for HTTP calls!"


@task
def update(ctx):
    print "***************************initial*********************************"
    ctx.run("env", pty=True)
    pub_ip = _geonode_public_host_ip()
    print "Public Hostname or IP is {0}".format(pub_ip)
    pub_port = _geonode_public_port()
    print "Public PORT is {0}".format(pub_port)
    db_url = _update_db_connstring()
    geodb_url = _update_geodb_connstring()
    envs = {
        "public_fqdn": "{0}:{1}".format(pub_ip, pub_port),
        "public_host": "{0}".format(pub_ip),
        "dburl": db_url,
        "geodburl": geodb_url,
        "override_fn": "$HOME/.override_env"
    }
    ctx.run("echo export GEOSERVER_PUBLIC_LOCATION=\
http://{public_fqdn}/geoserver/ >> {override_fn}".format(**envs), pty=True)
    ctx.run("echo export SITEURL=\
http://{public_fqdn}/ >> {override_fn}".format(**envs), pty=True)
    ctx.run("echo export ALLOWED_HOSTS=\
\"\\\"['{public_fqdn}', '{public_host}', 'django', 'geonode',]\\\"\" \
>> {override_fn}".format(**envs), pty=True)
    ctx.run("echo export DATABASE_URL=\
{dburl} >> {override_fn}".format(**envs), pty=True)
    ctx.run("echo export GEODATABASE_URL=\
{geodburl} >> {override_fn}".format(**envs), pty=True)
    ctx.run("echo export PYCSW=\
\"\\\"{0}\\\"\" >> {override_fn}".format(
            _pycsw_info_provision(),
            **envs
        )
    )
    ctx.run("source $HOME/.override_env", pty=True)
    print "****************************final**********************************"
    ctx.run("env", pty=True)


# see issue https://github.com/celery/celery/issues/3200
# @task
# def workaround(ctx):
#     print "**************************workaround*******************************"
#     ctx.run("pip uninstall --yes geonode", pty=True)
#     ctx.run("pip install \
# git+https://github.com/GeoNode/geonode.git@2.7.x#egg=geonode", pty=True)
#     ctx.run("pip uninstall --yes billiard", pty=True)
#     ctx.run("pip install \
# git+https://github.com/celery/billiard.git#egg=billiard", pty=True)
#     ctx.run("pip uninstall --yes kombu", pty=True)
#     ctx.run("pip install \
# git+https://github.com/celery/kombu.git#egg=kombu", pty=True)


@task
def migrations(ctx):
    print "**************************migrations*******************************"
    ctx.run("django-admin.py makemigrations --settings={0}".format(
        "geonode.settings"
    ), pty=True)
    ctx.run("django-admin.py migrate --noinput --settings={0}".format(
        "geonode.settings"
    ), pty=True)
    ctx.run("django-admin.py makemigrations --settings={0}".format(
        _localsettings()
    ), pty=True)
    ctx.run("django-admin.py migrate --noinput --settings={0}".format(
        _localsettings()
    ), pty=True)


@task
def prepare(ctx):
    print "**********************prepare fixture***************************"
    ctx.run("rm -rf /tmp/default_oauth_apps_docker.json", pty=True)
    _prepare_oauth_fixture()
    ctx.run("rm -rf /tmp/mdtools_services_metadata_docker.json", pty=True)
    _prepare_service_metadata_fixture()
    ctx.run("rm -rf /tmp/sites_docker.json", pty=True)
    _prepare_site_fixture()
    ctx.run("rm -rf /tmp/apikey_docker.json", pty=True)
    _prepare_apikey_fixture()
    ctx.run("rm -rf /tmp/default_monitoring_apps_docker.json", pty=True)
    _prepare_monitoring_fixture()


@task
def fixtures(ctx):
    print "**************************fixtures********************************"
    ctx.run("django-admin.py loaddata sample_admin \
--settings={0}".format("geonode.settings"), pty=True)
    ctx.run("django-admin.py loaddata /tmp/default_oauth_apps_docker.json \
--settings={0}".format("geonode.settings"), pty=True)
    ctx.run("django-admin.py loaddata initial_data.json \
--settings={0}".format("geonode.settings"), pty=True)
    ctx.run("django-admin.py loaddata /tmp/sites_docker.json \
--settings={0}".format("geosk.settings"), pty=True)
    ctx.run("django-admin.py loaddata /tmp/mdtools_services_metadata_docker.json \
--settings={0}".format("geosk.settings"), pty=True)
    ctx.run("django-admin.py loaddata /tmp/apikey_docker.json \
--settings={0}".format("geosk.settings"), pty=True)
    ctx.run("django-admin.py loaddata /tmp/default_monitoring_apps_docker.json \
--settings={0}".format("geosk.settings"), pty=True)


@task
def collectstatic(ctx):
    print "**************************fixtures********************************"
    ctx.run("django-admin.py collectstatic \
--settings={0}".format("geosk.settings"), pty=True)


@task
def geoserverfixture(ctx):
    print "*****************geoserver fixture********************************"
    _geoserver_info_provision(os.environ['GEOSERVER_LOCATION'] + "rest/")


@task
def updategeoip(ctx):
    print "**************************update geoip********************************"
    ctx.run("django-admin.py updategeoip \
    --settings={0}".format("geosk.settings"), pty=True)


@task
def collectmetrics(ctx):
    print "************************collect metrics******************************"
    ctx.run("python -W ignore manage.py collect_metrics  \
    --settings={0} -n -t xml".format("geosk.settings"), pty=True)


def _docker_host_ip():
    client = docker.from_env()
    ip_list = client.containers.run(BOOTSTRAP_IMAGE_CHEIP,
                                    network_mode='host'
                                    ).split("\n")
    if len(ip_list) > 1:
        print("Docker daemon is running on more than one \
address {0}".format(ip_list))
        print("Only the first address:{0} will be returned!".format(
            ip_list[0]
        ))
    else:
        print("Docker daemon is running at the following \
address {0}".format(ip_list[0]))
    return ip_list[0]


def _container_exposed_port(component, instname):
    client = docker.from_env()
    ports_dict = json.dumps(
        [c.attrs['Config']['ExposedPorts'] for c in client.containers.list(
            filters={
                'label': 'org.geonode.component={0}'.format(component),
                'status': 'running'
            }
        ) if '{0}'.format(instname) in c.name][0]
    )
    for key in json.loads(ports_dict):
        port = re.split('/tcp', key)[0]
    return port


def _update_db_connstring():
    user = os.getenv('GEONODE_DATABASE', 'geonode')
    pwd = os.getenv('GEONODE_DATABASE_PASSWORD', 'geonode')
    dbname = os.getenv('GEONODE_DATABASE', 'geonode')
    connstr = 'postgres://{0}:{1}@db:5432/{2}'.format(
        user,
        pwd,
        dbname
    )
    return connstr


def _update_geodb_connstring():
    geouser = os.getenv('GEONODE_GEODATABASE', 'geonode_data')
    geopwd = os.getenv('GEONODE_GEODATABASE_PASSWORD', 'geonode_data')
    geodbname = os.getenv('GEONODE_GEODATABASE', 'geonode_data')
    geoconnstr = 'postgis://{0}:{1}@db:5432/{2}'.format(
        geouser,
        geopwd,
        geodbname
    )
    return geoconnstr


def _localsettings():
    settings = os.getenv('DJANGO_SETTINGS_MODULE', 'geosk.settings')
    return settings


def _geonode_public_host_ip():
    gn_pub_hostip = os.getenv('GEONODE_LB_HOST_IP', '')
    if not gn_pub_hostip:
        gn_pub_hostip = _docker_host_ip()
    return gn_pub_hostip


def _geonode_public_port():
    gn_pub_port = os.getenv('GEONODE_LB_PORT', '')
    if not gn_pub_port:
        gn_pub_port = _container_exposed_port(
            'nginx',
            os.getenv('GEONODE_INSTANCE_NAME', 'starterkit')
        )
    return gn_pub_port


def _prepare_oauth_fixture():
    pub_ip = _geonode_public_host_ip()
    print "Public Hostname or IP is {0}".format(pub_ip)
    pub_port = _geonode_public_port()
    print "Public PORT is {0}".format(pub_port)
    default_fixture = [
        {
            "model": "oauth2_provider.application",
            "pk": 1001,
            "fields": {
                "skip_authorization": True,
                "redirect_uris": "http://{0}:{1}/geoserver/index.html".format(
                    pub_ip, pub_port
                ),
                "name": "GeoServer",
                "authorization_grant_type": "authorization-code",
                "client_type": "confidential",
                "client_id": "Jrchz2oPY3akmzndmgUTYrs9gczlgoV20YPSvqaV",
                "client_secret": "\
rCnp5txobUo83EpQEblM8fVj3QT5zb5qRfxNsuPzCqZaiRyIoxM4jdgMiZKFfePBHYXCLd7B8NlkfDB\
Y9HKeIQPcy5Cp08KQNpRHQbjpLItDHv12GvkSeXp6OxaUETv3",
                "user": [
                    "admin"
                ]
            }
        }
    ]
    with open('/tmp/default_oauth_apps_docker.json', 'w') as fixturefile:
        json.dump(default_fixture, fixturefile)


def _prepare_service_metadata_fixture():
    pub_ip = _geonode_public_host_ip()
    print "Public Hostname or IP is {0}".format(pub_ip)
    pub_port = _geonode_public_port()
    print "Public PORT is {0}".format(pub_port)
    contact_country = os.getenv("SERVICEPROVIDER_COUNTRY", "")
    print "contact_country is {0}".format(contact_country)
    provider_url = os.getenv("SERVICEPROVIDER_SITE", "")
    print "provider_url is {0}".format(provider_url)
    contact_role = os.getenv("SERVICEPROVIDER_INDIVIDUALNAME", "")
    print "contact_role is {0}".format(contact_role)
    contact_city = os.getenv("SERVICEPROVIDER_CITY", "")
    print "contact_city is {0}".format(contact_city)
    contact_instructions = os.getenv("SERVICEPROVIDER_INSTRUCTIONS", "")
    print "contact_instructions is {0}".format(contact_instructions)
    contact_position = os.getenv("SERVICEPROVIDER_POSITIONNAME", "")
    print "contact_position is {0}".format(contact_position)
    contact_fax = os.getenv("SERVICEPROVIDER_FAX", "")
    print "contact_fax is {0}".format(contact_fax)
    node_title = os.getenv("SERVICEPROVIDER_NODETITLE", "")
    print "node_title is {0}".format(node_title)
    contact_hours = os.getenv("SERVICEPROVIDER_HOURS", "")
    print "contact_hours is {0}".format(contact_hours)
    node_name = os.getenv("SERVICEPROVIDER_NODENAME", "")
    print "node_name is {0}".format(node_name)
    node_abstract = os.getenv("SERVICEPROVIDER_NODEABSTRACT", "")
    print "node_abstract is {0}".format(node_abstract)
    contact_address = os.getenv("SERVICEPROVIDER_ADDRESS", "")
    print "contact_address is {0}".format(contact_address)
    contact_email = os.getenv("SERVICEPROVIDER_EMAIL", "")
    print "contact_email is {0}".format(contact_email)
    contact_url = os.getenv("SERVICEPROVIDER_SITE", "")
    print "contact_url is {0}".format(contact_url)
    contact_stateprovince = os.getenv("SERVICEPROVIDER_STATEPROVINCE", "")
    print "contact_stateprovince is {0}".format(contact_stateprovince)
    provider_name = os.getenv("SERVICEPROVIDER_NAME", "")
    print "provider_name is {0}".format(provider_name)
    contact_postalcode = os.getenv("SERVICEPROVIDER_POSTALCODE", "")
    print "contact_postalcode is {0}".format(contact_postalcode)
    contact_phone = os.getenv("SERVICEPROVIDER_PHONE", "")
    print "contact_phone is {0}".format(contact_phone)
    contact_name = os.getenv("SERVICEPROVIDER_NAME", "")
    print "contact_name is {0}".format(contact_name)
    node_keywords = os.getenv("SERVICEPROVIDER_NODEKEYWORDS", "")
    print "node_keywords is {0}".format(node_keywords)

    d = datetime.datetime.now()
    mdext_date = d.isoformat()[:23] + "Z"
    default_fixture = [
        {
            "fields": {
                "contact_country": contact_country,
                "provider_url": provider_url,
                "contact_role": contact_role,
                "contact_city": contact_city,
                "contact_instructions": contact_instructions,
                "contact_position": contact_position,
                "contact_fax": contact_fax,
                "node_title": node_title,
                "contact_hours": contact_hours,
                "node_name": node_name,
                "node_abstract": node_abstract,
                "contact_address": contact_address,
                "contact_email": contact_email,
                "contact_url": contact_url,
                "contact_stateprovince": contact_stateprovince,
                "provider_name": provider_name,
                "contact_postalcode": contact_postalcode,
                "contact_phone": contact_phone,
                "contact_name": contact_name,
                "node_keywords": node_keywords
            },
            "model": "mdtools.servicesmetadata",
            "pk": 1
        }
    ]
    with open(
        '/tmp/mdtools_services_metadata_docker.json',
        'w'
    ) as fixturefile:
        json.dump(default_fixture, fixturefile)


def _prepare_site_fixture():
    domain = _geonode_public_host_ip()
    print "Public domain is {0}".format(domain)
    port = _geonode_public_port()
    print "Public port is {0}".format(port)
    default_fixture = [
        {
            "fields": {
                "domain": domain,
                "name": domain
            },
            "model": "sites.site",
            "pk": 1
        }
    ]
    with open(
        '/tmp/sites_docker.json',
        'w'
    ) as fixturefile:
        json.dump(default_fixture, fixturefile)


def _prepare_apikey_fixture():
    api_key = os.getenv(
        "TASTYPIE_APIKEY",
        "pyxW5djJ7XsjeFUXduAsGpR4xMGUwpeBGQRqTeT3"
    )
    print "Tastypie apikey is {0}".format(api_key)
    default_fixture = [
        {
            "fields": {
                "user": 1000,
                "key": api_key,
                "created": "2018-06-28T14:54:51Z"
            },
            "model": "tastypie.apikey",
            "pk": 1
        }
    ]
    with open(
        '/tmp/apikey_docker.json',
        'w'
    ) as fixturefile:
        json.dump(default_fixture, fixturefile)


def _rest_api_availability(url):
    import requests
    try:
        r = response = requests.request('get', url)
        r.raise_for_status()  # Raises a HTTPError if the status is 4xx, 5xxx

    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
        print "GeoServer connection error is {0}".format(e)
        return False
    except requests.exceptions.HTTPError as er:
        print "GeoServer HTTP error is {0}".format(er)
        return False
    else:
        print "GeoServer API are available!"
        return True


def _geoserver_info_provision(url):
    from geoserver.catalog import Catalog
    from geosk.mdtools.geoserver_extra import Settings
    cat = Catalog(url,
        username="admin",
        password="geoserver"
    )
    gs_settings = Settings(cat)
    print "GeoServer service url is {0}".format(cat.service_url)
    contact_country = os.getenv("SERVICEPROVIDER_COUNTRY", "")
    print "contact_country is {0}".format(contact_country)
    provider_url = os.getenv("SERVICEPROVIDER_SITE", "")
    print "provider_url is {0}".format(provider_url)
    contact_role = os.getenv("SERVICEPROVIDER_INDIVIDUALNAME", "")
    print "contact_role is {0}".format(contact_role)
    contact_city = os.getenv("SERVICEPROVIDER_CITY", "")
    print "contact_city is {0}".format(contact_city)
    contact_instructions = os.getenv("SERVICEPROVIDER_INSTRUCTIONS", "")
    print "contact_instructions is {0}".format(contact_instructions)
    contact_position = os.getenv("SERVICEPROVIDER_POSITIONNAME", "")
    print "contact_position is {0}".format(contact_position)
    contact_fax = os.getenv("SERVICEPROVIDER_FAX", "")
    print "contact_fax is {0}".format(contact_fax)
    node_title = os.getenv("SERVICEPROVIDER_NODETITLE", "")
    print "node_title is {0}".format(node_title)
    contact_hours = os.getenv("SERVICEPROVIDER_HOURS", "")
    print "contact_hours is {0}".format(contact_hours)
    node_name = os.getenv("SERVICEPROVIDER_NODENAME", "")
    print "node_name is {0}".format(node_name)
    node_abstract = os.getenv("SERVICEPROVIDER_NODEABSTRACT", "")
    print "node_abstract is {0}".format(node_abstract)
    contact_address = os.getenv("SERVICEPROVIDER_ADDRESS", "")
    print "contact_address is {0}".format(contact_address)
    contact_email = os.getenv("SERVICEPROVIDER_EMAIL", "")
    print "contact_email is {0}".format(contact_email)
    contact_url = os.getenv("SERVICEPROVIDER_SITE", "")
    print "contact_url is {0}".format(contact_url)
    contact_stateprovince = os.getenv("SERVICEPROVIDER_STATEPROVINCE", "")
    print "contact_stateprovince is {0}".format(contact_stateprovince)
    provider_name = os.getenv("SERVICEPROVIDER_NAME", "")
    print "provider_name is {0}".format(provider_name)
    contact_postalcode = os.getenv("SERVICEPROVIDER_POSTALCODE", "")
    print "contact_postalcode is {0}".format(contact_postalcode)
    contact_phone = os.getenv("SERVICEPROVIDER_PHONE", "")
    print "contact_phone is {0}".format(contact_phone)
    contact_name = os.getenv("SERVICEPROVIDER_NAME", "")
    print "contact_name is {0}".format(contact_name)
    node_keywords = os.getenv("SERVICEPROVIDER_NODEKEYWORDS", "")
    print "node_keywords is {0}".format(node_keywords)
    contact = {
        "contact": {
            "address": contact_address,
            "addressCity": contact_city,
            "addressCountry": contact_country,
            "addressPostalCode": contact_postalcode,
            "addressState": contact_stateprovince,
            "addressType": None,
            "contactEmail": contact_email,
            "contactFacsimile": contact_fax,
            "contactOrganization": provider_name,
            "contactPerson": contact_name,
            "contactPosition": contact_position,
            "contactVoice": contact_phone
        }
    }

    def get_service_json(service):
        # get current values
        service_base = gs_settings.get_service_config(service)
        service_base[service]['name'] = "{0} - {1}".format(
            node_name,
            service
        )
        service_base[service]['title'] = "{0} - {1}".format(
            node_title,
            service
        )
        service_base[service]['maintainer'] = provider_url if provider_url is not None and provider_url else os.environ['SITEURL']
        service_base[service]['abstrct'] = node_abstract if node_abstract is not None else '-'
        service_base[service]['onlineResource'] = os.environ['SITEURL']
        return service_base

    gs_settings.update_contact(contact)
    gs_settings.update_service('wms', get_service_json('wms'))
    gs_settings.update_service('wfs', get_service_json('wfs'))
    gs_settings.update_service('wcs', get_service_json('wcs'))

def _pycsw_info_provision():
    node_title = os.getenv("SERVICEPROVIDER_NODETITLE", "")
    print "node_title is {0}".format(node_title)
    node_abstract = os.getenv("SERVICEPROVIDER_NODEABSTRACT", "")
    print "node_abstract is {0}".format(node_abstract)
    provider_name = os.getenv("SERVICEPROVIDER_NAME", "")
    print "provider_name is {0}".format(provider_name)
    provider_url = os.getenv("SERVICEPROVIDER_SITE", "")
    print "provider_url is {0}".format(provider_url)
    contact_name = os.getenv("SERVICEPROVIDER_NAME", "")
    print "contact_name is {0}".format(contact_name)
    contact_position = os.getenv("SERVICEPROVIDER_POSITIONNAME", "")
    print "contact_position is {0}".format(contact_position)
    contact_address = os.getenv("SERVICEPROVIDER_ADDRESS", "")
    print "contact_address is {0}".format(contact_address)
    contact_city = os.getenv("SERVICEPROVIDER_CITY", "")
    print "contact_city is {0}".format(contact_city)
    contact_stateprovince = os.getenv("SERVICEPROVIDER_STATEPROVINCE", "")
    print "contact_stateprovince is {0}".format(contact_stateprovince)
    contact_postalcode = os.getenv("SERVICEPROVIDER_POSTALCODE", "")
    print "contact_postalcode is {0}".format(contact_postalcode)
    contact_country = os.getenv("SERVICEPROVIDER_COUNTRY", "")
    print "contact_country is {0}".format(contact_country)
    contact_phone = os.getenv("SERVICEPROVIDER_PHONE", "")
    print "contact_phone is {0}".format(contact_phone)
    contact_fax = os.getenv("SERVICEPROVIDER_FAX", "")
    print "contact_fax is {0}".format(contact_fax)
    contact_email = os.getenv("SERVICEPROVIDER_EMAIL", "")
    print "contact_email is {0}".format(contact_email)
    contact_url = os.getenv("SERVICEPROVIDER_SITE", "")
    print "contact_url is {0}".format(contact_url)
    contact_hours = os.getenv("SERVICEPROVIDER_HOURS", "")
    print "contact_hours is {0}".format(contact_hours)
    contact_instructions = os.getenv("SERVICEPROVIDER_INSTRUCTIONS", "")
    print "contact_instructions is {0}".format(contact_instructions)
    contact_role = os.getenv("SERVICEPROVIDER_INDIVIDUALNAME", "")
    print "contact_role is {0}".format(contact_role)
    PYCSW = {
        # pycsw configuration
        'CONFIGURATION': {
            'metadata:main': {
                'identification_title': "{0} - Catalog ".format(node_title),
                'identification_abstract': node_abstract,
                'identification_keywords': 'sdi,catalogue,discovery,metadata,GeoNode',  # TODO
                'identification_keywords_type': 'theme',
                'identification_fees': 'None',  # TODO
                'identification_accessconstraints': 'None',  # TODO
                'provider_name': provider_name,
                'provider_url': provider_url,
                'contact_name': contact_name,
                'contact_position': contact_position,
                'contact_address': contact_address,
                'contact_city': contact_city,
                'contact_stateorprovince': contact_stateprovince,
                'contact_postalcode': contact_postalcode,
                'contact_country': contact_country,
                'contact_phone': contact_phone,
                'contact_fax': contact_fax,
                'contact_email': contact_email,
                'contact_url': contact_url,
                'contact_hours': contact_hours,
                'contact_instructions': contact_instructions,
                'contact_role': contact_role,
            },
            'metadata:inspire': {
                'enabled': 'true',
                'languages_supported': 'it,eng',
                'default_language': 'it',
                'date': 'YYYY-MM-DD',
                'gemet_keywords': 'Utility and governmental services',
                'conformity_service': 'notEvaluated',
                'contact_name': 'Organization Name',
                'contact_email': 'Email Address',
                'temp_extent': 'YYYY-MM-DD/YYYY-MM-DD',
            }
        }
    }
    return PYCSW

def _prepare_monitoring_fixture():
    pub_ip = _geonode_public_host_ip()
    print "Public Hostname or IP is {0}".format(pub_ip)
    pub_port = _geonode_public_port()
    print "Public PORT is {0}".format(pub_port)
    default_fixture = [
        {
            "fields": {
                "active": True,
                "ip": "{0}".format(
                    socket.gethostbyname('geonode')
                ),
                "name": "geonode"
            },
            "model": "monitoring.host",
            "pk": 1
        },
        {
            "fields": {
                "name": "local-geonode",
                "url": "",
                "notes": "",
                "last_check": None,
                "active": True,
                "host": 1,
                "check_interval": "00:01:00",
                "service_type": 1
            },
            "model": "monitoring.service",
            "pk": 1
        },
        {
            "fields": {
                "name": "local-system-geonode",
                "url": "http://geonode:80/",
                "notes": "",
                "last_check": None,
                "active": True,
                "host": 1,
                "check_interval": "00:01:00",
                "service_type": 3
            },
            "model": "monitoring.service",
            "pk": 2
        },
        {
            "fields": {
                "name": "local-geoserver",
                "url": "http://geonode:80/geoserver/",
                "notes": "",
                "last_check": None,
                "active": True,
                "host": 1,
                "check_interval": "00:01:00",
                "service_type": 2
            },
            "model": "monitoring.service",
            "pk": 3
        }
    ]
    with open('/tmp/default_monitoring_apps_docker.json', 'w') as fixturefile:
        json.dump(default_fixture, fixturefile)