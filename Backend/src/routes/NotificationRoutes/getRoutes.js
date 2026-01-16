// ============================================================================
// getRoutes.js - GET Routes for Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notification");
const { protect } = require("../../middleware/auth");

// ============================================================================
// Get Routes (Protected - Current User)
// ============================================================================

// Get recent notifications for current user (Optimized)
router.get("/recent", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const result = await Notification.getLightweight(userId, 1, parseInt(limit));

    res.json({
      success: true,
      data: result.notifications, // Ensure array is returned directly for backward compatibility or wrap as needed
    });
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الإشعارات الحديثة",
      error: error.message,
    });
  }
});

// Get unread count for current user
router.get("/unread-count", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Use fast count
    const stats = await Notification.getQuickStats(userId);

    res.json({
      success: true,
      count: stats.unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في حساب الإشعارات غير المقروءة",
      error: error.message,
    });
  }
});

// ============================================================================
// Get Routes (By User ID)
// ============================================================================

// Get notifications for a specific user with pagination (Optimized)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, isRead, category } = req.query;

    // Build optimized filter
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    // Use the optimized static method
    const result = await Notification.getLightweight(
      userId,
      parseInt(page),
      parseInt(limit),
      filter
    );
    
    // Get quick stats in parallel for better performance
    const stats = await Notification.getQuickStats(userId);

    const response = {
      success: true,
      data: {
        notifications: result.notifications,
        pagination: result.pagination,
        stats: {
          unreadCount: stats.unreadCount,
          newCount: stats.todayCount,
          totalCount: result.stats.totalCount,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الإشعارات",
      error: error.message,
    });
  }
});

// Get notification details (Full data)
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.getWithDetails(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification details:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب تفاصيل الإشعار",
      error: error.message,
    });
  }
});

// Get unread count for specific user
router.get("/:userId/unread-count", async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await Notification.getQuickStats(userId);

    res.json({
      success: true,
      unreadCount: stats.unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في حساب الإشعارات غير المقروءة",
      error: error.message,
    });
  }
});

// Get notification stats for a user
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await Notification.getQuickStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب إحصائيات الإشعارات",
      error: error.message,
    });
  }
});

module.exports = router;
