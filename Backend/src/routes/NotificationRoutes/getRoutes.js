// ============================================================================
// getRoutes.js - GET Routes for Notifications (مع Redis Caching)
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notfcation/Notification");
const { protect } = require("../../middleware/auth");
const {
  getCachedUnreadCount,
  setCachedUnreadCount,
  getCachedStats,
  setCachedStats,
  getCachedRecentNotifications,
  setCachedRecentNotifications,
  getCachedNotificationList,
  setCachedNotificationList,
} = require("../../Notifications/Core/NotificationCache");

// ============================================================================
// Get Routes (Protected - Current User)
// ============================================================================

// Get recent notifications for current user (Optimized with Redis)
router.get("/recent", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit);

    // ✅ محاولة جلب من Redis أولاً
    const cached = await getCachedRecentNotifications(userId, limitNum);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true,
      });
    }

    const result = await Notification.getLightweight(userId, 1, limitNum);

    // ✅ حفظ في Redis
    await setCachedRecentNotifications(userId, result.notifications, limitNum);

    res.json({
      success: true,
      data: result.notifications,
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

// Get unread count for current user (Optimized with Redis)
router.get("/unread-count", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ محاولة جلب من Redis أولاً
    const cached = await getCachedUnreadCount(userId);
    if (cached !== null) {
      return res.json({
        success: true,
        count: cached,
        fromCache: true,
      });
    }

    // Use fast count
    const stats = await Notification.getQuickStats(userId);

    // ✅ حفظ في Redis
    await setCachedUnreadCount(userId, stats.unreadCount);

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

// Get notifications for a specific user with pagination (Optimized with Redis)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, isRead, category } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // ✅ محاولة جلب من Redis أولاً (فقط للصفحة الأولى بدون فلاتر)
    if (pageNum === 1 && !type && isRead === undefined) {
      const cached = await getCachedNotificationList(userId, pageNum, limitNum, category);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          fromCache: true,
        });
      }
    }

    // Build optimized filter
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    // Use the optimized static method
    const result = await Notification.getLightweight(
      userId,
      pageNum,
      limitNum,
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

    // ✅ حفظ في Redis (فقط للصفحة الأولى بدون فلاتر خاصة)
    if (pageNum === 1 && !type && isRead === undefined) {
      await setCachedNotificationList(userId, pageNum, limitNum, category, response.data);
    }

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

// Get notification details (Full data - no caching needed)
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

// Get unread count for specific user (Optimized with Redis)
router.get("/:userId/unread-count", async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ محاولة جلب من Redis أولاً
    const cached = await getCachedUnreadCount(userId);
    if (cached !== null) {
      return res.json({
        success: true,
        unreadCount: cached,
        fromCache: true,
      });
    }

    const stats = await Notification.getQuickStats(userId);

    // ✅ حفظ في Redis
    await setCachedUnreadCount(userId, stats.unreadCount);

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

// Get notification stats for a user (Optimized with Redis)
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ محاولة جلب من Redis أولاً
    const cached = await getCachedStats(userId);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true,
      });
    }

    const stats = await Notification.getQuickStats(userId);

    // ✅ حفظ في Redis
    await setCachedStats(userId, stats);

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
