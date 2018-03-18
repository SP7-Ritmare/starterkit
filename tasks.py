import json
import logging
import os
import re
import datetime
import docker

from invoke import run, task

BOOTSTRAP_IMAGE_CHEIP = 'codenvy/che-ip:nightly'


@task
def waitfordbs(ctx):
    print "**************************databases*******************************"
    ctx.run("/usr/bin/wait-for-databases {0}".format('db'), pty=True)


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
                "redirect_uris": "http://{0}:{1}/geoserver".format(
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
