// ============================================================================
// createRoutes.js - CREATE Routes for Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notification");
const { protect } = require("../../middleware/authMiddleware");
const { validateNotificationFormData } = require("../../Validation/Notification/NotificationValidation");

// ============================================================================
// Create Routes
// ============================================================================

// Create test notifications (for development)
router.post("/create-test-notifications", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userModel = req.user.role === 'admin' ? 'Admin' : req.user.role === 'teacher' ? 'Teacher' : 'Student';
    
    // Create test notifications
    const testNotifications = [
      {
        recipient: userId,
        recipientModel: userModel,
        type: 'general',
        title: 'مرحباً بك',
        message: 'هذا إشعار تجريبي للاختبار',
        isRead: false,
      },
      {
        recipient: userId,
        recipientModel: userModel,
        type: 'activity',
        title: 'نشاط جديد',
        message: 'تم إضافة نشاط جديد للفصل',
        isRead: false,
      },
      {
        recipient: userId,
        recipientModel: userModel,
        type: 'message',
        title: 'رسالة جديدة',
        message: 'لديك رسالة جديدة من المعلم',
        isRead: true,
      }
    ];

    const createdNotifications = await Notification.insertMany(testNotifications);

    res.json({
      success: true,
      message: 'تم إنشاء الإشعارات التجريبية بنجاح',
      data: createdNotifications,
    });
  } catch (error) {
    console.error("Error creating test notifications:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إنشاء الإشعارات التجريبية",
      error: error.message,
    });
  }
});

// Create new notification (for testing or admin)
router.post("/", validateNotificationFormData, async (req, res) => {
  try {
    const {
      recipient,
      recipientModel,
      type,
      title,
      message,
      data,
      priority,
      isSystemNotification,
    } = req.body;

    const notification = new Notification({
      recipient,
      recipientModel,
      type,
      title,
      message,
      data: data || {},
      priority: priority || "medium",
      isSystemNotification: isSystemNotification || false,
    });

    const savedNotification = await notification.save();

    // Send notification immediately if service is available
    if (global.notificationService) {
      await global.notificationService.sendRealTimeNotification(
        savedNotification,
      );
    }

    res.status(201).json({
      success: true,
      message: "تم إنشاء الإشعار بنجاح",
      data: savedNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إنشاء الإشعار",
      error: error.message,
    });
  }
});

module.exports = router;
