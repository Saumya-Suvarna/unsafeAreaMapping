FROM tiangolo/uwsgi-nginx-flask:python3.6

ENV GEOS_VERSION 3.6.1
# Install geos
RUN mkdir -p /src \
    && cd /src \
    && curl -f -L -O http://download.osgeo.org/geos/geos-$GEOS_VERSION.tar.bz2 \
    && tar jxf geos-$GEOS_VERSION.tar.bz2 \
    && cd /src/geos-$GEOS_VERSION \
    && ./configure \
    && make \
    && make install \
    && rm -rf /src








RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libatlas-base-dev gfortran

WORKDIR /app
ADD requirements.txt /app
RUN pip3 install --trusted-host pypi.python.org -r requirements.txt



# removing dependencies
#RUN apk del .build-deps

ENV LISTEN_PORT=8000
EXPOSE 8000

COPY /app /app
