// ============================================================================
// ReportController/reportHelpers.js - Utility Functions for Reports
// ============================================================================

/**
 * Calculate overall average from memorization and review marks
 * @param {number} memorizationAverage - Memorization average
 * @param {number} reviewAverage - Review average
 * @returns {number} Overall average
 */
exports.calculateOverallAverage = (memorizationAverage, reviewAverage) => {
  if (memorizationAverage !== null && reviewAverage !== null) {
    return Math.round(((memorizationAverage + reviewAverage) / 2) * 10) / 10;
  }
  return 0;
};

/**
 * Format date range filter for MongoDB queries
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {object} Date filter object
 */
exports.buildDateFilter = (startDate, endDate) => {
  if (startDate && endDate) {
    return {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  }
  return {};
};

/**
 * Calculate attendance percentage
 * @param {number} present - Number of present days
 * @param {number} total - Total days
 * @returns {number} Attendance percentage
 */
exports.calculateAttendancePercentage = (present, total) => {
  return total > 0 ? Math.round((present / total) * 100) : 0;
};

/**
 * Format student name for display
 * @param {object} student - Student object
 * @returns {string} Formatted student name
 */
exports.formatStudentName = (student) => {
  return `${student.firstName} ${student.fatherName || ""} ${
    student.lastName || ""
  }`.trim();
};

/**
 * Sort monthly averages by year and month
 * @param {array} averages - Array of monthly averages
 * @returns {array} Sorted averages
 */
exports.sortMonthlyAverages = (averages) => {
  return averages.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
};

/**
 * Filter averages by month and year
 * @param {array} averages - Array of monthly averages
 * @param {number} month - Month to filter by (optional)
 * @param {number} year - Year to filter by (optional)
 * @returns {array} Filtered averages
 */
exports.filterAveragesByPeriod = (averages, month, year) => {
  let filtered = [...averages];

  if (year) {
    filtered = filtered.filter((avg) => avg.year === parseInt(year));
  }

  if (month) {
    filtered = filtered.filter((avg) => avg.month === parseInt(month));
  }

  return filtered;
};
