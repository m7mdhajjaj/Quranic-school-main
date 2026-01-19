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
 * Teacher, Admin, and TeacherAssistant access for marks
 * الوصول للمعلمين والمديرين ومساعدي المعلمين فقط
 * 
 * @middleware
 * @description يسمح فقط للمستخدمين من نوع teacher أو admin أو teacherAssistant
 * @access Protected (Teacher, Admin, TeacherAssistant only)
 */
exports.teacherProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم معلم أو إداري أو مساعد معلم
      const allowedRoles = ["teacher", "admin", "teacherAssistant"];
      if (!allowedRoles.includes(req.user.role)) {
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
      const allowedRoles = ["teacher", "secretary", "admin", "teacherAssistant"];
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
 * Teacher Assistant only access
 * الوصول لمساعد المدرس فقط
 * 
 * @middleware
 * @description يسمح فقط للمستخدمين من نوع teacherAssistant
 * @access Protected (Teacher Assistant only)
 */
exports.teacherAssistantProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم مساعد مدرس
      if (req.user.role !== "teacherAssistant") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لغير مساعد المدرس بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Teacher Assistant protect middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "خطأ في التحقق من الصلاحيات",
    });
  }
};

/**
 * Teacher Assistant or Admin access
 * الوصول لمساعد المدرس أو المدير
 * 
 * @middleware
 * @description يسمح لمساعد المدرس والمدير فقط
 * @access Protected (Teacher Assistant, Admin)
 */
exports.teacherAssistantOrAdminProtect = async (req, res, next) => {
  try {
    // استخدام وسيط الحماية أولاً
    await protect(req, res, () => {
      // التحقق من أن المستخدم مساعد مدرس أو إداري
      if (req.user.role !== "teacherAssistant" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مصرح لغير مساعد المدرس أو المدير بالوصول إلى هذه الصفحة",
        });
      }

      next();
    });
  } catch (error) {
    console.error("Teacher Assistant or Admin protect middleware error:", error);
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
        console.log('🔑 [secretaryGroupsAccess] Required Level:', requiredLevel);
        console.log('📊 [secretaryGroupsAccess] User:', { id: req.user.id, role: req.user.role });
        
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          console.log('✅ [secretaryGroupsAccess] Admin - Full Access Granted');
          return next();
        }
        
        // التحقق من صلاحيات المعلم (يسمح للمعلم برؤية الحلقات وطلاب حلقة معينة)
        if (req.user.role === "teacher") {
          console.log('✅ [secretaryGroupsAccess] Teacher - View Access Granted');
          // المعلم يحق له فقط العرض (view)
          if (requiredLevel === 'view') {
            return next();
          }
          // إذا طلب إدارة، نمنعه
          return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية لإدارة الحلقات",
          });
        }

        // التحقق من صلاحيات السكرتير
        if (req.user.role === "secretary") {
          const Secretary = require("../../schema/Secretary");
          const secretary = await Secretary.findById(req.user.id);
          
          console.log('📑 [secretaryGroupsAccess] Secretary Found:', !!secretary);
          
          if (!secretary) {
            console.log('❌ [secretaryGroupsAccess] Secretary not found in database');
            return res.status(404).json({
              success: false,
              message: "السكرتير غير موجود",
            });
          }
          
          const groupsAccessLevel = secretary.permissions?.groupsAccess || 'none';
          const studentsAccessLevel = secretary.permissions?.studentsAccess || 'none';
          
          console.log('🔐 [secretaryGroupsAccess] Permissions:', {
            groupsAccess: groupsAccessLevel,
            studentsAccess: studentsAccessLevel
          });
          
          // إذا كان المطلوب عرض فقط، نسمح لمن لديه صلاحية الحلقات أو الطلاب
          if (requiredLevel === 'view') {
            // السماح إذا كان لديه صلاحية الحلقات (view أو manage)
            if (groupsAccessLevel !== 'none') {
              console.log('✅ [secretaryGroupsAccess] View Access Granted - Has Groups Permission');
              req.secretaryAccessLevel = groupsAccessLevel;
              return next();
            }
            // السماح إذا كان لديه صلاحية الطلاب (لأنه يحتاج يشوف الحلقات لإضافة طالب)
            if (studentsAccessLevel !== 'none') {
              console.log('✅ [secretaryGroupsAccess] View Access Granted - Has Students Permission');
              req.secretaryAccessLevel = 'view'; // فقط عرض
              return next();
            }
            // لا يملك أي صلاحية
            console.log('❌ [secretaryGroupsAccess] Access Denied - No Groups or Students Permission');
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى الحلقات",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون لديه groupsAccess = manage
          if (requiredLevel === 'manage') {
            if (groupsAccessLevel !== 'manage') {
              console.log('❌ [secretaryGroupsAccess] Manage Access Denied - Needs Manage Permission');
              return res.status(403).json({
                success: false,
                message: "ليس لديك صلاحية لإدارة الحلقات",
              });
            }
            console.log('✅ [secretaryGroupsAccess] Manage Access Granted');
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
        console.log('🔑 [secretaryTeachersAccess] Required Level:', requiredLevel);
        console.log('📊 [secretaryTeachersAccess] User:', { id: req.user.id, role: req.user.role });
        
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          console.log('✅ [secretaryTeachersAccess] Admin - Full Access Granted');
          return next();
        }
        
        // السماح للمعلم بالوصول لبياناته الخاصة فقط (للعرض)
        if (req.user.role === "teacher") {
          const requestedId = req.params.id || req.params.teacherId;
          console.log('🏫 [secretaryTeachersAccess] Teacher Self Access Check:', {
            requestedId,
            teacherId: req.user.id,
            isSelf: requestedId === req.user.id
          });
          // المعلم يمكنه فقط عرض بياناته الخاصة
          if (requestedId && requestedId === req.user.id && requiredLevel === 'view') {
            console.log('✅ [secretaryTeachersAccess] Teacher Self-Access Granted');
            req.isSelfAccess = true;
            return next();
          }
          // لا يمكن للمعلم الوصول لبيانات معلمين آخرين أو إدارة البيانات
          console.log('❌ [secretaryTeachersAccess] Teacher Access Denied - Not Self or Manage');
          return res.status(403).json({
            success: false,
            message: "غير مصرح لك بالوصول إلى بيانات معلمين آخرين",
          });
        }
        
        // التحقق من صلاحيات السكرتير
        if (req.user.role === "secretary") {
          const Secretary = require("../../schema/Secretary");
          const secretary = await Secretary.findById(req.user.id);
          
          console.log('📑 [secretaryTeachersAccess] Secretary Found:', !!secretary);
          
          if (!secretary) {
            console.log('❌ [secretaryTeachersAccess] Secretary not found in database');
            return res.status(404).json({
              success: false,
              message: "السكرتير غير موجود",
            });
          }
          
          const accessLevel = secretary.permissions?.teachersAccess || 'none';
          
          console.log('🔐 [secretaryTeachersAccess] Permission Level:', accessLevel);
          
          // التحقق من مستوى الصلاحية
          if (accessLevel === 'none') {
            console.log('❌ [secretaryTeachersAccess] Access Denied - No Permission');
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى المعلمين",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون manage
          if (requiredLevel === 'manage' && accessLevel !== 'manage') {
            console.log('❌ [secretaryTeachersAccess] Manage Access Denied - View Only');
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة المعلمين (عرض فقط)",
            });
          }
          
          console.log('✅ [secretaryTeachersAccess] Access Granted - Level:', accessLevel);
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
 * التحقق من صلاحية الوصول للطلاب
 * 
 * @middleware
 * @param {'view' | 'manage'} requiredLevel - مستوى الصلاحية المطلوب
 * @description يسمح للأدمن أو المعلم أو السكرتير الذي لديه صلاحية الطلاب
 *              - الأدمن: وصول كامل
 *              - المعلم: عرض طلاب حلقاته فقط
 *              - الطالب: وصول لبياناته فقط
 *              - السكرتير: حسب صلاحياته
 * @access Protected (Admin, Teacher for own groups, Secretary with studentsAccess, Student for self-access)
 */
exports.secretaryStudentsAccess = (requiredLevel = 'view') => {
  return async (req, res, next) => {
    try {
      await protect(req, res, async () => {
        console.log('🔑 [secretaryStudentsAccess] Required Level:', requiredLevel);
        console.log('📊 [secretaryStudentsAccess] User:', { id: req.user.id, role: req.user.role });
        
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          console.log('✅ [secretaryStudentsAccess] Admin - Full Access Granted');
          return next();
        }
        
        // ✅ المعلم يستطيع عرض طلاب حلقاته فقط (view)
        if (req.user.role === "teacher") {
          console.log('🏫 [secretaryStudentsAccess] Teacher - View Access for Own Groups');
          if (requiredLevel === 'view') {
            req.isTeacherAccess = true;
            return next();
          }
          // المعلم لا يستطيع إدارة الطلاب (إضافة/حذف)
          return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية لإدارة الطلاب",
          });
        }
        
        // ✅ مساعد المدرس يستطيع عرض طلاب حلقاته المسموح بها فقط (view)
        if (req.user.role === "teacherAssistant") {
          console.log('👨‍🏫 [secretaryStudentsAccess] TeacherAssistant - View Access for Allowed Groups');
          if (requiredLevel === 'view') {
            req.isTeacherAssistantAccess = true;
            return next();
          }
          // مساعد المدرس لا يستطيع إدارة الطلاب (إضافة/حذف)
          return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية لإدارة الطلاب",
          });
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
          
          console.log('📑 [secretaryStudentsAccess] Secretary Found:', !!secretary);
          
          if (!secretary) {
            console.log('❌ [secretaryStudentsAccess] Secretary not found in database');
            return res.status(404).json({
              success: false,
              message: "السكرتير غير موجود",
            });
          }
          
          const accessLevel = secretary.permissions?.studentsAccess || 'none';
          
          console.log('🔐 [secretaryStudentsAccess] Permission Level:', accessLevel);
          
          // التحقق من مستوى الصلاحية
          if (accessLevel === 'none') {
            console.log('❌ [secretaryStudentsAccess] Access Denied - No Permission');
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى الطلاب",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون manage
          if (requiredLevel === 'manage' && accessLevel !== 'manage') {
            console.log('❌ [secretaryStudentsAccess] Manage Access Denied - View Only');
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة الطلاب (عرض فقط)",
            });
          }
          
          console.log('✅ [secretaryStudentsAccess] Access Granted - Level:', accessLevel);
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

/**
 * Secretary Timetable Access Middleware
 * التحقق من صلاحية الوصول للجدول (الأسبوعي والشهري)
 * 
 * @middleware
 * @description يسمح للأدمن أو المعلم أو الطالب أو السكرتير الذي لديه صلاحية الجدول
 *              - الأدمن: وصول كامل مع إدارة
 *              - المعلم: عرض جدوله فقط
 *              - الطالب: عرض جدول حلقته فقط
 *              - السكرتير: عرض فقط حسب صلاحياته
 * @access Protected (Admin with full access, Teacher/Student with view only, Secretary with view based on permission)
 */
/**
 * Timetable Access Middleware
 * التحقق من صلاحية الوصول للجدول
 * 
 * @middleware
 * @param {'view' | 'manage'} requiredLevel - مستوى الصلاحية المطلوب
 * @description يسمح للأدمن أو المعلم أو الطالب أو السكرتير
 *              - الأدمن: وصول كامل (إدارة جميع المواعيد)
 *              - المعلم: إدارة مواعيد حلقاته فقط
 *              - الطالب: عرض جدول حلقته فقط
 *              - السكرتير: حسب صلاحياته
 * @access Protected
 */
exports.secretaryTimetableAccess = (requiredLevel = 'view') => {
  return async (req, res, next) => {
    try {
      await protect(req, res, async () => {
        console.log('🔑 [secretaryTimetableAccess] Required Level:', requiredLevel);
        console.log('📊 [secretaryTimetableAccess] User:', { id: req.user.id, role: req.user.role });
        
        // الأدمن لديه وصول كامل
        if (req.user.role === "admin") {
          console.log('✅ [secretaryTimetableAccess] Admin - Full Access Granted');
          req.canManage = true; // الأدمن يستطيع الإدارة
          return next();
        }
        
        // ✅ المعلم يستطيع إدارة مواعيد حلقاته فقط
        if (req.user.role === "teacher") {
          console.log('🏫 [secretaryTimetableAccess] Teacher - Access for Own Groups');
          // المعلم يستطيع العرض والإدارة (التحقق من الحلقة يتم في الـ controller)
          req.canManage = true; // يستطيع الإدارة لحلقاته
          req.isTeacherAccess = true; // علامة للتحقق في الـ controller
          req.teacherId = req.user.id; // معرف المعلم للتحقق
          return next();
        }
        
        // ✅ الطالب لديه وصول للعرض فقط (لجدول حلقته)
        if (req.user.role === "student") {
          console.log('👨‍🎓 [secretaryTimetableAccess] Student - View Only');
          if (requiredLevel === 'manage') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة الجدول",
            });
          }
          req.canManage = false; // الطالب عرض فقط
          return next();
        }
        
        // ✅ مساعد المعلم لديه وصول للعرض فقط (لجدول الحلقات المسموح له بها)
        if (req.user.role === "teacherAssistant") {
          console.log('👨‍🏫 [secretaryTimetableAccess] Teacher Assistant - View Only for Allowed Groups');
          if (requiredLevel === 'manage') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة الجدول",
            });
          }
          req.canManage = false; // المساعد عرض فقط
          req.isTeacherAssistantAccess = true; // علامة للتحقق في الـ controller
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
          
          const accessLevel = secretary.permissions?.timetableAccess || 'none';
          
          console.log('🔐 [secretaryTimetableAccess] Secretary Permission:', accessLevel);
          
          // التحقق من مستوى الصلاحية
          if (accessLevel === 'none') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية للوصول إلى الجدول",
            });
          }
          
          // إذا كان المطلوب إدارة، يجب أن يكون manage
          if (requiredLevel === 'manage' && accessLevel !== 'manage') {
            return res.status(403).json({
              success: false,
              message: "ليس لديك صلاحية لإدارة الجدول (عرض فقط)",
            });
          }
          
          req.canManage = accessLevel === 'manage';
          req.secretaryAccessLevel = accessLevel;
          return next();
        }
        
        // غير مصرح لأي دور آخر
        return res.status(403).json({
          success: false,
          message: "غير مصرح لك بالوصول إلى الجدول",
        });
      });
    } catch (error) {
      console.error("Secretary timetable access middleware error:", error);
      return res.status(401).json({
        success: false,
        message: "خطأ في التحقق من صلاحيات الجدول",
      });
    }
  };
};
