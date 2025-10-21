// ============================================================================
// updateRoutes.js - UPDATE Routes for Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notification");
const { protect } = require("../../middleware/authMiddleware");

// ============================================================================
// Mark as Read Routes
// ============================================================================

// Mark single notification as read (PUT - with auth)
router.put("/:notificationId/read", protect, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Ensure notification belongs to current user
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود أو غير مسموح بالوصول إليه",
      });
    }

    res.json({
      success: true,
      message: "تم تحديد الإشعار كمقروء",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديد الإشعار كمقروء",
      error: error.message,
    });
  }
});

// Mark single notification as read (PATCH - backward compatibility)
router.patch("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود",
      });
    }

    res.json({
      success: true,
      message: "تم تحديد الإشعار كمقروء",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث الإشعار",
      error: error.message,
    });
  }
});

// Mark all notifications as read for current user (PUT - with auth)
router.put("/read-all", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    res.json({
      success: true,
      message: "تم تحديد جميع الإشعارات كمقروءة",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديد جميع الإشعارات كمقروءة",
      error: error.message,
    });
  }
});

// Mark all notifications as read for specific user (PATCH)
router.patch("/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    res.json({
      success: true,
      message: "تم تحديد جميع الإشعارات كمقروءة",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث الإشعارات",
      error: error.message,
    });
  }
});

module.exports = router;
