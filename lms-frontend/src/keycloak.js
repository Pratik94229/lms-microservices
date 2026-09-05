import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8181",
  realm: "lms",
  clientId: "lms-client",
});

export default keycloak;
