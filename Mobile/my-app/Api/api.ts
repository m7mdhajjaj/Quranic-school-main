import axios from "axios";
import { API_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create a global axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 60000, // 60 seconds timeout for file uploads
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  async (config) => {
    console.log(
      `📡 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    const token = await AsyncStorage.getItem("token");
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
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
    );
    return response;
  },
  async (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Don't auto-redirect on verify endpoints
      const isVerifyEndpoint = error.config?.url?.includes("/auth/verify");

      if (!isVerifyEndpoint) {
        // Clear AsyncStorage on 401 error
        await AsyncStorage.multiRemove([
          "token",
          "user",
          "userId",
          "savedCredentials",
        ]);

        // Note: Navigation to login should be handled in your app's navigation system
        // You might want to emit an event or use a navigation ref here
      }
    }
    return Promise.reject(error);
  }
);

export default api;
