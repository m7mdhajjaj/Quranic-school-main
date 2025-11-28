const { getGroupsByTeacherIdWithFilters } = require('../basicController/groupController');

/**
 * Get all groups for a teacher (for daily marks page)
 * GET /api/attendance/teacher/:teacherId/groups-for-marks
 * 
 * This endpoint is specifically designed for the daily marks page.
 * It fetches groups without student details (optimized for performance).
 * 
 * Query params:
 * - filter: 'all' | 'withStudents' | 'withoutStudents' (default: 'all')
 * - includeStudents: 'true' | 'false' (default: 'false' - no student details needed)
 * 
 * Returns:
 * - teacher: معلومات المعلم
 * - groups: الحلقات مع عدد الطلاب (بدون تفاصيل الطلاب)
 * - summary: ملخص الإحصائيات
 * 
 * Note: Validation is handled by validateGetTeacherGroups middleware
 */
exports.getTeacherGroupsForMarks = async (req, res) => {
  // Set default query params optimized for daily marks page
  req.query.filter = req.query.filter || 'all';
  req.query.includeStudents = req.query.includeStudents || 'false'; // لا نحتاج تفاصيل الطلاب
  
  console.log(`📝 [DailyMarks API] Fetching groups for teacher: ${req.params.teacherId}`);
  
  // Delegate to the existing group controller function
  // This function already handles:
  // ✅ Fetching teacher groups
  // ✅ Counting students per group
  // ✅ Filtering (all/withStudents/withoutStudents)
  // ✅ Returning summary statistics
  // ✅ includeStudents=false means no student details (faster)
  return getGroupsByTeacherIdWithFilters(req, res);
};
