// ============================================================================
// examHelpers.js - Helper Functions for Exam Controller
// ============================================================================

/**
 * Check if time is within allowed range (12:00 - 21:00)
 */
const isTimeWithinAllowedRange = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parts = timeStr.split(":");
  if (parts.length < 2) return false;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 12 * 60; // 12:00
  const MAX = 21 * 60; // 21:00
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
