/**
 * ============================================================================
 * Group Stats Validation - Frontend UI Layer
 * ============================================================================
 * 
 * تحقق إحصائيات الحلقة - يطابق Backend GroupStatsValidation.js
 * 
 * Backend Endpoint:
 * - GET /api/daily-marks/group-stats/:groupName → validateGroupStats
 */

import * as yup from 'yup';
import { isRequired } from './helpers';

// ============================================================================
// TYPES - الأنواع
// ============================================================================

export interface GroupStatsParams {
  groupName: string;
  month?: number;
  year?: number;
}

// ============================================================================
// HELPERS - دوال مساعدة
// ============================================================================

/**
 * Validate group stats parameters
 */
export const validateGroupStatsParams = (params: GroupStatsParams): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate group name
  if (!isRequired(params.groupName)) {
    errors.push('اسم الحلقة مطلوب');
  }

  // Validate month (optional)
  if (params.month !== undefined) {
    if (params.month < 1 || params.month > 12) {
      errors.push('الشهر يجب أن يكون رقماً بين 1 و 12');
    }
  }

  // Validate year (optional)
  if (params.year !== undefined) {
    if (params.year < 2000 || params.year > 2100) {
      errors.push('السنة يجب أن تكون رقماً بين 2000 و 2100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// VALIDATION SCHEMAS - مخططات التحقق
// ============================================================================

/**
 * Validation schema for group stats parameters
 * Matches Backend validateGroupStats middleware
 */
export const groupStatsValidationSchema = yup.object<GroupStatsParams>({
  groupName: yup
    .string()
    .required('اسم الحلقة مطلوب')
    .trim(),

  month: yup
    .number()
    .optional()
    .min(1, 'الشهر يجب أن يكون 1 أو أكثر')
    .max(12, 'الشهر يجب أن يكون 12 أو أقل'),

  year: yup
    .number()
    .optional()
    .min(2000, 'السنة يجب أن تكون 2000 أو أكثر')
    .max(2100, 'السنة يجب أن تكون 2100 أو أقل'),
});
