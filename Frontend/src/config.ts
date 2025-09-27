// Base API URL for backend requests
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
export const API_URL = `${API_BASE_URL}/api`;

// Configuration variables
export const CONFIG = {
  defaultPageSize: 10,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  socketTransports: ['websocket', 'polling'] as const,
};
