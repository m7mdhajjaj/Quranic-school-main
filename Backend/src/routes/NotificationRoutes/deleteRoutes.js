// ============================================================================
// deleteRoutes.js - DELETE Routes for Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notification");
const { protect } = require("../../middleware/auth");

// ============================================================================
// Delete Routes
// ============================================================================

// Delete single notification (with auth)
router.delete("/:notificationId", protect, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Ensure notification belongs to current user before deleting
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود أو غير مسموح بحذفه",
      });
    }

    res.json({
      success: true,
      message: "تم حذف الإشعار بنجاح",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في حذف الإشعار",
      error: error.message,
    });
  }
});

// Delete all read notifications for a user
router.delete("/:userId/read", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.deleteMany({
      recipient: userId,
      isRead: true,
    });

    res.json({
      success: true,
      message: "تم حذف جميع الإشعارات المقروءة",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في حذف الإشعارات المقروءة",
      error: error.message,
    });
  }
});

module.exports = router;
