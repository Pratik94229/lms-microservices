#!/bin/sh

set -e

mkdir -p /opt/keycloak/data/import

cp /opt/keycloak/realm/lms-realm.json \
   /opt/keycloak/data/import/lms-realm.json

export JAVA_OPTS_APPEND="-Xms128m -Xmx350m"

exec /opt/keycloak/bin/kc.sh start \
  --http-enabled=true \
  --http-port="${KC_HTTP_PORT:-8181}" \
  --hostname="${KEYCLOAK_HOSTNAME:-localhost}" \
  --proxy-headers=xforwarded \
  --import-realm