# TODO : use python:2.7.13-alpine3.6 to make this lighter ( it is what we use for letsencryipt as well)
# But it seems it's not possible for now because alpine only has geos 3.6 which is not supported by django 1.8
# (probably because of https://code.djangoproject.com/ticket/28441)

FROM python:2.7.16-slim-stretch
MAINTAINER Starterkit development team

# Install system dependencies
RUN mkdir -p /usr/share/man/man1; mkdir -p /usr/share/man/man7
RUN echo "Updating apt-get" && \
        apt-get update && \
        echo "Installing build dependencies" && \
        apt-get install -y git gcc make libc-dev musl-dev libpcre3 libpcre3-dev g++ && \
        echo "Installing database dependencies" && \
        apt-get install -y postgresql-client libpq-dev sqlite3 && \
        echo "Installing Pillow dependencies" && \
        # RUN apt-get install -y NOTHING ?? It was probably added in other packages... ALPINE needed jpeg-dev zlib-dev && \
        echo "Installing GDAL dependencies" && \
        apt-get install -y libgeos-dev libgdal-dev && \
        echo "Installing Psycopg2 dependencies" && \
        # RUN apt-get install -y NOTHING ?? It was probably added in other packages... ALPINE needed postgresql-dev && \
        echo "Installing other dependencies" && \
        apt-get install -y libxml2-dev libxslt-dev gettext zip libmemcached-dev libsasl2-dev zlib1g-dev && \
        echo "Installing GeoIP dependencies" && \
        apt-get install -y geoip-bin geoip-database && \
        echo "Installing healthceck dependencies" && \
        apt-get install -y curl && \
        echo "Python server" && \
        pip install uwsgi && \
        echo "Removing build dependencies and cleaning up" && \
        # TODO : cleanup apt-get with something like apt-get -y --purge autoremove gcc make libc-dev musl-dev libpcre3 libpcre3-dev g++ && \
        rm -rf /var/lib/apt/lists/* && \
        rm -rf ~/.cache/pip

# Install python dependencies
RUN echo "Geonode python dependencies"
RUN pip install celery==4.1.0 # see https://github.com/GeoNode/geonode/pull/3714

RUN mkdir -p /usr/src/app
COPY . /usr/src/app/
WORKDIR /usr/src/app

RUN mkdir -p /var/log/uwsgi/app/
RUN touch /var/log/uwsgi/app/geosk.log

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
RUN pip install pip==20.1

# To understand the next section (the need for requirements.txt and setup.py)
# Please read: https://packaging.python.org/requirements/

# fix for known bug in system-wide packages
RUN ln -fs /usr/lib/python2.7/plat-x86_64-linux-gnu/_sysconfigdata*.py /usr/lib/python2.7/

# app-specific requirements
RUN pip install --upgrade --no-cache-dir --src /usr/src -r requirements.txt
RUN pip install --upgrade -e .

# Install pygdal (after requirements for numpy 1.16)
RUN pip install pygdal==$(gdal-config --version).*

ENTRYPOINT service cron restart && /usr/src/app/entrypoint.sh
