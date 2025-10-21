// ============================================================================
// Format utilities
// ============================================================================

/**
 * Formats a number to fixed decimal places
 */
export const formatAvg = (x: number | null | undefined, digits = 1) =>
  x == null || Number.isNaN(x) ? undefined : x.toFixed(digits);
