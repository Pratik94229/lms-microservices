FROM quay.io/keycloak/keycloak:26.7.0

COPY start-keycloak.sh /opt/keycloak/start-keycloak.sh

RUN chmod +x /opt/keycloak/start-keycloak.sh

ENTRYPOINT ["/opt/keycloak/start-keycloak.sh"]
