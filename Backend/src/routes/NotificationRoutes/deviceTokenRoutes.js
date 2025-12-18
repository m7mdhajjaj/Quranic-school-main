// ============================================================================
// deviceTokenRoutes.js - Device Token Management Routes (FCM)
// ============================================================================

const express = require("express");
const router = express.Router();
const DeviceToken = require("../../schema/DeviceToken");
const { protect } = require("../../middleware/authMiddleware");

// ============================================================================
// Device Token Routes (FCM - Firebase Cloud Messaging)
// ============================================================================

// Register/Update device token for current user
router.post('/register-token', protect, async (req, res) => {
  try {
    // ✅ التحقق من وجود المستخدم
    if (!req.user || !req.user._id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ 
        success: false, 
        message: 'user not authenticated' 
      });
    }

    const userId = req.user._id;
    const userModel = req.user.role === 'admin' ? 'Admin' : req.user.role === 'teacher' ? 'Teacher' : 'Student';
    const { token, platform = 'web' } = req.body;

    console.log(`📱 Register token request - User: ${userId}, Role: ${userModel}, Platform: ${platform}`);

    if (!token) {
      console.warn('⚠️ Token missing in request');
      return res.status(400).json({ 
        success: false, 
        message: 'token is required' 
      });
    }

    // Upsert token (unique)
    const existing = await DeviceToken.findOne({ token });
    if (existing) {
      existing.user = userId;
      existing.userModel = userModel;
      existing.platform = platform;
      await existing.save();
      
      console.log(`✅ Device token updated for user ${userId}`);
    } else {
      await DeviceToken.create({ 
        user: userId, 
        userModel, 
        token, 
        platform 
      });
      
      console.log(`✅ New device token registered for user ${userId}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'token registered' 
    });
  } catch (error) {
    console.error('❌ Error registering token:', error);
    console.error('❌ Error stack:', error.stack);
    
    // ✅ تأكد من إرجاع JSON دائماً
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'error registering token', 
        error: error.message 
      });
    }
  }
});

// Unregister device token
router.post('/unregister-token', protect, async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log(`📱 Unregister token request`);
    
    if (!token) {
      console.warn('⚠️ Token missing in request');
      return res.status(400).json({ 
        success: false, 
        message: 'token is required' 
      });
    }
    
    const result = await DeviceToken.deleteOne({ token });
    
    console.log(`✅ Device token unregistered: ${result.deletedCount} deleted`);
    
    return res.status(200).json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('❌ Error unregistering token:', error);
    console.error('❌ Error stack:', error.stack);
    
    // ✅ تأكد من إرجاع JSON دائماً
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'error unregistering token', 
        error: error.message 
      });
    }
  }
});

module.exports = router;
