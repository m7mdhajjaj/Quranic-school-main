const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

class FCMService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      if (admin.apps && admin.apps.length > 0) {
        this.initialized = true;
        return;
      }

      // Expect service account JSON path or JSON content in env
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      let serviceAccount;
      if (serviceAccountJson) {
        serviceAccount = JSON.parse(serviceAccountJson);
      } else if (serviceAccountPath) {
        // Resolve path relative to project root
        const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
        console.log(`🔍 Looking for Firebase service account at: ${resolvedPath}`);
        
        if (fs.existsSync(resolvedPath)) {
          serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
          console.log('✅ Service account file found and loaded');
        } else {
          console.warn(`⚠️  Service account file not found at: ${resolvedPath}`);
          console.warn('FCM: No service account provided in env; FCM disabled');
          return;
        }
      } else {
        console.warn('FCM: No service account provided in env; FCM disabled');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.messaging = admin.messaging();
      this.initialized = true;
      console.log('✅ FCM initialized');
    } catch (error) {
      console.error('❌ Error initializing FCM:', error.message || error);
    }
  }

  async sendToToken(token, payload, options = {}) {
    if (!this.initialized) return null;
    try {
      const message = {
        token,
        data: payload.data || {},
        notification: payload.notification,
        android: options.android,
        apns: options.apns,
        webpush: options.webpush,
      };
      return await this.messaging.send(message);
    } catch (error) {
      console.error('❌ FCM sendToToken error:', error.message || error);
      return null;
    }
  }

  async sendToTokens(tokens, payload, options = {}) {
    if (!this.initialized) return null;
    try {
      const message = {
        tokens: tokens,
        data: payload.data || {},
        notification: payload.notification,
        android: options.android,
        apns: options.apns,
        webpush: options.webpush,
      };
      const response = await this.messaging.sendMulticast(message);
      return response;
    } catch (error) {
      console.error('❌ FCM sendToTokens error:', error.message || error);
      return null;
    }
  }
}

module.exports = new FCMService();
