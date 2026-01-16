/**
 * AdminHandler.js
 * معالجة الإشعارات الناتجة عن إجراءات الأدمن
 * (مثل تعيين الحلقات، تحديث البيانات، إلخ)
 * 
 * أنواع الإشعارات الإدارية:
 * - admin_action: إجراء إداري عام
 * - user_approval: اعتماد مستخدم
 * - role_change: تغيير دور
 * - system_update: تحديث النظام
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
    title: 'حلقة جديدة',
    message: `تم تعيينك على حلقة ${groupName}`,
    messageSummary: `حلقة ${groupName}`,
    type: 'admin_action',
    category: 'admin',
    data: { 
      groupName,
      action: 'group_assigned',
      entityType: 'group',
      performedBy: adminName
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
    title: 'تحديث الحلقة',
    message: `تم تحديث بيانات حلقة ${groupName}`,
    messageSummary: `تحديث ${groupName}`,
    type: 'system_update',
    category: 'admin',
    data: { 
      groupName,
      action: 'group_updated',
      entityType: 'group',
      performedBy: adminName
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
    title: 'نقل الحلقة',
    message: `تم نقل حلقة ${groupName} لمعلم آخر`,
    messageSummary: `نقل ${groupName}`,
    type: 'admin_action',
    category: 'admin',
    priority: 'high',
    data: { 
      groupName,
      action: 'group_transferred_from',
      entityType: 'group',
      performedBy: adminName
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
    title: 'حلقة جديدة',
    message: `تم نقل حلقة ${groupName} إلى إشرافك`,
    messageSummary: `استلام ${groupName}`,
    type: 'admin_action',
    category: 'admin',
    data: { 
      groupName,
      action: 'group_transferred_to',
      entityType: 'group',
      performedBy: adminName
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
    title: 'حذف الحلقة',
    message: `تم حذف حلقة ${groupName}`,
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
    title: 'تحديث الملف',
    message: 'تم تحديث بياناتك الشخصية',
    type: 'system',
    data: { 
      action: 'teacher_info_updated'
    },
    link: '/teacher/profile'
  });
};

/**
 * إشعار لطلاب الحلقة بتغيير المعلم
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {Array} studentIds - قائمة معرفات الطلاب
 * @param {string} groupName - اسم الحلقة
 * @param {string} teacherName - اسم المعلم
 * @param {string} actionType - نوع العملية ('assigned' | 'removed')
 */
exports.notifyGroupStudentsTeacherChanged = async (createNotification, studentIds, groupName, teacherName, actionType) => {
  const title = actionType === 'assigned' ? 'معلم جديد' : 'تغيير المعلم';
  const message = actionType === 'assigned' 
    ? `الأستاذ ${teacherName} معلم حلقتكم`
    : `تم تغيير معلم الحلقة`;
  
  const type = actionType === 'assigned' ? 'success' : 'alert';

  const notifications = studentIds.map(studentId => ({
    recipient: studentId,
    recipientModel: 'Student',
    title,
    message,
    type,
    data: {
      groupName,
      teacherName,
      action: actionType === 'assigned' ? 'teacher_assigned_to_group' : 'teacher_removed_from_group'
    },
    link: '/student/group'
  }));

  // نستخدم Promise.all لإرسال الإشعارات بشكل متوازي
  return Promise.all(notifications.map(n => createNotification(n)));
};

/**
 * إشعار لطلاب الحلقة بحذف الحلقة
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {Array} studentIds - قائمة معرفات الطلاب
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupDeletedForStudents = async (createNotification, studentIds, groupName, adminName = "الإدارة") => {
  const notifications = studentIds.map(studentId => ({
    recipient: studentId,
    recipientModel: 'Student',
    title: 'حذف الحلقة',
    message: `تم حذف حلقة ${groupName}`,
    type: 'alert',
    data: { 
      groupName,
      action: 'group_deleted'
    },
    link: '/student/group'
  }));

  return Promise.all(notifications.map(n => createNotification(n)));
};

/**
 * إشعار بتغيير اسم الحلقة
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {Array} studentIds - قائمة معرفات الطلاب
 * @param {string} oldName - الاسم القديم
 * @param {string} newName - الاسم الجديد
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyGroupRenamed = async (createNotification, teacherId, studentIds, oldName, newName, adminName = "الإدارة") => {
  const promises = [];

  // إشعار المعلم
  if (teacherId) {
    promises.push(createNotification({
      recipient: teacherId,
      recipientModel: 'Teacher',
      title: 'تغيير الاسم',
      message: `تم تغيير اسم الحلقة إلى ${newName}`,
      type: 'system',
      data: { 
        oldName,
        newName,
        action: 'group_renamed'
      },
      link: '/teacher/groups'
    }));
  }

  // إشعار الطلاب
  if (studentIds && studentIds.length > 0) {
    studentIds.forEach(studentId => {
      promises.push(createNotification({
        recipient: studentId,
        recipientModel: 'Student',
        title: 'تغيير الاسم',
        message: `تم تغيير اسم الحلقة إلى ${newName}`,
        type: 'system',
        data: { 
          oldName,
          newName,
          action: 'group_renamed'
        },
        link: '/student/group'
      }));
    });
  }

  return Promise.all(promises);
};

/**
 * إشعار بإضافة طالب إلى حلقة (بواسطة الأدمن)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {Object} student - بيانات الطالب
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyAdminAddedStudent = async (createNotification, teacherId, student, groupName, adminName = "الإدارة") => {
  console.log("🎯 AdminHandler.notifyAdminAddedStudent استُدعي");
  console.log("🎯 المعلم ID:", teacherId);
  console.log("🎯 الطالب:", student.firstName, student.lastName);
  console.log("🎯 الحلقة:", groupName);
  console.log("🎯 الأدمن:", adminName);
  
  const promises = [];

  // إشعار المعلم
  if (teacherId) {
    promises.push(createNotification({
      recipient: teacherId,
      recipientModel: 'Teacher',
      title: 'طالب جديد',
      message: `${student.firstName} ${student.lastName} - ${groupName}`,
      type: 'success',
      data: { 
        action: 'student_added_by_admin',
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        groupName: groupName,
        adminName: adminName
      },
      link: '/teacher/groups'
    }));
  }

  // إشعار الطالب
  if (student && student._id) {
    promises.push(createNotification({
      recipient: student._id,
      recipientModel: 'Student',
      title: 'إضافة للحلقة',
      message: `تم إضافتك لحلقة ${groupName}`,
      type: 'success',
      data: { 
        action: 'student_added_to_group',
        groupName: groupName,
        adminName: adminName
      },
      link: '/student/group'
    }));
  }
  
  console.log("🎯 إرسال إشعارات للمعلم والطالب");
  
  return Promise.all(promises);
};

/**
 * إشعار بإزالة طالب من حلقة (بواسطة الأدمن)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} teacherId - معرف المعلم
 * @param {Object} student - بيانات الطالب
 * @param {string} groupName - اسم الحلقة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyAdminRemovedStudent = async (createNotification, teacherId, student, groupName, adminName = "الإدارة") => {
  return createNotification({
    recipient: teacherId,
    recipientModel: 'Teacher',
    title: 'حذف طالب',
    message: `${student.firstName} ${student.lastName} - ${groupName}`,
    type: 'warning',
    data: { 
      action: 'student_removed_by_admin',
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      groupName: groupName,
      adminName: adminName
    },
    link: '/teacher/groups'
  });
};

/**
 * إشعار بنقل طالب بين حلقات (بواسطة الأدمن)
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {string} oldTeacherId - معرف المعلم القديم
 * @param {string} newTeacherId - معرف المعلم الجديد
 * @param {Object} student - بيانات الطالب
 * @param {string} oldGroupName - اسم الحلقة القديمة
 * @param {string} newGroupName - اسم الحلقة الجديدة
 * @param {string} adminName - اسم المدير (اختياري)
 */
exports.notifyAdminMovedStudent = async (createNotification, oldTeacherId, newTeacherId, student, oldGroupName, newGroupName, adminName = "الإدارة") => {
  const promises = [];

  // إشعار المعلم القديم
  if (oldTeacherId) {
    promises.push(createNotification({
      recipient: oldTeacherId,
      recipientModel: 'Teacher',
      title: 'نقل طالب',
      message: `${student.firstName} ${student.lastName} إلى ${newGroupName}`,
      type: 'warning',
      data: { 
        action: 'student_moved_out_by_admin',
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        oldGroup: oldGroupName,
        newGroup: newGroupName,
        adminName: adminName
      },
      link: '/teacher/groups'
    }));
  }

  // إشعار المعلم الجديد
  if (newTeacherId) {
    promises.push(createNotification({
      recipient: newTeacherId,
      recipientModel: 'Teacher',
      title: 'طالب جديد',
      message: `${student.firstName} ${student.lastName} - ${newGroupName}`,
      type: 'success',
      data: { 
        action: 'student_moved_in_by_admin',
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        oldGroup: oldGroupName,
        newGroup: newGroupName,
        adminName: adminName
      },
      link: '/teacher/groups'
    }));
  }

  // إشعار الطالب
  if (student && student._id) {
    promises.push(createNotification({
      recipient: student._id,
      recipientModel: 'Student',
      title: 'تغيير الحلقة',
      message: `تم نقلك إلى حلقة ${newGroupName}`,
      type: 'system',
      data: { 
        action: 'student_group_changed_by_admin',
        oldGroup: oldGroupName,
        newGroup: newGroupName,
        adminName: adminName
      },
      link: '/student/group'
    }));
  }

  return Promise.all(promises);
};

