// ============================================================================
// Time formatting utilities
// ============================================================================

/**
 * Formats time to 12-hour format with Arabic period (صباحاً/مساءً)
 * @param {string} timeStr - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format with Arabic period
 * @example
 * formatTime12Arabic("14:30") // "2:30 مساءً"
 * formatTime12Arabic("09:00") // "9:00 صباحاً"
 * formatTime12Arabic("00:00") // "12:00 صباحاً"
 * formatTime12Arabic("12:00") // "12:00 مساءً"
 */
const formatTime12Arabic = (timeStr) => {
  if (!timeStr) return timeStr;
  const [hStr, mStr] = timeStr.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? "مساءً" : "صباحاً";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, "0");
  return `${h}:${mm} ${period}`;
};

module.exports = {
  formatTime12Arabic,
};
