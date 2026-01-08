import axios from 'axios';
import { API_URL } from '../config/config';

// ✅ Request cache للـ GET requests (5 دقائق)
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create a global axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 30000, // ✅ تقليل timeout من 60 ثانية إلى 30 ثانية
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    // ✅ تقليل logging في production
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ استخدام cache للـ GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // إرجاع البيانات من الـ cache
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK (Cached)',
            headers: {},
            config,
          });
        };
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    // ✅ تقليل logging في production
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    
    // ✅ حفظ البيانات في الـ cache للـ GET requests
    if (response.config.method === 'get' && response.config.url && response.status === 200) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    // ✅ مسح الـ cache عند حدوث تغيير في البيانات (POST, PUT, DELETE, PATCH)
    if (['post', 'put', 'delete', 'patch'].includes(response.config.method?.toLowerCase() || '')) {
      if (import.meta.env.DEV) {
        console.log('🧹 Clearing API cache due to mutation');
      }
      requestCache.clear();
    }
    
    return response;
  },
  (error) => {
    // ✅ تقليل logging في production
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
    
    if (error.response?.status === 401) {
      // Don't auto-redirect on verify endpoints or if already on login
      const isVerifyEndpoint = error.config?.url?.includes('/auth/verify');
      const isOnLogin = window.location.pathname.includes('/login');
      
      if (!isVerifyEndpoint && !isOnLogin) {
        // Clear local storage on 401 error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('savedCredentials');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;