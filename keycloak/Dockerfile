FROM quay.io/keycloak/keycloak:26.7.0

COPY start-keycloak.sh /opt/keycloak/start-keycloak.sh
COPY lms-realm.json /opt/keycloak/realm/lms-realm.json

ENTRYPOINT ["/bin/sh", "/opt/keycloak/start-keycloak.sh"]
