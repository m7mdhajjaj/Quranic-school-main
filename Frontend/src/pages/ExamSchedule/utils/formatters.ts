// ============================================================================
// formatters.ts - Date, Time, and Number Formatting Utilities
// ============================================================================

import type { Exam } from "@/Api/examApi";

/**
 * Validates if time is within allowed range (09:00 - 19:00)
 */
export const isTimeWithinAllowedRange = (timeStr: string): boolean => {
  if (!timeStr) return false;
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 9 * 60; // 09:00
  const MAX = 19 * 60; // 19:00
  return total >= MIN && total <= MAX;
};

/**
 * Formats date to Arabic format (e.g., "15 يناير 2024")
 */
export const formatDateArabic = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return `${day} ${arabicMonths[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Formats time to 12-hour format with Arabic period (صباحاً/مساءً)
 */
export const formatTime12Arabic = (timeStr: string): string => {
  if (!timeStr) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? 'مساءً' : 'صباحاً';
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, '0');
  return `${h}:${mm} ${period}`;
};

/**
 * Formats a number to fixed decimal places
 */
export const formatAvg = (x: number | null | undefined, digits = 1) =>
  x == null || Number.isNaN(x) ? undefined : x.toFixed(digits);

/**
 * Safely extracts exam ID from exam object
 */
export const safeExamId = (ex: Exam | null | undefined): string | null => {
  if (!ex) return null;
  const val = ex._id ?? ex.id;
  if (val === undefined || val === null) return null;
  return String(val);
};
