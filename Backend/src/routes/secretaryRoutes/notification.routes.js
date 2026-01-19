/**
 * ============================================================================
 * Secretary Notification Routes - مسارات إشعارات السكرتير
 * ============================================================================
 * 
 * ✅ يمكن للسكرتير إرسال إشعارات لـ:
 * - الطلاب (إذا كان لديه studentsAccess)
 * - المعلمين (إذا كان لديه teachersAccess)
 * - المدير (دائماً)
 * 
 * ⚠️ لا يمكن للسكرتير إرسال إشعارات للمساعدين
 */

const express = require("express");
const router = express.Router();
const { secretaryProtect } = require("../../middleware/auth");
const { getSecretaryPermissions } = require("../../Notifications/Handlers/SecretaryHandler");

// ============================================================================
// Get Secretary Permissions
// ============================================================================

/**
 * GET /api/secretary/notifications/permissions
 * جلب صلاحيات السكرتير للإشعارات
 */
router.get("/permissions", secretaryProtect, async (req, res) => {
  try {
    const secretaryId = req.user._id;
    const permissions = await getSecretaryPermissions(secretaryId);
    
    if (!permissions) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }
    
    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Error getting secretary permissions:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الصلاحيات",
      error: error.message,
    });
  }
});

// ============================================================================
// Broadcast Notifications
// ============================================================================

/**
 * POST /api/secretary/notifications/broadcast/students
 * إرسال إشعار لجميع الطلاب
 */
router.post("/broadcast/students", secretaryProtect, async (req, res) => {
  try {
    const { title, message, data = {} } = req.body;
    const secretaryId = req.user._id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "العنوان والرسالة مطلوبان",
      });
    }
    
    const result = await global.notificationService.secretaryNotifyAllStudents(
      secretaryId,
      title,
      message,
      data
    );
    
    if (!result.success && result.reason === 'no_permission') {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية إرسال إشعارات للطلاب",
      });
    }
    
    res.json({
      success: true,
      message: `تم إرسال الإشعار لـ ${result.count} طالب`,
      data: result,
    });
  } catch (error) {
    console.error("Error broadcasting to students:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إرسال الإشعار",
      error: error.message,
    });
  }
});

/**
 * POST /api/secretary/notifications/broadcast/teachers
 * إرسال إشعار لجميع المعلمين
 */
router.post("/broadcast/teachers", secretaryProtect, async (req, res) => {
  try {
    const { title, message, data = {} } = req.body;
    const secretaryId = req.user._id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "العنوان والرسالة مطلوبان",
      });
    }
    
    const result = await global.notificationService.secretaryNotifyAllTeachers(
      secretaryId,
      title,
      message,
      data
    );
    
    if (!result.success && result.reason === 'no_permission') {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية إرسال إشعارات للمعلمين",
      });
    }
    
    res.json({
      success: true,
      message: `تم إرسال الإشعار لـ ${result.count} معلم`,
      data: result,
    });
  } catch (error) {
    console.error("Error broadcasting to teachers:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إرسال الإشعار",
      error: error.message,
    });
  }
});

/**
 * POST /api/secretary/notifications/broadcast/admin
 * إرسال إشعار للمدير
 */
router.post("/broadcast/admin", secretaryProtect, async (req, res) => {
  try {
    const { title, message, data = {} } = req.body;
    const secretaryId = req.user._id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "العنوان والرسالة مطلوبان",
      });
    }
    
    const result = await global.notificationService.secretaryNotifyAdmin(
      secretaryId,
      title,
      message,
      data
    );
    
    res.json({
      success: true,
      message: "تم إرسال الإشعار للمدير",
      data: result,
    });
  } catch (error) {
    console.error("Error notifying admin:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إرسال الإشعار",
      error: error.message,
    });
  }
});

/**
 * POST /api/secretary/notifications/broadcast/all
 * إرسال إشعار للجميع (حسب الصلاحيات)
 * ⚠️ لا يشمل المساعدين
 */
router.post("/broadcast/all", secretaryProtect, async (req, res) => {
  try {
    const { title, message, data = {} } = req.body;
    const secretaryId = req.user._id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "العنوان والرسالة مطلوبان",
      });
    }
    
    const result = await global.notificationService.secretaryNotifyAll(
      secretaryId,
      title,
      message,
      data
    );
    
    if (!result.success && result.reason === 'secretary_not_found') {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }
    
    res.json({
      success: true,
      message: "تم إرسال الإشعارات",
      data: result,
    });
  } catch (error) {
    console.error("Error broadcasting to all:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إرسال الإشعارات",
      error: error.message,
    });
  }
});

// ============================================================================
// Individual Notifications
// ============================================================================

/**
 * POST /api/secretary/notifications/student/:studentId
 * إرسال إشعار لطالب معين
 */
router.post("/student/:studentId", secretaryProtect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { title, message, data = {} } = req.body;
    const secretaryId = req.user._id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "العنوان والرسالة مطلوبان",
      });
    }
    
    const result = await global.notificationService.secretaryNotifyStudent(
      secretaryId,
      studentId,
      title,
      message,
      data
    );
    
    if (!result.success && result.reason === 'no_permission') {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية إرسال إشعارات للطلاب",
      });
    }
    
    res.json({
      success: true,
      message: "تم إرسال الإشعار للطالب",
      data: result,
    });
  } catch (error) {
    console.error("Error notifying student:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إرسال الإشعار",
      error: error.message,
    });
  }
});

/**
 * POST /api/secretary/notifications/teacher/:teacherId
 * إرسال إشعار لمعلم معين
 */
router.post("/teacher/:teacherId", secretaryProtect, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { title, message, data = {} } = req.body;
    const secretaryId = req.user._id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "العنوان والرسالة مطلوبان",
      });
    }
    
    const result = await global.notificationService.secretaryNotifyTeacher(
      secretaryId,
      teacherId,
      title,
      message,
      data
    );
    
    if (!result.success && result.reason === 'no_permission') {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية إرسال إشعارات للمعلمين",
      });
    }
    
    res.json({
      success: true,
      message: "تم إرسال الإشعار للمعلم",
      data: result,
    });
  } catch (error) {
    console.error("Error notifying teacher:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إرسال الإشعار",
      error: error.message,
    });
  }
});

module.exports = router;
