import axios from "axios";
import keycloak from "../keycloak";
import { setAccessToken, removeAccessToken } from "../utils/auth";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Attach a valid Keycloak JWT to every request.
api.interceptors.request.use(
  async (config) => {
    // Only attempt token handling when Keycloak
    // has an authenticated user.
    if (keycloak.authenticated) {
      try {
        // Refresh the token if it expires within
        // the next 30 seconds.
        await keycloak.updateToken(30);

        // Keep localStorage synchronized with
        // the current Keycloak token.
        if (keycloak.token) {
          setAccessToken(keycloak.token);

          config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
      } catch (error) {
        console.error("Failed to refresh Keycloak token:", error);

        // Remove the stale locally stored token.
        removeAccessToken();

        // Reject the request because we cannot
        // safely send an expired/invalid token.
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle authentication failures centrally.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Authentication failed.");

      removeAccessToken();
    }

    return Promise.reject(error);
  },
);

export default api;
