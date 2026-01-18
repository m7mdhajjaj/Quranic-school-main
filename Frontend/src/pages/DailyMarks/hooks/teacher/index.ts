/**
 * ============================================================================
 * Teacher Hooks - خاصة بالمعلم فقط (V7)
 * ============================================================================
 * 
 * V7: All validation is now handled by:
 * - Frontend: Validation/DailyMark (schemas + helpers)
 * - Backend: SectionSequenceService
 */

// معالجة CRUD للعلامات والمقاطع
export { useDailyMarksHandlers } from './useDailyMarksHandlers';

// اختيار الطالب والحلقة
export { useStudentSelection } from './useStudentSelection';

// التحقق من صحة المقطع (UI layer only)
export { useSectionValidation } from './useSectionValidation';

// التحقق من التاريخ والمقاطع (للنماذج - Modals)
export { useAutoValidateSchedule } from './useAutoValidateSchedule';
export type { SegmentData, AlternativeDateOption } from './useAutoValidateSchedule';
