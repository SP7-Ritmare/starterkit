FROM geonode/geonode:latest
MAINTAINER Starterkit development team

COPY requirements.txt /usr/src/app/
RUN pip install -r requirements.txt --no-deps

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
