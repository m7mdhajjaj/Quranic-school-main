// ============================================================================
// DailyMark Filter Helpers - دوال مساعدة للفلترة
// ============================================================================
// هذا الملف يحتوي على دوال الفلترة المشتركة بين controllers العلامات

const { getTeacherGroups } = require("../../basicController/teacherController/utils.controller");
const Student = require("../../../schema/Student");

// ============================================================================
// Helper Functions - Role-based Group Filtering
// ============================================================================

/**
 * Get user's group(s) based on role
 * @param {Object} user - User object from req.user
 * @param {string} requestedGroup - Optional group from query
 * @returns {Promise<{userGroup: string, teacherGroups: string[]}>}
 */
async function getUserGroupsByRole(user, requestedGroup = null) {
  let userGroup = requestedGroup || null;
  let teacherGroups = null;

  if (!user) {
    return { userGroup, teacherGroups };
  }

  if (user.role === "student") {
    // Student: fetch current group from database
    const studentData = await Student.findById(user._id).select('group');
    userGroup = studentData ? studentData.group : null;
  } else if (user.role === "teacher") {
    // Teacher: get assigned groups that have students
    const allTeacherGroups = await getTeacherGroups(user._id);
    
    if (allTeacherGroups && allTeacherGroups.length > 0) {
      // Get only groups that have students
      const groupsWithStudents = await Student.distinct('group', {
        group: { $in: allTeacherGroups }
      });
      teacherGroups = groupsWithStudents;
      
      // If specific group requested, check if it has students
      if (userGroup) {
        if (!teacherGroups.includes(userGroup)) {
          // Fallback: If the requested group is not accessible (e.g. inactive or no students), 
          // don't throw error. Instead, fall back to the default selection logic.
          userGroup = null;
        }
      } 
      
      if (!userGroup && teacherGroups.length > 0) {
        // If no specific group requested, use first group with students
        userGroup = teacherGroups[0];
      }
    }
  }
  // Admin can see all groups

  return { userGroup, teacherGroups };
}

/**
 * Build group filter based on user role
 * @param {Object} user - User object from req.user
 * @param {string} userGroup - User's group
 * @param {string} requestedGroup - Optional group from query
 * @returns {Object} MongoDB filter object
 */
function buildGroupFilter(user, userGroup, requestedGroup = null) {
  const groupFilter = {};

  if (user && user.role === "student") {
    // Student: only their group
    groupFilter.group = userGroup;
  } else if (user && user.role === "teacher") {
    // Teacher: specific group if selected
    if (userGroup) {
      groupFilter.group = userGroup;
    }
  } else if (requestedGroup) {
    // Admin: specific group if requested
    groupFilter.group = requestedGroup;
  }

  return groupFilter;
}

// ============================================================================
// Helper Functions - Date Filtering
// ============================================================================

/**
 * Build date filter for month/year/day or date range
 * @param {number|string} month - Month number (1-12)
 * @param {number|string} year - Year
 * @param {number|string} day - Day number (1-31)
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Object} MongoDB date filter object
 */
function buildDateFilter(month, year, day, startDate, endDate) {
  // Helper: parse date-only strings as LOCAL dates (avoids UTC shift)
  const parseLocalDateOnly = (dateStr, endOfDay = false) => {
    if (!dateStr) return null;
    // If it's exactly YYYY-MM-DD, build a local Date at start/end of day
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr));
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      return endOfDay
        ? new Date(y, mo - 1, d, 23, 59, 59, 999)
        : new Date(y, mo - 1, d, 0, 0, 0, 0);
    }
    // Fallback: full ISO string / timestamp etc.
    const dt = new Date(dateStr);
    if (Number.isNaN(dt.getTime())) return null;
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    else dt.setHours(0, 0, 0, 0);
    return dt;
  };

  // Filter by date range
  // If only startDate is provided, treat it as a single day filter
  if (startDate) {
    const start = parseLocalDateOnly(startDate, false);
    // If endDate is provided, use it. Otherwise, use startDate as endDate (single day)
    const end = parseLocalDateOnly(endDate || startDate, true);

    if (!start || !end) return {};

    // Ensure correct order
    const startTime = start.getTime();
    const endTime = end.getTime();
    const gte = startTime <= endTime ? start : end;
    const lte = startTime <= endTime ? end : start;
    
    return {
      $gte: gte,
      $lte: lte
    };
  }

  // Filter by specific day, month, and year
  if (day && month && year) {
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Create date range for the specific day
    const startDate = new Date(yearNum, monthNum - 1, dayNum, 0, 0, 0, 0); // Start of day
    const endDate = new Date(yearNum, monthNum - 1, dayNum, 23, 59, 59, 999); // End of day

    return {
      $gte: startDate,
      $lte: endDate,
    };
  }
  
  // Filter by month and year
  if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Create date range for the entire month
    const startDate = new Date(yearNum, monthNum - 1, 1); // First day of month
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Last day of month

    return {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (year) {
    // Only year filter (all months of that year)
    const yearNum = parseInt(year);
    const startDate = new Date(yearNum, 0, 1); // Jan 1st
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999); // Dec 31st

    return {
      $gte: startDate,
      $lte: endDate,
    };
  }

  return {};
}

// ============================================================================
// Helper Functions - Section Search
// ============================================================================

/**
 * Build search filter for sections
 * @param {string} searchTerm - Search term
 * @returns {Object} MongoDB search filter object
 */
function buildSectionSearchFilter(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return {};
  }

  const searchRegex = new RegExp(searchTerm.trim(), "i"); // Case-insensitive search
  return {
    $or: [
      { reviewSection: searchRegex },
      { memorizationSection: searchRegex },
    ],
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  getUserGroupsByRole,
  buildGroupFilter,
  buildDateFilter,
  buildSectionSearchFilter,
};
