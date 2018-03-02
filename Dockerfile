FROM geonode/geonode:latest
MAINTAINER Starterkit development team

# WORKDIR /usr/src/
# RUN apt-get update \
#     && apt-get install -y gdal-bin \
#     && pip uninstall --yes geonode \
#     && git clone -b 2.7.x https://github.com/GeoNode/geonode \
#     && pip install -e geonode \
#     && pip install -r geonode/requirements.txt \
#     && pip install pygdal==1.10.1.3
#
#
# WORKDIR /usr/src/app/
RUN pip uninstall --yes geonode \
    && pip install git+https://github.com/GeoNode/geonode.git@2.7.x#egg=geonode
COPY requirements.txt /usr/src/app/
# see issue https://github.com/celery/celery/issues/3200
RUN pip install -r requirements.txt \
    && pip uninstall --yes billiard \
    && pip install git+https://github.com/celery/billiard.git#egg=billiard \
    && pip uninstall --yes kombu \
    && pip install git+https://github.com/celery/kombu.git#egg=kombu

# add bower and grunt command
ONBUILD COPY . /usr/src/app/
WORKDIR /usr/src/app/geosk/static
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get -y install nodejs git g++ pkg-config build-essential \
    && npm install -g bower grunt grunt-cli node-gyp \
    && npm install \
    && bower update --allow-root \
    && grunt \
    && npm uninstall -g bower grunt grunt-cli node-gyp \
    && apt-get -y purge nodejs \
    && apt-get -y autoremove --purge \
    && apt-get clean \
    && rm -rf /usr/lib/node_modules && rm -rf /root/.npm

WORKDIR /usr/src/app

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
