// ============================================================================
// Time validation utilities
// ============================================================================

/**
 * Validates if time is within allowed range (09:00 - 19:00)
 */
export const isTimeWithinAllowedRange = (timeStr: string): boolean => {
  if (!timeStr) return false;
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 9 * 60; // 09:00
  const MAX = 19 * 60; // 19:00
  return total >= MIN && total <= MAX;
};
