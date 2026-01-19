// ============================================================================
// middleware/auth/groupOwnership.js - Group Ownership Authorization Middleware
// ============================================================================
// 
// ✅ OPTIMIZED: توحيد كود التحقق من ملكية الحلقة المكرر في 7+ ملفات
// يُستخدم للتحقق من أن المستخدم هو معلم الحلقة (أو مدير)
// ============================================================================

const Group = require("../../schema/Group");

/**
 * Middleware للتحقق من ملكية الحلقة
 * يسمح للمدير أو معلم الحلقة فقط
 * @param {string} groupIdParam - اسم البارامتر الذي يحتوي على ID الحلقة (default: 'groupId')
 */
const requireGroupOwnership = (groupIdParam = 'groupId') => {
  return async (req, res, next) => {
    try {
      // المدير لديه صلاحية كاملة
      if (req.user.role === 'admin') {
        return next();
      }

      const groupId = req.params[groupIdParam] || req.body[groupIdParam];
      
      if (!groupId) {
        return res.status(400).json({
          message: "معرف الحلقة مطلوب"
        });
      }

      const group = await Group.findById(groupId).select('teacher name').lean();
      
      if (!group) {
        return res.status(404).json({
          message: "الحلقة غير موجودة"
        });
      }

      // التحقق من أن المستخدم هو معلم الحلقة
      const isTeacherOfGroup = group.teacher.toString() === req.user._id.toString();
      
      if (!isTeacherOfGroup) {
        console.warn(`⚠️ Unauthorized access attempt - User: ${req.user._id}, Group: ${groupId}`);
        return res.status(403).json({
          message: "غير مصرح لك بالوصول لهذه الحلقة"
        });
      }

      // إضافة الحلقة للـ request لاستخدامها لاحقاً (تجنب استعلام إضافي)
      req.group = group;
      next();
    } catch (error) {
      console.error("Error in groupOwnership middleware:", error);
      res.status(500).json({ message: "حدث خطأ أثناء التحقق من الصلاحيات" });
    }
  };
};

/**
 * Middleware للتحقق من ملكية الإنذار (عبر الحلقة)
 * يُستخدم لعمليات حذف الإنذارات
 */
const requireWarningOwnership = async (req, res, next) => {
  try {
    // المدير لديه صلاحية كاملة
    if (req.user.role === 'admin') {
      return next();
    }

    const Warning = require("../../schema/Warning");
    const { warningId } = req.params;

    if (!warningId) {
      return res.status(400).json({
        message: "معرف الإنذار مطلوب"
      });
    }

    const warning = await Warning.findById(warningId)
      .populate('groupId', 'teacher name')
      .lean();

    if (!warning) {
      return res.status(404).json({
        message: "الإنذار غير موجود"
      });
    }

    // التحقق من أن المستخدم هو معلم الحلقة
    if (!warning.groupId || warning.groupId.teacher.toString() !== req.user._id.toString()) {
      console.warn(`⚠️ Unauthorized delete attempt - User: ${req.user._id}, Warning: ${warningId}`);
      return res.status(403).json({
        message: "غير مصرح لك بحذف هذا الإنذار"
      });
    }

    // إضافة الإنذار للـ request
    req.warning = warning;
    next();
  } catch (error) {
    console.error("Error in warningOwnership middleware:", error);
    res.status(500).json({ message: "حدث خطأ أثناء التحقق من الصلاحيات" });
  }
};

module.exports = {
  requireGroupOwnership,
  requireWarningOwnership
};
