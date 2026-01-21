// ============================================================================
// Mobile Configuration - Central Configuration File
// ============================================================================
// This file contains all configuration variables used throughout the application
// Use these instead of hardcoded URLs in your components
// ============================================================================

// Backend URLs
export const BACKEND_PORT = "5005";
export const BACKEND_HOST = "192.168.1.1"; // Change this to your computer's IP address
export const API_BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;

// Application Configuration
export const CONFIG = {
  defaultPageSize: 10,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  socketTransports: ["websocket", "polling"] as const,
  defaultTimeout: 10000, // 10 seconds
};
