#!/bin/sh

set -e

mkdir -p /opt/keycloak/data/import

cp /etc/secrets/lms-realm.json /opt/keycloak/data/import/lms-realm.json

exec /opt/keycloak/bin/kc.sh start \
  --optimized \
  --http-enabled=true \
  --http-port="${PORT:-10000}" \
  --hostname="${KEYCLOAK_HOSTNAME}" \
  --proxy-headers=xforwarded \
  --import-realm
