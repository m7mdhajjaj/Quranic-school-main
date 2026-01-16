// Firebase Configuration and Cloud Messaging Setup
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAPCYf7HCTQ3DiW_PFwxTKBeHFp3EN5Qn4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quranic-school-main.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quranic-school-main",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quranic-school-main.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "570702964068",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:570702964068:web:64bb6b980db932cc3f8671",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EHTEZ0CWYY"
};

// VAPID Key for web push (get from Firebase Console > Cloud Messaging > Web Push certificates)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BL8lvVEg7bHx9Z7dm5HjS5TXImbL7HsDstJG-7istQ-FmafDheIdJsVkcRpucUiA6msThVR4nUXvG1pqyZQGCf8';

if (!VAPID_KEY || VAPID_KEY === '') {
  console.warn('⚠️ VITE_FIREBASE_VAPID_KEY is missing. Push notifications may fail. Generate a key pair in Firebase Console > Project Settings > Cloud Messaging > Web Push certificates.');
}

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

// Use window object to persist across hot reloads
declare global {
  interface Window {
    __FCM_TOKEN_LOGGED__?: string;
    __FCM_TOKEN_REGISTERED__?: string;
  }
}

/**
 * Register Service Worker explicitly
 */
const registerServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Wait for service worker to be ready to avoid "no active Service Worker" errors
      const registration = await navigator.serviceWorker.ready;
      
      console.log('✅ Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get FCM token without requesting permission (if already granted)
 * @returns FCM token string or null if failed
 */
export const getExistingToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    // Only get token if permission is already granted
    if (Notification.permission !== 'granted') {
      return null;
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('⚠️ Could not register Service Worker');
      return null;
    }

    const getTokenOptions: any = {
      serviceWorkerRegistration: registration
    };
    
    if (VAPID_KEY) {
      getTokenOptions.vapidKey = VAPID_KEY;
    }

    const token = await getToken(messaging, getTokenOptions);
    
    if (token) {
      // Only log if token is different from last logged
      if (token !== window.__FCM_TOKEN_LOGGED__) {
        console.log('📱 FCM Token retrieved:', token);
        window.__FCM_TOKEN_LOGGED__ = token;
      }
      return token;
    } else {
      console.warn('⚠️ No registration token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

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
      
      const registration = await registerServiceWorker();
      if (!registration) {
        console.warn('⚠️ Could not register Service Worker');
        return null;
      }

      // Get FCM token
      const getTokenOptions: any = {
        serviceWorkerRegistration: registration
      };
      
      if (VAPID_KEY) {
        getTokenOptions.vapidKey = VAPID_KEY;
      }

      const token = await getToken(messaging, getTokenOptions);
      
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
export const onMessageListener = (callback: (payload: unknown) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    // Immediately log and defer callback to avoid blocking
    console.log('📩 Foreground message received:', payload);
    
    // Use setTimeout with 0 delay to defer to next tick
    setTimeout(() => callback(payload), 0);
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
  apiUrl: string = '/api/fcm/token',
  authToken?: string
): Promise<boolean> => {
  // Skip if token was already registered (use window object to persist)
  if (token === window.__FCM_TOKEN_REGISTERED__) {
    return true;
  }

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

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      console.error(`❌ Failed to register token - Status: ${response.status}`);
      // Try to get error message from response
      try {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      } catch (e) {
        console.error('❌ Could not read error response');
      }
      return false;
    }

    const data = await response.json();
    
    if (data.success) {
      window.__FCM_TOKEN_REGISTERED__ = token;
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

export { app, messaging };
