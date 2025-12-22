const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth/protect.middleware');
const { validate } = require('../middleware');
const DeviceToken = require('../schema/DeviceToken');
const { fcmTokenSchema, removeFcmTokenSchema } = require('../Validation/Chat/chatValidation');

// Save/Update FCM Token
router.post('/token', protect, validate(fcmTokenSchema), async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    // Check if token already exists
    let deviceToken = await DeviceToken.findOne({ token });

    if (deviceToken) {
      // Update existing token
      deviceToken.user = userId;
      deviceToken.platform = platform || deviceToken.platform;
      deviceToken.lastUsed = new Date();
      await deviceToken.save();
    } else {
      // Create new token
      deviceToken = await DeviceToken.create({
        user: userId,
        token,
        platform: platform || 'web',
        lastUsed: new Date()
      });
    }

    res.status(200).json({ message: 'Token saved successfully', deviceToken });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(400).json({ message: error.message });
  }
});

// Remove FCM Token (on logout)
router.delete('/token', protect, validate(removeFcmTokenSchema), async (req, res) => {
  try {
    const { token } = req.body;

    await DeviceToken.findOneAndDelete({ token });
    res.status(200).json({ message: 'Token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all tokens for current user
router.get('/tokens', protect, async (req, res) => {
  try {
    const tokens = await DeviceToken.find({ user: req.user.id });
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
