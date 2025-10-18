// Firebase Configuration and Cloud Messaging Setup
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA92yiBW1-ys2swFZxGNWBDS2nrjjhCqDQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quranic-school-77b5e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quranic-school-77b5e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quranic-school-77b5e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "113132422081",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:113132422081:web:dae9d7d860047f3193e540"
};

// VAPID Key for web push (get from Firebase Console > Cloud Messaging > Web Push certificates)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
  }
} catch (error) {
  console.warn('⚠️ Firebase Messaging not supported:', error);
}

/**
 * Request permission and get FCM token
 * @returns FCM token string or null if failed
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      if (token) {
        console.log('📱 FCM Token:', token);
        return token;
      } else {
        console.warn('⚠️ No registration token available');
        return null;
      }
    } else {
      console.warn('⚠️ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param callback Function to handle incoming messages
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('📩 Foreground message received:', payload);
    callback(payload);
  });

  return unsubscribe;
};

/**
 * Register FCM token with backend
 * @param token FCM token
 * @param apiUrl Backend API URL
 * @param authToken User auth token
 */
export const registerTokenWithBackend = async (
  token: string,
  apiUrl: string = '/api/notifications/register-token',
  authToken?: string
): Promise<boolean> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token,
        platform: 'web'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Token registered with backend');
      return true;
    } else {
      console.error('❌ Failed to register token with backend:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error registering token with backend:', error);
    return false;
  }
};

/**
 * Initialize FCM and register token automatically
 * Call this after user login
 */
export const initializeFCM = async (authToken?: string): Promise<void> => {
  try {
    const token = await requestNotificationPermission();
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem('fcm_token', token);
      
      // Register with backend if auth token is provided
      if (authToken) {
        await registerTokenWithBackend(token, undefined, authToken);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
  }
};

export { app, messaging };
