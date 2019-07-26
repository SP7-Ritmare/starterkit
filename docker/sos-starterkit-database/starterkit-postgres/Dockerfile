FROM mdillon/postgis:9.5
MAINTAINER Francesco Bartoli <francesco.bartoli@geobeyond.it>

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=sos

ADD sos_db_create.sql /docker-entrypoint-initdb.d/
RUN mkdir /dbsosdata \
    && chown -R postgres /dbsosdata

ENV PGDATA /dbsosdata
