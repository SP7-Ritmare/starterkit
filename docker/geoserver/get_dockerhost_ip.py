#!/usr/bin/env python

import logging

import docker

BOOTSTRAP_IMAGE_CHEIP = 'codenvy/che-ip:nightly'
# AF: why call before definition? print _docker_host_ip()


def _docker_host_ip():
    client = docker.from_env()
    ip_list = client.containers.run(BOOTSTRAP_IMAGE_CHEIP,
                                    network_mode='host'
                                    ).split("\n")
    if len(ip_list) > 1:
        logging.info(f"Docker daemon is running on more than one address {ip_list}")
        logging.info(f"Only the first address:{ip_list[0]} will be returned!")
    else:
        logging.info(f"Docker daemon is running at the following address {ip_list[0]}")
    return ip_list[0]
