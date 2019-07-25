FROM python:2.7.16-stretch
MAINTAINER Starterkit development team

RUN mkdir -p /usr/src/app

# This section is borrowed from the official Django image but adds GDAL and others
RUN apt-get update && apt-get install -y \
		gcc \
		gettext \
		postgresql-client libpq-dev \
		sqlite3 \
        python-gdal python-psycopg2 \
        python-imaging python-lxml \
        python-dev libgdal-dev \
        python-ldap \
        libmemcached-dev libsasl2-dev zlib1g-dev \
        python-pylibmc \
        uwsgi uwsgi-plugin-python \
	--no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN GDAL_VERSION=`gdal-config --version` \
    && PYGDAL_VERSION="$(pip install pygdal==$GDAL_VERSION 2>&1 | grep -oP '(?<=: )(.*)(?=\))' | grep -oh $GDAL_VERSION\.[0-9])" \
    && pip install numpy==1.16.* \
    && pip install pygdal=="`gdal-config --version`.*"

# fix for known bug in system-wide packages
RUN ln -fs /usr/lib/python2.7/plat-x86_64-linux-gnu/_sysconfigdata*.py /usr/lib/python2.7/

RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list
RUN apt-get update && apt-get install -y geoip-bin

# add bower and grunt command
COPY . /usr/src/app/
WORKDIR /usr/src/app

RUN apt-get update && apt-get -y install cron
COPY monitoring-cron /etc/cron.d/monitoring-cron
RUN chmod 0644 /etc/cron.d/monitoring-cron
RUN crontab /etc/cron.d/monitoring-cron
RUN touch /var/log/cron.log
RUN service cron start

COPY wait-for-databases.sh /usr/bin/wait-for-databases
RUN chmod +x /usr/bin/wait-for-databases
RUN chmod +x /usr/src/app/tasks.py \
    && chmod +x /usr/src/app/entrypoint.sh

RUN mkdir -p /usr/src/app/geosk/uploaded
RUN mkdir -p /usr/src/app/geosk/static_root
RUN chmod -Rf 775 /usr/src/app/geosk/uploaded
RUN chmod -Rf 775 /usr/src/app/geosk/static_root

# Upgrade pip
RUN pip install pip --upgrade
RUN pip install --upgrade --no-cache-dir --src /usr/src -r requirements.txt
RUN pip install --upgrade -e .

ENTRYPOINT service cron restart && /usr/src/app/entrypoint.sh
