/**
 * ============================================================================
 * Role-Based Authorization Middleware - التحقق من الصلاحيات
 * ============================================================================
 * 
 * يتعامل مع التحكم في الوصول حسب دور المستخدم
 * يستخدم protect middleware أولاً ثم يتحقق من الدور
 */

const { protect } = require("./protect.middleware");

/**
 * Teacher and Admin only access
 * الوصول للمعلمين والمديرين فقط
 * 
 * @middleware
 * @description يسمح فقط للمستخدمين من نوع teacher أو admin
 * @access Protected (Teacher, Admin only)
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
 * الوصول للمديرين فقط
 * 
 * @middleware
 * @description يسمح فقط للمستخدمين من نوع admin
 * @access Protected (Admin only)
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
 * منع المديرين من صفحات الطلاب/المعلمين
 * 
 * @middleware
 * @description يمنع المستخدمين من نوع admin من الوصول
 * @access Protected (Students and Teachers only)
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
