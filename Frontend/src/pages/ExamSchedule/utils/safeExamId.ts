// ============================================================================
// Exam ID utilities
// ============================================================================

import type { Exam } from "@/Api/examApi";

/**
 * Safely extracts exam ID from exam object
 */
export const safeExamId = (ex: Exam | null | undefined): string | null => {
  if (!ex) return null;
  const val = ex._id ?? ex.id;
  if (val === undefined || val === null) return null;
  return String(val);
};
