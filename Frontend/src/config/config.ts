// ============================================================================
// Frontend Configuration - Central Configuration File
// ============================================================================
// This file contains all configuration variables used throughout the application
// Use these instead of hardcoded URLs in your components
// ============================================================================

// Backend URLs
export const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "5005";
export const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || "localhost";
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${BACKEND_HOST}:${BACKEND_PORT}`;
// Use relative URL for API calls - Vite proxy will handle forwarding to backend
export const API_URL = '/api';
export const SOCKET_URL = API_BASE_URL;

// Application Configuration
export const CONFIG = {
  defaultPageSize: 10,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  socketTransports: ['websocket', 'polling'] as const,
  
  // Image and Upload Settings
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxImageSize: 3 * 1024 * 1024, // 3MB
  
  // API Timeouts
  apiTimeout: 30000, // 30 seconds
  socketTimeout: 5000, // 5 seconds
};
