/**
 * ============================================================================
 * DailyMark Validation - Central Export
 * ============================================================================
 * 
 * 📦 Frontend validation schemas matching Backend validation middleware
 * 
 * Structure matches Backend:
 * - marksValidation.ts     → DailyMarksValidation.js
 * - sectionValidation.ts   → DailyMarksSectionValidation.js
 * - groupStatsValidation.ts → GroupStatsValidation.js
 * - helpers.ts             → Shared validation helpers
 * 
 * ============================================================================
 */

// ============================================================================
// MARKS VALIDATION - تحقق العلامات
// ============================================================================
export {
  // Schemas
  markValidationSchema,
  bulkMarksValidationSchema,
  updateMarkValidationSchema,
  
  // Types
  type MarkFormData,
  type BulkMarkFormData,
  type UpdateMarkFormData,
  
  // Helpers
  validateMarkValue,
  sanitizeMarkData,
} from './marksValidation';

// ============================================================================
// SECTION VALIDATION - تحقق المقاطع
// ============================================================================
export {
  // Schemas
  sectionValidationSchema,
  quranSegmentSchema,
  activeSurahValidationSchema,
  
  // Types
  type SectionFormData,
  type QuranSegmentData,
  type ActiveSurahFormData,
  
  // Helpers
  validateSectionData,
  sanitizeSectionData,
} from './sectionValidation';

// ============================================================================
// GROUP STATS VALIDATION - تحقق إحصائيات الحلقة
// ============================================================================
export {
  // Schemas
  groupStatsValidationSchema,
  
  // Types
  type GroupStatsParams,
  
  // Helpers
  validateGroupStatsParams,
} from './groupStatsValidation';

// ============================================================================
// HELPERS - دوال مساعدة مشتركة
// ============================================================================
export {
  // ID Validation
  isValidObjectId,
  validateStudentId,
  validateSectionId,
  validateGroupId,
  
  // Date Validation
  isValidDate,
  formatDateForApi,
  
  // Text Validation
  sanitizeText,
  isArabicText,
  
  // Generic helpers
  isRequired,
  isValidNumber,
} from './helpers';
