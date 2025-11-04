/**
 * Role-Based Authorization Middleware
 * Handles role-specific access control
 */

const { protect } = require("./protect.middleware");

/**
 * Teacher and Admin only access
 * @middleware
 */
exports.teacherProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم معلم أو إداري
      if (req.user.role !== "teacher" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح للطلاب بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Teacher protect middleware error:", error);
    res.status(401).json({
      success: false,
      message: "خطأ في التحقق من صلاحيات المعلم",
    });
  }
};

/**
 * Admin only access
 * @middleware
 */
exports.adminProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم مسؤول
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لغير المسؤولين بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Admin protect middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "رمز المصادقة غير صالح أو منتهي الصلاحية",
      error: process.env.NODE_ENV === "production" ? undefined : error.message
    });
  }
};

/**
 * Restrict admin from student/teacher pages
 * @middleware
 */
exports.restrictAdmin = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم ليس مديراً
      if (req.user.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "هذه الصفحة غير متاحة للمديرين. الرجاء استخدام صفحة الإدارة الخاصة بك.",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Restrict admin middleware error:", error);
    res.status(401).json({
      success: false,
      message: "خطأ في التحقق من الصلاحيات",
    });
  }
};
