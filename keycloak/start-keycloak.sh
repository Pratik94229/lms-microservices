#!/bin/sh

set -e

mkdir -p /opt/keycloak/data/import

cp /etc/secrets/lms-realm.json /opt/keycloak/data/import/lms-realm.json

export JAVA_OPTS_APPEND="-Xms128m -Xmx350m"

exec /opt/keycloak/bin/kc.sh start \
  --http-enabled=true \
  --http-port="${PORT:-10000}" \
  --hostname="${KEYCLOAK_HOSTNAME}" \
  --proxy-headers=xforwarded \
  --import-realm
