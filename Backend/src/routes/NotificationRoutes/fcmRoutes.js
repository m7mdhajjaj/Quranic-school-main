// ============================================================================
// fcmRoutes.js - Unified FCM Token Management Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth/protect.middleware');
const { validate } = require('../../middleware');
const DeviceToken = require('../../schema/DeviceToken');
const { fcmTokenSchema, removeFcmTokenSchema } = require('../../Validation/Chat/chatValidation');

// ============================================================================
// Register/Update FCM Token
// ============================================================================
router.post('/token', protect, validate(fcmTokenSchema), async (req, res) => {
  try {
    // ✅ التحقق من وجود المستخدم
    if (!req.user || !req.user.id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const userId = req.user.id;
    const userModel = req.user.role === 'admin' ? 'Admin' 
                    : req.user.role === 'teacher' ? 'Teacher' 
                    : 'Student';
    const { token, platform = 'web' } = req.body;

    console.log(`📱 Register token request - User: ${userId}, Role: ${userModel}, Platform: ${platform}`);

    if (!token) {
      console.warn('⚠️ Token missing in request');
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }

    // Upsert token (handle duplicates gracefully)
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
        throw dbError;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Token registered successfully' 
    });
  } catch (error) {
    console.error('❌ Error registering token:', error);
    console.error('❌ Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error registering token', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ============================================================================
// Remove FCM Token (on logout)
// ============================================================================
router.delete('/token', protect, validate(removeFcmTokenSchema), async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log(`📱 Unregister token request`);
    
    if (!token) {
      console.warn('⚠️ Token missing in request');
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }

    const result = await DeviceToken.findOneAndDelete({ token });
    
    console.log(`✅ Device token unregistered: ${result ? 1 : 0} deleted`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Token removed successfully',
      deletedCount: result ? 1 : 0
    });
  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error removing token', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// ============================================================================
// Get all tokens for current user
// ============================================================================
router.get('/tokens', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📱 Get tokens request for user: ${userId}`);
    
    const tokens = await DeviceToken.find({ user: userId });
    
    console.log(`✅ Found ${tokens.length} tokens for user ${userId}`);
    
    return res.status(200).json({ 
      success: true, 
      tokens,
      count: tokens.length
    });
  } catch (error) {
    console.error('❌ Error getting tokens:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error retrieving tokens',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
