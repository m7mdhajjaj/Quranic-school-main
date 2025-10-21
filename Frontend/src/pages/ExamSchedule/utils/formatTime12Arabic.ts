// ============================================================================
// Time formatting utilities
// ============================================================================

/**
 * Formats time to 12-hour format with Arabic period (صباحاً/مساءً)
 */
export const formatTime12Arabic = (timeStr: string): string => {
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
