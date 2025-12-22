// ============================================================================
// deviceTokenRoutes.js - Device Token Management Routes (FCM)
// ============================================================================

const express = require("express");
const router = express.Router();
const DeviceToken = require("../../schema/DeviceToken");
const { protect } = require("../../middleware/auth");

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
    try {
      const existing = await DeviceToken.findOne({ token });
      if (existing) {
        // Update existing token
        existing.user = userId;
        existing.userModel = userModel;
        existing.platform = platform;
        await existing.save();
        
        console.log(`✅ Device token updated for user ${userId}`);
      } else {
        // Create new token
        await DeviceToken.create({ 
          user: userId, 
          userModel, 
          token, 
          platform 
        });
        
        console.log(`✅ New device token registered for user ${userId}`);
      }
    } catch (dbError) {
      // Handle duplicate key error (E11000)
      if (dbError.code === 11000) {
        console.log(`⚠️ Duplicate token detected, updating instead...`);
        await DeviceToken.findOneAndUpdate(
          { token },
          { user: userId, userModel, platform },
          { upsert: true, new: true }
        );
        console.log(`✅ Device token updated (via upsert) for user ${userId}`);
      } else {
        throw dbError; // Re-throw if not duplicate error
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'token registered' 
    });
  } catch (error) {
    console.error('❌ Error registering token:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // ✅ تأكد من إرجاع JSON دائماً - حتى في حالة الخطأ
    return res.status(500).json({ 
      success: false, 
      message: 'error registering token', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
