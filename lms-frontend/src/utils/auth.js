const TOKEN_KEY = "accessToken";
const USER_KEY = "currentUser";

export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

export const getUserRoles = () => {
  const role = getUserRole();
  return role ? [role] : [];
};

export const hasRole = (role) => {
  return getUserRole() === role;
};

export const hasAnyRole = (roles = []) => {
  const role = getUserRole();
  return roles.includes(role);
};

export const isAdmin = () => {
  return getUserRole() === "ADMIN";
};

export const isInstructor = () => {
  return getUserRole() === "INSTRUCTOR";
};

export const isStudent = () => {
  return getUserRole() === "STUDENT";
};

export const addAuthListener = (callback) => {
  const handleStorageChange = (event) => {
    if (event.key === TOKEN_KEY || event.key === USER_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
};

export const removeAccessToken = () => {
  clearAccessToken();
};

export const logout = () => {
  clearAccessToken();
  window.location.href = "/login";
};
