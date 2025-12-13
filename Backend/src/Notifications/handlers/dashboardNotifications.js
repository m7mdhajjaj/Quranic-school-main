// Helper functions for dashboard notifications
// DISABLED: Dashboard Socket functionality removed

/**
 * إرسال إشعار تحديث الداشبورد
 * @param {string} updateType - نوع التحديث ('stats', 'groups', 'full')
 * @param {object} data - البيانات المحدثة (اختياري)
 * @deprecated Dashboard Socket functionality has been removed
 */
const notifyDashboardUpdate = (updateType = 'full', data = null) => {
  // Disabled - Dashboard Socket removed
  return;
};

/**
 * إرسال إشعار عند تغيير إحصائيات الطلاب
 */
const notifyStudentStatsUpdate = () => {
  notifyDashboardUpdate('stats');
};

/**
 * إرسال إشعار عند تغيير إحصائيات المعلمين
 */
const notifyTeacherStatsUpdate = () => {
  notifyDashboardUpdate('stats');
};

/**
 * إرسال إشعار عند تغيير بيانات الحلقات
 */
const notifyGroupsUpdate = () => {
  notifyDashboardUpdate('groups');
};

/**
 * إرسال إشعار عند تغيير الامتحانات
 */
const notifyExamStatsUpdate = () => {
  notifyDashboardUpdate('stats');
};

/**
 * إرسال إشعار عند تغيير الدرجات
 */
const notifyMarksUpdate = () => {
  notifyDashboardUpdate('stats');
};

/**
 * إرسال إشعار عند تغيير الحضور
 */
const notifyAttendanceUpdate = () => {
  notifyDashboardUpdate('stats');
};

/**
 * إرسال إشعار عند تغيير الأنشطة
 */
const notifyActivityStatsUpdate = () => {
  notifyDashboardUpdate('stats');
};

/**
 * إرسال إشعار عند تغيير الأخبار
 */
const notifyNewsStatsUpdate = () => {
  notifyDashboardUpdate('stats');
};

module.exports = {
  notifyDashboardUpdate,
  notifyStudentStatsUpdate,
  notifyTeacherStatsUpdate,
  notifyGroupsUpdate,
  notifyExamStatsUpdate,
  notifyMarksUpdate,
  notifyAttendanceUpdate,
  notifyActivityStatsUpdate,
  notifyNewsStatsUpdate,
};