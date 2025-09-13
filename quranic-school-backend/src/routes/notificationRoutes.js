const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// جلب إشعارات المستخدم مع التصفح
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, isRead } = req.query;

    // بناء فلتر الاستعلام
    const filter = { recipient: userId };

    if (type) {
      filter.type = type;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    // الحصول على الإشعارات مع التصفح
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // حساب العدد الإجمالي للإشعارات
    const totalCount = await Notification.countDocuments(filter);

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    // حساب عدد الإشعارات الجديدة (آخر 5 دقائق)
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

// الحصول على عدد الإشعارات غير المقروءة فقط
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

// تحديد إشعار واحد كمقروء
router.patch("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
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

// تحديد جميع إشعارات المستخدم كمقروءة
router.patch("/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
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

// حذف إشعار واحد
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود",
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

// حذف جميع الإشعارات المقروءة للمستخدم
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

// إنشاء إشعار جديد (للاختبار أو الإدارة)
router.post("/", async (req, res) => {
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

    // إرسال الإشعار فوراً إذا كانت خدمة الإشعارات متاحة
    if (global.notificationService) {
      await global.notificationService.sendRealTimeNotification(
        savedNotification
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

// الحصول على إحصائيات الإشعارات للمستخدم
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Notification.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId) } },
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
      { $match: { recipient: mongoose.Types.ObjectId(userId) } },
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

// البحث في الإشعارات
router.get("/:userId/search", async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, type, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    const filter = { recipient: userId };

    // البحث النصي
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }

    // فلتر حسب النوع
    if (type) {
      filter.type = type;
    }

    // فلتر حسب التاريخ
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
