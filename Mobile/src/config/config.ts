// API Configuration for React Native App

// Backend API URL
// غيّر هذا الرابط حسب IP الخاص بك عند التطوير
// للتطوير المحلي: استخدم IP جهازك بدلاً من localhost
export const API_URL = "http://192.168.1.100:5005/api"; // غيّر IP Address حسب شبكتك

// Socket.io URL
export const SOCKET_URL = "http://192.168.1.100:5005"; // نفس IP بدون /api

// Firebase Configuration (نفس الإعدادات من Frontend)
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// App Configuration
export const APP_CONFIG = {
  appName: "Quranic School",
  version: "1.0.0",
  enableDevMode: __DEV__, // تلقائياً يتم تفعيله في وضع التطوير
};

// Pagination
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

// Cache Configuration
export const CACHE_CONFIG = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
};
