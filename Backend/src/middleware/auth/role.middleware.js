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

/**
 * Secretary only access
 * الوصول للسكرتير فقط
 * 
 * @middleware
 * @description يسمح فقط للمستخدمين من نوع secretary
 * @access Protected (Secretary only)
 */
exports.secretaryProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم سكرتير
      if (req.user.role !== "secretary") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لغير السكرتير بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Secretary protect middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "خطأ في التحقق من صلاحيات السكرتير",
    });
  }
};

/**
 * Secretary and Admin access
 * الوصول للسكرتير والمديرين
 * 
 * @middleware
 * @description يسمح للمستخدمين من نوع secretary أو admin
 * @access Protected (Secretary, Admin only)
 */
exports.secretaryOrAdminProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم سكرتير أو إداري
      if (req.user.role !== "secretary" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لغير السكرتير أو المدير بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Secretary or Admin protect middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "خطأ في التحقق من الصلاحيات",
    });
  }
};

/**
 * Staff access (Teacher, Secretary, Admin)
 * الوصول للموظفين (المعلمين والسكرتير والمديرين)
 * 
 * @middleware
 * @description يسمح للمعلمين والسكرتير والمديرين
 * @access Protected (Teacher, Secretary, Admin)
 */
exports.staffProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم موظف
      const allowedRoles = ["teacher", "secretary", "admin"];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "غير مصرح للطلاب بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Staff protect middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "خطأ في التحقق من الصلاحيات",
    });
  }
};

/**
 * Secretary Groups Access Middleware
 * التحقق من صلاحية السكرتير للوصول للحلقات
 * 
 * @middleware
 * @param {'view' | 'manage'} requiredLevel - مستوى الصلاحية المطلوب
 * @description يسمح للأدمن أو السكرتير الذي لديه صلاحية الحلقات
 *              كما يسمح للسكرتير الذي لديه صلاحية الطلاب بعرض الحلقات (لإضافة طالب لحلقة)
 * @access Protected (Admin, Secretary with groupsAccess or studentsAccess for view)
 */
exports.secretaryGroupsAccess = (requiredLevel = 'view') => {
  return async (req, res, next) => {
    try {
      await protect(req, res, async () => {
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          return next();
        }
        
        // التحقق من صلاحيات السكرتير
        if (req.user.role === "secretary") {
          const Secretary = require("../../schema/Secretary");
          const secretary = await Secretary.findById(req.user.id);
          
          if (!secretary) {
            return res.status(404).json({
              success: false,
              message: "السكرتير غير موجود",
            });
          }
          
          const groupsAccessLevel = secretary.permissions?.groupsAccess || 'none';
          const studentsAccessLevel = secretary.permissions?.studentsAccess || 'none';
          
          // إذا كان المطلوب عرض فقط، نسمح لمن لديه صلاحية الحلقات أو الطلاب
          if (requiredLevel === 'view') {
            // السماح إذا كان لديه صلاحية الحلقات (view أو manage)
            if (groupsAccessLevel !== 'none') {
              req.secretaryAccessLevel = groupsAccessLevel;
              return next();
            }
            // السماح إذا كان لديه صلاحية الطلاب (لأنه يحتاج يشوف الحلقات لإضافة طالب)
            if (studentsAccessLevel !== 'none') {
              req.secretaryAccessLevel = 'view'; // فقط عرض
              return next();
            }
            // لا يملك أي صلاحية
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى الحلقات",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون لديه groupsAccess = manage
          if (requiredLevel === 'manage') {
            if (groupsAccessLevel !== 'manage') {
              return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية لإدارة الحلقات",
              });
            }
            req.secretaryAccessLevel = 'manage';
            return next();
          }
          
          // أي حالة أخرى
          return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية للوصول إلى الحلقات",
          });
        }
        
        // غير مصرح لأي دور آخر
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بالوصول إلى هذه الصفحة",
        });
      });
    } catch (error) {
      console.error("Secretary groups access middleware error:", error);
      return res.status(401).json({
        success: false,
        message: "خطأ في التحقق من صلاحيات الحلقات",
      });
    }
  };
};

/**
 * Secretary Teachers Access Middleware
 * التحقق من صلاحية السكرتير للوصول للمعلمين
 * 
 * @middleware
 * @param {'view' | 'manage'} requiredLevel - مستوى الصلاحية المطلوب
 * @description يسمح للأدمن أو السكرتير الذي لديه صلاحية المعلمين
 *              كما يسمح للمعلم بالوصول لبياناته الخاصة فقط
 * @access Protected (Admin, Secretary with teachersAccess, Teacher for self-access)
 */
exports.secretaryTeachersAccess = (requiredLevel = 'view') => {
  return async (req, res, next) => {
    try {
      await protect(req, res, async () => {
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          return next();
        }
        
        // السماح للمعلم بالوصول لبياناته الخاصة فقط (للعرض)
        if (req.user.role === "teacher") {
          const requestedId = req.params.id || req.params.teacherId;
          // المعلم يمكنه فقط عرض بياناته الخاصة
          if (requestedId && requestedId === req.user.id && requiredLevel === 'view') {
            req.isSelfAccess = true;
            return next();
          }
          // لا يمكن للمعلم الوصول لبيانات معلمين آخرين أو إدارة البيانات
          return res.status(403).json({
            success: false,
            message: "غير مصرح لك بالوصول إلى بيانات معلمين آخرين",
          });
        }
        
        // التحقق من صلاحيات السكرتير
        if (req.user.role === "secretary") {
          const Secretary = require("../../schema/Secretary");
          const secretary = await Secretary.findById(req.user.id);
          
          if (!secretary) {
            return res.status(404).json({
              success: false,
              message: "السكرتير غير موجود",
            });
          }
          
          const accessLevel = secretary.permissions?.teachersAccess || 'none';
          
          // التحقق من مستوى الصلاحية
          if (accessLevel === 'none') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى المعلمين",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون manage
          if (requiredLevel === 'manage' && accessLevel !== 'manage') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة المعلمين (عرض فقط)",
            });
          }
          
          // إضافة مستوى الصلاحية للـ request
          req.secretaryAccessLevel = accessLevel;
          return next();
        }
        
        // غير مصرح لأي دور آخر
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بالوصول إلى هذه الصفحة",
        });
      });
    } catch (error) {
      console.error("Secretary teachers access middleware error:", error);
      return res.status(401).json({
        success: false,
        message: "خطأ في التحقق من صلاحيات المعلمين",
      });
    }
  };
};

/**
 * Secretary Students Access Middleware
 * التحقق من صلاحية السكرتير للوصول للطلاب
 * 
 * @middleware
 * @param {'view' | 'manage'} requiredLevel - مستوى الصلاحية المطلوب
 * @description يسمح للأدمن أو السكرتير الذي لديه صلاحية الطلاب
 *              كما يسمح للطالب بالوصول لبياناته الخاصة فقط
 * @access Protected (Admin, Secretary with studentsAccess, Student for self-access)
 */
exports.secretaryStudentsAccess = (requiredLevel = 'view') => {
  return async (req, res, next) => {
    try {
      await protect(req, res, async () => {
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          return next();
        }
        
        // السماح للطالب بالوصول لبياناته الخاصة فقط (للعرض)
        if (req.user.role === "student") {
          const requestedId = req.params.id || req.params.studentId;
          // الطالب يمكنه فقط عرض بياناته الخاصة
          if (requestedId && requestedId === req.user.id && requiredLevel === 'view') {
            req.isSelfAccess = true;
            return next();
          }
          // لا يمكن للطالب الوصول لبيانات طلاب آخرين أو إدارة البيانات
          return res.status(403).json({
            success: false,
            message: "غير مصرح لك بالوصول إلى بيانات طلاب آخرين",
          });
        }
        
        // التحقق من صلاحيات السكرتير
        if (req.user.role === "secretary") {
          const Secretary = require("../../schema/Secretary");
          const secretary = await Secretary.findById(req.user.id);
          
          if (!secretary) {
            return res.status(404).json({
              success: false,
              message: "السكرتير غير موجود",
            });
          }
          
          const accessLevel = secretary.permissions?.studentsAccess || 'none';
          
          // التحقق من مستوى الصلاحية
          if (accessLevel === 'none') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى الطلاب",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون manage
          if (requiredLevel === 'manage' && accessLevel !== 'manage') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة الطلاب (عرض فقط)",
            });
          }
          
          // إضافة مستوى الصلاحية للـ request
          req.secretaryAccessLevel = accessLevel;
          return next();
        }
        
        // غير مصرح لأي دور آخر
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بالوصول إلى هذه الصفحة",
        });
      });
    } catch (error) {
      console.error("Secretary students access middleware error:", error);
      return res.status(401).json({
        success: false,
        message: "خطأ في التحقق من صلاحيات الطلاب",
      });
    }
  };
};
