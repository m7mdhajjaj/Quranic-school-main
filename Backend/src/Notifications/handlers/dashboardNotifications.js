// Helper functions for dashboard notifications

/**
 * إرسال إشعار تحديث الداشبورد
 * @param {string} updateType - نوع التحديث ('stats', 'groups', 'full')
 * @param {object} data - البيانات المحدثة (اختياري)
 */
const notifyDashboardUpdate = (updateType = 'full', data = null) => {
  try {
    if (global.notifyDashboardUpdate) {
      global.notifyDashboardUpdate(updateType, data);
    }
  } catch (error) {
    console.error('خطأ في إرسال إشعار تحديث الداشبورد:', error);
  }
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