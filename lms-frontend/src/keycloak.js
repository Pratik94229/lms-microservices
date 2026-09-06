import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://lms-keycloak.onrender.com",
  realm: "lms",
  clientId: "lms-client",
});

export default keycloak;
