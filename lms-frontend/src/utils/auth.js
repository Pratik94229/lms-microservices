import keycloak from "../keycloak";

// Key used to store the JWT access token in browser localStorage.
const TOKEN_KEY = "accessToken";

// Custom browser event used to notify React components
// whenever the user's authentication state changes.
const AUTH_EVENT = "auth-changed";

// Get the current Keycloak access token.
//
// Keycloak is now the source of truth for authentication.
// localStorage is kept in sync because the existing
// application already uses it.
export const getAccessToken = () => {
  return keycloak.token || localStorage.getItem(TOKEN_KEY);
};

// Store the JWT access token in localStorage.
//
// Keycloak itself continues to manage the active token.
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
};

// Remove the locally stored access token.
//
// This does NOT log the user out of Keycloak.
// Keycloak logout will be handled separately.
export const removeAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);

  window.dispatchEvent(new Event(AUTH_EVENT));
};

// Check whether the user is authenticated.
export const isAuthenticated = () => {
  return Boolean(keycloak.authenticated && keycloak.token);
};

// Register a listener for authentication changes.
export const addAuthListener = (callback) => {
  window.addEventListener(AUTH_EVENT, callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
  };
};

// Decode the payload section of the JWT.
//
// IMPORTANT:
// This only decodes the JWT.
// It does NOT verify the token.
// Token validation is performed by the backend.
const decodeTokenPayload = () => {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    // JWT payload is Base64URL encoded.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // Add missing Base64 padding if necessary.
    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const decodedPayload = atob(paddedBase64);

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

// Get all Keycloak realm roles assigned to the user.
export const getUserRoles = () => {
  const payload = decodeTokenPayload();

  if (!payload) {
    return [];
  }

  return payload.realm_access?.roles || [];
};

// Check whether the current user has a specific role.
export const hasRole = (role) => {
  return getUserRoles().includes(role);
};

// Check whether the current user has the STUDENT role.
export const isStudent = () => {
  return hasRole("STUDENT");
};

// Check whether the current user has the INSTRUCTOR role.
export const isInstructor = () => {
  return hasRole("INSTRUCTOR");
};

// Check whether the current user has the ADMIN role.
export const isAdmin = () => {
  return hasRole("ADMIN");
};
