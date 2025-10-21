// ============================================================================
// examHelpers.js - Helper Functions for Exam Controller
// ============================================================================

/**
 * Check if time is within allowed range (09:00 - 19:00)
 */
const isTimeWithinAllowedRange = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parts = timeStr.split(":");
  if (parts.length < 2) return false;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 9 * 60; // 09:00
  const MAX = 19 * 60; // 19:00
  return total >= MIN && total <= MAX;
};

/**
 * Build duplicate query for checking existing exams
 */
const buildDuplicateQuery = (date, group) => {
  if (group) {
    return { date, group };
  }
  return {
    date,
    $or: [
      { group: { $exists: false } },
      { group: null },
      { group: "" },
    ],
  };
};

module.exports = {
  isTimeWithinAllowedRange,
  buildDuplicateQuery,
};
