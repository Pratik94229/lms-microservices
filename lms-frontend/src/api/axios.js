import axios from "axios";
import { getAccessToken, clearAccessToken } from "../utils/auth";

const api = axios.create({
  baseURL: "https://lms-api-gateway-9lpv.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach our custom JWT to every API request.
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// If the backend rejects the JWT, clear the local session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
