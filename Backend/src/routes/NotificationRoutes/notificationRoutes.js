// ============================================================================
// notificationRoutes.js - Main Router Entry Point
// ============================================================================
// 
// تم تقسيم الـ routes إلى ملفات منفصلة في مجلد NotificationRoutes:
// - getRoutes.js: جلب الإشعارات
// - updateRoutes.js: تحديث الإشعارات
// - deleteRoutes.js: حذف الإشعارات
// - createRoutes.js: إنشاء إشعارات
// ملاحظة: إدارة توكنات FCM تم نقلها إلى /api/fcm (fcmRoutes.js)
//
// ============================================================================

const express = require("express");
const router = express.Router();

// Import route modules
const getRoutes = require("./getRoutes");
const updateRoutes = require("./updateRoutes");
const deleteRoutes = require("./deleteRoutes");
const createRoutes = require("./createRoutes");

// Mount route modules
router.use("/", getRoutes);
router.use("/", updateRoutes);
router.use("/", deleteRoutes);
router.use("/", createRoutes);

module.exports = router;
