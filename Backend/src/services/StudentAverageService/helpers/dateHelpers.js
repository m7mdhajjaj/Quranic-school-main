// ============================================================================
// helpers/dateHelpers.js - Date Helper Functions
// ============================================================================

const { TIMEZONE } = require('../../../config/timezone');

/**
 * Get the date range for a specific month
 * @param {Number} month - Month number (1-12)
 * @param {Number} year - Year
 * @returns {Object} - { startDate, endDate }
 */
exports.getMonthDateRange = (month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0); // Last day of month

    console.log(`📅 Date Range: ${startDate.toLocaleDateString('ar-SA', { timeZone: TIMEZONE })} - ${endDate.toLocaleDateString('ar-SA', { timeZone: TIMEZONE })}`);

    return { startDate, endDate };
  } catch (error) {
    console.error("❌ Error in getMonthDateRange:", error);
    throw error;
  }
};

/**
 * Format date to Arabic locale
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date
 */
exports.formatDate = (date) => {
  try {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ar-SA', { timeZone: TIMEZONE });
  } catch (error) {
    console.error("❌ Error in formatDate:", error);
    return null;
  }
};

/**
 * Get current month and year
 * @returns {Object} - { month, year }
 */
exports.getCurrentMonthYear = () => {
  try {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  } catch (error) {
    console.error("❌ Error in getCurrentMonthYear:", error);
    throw error;
  }
};

/**
 * Check if a date is in a specific month/year
 * @param {Date} date - Date to check
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Boolean}
 */
exports.isDateInMonth = (date, month, year) => {
  try {
    const d = new Date(date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  } catch (error) {
    console.error("❌ Error in isDateInMonth:", error);
    return false;
  }
};
