// Firebase Cloud Messaging Service Worker
// This file must be in the public folder and served from the root

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyAPCYf7HCTQ3DiW_PFwxTKBeHFp3EN5Qn4",
  authDomain: "quranic-school-main.firebaseapp.com",
  projectId: "quranic-school-main",
  storageBucket: "quranic-school-main.firebasestorage.app",
  messagingSenderId: "570702964068",
  appId: "1:570702964068:web:64bb6b980db932cc3f8671",
  measurementId: "G-EHTEZ0CWYY"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك إشعار جديد',
    icon: payload.notification?.icon || '/vite.svg',
    badge: '/vite.svg',
    tag: payload.data?.notificationId || 'default',
    data: payload.data,
    requireInteraction: false,
    silent: false,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();
  
  // Navigate to the app or specific page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || self.location.origin;
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});
