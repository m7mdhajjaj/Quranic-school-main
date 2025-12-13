import axios from "axios";
import { API_URL } from "../config/config";

// Create a global axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 60000, // 60 seconds timeout for file uploads
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    console.log(
      `📡 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - Status: ${response.status}`
    );
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Don't auto-redirect on verify endpoints or if already on login
      const isVerifyEndpoint = error.config?.url?.includes("/auth/verify");
      const isOnLogin = window.location.pathname.includes("/login");

      if (!isVerifyEndpoint && !isOnLogin) {
        // Clear local storage on 401 error
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("savedCredentials");

        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
