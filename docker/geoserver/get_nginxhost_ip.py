#!/usr/bin/env python3

import logging
import os

import docker

client = docker.from_env()
# print(client.info())
# TODO avoid this script can fail and fall in the loop where the geoserver
# service is not available and consequently the nginx too which has geoserver
# as a reference link
for network in client.networks.list():
    if 'geonode' in network.name:
        geonode_network = network.name
    else:
        geonode_network = 'geonode_default'

try:
    containers = {
        c.attrs['Config']['Image']: c.attrs['NetworkSettings']['\
Networks'][geonode_network]['\
IPAddress'] for c in client.containers.list() if c.status in 'running'
    }
    for item in containers.items():
        if "geonode/nginx" in item[0]:
            ipaddr = item[1]

    try:
        os.environ["NGINX_BASE_URL"] = f"http://{ipaddr}:80"
        nginx_base_url = f"http://{ipaddr}:80"
    except NameError as er:
        logging.info(f"NGINX container is not running maybe exited! Runningcontainers are:{containers}")
except KeyError as ke:
    logging.info(f"There has been a problem with the dockernetwork which has raised the following exception: {ke}")
else:
    # nginx_base_url = None
    pass
finally:
    try:
        print(nginx_base_url)
    except NameError as ne:
        print("http://geonode:80")
