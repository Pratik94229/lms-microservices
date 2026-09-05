import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import keycloak from "./keycloak";
import { setAccessToken, removeAccessToken } from "./utils/auth";

const renderApp = () => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

keycloak.onAuthSuccess = () => {
  console.log("Keycloak: authentication successful");

  if (keycloak.token) {
    setAccessToken(keycloak.token);
  }
};

keycloak.onAuthLogout = () => {
  console.log("Keycloak: user logged out");

  removeAccessToken();
};

keycloak.onTokenExpired = async () => {
  console.log("Keycloak: access token expired");

  try {
    await keycloak.updateToken(30);

    if (keycloak.token) {
      setAccessToken(keycloak.token);
    }
  } catch (error) {
    console.error("Keycloak: failed to refresh expired token");

    removeAccessToken();
  }
};

keycloak
  .init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    console.log(
      authenticated
        ? "Keycloak: existing session found"
        : "Keycloak: no existing session",
    );

    if (authenticated && keycloak.token) {
      setAccessToken(keycloak.token);
    } else {
      removeAccessToken();
    }

    renderApp();
  })
  .catch((error) => {
    console.error("Keycloak initialization failed:", error);

    removeAccessToken();

    renderApp();
  });
