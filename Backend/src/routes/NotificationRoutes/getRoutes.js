// ============================================================================
// getRoutes.js - GET Routes for Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const Notification = require("../../schema/Notification");
const { protect } = require("../../middleware/authMiddleware");

// ============================================================================
// Get Routes (Protected - Current User)
// ============================================================================

// Get recent notifications for current user
router.get("/recent", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: notifications,
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

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.json({
      success: true,
      count,
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

// Get notifications for a specific user with pagination
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, isRead } = req.query;

    // Build filter
    const filter = { recipient: userId };

    if (type) {
      filter.type = type;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    // Get new count (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const newCount = await Notification.countDocuments({
      recipient: userId,
      createdAt: { $gte: fiveMinutesAgo },
    });

    const response = {
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNextPage: parseInt(page) * parseInt(limit) < totalCount,
          hasPrevPage: parseInt(page) > 1,
        },
        stats: {
          unreadCount,
          newCount,
          totalCount,
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

// Get unread count for specific user
router.get("/:userId/unread-count", async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
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
    const mongoose = require("mongoose");

    const stats = await Notification.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
          read: {
            $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          type: "$_id",
          total: 1,
          unread: 1,
          read: 1,
          _id: 0,
        },
      },
    ]);

    const totalStats = await Notification.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
          read: {
            $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byType: stats,
        overall: totalStats[0] || { total: 0, unread: 0, read: 0 },
        generatedAt: new Date(),
      },
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

// Search notifications for a user
router.get("/:userId/search", async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, type, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    const filter = { recipient: userId };

    // Text search
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }

    // Filter by type
    if (type) {
      filter.type = type;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalCount = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
        },
        searchQuery: q,
      },
    });
  } catch (error) {
    console.error("Error searching notifications:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في البحث عن الإشعارات",
      error: error.message,
    });
  }
});

module.exports = router;
