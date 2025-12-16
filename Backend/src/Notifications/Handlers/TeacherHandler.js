/**
 * TeacherHandler.js
 * معالجة الإشعارات الخاصة بالمعلمين
 */

/**
 * إشعار بتعيين حلقة جديدة للمعلم
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupAssigned = async (createNotification, teacherId, groupName, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'تم تعيين حلقة جديدة لك',
    message: `قام ${adminName} بتعيين حلقة "${groupName}" لك.`,
    type: 'system', // أو نوع مخصص إذا وجد
    data: { 
      groupName,
      action: 'group_assigned'
    },
    link: '/teacher/groups'
  });
};

/**
 * إشعار بتحديث بيانات الحلقة
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupUpdated = async (createNotification, teacherId, groupName, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'تحديث بيانات الحلقة',
    message: `قام ${adminName} بتحديث بيانات حلقة "${groupName}".`,
    type: 'system',
    data: { 
      groupName,
      action: 'group_updated'
    },
    link: '/teacher/groups'
  });
};

/**
 * إشعار بنقل الحلقة من المعلم (فقدان الحلقة)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupTransferredFrom = async (createNotification, teacherId, groupName, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'تم نقل الحلقة منك',
    message: `قام ${adminName} بنقل حلقة "${groupName}" إلى معلم آخر.`,
    type: 'warning',
    data: { 
      groupName,
      action: 'group_transferred_from'
    },
    link: '/teacher/groups'
  });
};

/**
 * إشعار بنقل الحلقة إلى المعلم (استلام الحلقة)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupTransferredTo = async (createNotification, teacherId, groupName, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'تم نقل حلقة إليك',
    message: `قام ${adminName} بنقل حلقة "${groupName}" لتصبح تحت إشرافك.`,
    type: 'success',
    data: { 
      groupName,
      action: 'group_transferred_to'
    },
    link: '/teacher/groups'
  });
};

/**
 * إشعار بحذف الحلقة
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupDeleted = async (createNotification, teacherId, groupName, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'تم حذف الحلقة',
    message: `قام ${adminName} بحذف حلقة "${groupName}".`,
    type: 'alert',
    data: { 
      groupName,
      action: 'group_deleted'
    },
    link: '/teacher/groups'
  });
};

/**
 * إشعار بتحديث بيانات المعلم الشخصية
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyTeacherInfoUpdated = async (createNotification, teacherId, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'تحديث بياناتك الشخصية',
    message: `قام ${adminName} بتحديث بيانات ملفك الشخصي.`,
    type: 'system',
    data: { 
      action: 'teacher_info_updated'
    },
    link: '/teacher/profile'
  });
};
