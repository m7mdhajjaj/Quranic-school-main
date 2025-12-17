// ============================================================================
// createRoutes.js - CREATE Routes for Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notification");
const Student = require("../../schema/Student");
const Group = require("../../schema/Group");
const { sendRealTimeNotification } = require("../../Notifications/Core/SocketSender");
const { protect } = require("../../middleware/authMiddleware");
const { validateNotificationFormData } = require("../../Validation/Notification/NotificationValidation");

// ============================================================================
// Create Routes
// ============================================================================

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

    // Send notification immediately
    const io = req.app.get('io') || global.io;
    if (io) {
      await sendRealTimeNotification(io, savedNotification);
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

// Send bulk notifications (for teachers/admins)
router.post("/send-bulk", protect, async (req, res) => {
  try {
    const {
      title,
      message,
      target, // 'all' | 'my_students'
      type = 'general',
      priority = 'medium'
    } = req.body;

    const senderId = req.user._id;
    const senderRole = req.user.role; // 'teacher' or 'admin'

    let recipients = [];

    if (target === 'all') {
      // Fetch all students
      const students = await Student.find({}).select('_id');
      recipients = students.map(s => s._id);
    } else if (target === 'my_students') {
      if (senderRole !== 'teacher') {
         return res.status(403).json({ success: false, message: "Only teachers can send to 'my_students'" });
      }
      
      // Find groups taught by this teacher
      const groups = await Group.find({ teacher: senderId }).select('name');
      const groupNames = groups.map(g => g.name);
      
      if (groupNames.length === 0) {
        return res.status(404).json({ success: false, message: "No groups found for this teacher" });
      }

      // Find students in these groups
      const students = await Student.find({ group: { $in: groupNames } }).select('_id');
      recipients = students.map(s => s._id);
    } else {
        return res.status(400).json({ success: false, message: "Invalid target" });
    }

    if (recipients.length === 0) {
        return res.status(404).json({ success: false, message: "No recipients found" });
    }

    // Create notifications
    const notificationsToCreate = recipients.map(recipientId => ({
      recipient: recipientId,
      recipientModel: 'Student',
      type,
      title,
      message,
      data: { senderId, senderRole },
      priority,
      isSystemNotification: false,
      isRead: false,
      createdAt: new Date()
    }));

    const createdNotifications = await Notification.insertMany(notificationsToCreate);

    // Send real-time notifications
    const io = req.app.get('io') || global.io;
    if (io) {
        // Send asynchronously to avoid blocking
        Promise.all(createdNotifications.map(notification => 
            sendRealTimeNotification(io, notification)
        )).catch(err => console.error("Error sending socket notifications:", err));
    }
    
    res.status(201).json({
      success: true,
      message: `Successfully sent notifications to ${recipients.length} students`,
      count: recipients.length
    });

  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notifications",
      error: error.message,
    });
  }
});

module.exports = router;
