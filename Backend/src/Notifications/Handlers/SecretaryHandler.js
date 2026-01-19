/**
 * SecretaryHandler.js
 * معالجة الإشعارات الخاصة بالسكرتير
 * 
 * ✅ الصلاحيات المدعومة:
 * - groupsAccess: none | view | manage (الحلقات)
 * - teachersAccess: none | view | manage (المعلمين)
 * - studentsAccess: none | view | manage (الطلاب)
 * - timetableAccess: none | view (الجدول)
 * 
 * ✅ يمكن للسكرتير إرسال إشعارات لـ:
 * - الطلاب (إذا كان لديه studentsAccess)
 * - المعلمين (إذا كان لديه teachersAccess)
 * - المدير (دائماً)
 * 
 * ⚠️ لا يمكن للسكرتير إرسال إشعارات للمساعدين
 */

const Secretary = require("../../schema/Secretary");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * التحقق من صلاحية السكرتير
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} permission - الصلاحية المطلوبة
 * @param {string} level - مستوى الصلاحية (view/manage)
 * @returns {Promise<boolean>}
 */
const checkSecretaryPermission = async (secretaryId, permission, level = 'view') => {
  try {
    const secretary = await Secretary.findById(secretaryId).select('permissions').lean();
    if (!secretary || !secretary.permissions) return false;
    
    const accessLevel = secretary.permissions[permission] || 'none';
    
    if (level === 'view') {
      return accessLevel === 'view' || accessLevel === 'manage';
    }
    if (level === 'manage') {
      return accessLevel === 'manage';
    }
    return false;
  } catch (error) {
    console.error('❌ Error checking secretary permission:', error);
    return false;
  }
};

/**
 * جلب صلاحيات السكرتير
 * @param {string} secretaryId - معرف السكرتير
 * @returns {Promise<Object>}
 */
const getSecretaryPermissions = async (secretaryId) => {
  try {
    const secretary = await Secretary.findById(secretaryId).select('permissions firstName lastName').lean();
    if (!secretary) return null;
    
    return {
      permissions: secretary.permissions || {},
      name: `${secretary.firstName} ${secretary.lastName}`,
      canAccessStudents: (secretary.permissions?.studentsAccess === 'view' || secretary.permissions?.studentsAccess === 'manage'),
      canManageStudents: secretary.permissions?.studentsAccess === 'manage',
      canAccessTeachers: (secretary.permissions?.teachersAccess === 'view' || secretary.permissions?.teachersAccess === 'manage'),
      canManageTeachers: secretary.permissions?.teachersAccess === 'manage',
      canAccessGroups: (secretary.permissions?.groupsAccess === 'view' || secretary.permissions?.groupsAccess === 'manage'),
      canManageGroups: secretary.permissions?.groupsAccess === 'manage',
      canAccessTimetable: secretary.permissions?.timetableAccess === 'view',
    };
  } catch (error) {
    console.error('❌ Error getting secretary permissions:', error);
    return null;
  }
};

// ============================================================================
// Broadcast Notifications (إشعارات للجميع)
// ============================================================================

/**
 * إرسال إشعار لجميع الطلاب (إذا كان لديه صلاحية)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifyAllStudents = async (createNotification, secretaryId, title, message, data = {}) => {
  // التحقق من الصلاحية
  const hasPermission = await checkSecretaryPermission(secretaryId, 'studentsAccess', 'view');
  if (!hasPermission) {
    console.warn('⚠️ Secretary does not have permission to notify students');
    return { success: false, reason: 'no_permission' };
  }
  
  try {
    // جلب جميع الطلاب النشطين
    const students = await Student.find({ isActive: true }).select('_id').lean();
    
    const notifications = [];
    for (const student of students) {
      notifications.push(
        createNotification({
          recipient: student._id,
          recipientModel: 'Student',
          title,
          message,
          messageSummary: message.length > 150 ? message.substring(0, 147) + '...' : message,
          type: 'general',
          category: 'general',
          data: {
            ...data,
            action: 'secretary_broadcast',
            fromSecretary: secretaryId,
          },
        })
      );
    }
    
    await Promise.all(notifications);
    console.log(`✅ Secretary broadcast to ${students.length} students`);
    return { success: true, count: students.length };
  } catch (error) {
    console.error('❌ Error sending broadcast to students:', error);
    return { success: false, error: error.message };
  }
};

/**
 * إرسال إشعار لجميع المعلمين (إذا كان لديه صلاحية)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifyAllTeachers = async (createNotification, secretaryId, title, message, data = {}) => {
  // التحقق من الصلاحية
  const hasPermission = await checkSecretaryPermission(secretaryId, 'teachersAccess', 'view');
  if (!hasPermission) {
    console.warn('⚠️ Secretary does not have permission to notify teachers');
    return { success: false, reason: 'no_permission' };
  }
  
  try {
    // جلب جميع المعلمين
    const teachers = await Teacher.find({}).select('_id').lean();
    
    const notifications = [];
    for (const teacher of teachers) {
      notifications.push(
        createNotification({
          recipient: teacher._id,
          recipientModel: 'Teacher',
          title,
          message,
          messageSummary: message.length > 150 ? message.substring(0, 147) + '...' : message,
          type: 'general',
          category: 'general',
          data: {
            ...data,
            action: 'secretary_broadcast',
            fromSecretary: secretaryId,
          },
        })
      );
    }
    
    await Promise.all(notifications);
    console.log(`✅ Secretary broadcast to ${teachers.length} teachers`);
    return { success: true, count: teachers.length };
  } catch (error) {
    console.error('❌ Error sending broadcast to teachers:', error);
    return { success: false, error: error.message };
  }
};

/**
 * إرسال إشعار للمدير
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifyAdmin = async (createNotification, secretaryId, title, message, data = {}) => {
  try {
    // جلب المدير (يفترض أن هناك مدير واحد على الأقل)
    const admin = await Admin.findOne({}).select('_id').lean();
    
    if (!admin) {
      console.warn('⚠️ No admin found to notify');
      return { success: false, reason: 'no_admin' };
    }
    
    await createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
      title,
      message,
      messageSummary: message.length > 150 ? message.substring(0, 147) + '...' : message,
      type: 'general',
      category: 'admin',
      priority: 'high',
      data: {
        ...data,
        action: 'secretary_message',
        fromSecretary: secretaryId,
      },
    });
    
    console.log('✅ Secretary notified admin');
    return { success: true };
  } catch (error) {
    console.error('❌ Error notifying admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * إرسال إشعار للجميع (طلاب + معلمين + مدير) حسب الصلاحيات
 * ⚠️ لا يشمل المساعدين (TeacherAssistants)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifyAll = async (createNotification, secretaryId, title, message, data = {}) => {
  const secretaryInfo = await getSecretaryPermissions(secretaryId);
  
  if (!secretaryInfo) {
    return { success: false, reason: 'secretary_not_found' };
  }
  
  const results = {
    students: { success: false, count: 0 },
    teachers: { success: false, count: 0 },
    admin: { success: false },
  };
  
  // إرسال للطلاب إذا كان لديه صلاحية
  if (secretaryInfo.canAccessStudents) {
    results.students = await exports.notifyAllStudents(createNotification, secretaryId, title, message, data);
  }
  
  // إرسال للمعلمين إذا كان لديه صلاحية
  if (secretaryInfo.canAccessTeachers) {
    results.teachers = await exports.notifyAllTeachers(createNotification, secretaryId, title, message, data);
  }
  
  // إرسال للمدير دائماً
  results.admin = await exports.notifyAdmin(createNotification, secretaryId, title, message, data);
  
  console.log('✅ Secretary broadcast completed:', results);
  return {
    success: true,
    results,
    sentBy: secretaryInfo.name,
  };
};

// ============================================================================
// Specific Notifications (إشعارات محددة)
// ============================================================================

/**
 * إشعار طالب معين
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} studentId - معرف الطالب
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifyStudent = async (createNotification, secretaryId, studentId, title, message, data = {}) => {
  const hasPermission = await checkSecretaryPermission(secretaryId, 'studentsAccess', 'view');
  if (!hasPermission) {
    return { success: false, reason: 'no_permission' };
  }
  
  try {
    await createNotification({
      recipient: studentId,
      recipientModel: 'Student',
      title,
      message,
      messageSummary: message.length > 150 ? message.substring(0, 147) + '...' : message,
      type: 'general',
      category: 'general',
      data: {
        ...data,
        action: 'secretary_message',
        fromSecretary: secretaryId,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error notifying student:', error);
    return { success: false, error: error.message };
  }
};

/**
 * إشعار معلم معين
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {string} teacherId - معرف المعلم
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 * @param {Object} data - بيانات إضافية
 */
exports.notifyTeacher = async (createNotification, secretaryId, teacherId, title, message, data = {}) => {
  const hasPermission = await checkSecretaryPermission(secretaryId, 'teachersAccess', 'view');
  if (!hasPermission) {
    return { success: false, reason: 'no_permission' };
  }
  
  try {
    await createNotification({
      recipient: teacherId,
      recipientModel: 'Teacher',
      title,
      message,
      messageSummary: message.length > 150 ? message.substring(0, 147) + '...' : message,
      type: 'general',
      category: 'general',
      data: {
        ...data,
        action: 'secretary_message',
        fromSecretary: secretaryId,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error notifying teacher:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// Action-Based Notifications (إشعارات حسب الإجراء)
// ============================================================================

/**
 * إشعار عند إضافة طالب (إذا كان لديه صلاحية manage)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {Object} student - بيانات الطالب
 * @param {string} groupName - اسم الحلقة
 * @param {string} teacherId - معرف المعلم
 */
exports.notifyStudentAdded = async (createNotification, secretaryId, student, groupName, teacherId) => {
  const secretaryInfo = await getSecretaryPermissions(secretaryId);
  
  if (!secretaryInfo || !secretaryInfo.canManageStudents) {
    return { success: false, reason: 'no_permission' };
  }
  
  const notifications = [];
  
  // إشعار الطالب
  notifications.push(
    createNotification({
      recipient: student._id,
      recipientModel: 'Student',
      title: 'مرحباً بك',
      message: `تم تسجيلك في حلقة ${groupName}`,
      messageSummary: `تسجيل في ${groupName}`,
      type: 'student_added',
      category: 'admin',
      data: {
        action: 'student_added',
        groupName,
        performedBy: secretaryInfo.name,
        performedByRole: 'secretary',
      },
    })
  );
  
  // إشعار المعلم
  if (teacherId) {
    notifications.push(
      createNotification({
        recipient: teacherId,
        recipientModel: 'Teacher',
        title: 'طالب جديد',
        message: `تم إضافة الطالب ${student.firstName} ${student.lastName} إلى حلقة ${groupName}`,
        messageSummary: `طالب جديد: ${student.firstName}`,
        type: 'student_added',
        category: 'admin',
        data: {
          action: 'student_added',
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          groupName,
          performedBy: secretaryInfo.name,
          performedByRole: 'secretary',
        },
      })
    );
  }
  
  await Promise.all(notifications);
  return { success: true };
};

/**
 * إشعار عند إزالة طالب (إذا كان لديه صلاحية manage)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {Object} student - بيانات الطالب
 * @param {string} groupName - اسم الحلقة
 * @param {string} teacherId - معرف المعلم
 * @param {string} reason - سبب الإزالة
 */
exports.notifyStudentRemoved = async (createNotification, secretaryId, student, groupName, teacherId, reason = '') => {
  const secretaryInfo = await getSecretaryPermissions(secretaryId);
  
  if (!secretaryInfo || !secretaryInfo.canManageStudents) {
    return { success: false, reason: 'no_permission' };
  }
  
  const notifications = [];
  
  // إشعار الطالب
  notifications.push(
    createNotification({
      recipient: student._id,
      recipientModel: 'Student',
      title: 'إزالة من الحلقة',
      message: reason ? `تم إزالتك من حلقة ${groupName}. السبب: ${reason}` : `تم إزالتك من حلقة ${groupName}`,
      messageSummary: `إزالة من ${groupName}`,
      type: 'student_deleted',
      category: 'admin',
      priority: 'high',
      data: {
        action: 'student_removed',
        groupName,
        reason,
        performedBy: secretaryInfo.name,
        performedByRole: 'secretary',
      },
    })
  );
  
  // إشعار المعلم
  if (teacherId) {
    notifications.push(
      createNotification({
        recipient: teacherId,
        recipientModel: 'Teacher',
        title: 'إزالة طالب',
        message: `تم إزالة الطالب ${student.firstName} ${student.lastName} من حلقة ${groupName}`,
        messageSummary: `إزالة: ${student.firstName}`,
        type: 'student_deleted',
        category: 'admin',
        data: {
          action: 'student_removed',
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          groupName,
          reason,
          performedBy: secretaryInfo.name,
          performedByRole: 'secretary',
        },
      })
    );
  }
  
  await Promise.all(notifications);
  return { success: true };
};

/**
 * إشعار عند نقل طالب بين الحلقات
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} secretaryId - معرف السكرتير
 * @param {Object} student - بيانات الطالب
 * @param {string} fromGroup - اسم الحلقة السابقة
 * @param {string} toGroup - اسم الحلقة الجديدة
 * @param {string} oldTeacherId - معرف المعلم القديم
 * @param {string} newTeacherId - معرف المعلم الجديد
 */
exports.notifyStudentMoved = async (createNotification, secretaryId, student, fromGroup, toGroup, oldTeacherId, newTeacherId) => {
  const secretaryInfo = await getSecretaryPermissions(secretaryId);
  
  if (!secretaryInfo || !secretaryInfo.canManageStudents) {
    return { success: false, reason: 'no_permission' };
  }
  
  const notifications = [];
  
  // إشعار الطالب
  notifications.push(
    createNotification({
      recipient: student._id,
      recipientModel: 'Student',
      title: 'نقل إلى حلقة جديدة',
      message: `تم نقلك من حلقة ${fromGroup} إلى حلقة ${toGroup}`,
      messageSummary: `نقل إلى ${toGroup}`,
      type: 'student_updated',
      category: 'admin',
      data: {
        action: 'student_moved',
        fromGroup,
        toGroup,
        performedBy: secretaryInfo.name,
        performedByRole: 'secretary',
      },
    })
  );
  
  // إشعار المعلم القديم
  if (oldTeacherId) {
    notifications.push(
      createNotification({
        recipient: oldTeacherId,
        recipientModel: 'Teacher',
        title: 'نقل طالب',
        message: `تم نقل الطالب ${student.firstName} ${student.lastName} من حلقتك إلى حلقة ${toGroup}`,
        messageSummary: `نقل: ${student.firstName}`,
        type: 'student_updated',
        category: 'admin',
        data: {
          action: 'student_moved_out',
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          toGroup,
          performedBy: secretaryInfo.name,
          performedByRole: 'secretary',
        },
      })
    );
  }
  
  // إشعار المعلم الجديد
  if (newTeacherId && newTeacherId !== oldTeacherId) {
    notifications.push(
      createNotification({
        recipient: newTeacherId,
        recipientModel: 'Teacher',
        title: 'طالب جديد',
        message: `تم نقل الطالب ${student.firstName} ${student.lastName} إلى حلقتك من حلقة ${fromGroup}`,
        messageSummary: `طالب جديد: ${student.firstName}`,
        type: 'student_updated',
        category: 'admin',
        data: {
          action: 'student_moved_in',
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          fromGroup,
          performedBy: secretaryInfo.name,
          performedByRole: 'secretary',
        },
      })
    );
  }
  
  await Promise.all(notifications);
  return { success: true };
};

// ============================================================================
// Exports
// ============================================================================

module.exports.checkSecretaryPermission = checkSecretaryPermission;
module.exports.getSecretaryPermissions = getSecretaryPermissions;
