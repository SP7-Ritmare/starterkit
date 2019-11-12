import json
import logging
import os
import re

import docker

import dataset
import bcrypt
from invoke import run, task

BOOTSTRAP_IMAGE_CHEIP = "codenvy/che-ip:nightly"


@task
def update(ctx):
    print "***************************initial*********************************"
    ctx.run("env", pty=True)
    pub_ip = _geonode_public_host_ip()
    print "Public Hostname or IP is {0}".format(pub_ip)
    pub_port = _geonode_public_port()
    print "Public PORT is {0}".format(pub_port)
    adminsos_pwd = _sos_admin_pwd(
        os.getenv(
            "SOS_ADMIN_PASSWORD",
            "password"
        )
    )
    print "Admin SOS password bcrypt hashed is {0}".format(adminsos_pwd)
    envs = {
        "public_schema": "https" if pub_port == 443 else "http",
        "public_fqdn": "{0}".format(pub_ip),
        "public_host": "{0}".format(pub_ip),
        "hashed_pwd": "{0}".format(adminsos_pwd),
        "override_fn": "$HOME/.override_env"
    }
    ctx.run("echo export GEOSERVER_PUBLIC_LOCATION=\
{public_schema}://{public_fqdn}/geoserver/ >> {override_fn}".format(**envs), pty=True)
    ctx.run("echo export SERVICE_SOSURL=\
{public_schema}://{public_fqdn}/observations/sos >> {override_fn}".format(
        **envs
    ), pty=True)
    # ctx.run("echo export SOS_ADMIN_PASSWORD='{hashed_pwd}' >> {override_fn}".format(
    #     **envs
    # ), pty=True)


@task
def updatedb(ctx):
    print "********************update configuration*************************"
    ctx.run("cp -rup $CATALINA_HOME/webapps/observations/configuration.db \
$CATALINA_HOME/webapps/observations/configuration.db.backup", pty=True)
    _prepare_configuration_database()


@task
def updatedbsos(ctx):
    ctx.run("PGPASSWORD=postgres PGCLIENTENCODING=utf-8 psql --host=dbsos \
--port=5432 --username=postgres --dbname=sos \
-f /usr/local/tomcat/webapps/observations/sql/PostgreSQL/series/PG_script_drop.sql", pty=True)
    ctx.run("PGPASSWORD=postgres PGCLIENTENCODING=utf-8 psql --host=dbsos \
--port=5432 --username=postgres --dbname=sos \
-f /usr/local/tomcat/webapps/observations/sql/PostgreSQL/series/PG_script_create.sql", pty=True)
#     ctx.run("PGPASSWORD=postgres PGCLIENTENCODING=utf-8 psql --host=dbsos \
# --port=5432 --username=postgres --dbname=sos \
# -f /usr/local/tomcat/webapps/observations/sql/PostgreSQL/series/PG_update_43_44.sql", pty=True)
    ctx.run("PGPASSWORD=postgres psql --host=dbsos --port=5432 \
--username=postgres --dbname=sos -c \
'ALTER TABLE featureofinterest ALTER hibernatediscriminator TYPE character varying(255)'", pty=True)
    ctx.run("PGPASSWORD=postgres psql --host=dbsos --port=5432 \
--username=postgres --dbname=sos -c \
'ALTER TABLE featureofinterest ALTER hibernatediscriminator DROP NOT NULL'", pty=True)
    ctx.run("PGPASSWORD=postgres psql --host=dbsos --port=5432 \
--username=postgres --dbname=sos -c \
'UPDATE featureofinterest SET hibernatediscriminator=null'", pty=True)
#    ctx.run("PGPASSWORD=postgres PGCLIENTENCODING=utf-8 psql --host=dbsos \
# --port=5432 --username=postgres --dbname=sos \
# -f /usr/local/tomcat/webapps/observations/sql/PostgreSQL/series/PG_script_create.sql", pty=True)
#    ctx.run("PGPASSWORD=postgres psql -v ON_ERROR_STOP=1 --host=dbsos \
# --port=5432 --username=postgres --dbname=sos << -EOSQL\
# ALTER TABLE featureofinterest ALTER hibernatediscriminator TYPE character varying(255)\
# ALTER TABLE featureofinterest ALTER hibernatediscriminator DROP NOT NULL\
# UPDATE featureofinterest SET hibernatediscriminator=null\
# EOSQL", pty=True)


def _docker_host_ip():
    client = docker.from_env()
    ip_list = client.containers.run(BOOTSTRAP_IMAGE_CHEIP,
                                    network_mode="host"
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
        [c.attrs["Config"]["ExposedPorts"] for c in client.containers.list(
            filters={
                "label": "org.geonode.component={0}".format(component),
                "status": "running"
            }
        ) if "{0}".format(instname) in c.name][0]
    )
    for key in json.loads(ports_dict):
        port = re.split("/tcp", key)[0]
    return port


def _geonode_public_host_ip():
    gn_pub_hostip = os.getenv("GEONODE_LB_HOST_IP", "localhost")
    if not gn_pub_hostip:
        gn_pub_hostip = _docker_host_ip()
    return gn_pub_hostip


def _geonode_public_port():
    gn_pub_port = os.getenv("GEONODE_LB_PORT", 80)
    if not gn_pub_port:
        gn_pub_port = _container_exposed_port(
            "nginx",
            os.getenv("GEONODE_INSTANCE_NAME", "starterkit")
        )
    return int(gn_pub_port)


def _sos_admin_pwd(pwd):
    hashed = bcrypt.hashpw(pwd, bcrypt.gensalt(rounds=10, prefix=b"2a"))
    if bcrypt.checkpw(pwd, hashed):
        print("Initial input password {0} matches!").format(pwd)
        return hashed
    else:
        print("Initial input password {0} Does not Match :(").format(pwd)
        raise EnvironmentError


def _str2int(string):
    if string in "1":
        return 1
    elif string in "0":
        return 0
    else:
        raise ValueError


def _prepare_dict_identifiers():

    pub_ip = _geonode_public_host_ip()
    print "Public Hostname or IP is {0}".format(pub_ip)
    pub_port = _geonode_public_port()
    print "Public PORT is {0}".format(pub_port)
    updated_pwd = _sos_admin_pwd(
        os.getenv(
            "SOS_ADMIN_PASSWORD",
            "password"
        )
    )
    print "SOS Admin password is {0}".format(updated_pwd)

    default_administrator_user = {
        "id": 1,
        "username": os.getenv("SOS_ADMIN_USERNAME", "admin"),
        "password": updated_pwd
    }

    string_settings_identifiers = {
        "serviceProvider.phone": os.getenv(
            "SERVICEPROVIDER_PHONE",
            "na"
        ),
        "serviceProvider.city": os.getenv(
            "SERVICEPROVIDER_CITY",
            "na"
        ),
        "serviceProvider.state": os.getenv(
            "SERVICEPROVIDER_STATE",
            "na"
        ),
        "serviceProvider.postalCode": os.getenv(
            "SERVICEPROVIDER_POSTALCODE",
            "na"
        ),
        "serviceProvider.country": os.getenv(
            "SERVICEPROVIDER_COUNTRY",
            "na"
        ),
        "serviceProvider.name": os.getenv(
            "SERVICEPROVIDER_NAME",
            "na"
        ),
        "serviceProvider.individualName": os.getenv(
            "SERVICEPROVIDER_INDIVIDUALNAME",
            "na"
        ),
        "serviceProvider.positionName": os.getenv(
            "SERVICEPROVIDER_POSITIONNAME",
            "na"
        ),
        "serviceProvider.address": os.getenv(
            "SERVICEPROVIDER_ADDRESS",
            "na"
        ),
        "inspire.namespace": os.getenv(
            "SERVICEPROVIDER_NAMESPACE",
            "na"
        ),
        "serviceProvider.email": os.getenv(
            "SERVICEPROVIDER_EMAIL",
            "na"
        ),
        "misc.defaultOfferingPrefix": os.getenv(
            "MISC_DEFAULTOFFERINGPREFIX",
            "offering:"
        ),
        "service.transactionalToken": os.getenv(
            "SOS_TRANSACTIONAL_AUTHORIZATION_TOKEN",
            "changeme"
        ),
        "service.transactionalAllowedIps": os.getenv(
            "TRANSACTIONAL_ALLOWED_IPS",
            "127.0.0.1"
        ),
        "service.transactionalAllowedProxies": os.getenv(
            "TRANSACTIONAL_ALLOWED_PROXIES",
            "127.0.0.1"
        )
    }

    uri_settings_identifiers = {
        "service.sosUrl": os.getenv(
            "SERVICE_SOSURL", "na"
        ),
        "serviceProvider.site": os.getenv(
            "SERVICEPROVIDER_SITE", "na"
        ),
        "inspire.metadataUrl.url": os.getenv(
            "INSPIRE_METADATA_URL", "na"
        )
    }

    boolean_settings_identifiers = {
        "service.security.transactional.active": _str2int(
            os.getenv(
                "SOS_TRANSACTIONAL_AUTHORIZATION_TOKEN_ACTIVE", 1
            )
        )
    }

    multilingual_string_settings_values_identifiers_it = {
        "serviceIdentification.abstract": os.getenv(
            "SERVICEIDENTIFICATION_ABSTRACT_IT", ""
        ),
        "serviceIdentification.title": os.getenv(
            "SERVICEIDENTIFICATION_TITLE_IT", ""
        )
    }

    multilingual_string_settings_values_identifiers_en = {
        "serviceIdentification.abstract": os.getenv(
            "SERVICEIDENTIFICATION_ABSTRACT_EN", ""
        ),
        "serviceIdentification.title": os.getenv(
            "SERVICEIDENTIFICATION_TITLE_EN", ""
        )
    }

    return string_settings_identifiers, uri_settings_identifiers, boolean_settings_identifiers, default_administrator_user, multilingual_string_settings_values_identifiers_it, multilingual_string_settings_values_identifiers_en


def _prepare_configuration_database():
    string, uri, boolean, default_admin, multilingualstring_it, multilingualstring_en = _prepare_dict_identifiers()

    try:
        db = dataset.connect(
            'sqlite:///' + os.path.join(
                os.path.join(
                    os.environ['CATALINA_HOME'],
                    'webapps/observations'
                ),
                'configuration.db'
            )
        )
        tb_administrator_user = db['administrator_user']
        # treat strings dict as tuple to filter and update records
        admin_update = default_admin
        tb_administrator_user.update(
            admin_update,
            ['id']
        )

        tb_string_settings = db['string_settings']
        # treat string dict as tuple to filter and update records
        for item_string in string.items():
            tb_string_settings.update(
                dict(
                    identifier=item_string[0],
                    value=item_string[1]
                ),
                ['identifier']
            )

        tb_uri_settings = db['uri_settings']
        # treat uri dict as tuple to filter and update records
        for item_uri in uri.items():
            tb_uri_settings.update(
                dict(
                    identifier=item_uri[0],
                    value=item_uri[1]
                ),
                ['identifier']
            )

        tb_boolean_settings = db['boolean_settings']
        # treat boolean dict as tuple to filter and update records
        for item_boolean in boolean.items():
            tb_boolean_settings.update(
                dict(
                    identifier=item_boolean[0],
                    value=item_boolean[1]
                ),
                ['identifier']
            )

        tb_multilingual_string_settings_values = db['multilingual_string_settings_values']
        # treat multilingual string dict as tuple to filter and update records
        for item_it in multilingualstring_it.items():
            tb_multilingual_string_settings_values.update(
                dict(
                    identifier=item_it[0],
                    value=item_it[1],
                    lang="ita"
                ),
                ['identifier', 'lang']
            )
        for item_en in multilingualstring_en.items():
            tb_multilingual_string_settings_values.update(
                dict(
                    identifier=item_en[0],
                    value=item_en[1],
                    lang="eng"
                ),
                ['identifier', 'lang']
            )

    except OperationalError as e:
        raise
