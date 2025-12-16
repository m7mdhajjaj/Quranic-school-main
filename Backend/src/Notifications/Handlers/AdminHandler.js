/**
 * AdminHandler.js
 * معالجة الإشعارات الناتجة عن إجراءات الأدمن
 * (مثل تعيين الحلقات، تحديث البيانات، إلخ)
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
    type: 'success',
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

/**
 * إشعار لطلاب الحلقة بتغيير المعلم
 * @param {Function} createNotification - دالة إنشاء الإشعار
 * @param {Array} studentIds - قائمة معرفات الطلاب
 * @param {string} groupName - اسم الحلقة
 * @param {string} teacherName - اسم المعلم
 * @param {string} actionType - نوع العملية ('assigned' | 'removed')
 */
exports.notifyGroupStudentsTeacherChanged = async (createNotification, studentIds, groupName, teacherName, actionType) => {
  const title = actionType === 'assigned' ? 'معلم جديد للحلقة' : 'تغيير في كادر الحلقة';
  const message = actionType === 'assigned' 
    ? `تم تعيين الأستاذ ${teacherName} معلماً لحلقتكم "${groupName}".`
    : `تم إلغاء تعيين الأستاذ ${teacherName} من حلقة "${groupName}".`;
  
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
    title: 'تم حذف الحلقة',
    message: `قام ${adminName} بحذف حلقة "${groupName}".`,
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
      title: 'تغيير اسم الحلقة',
      message: `تم تغيير اسم حلقتك من "${oldName}" إلى "${newName}".`,
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
        title: 'تغيير اسم الحلقة',
        message: `تم تغيير اسم حلقتك من "${oldName}" إلى "${newName}".`,
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
      title: 'إضافة طالب جديد',
      message: `تم إضافة الطالب ${student.firstName} ${student.lastName} إلى حلقتك ${groupName} بواسطة ${adminName}`,
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
      title: 'تم اضافتك للحلقة',
      message: `تم اضافتك للحلقة ${groupName}`,
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
    title: 'حذف طالب من الحلقة',
    message: `تم ازالة الطالب ${student.firstName} ${student.lastName} من حلقتك ${groupName} بواسطة ${adminName}`,
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
      title: 'نقل طالب من الحلقة',
      message: `تم نقل الطالب ${student.firstName} ${student.lastName} من حلقتك ${oldGroupName} إلى حلقة ${newGroupName} بواسطة ${adminName}`,
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
      title: 'نقل طالب إلى الحلقة',
      message: `تم نقل الطالب ${student.firstName} ${student.lastName} إلى حلقتك ${newGroupName} من حلقة ${oldGroupName} بواسطة ${adminName}`,
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
      message: `تم نقل حلقتك من ${oldGroupName} إلى ${newGroupName} بواسطة ${adminName}`,
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

