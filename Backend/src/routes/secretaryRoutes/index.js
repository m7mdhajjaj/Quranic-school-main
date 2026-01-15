/**
 * ============================================================================
 * Secretary Routes - مسارات API للسكرتير
 * ============================================================================
 */

const express = require("express");
const router = express.Router();

const {
  getAllSecretaries,
  getSecretaryById,
  createSecretary,
  updateSecretary,
  updateSecretaryPermissions,
  deleteSecretary,
  changeSecretaryPassword,
  getCurrentSecretary,
  getSecretaryStats,
  checkDuplicate,
} = require("../../controllers/secretaryController");

const {
  protect,
  adminProtect,
  secretaryProtect,
  secretaryOrAdminProtect,
} = require("../../middleware/auth");

// استيراد مسارات الصورة الشخصية
const avatarRoutes = require("./avatar.routes");

// ============================================================================
// Avatar Routes - مسارات الصورة الشخصية
// ============================================================================
router.use("/", avatarRoutes);

// ============================================================================
// Secretary Self Routes - مسارات السكرتير لنفسه
// ============================================================================

// الحصول على بيانات السكرتير الحالي
router.get("/me", secretaryProtect, getCurrentSecretary);

// ============================================================================
// Admin Routes - مسارات الإدارة
// ============================================================================

// الحصول على إحصائيات السكرتيرين
router.get("/stats", adminProtect, getSecretaryStats);

// التحقق من تكرار البيانات (email, phoneNumber, idNumber)
router.post("/check-duplicate", adminProtect, checkDuplicate);

// الحصول على جميع السكرتيرين
router.get("/", adminProtect, getAllSecretaries);

// الحصول على سكرتير بواسطة ID
router.get("/:id", secretaryOrAdminProtect, getSecretaryById);

// إنشاء سكرتير جديد
router.post("/", adminProtect, createSecretary);

// تحديث بيانات سكرتير
router.put("/:id", secretaryOrAdminProtect, updateSecretary);

// تحديث صلاحيات السكرتير (Admin only)
router.patch("/:id/permissions", adminProtect, updateSecretaryPermissions);

// تغيير كلمة مرور السكرتير
router.patch("/:id/password", secretaryOrAdminProtect, changeSecretaryPassword);

// حذف سكرتير
router.delete("/:id", adminProtect, deleteSecretary);

module.exports = router;
