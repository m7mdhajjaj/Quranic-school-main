/**
 * ============================================================================
 * Teacher Hooks - خاصة بالمعلم فقط
 * ============================================================================
 */

// معالجة CRUD للعلامات والمقاطع
export { useDailyMarksHandlers } from './useDailyMarksHandlers';

// اختيار الطالب والحلقة
export { useStudentSelection } from './useStudentSelection';

// إصلاح المقاطع بالذكاء الاصطناعي
export { useAiRepair } from './useAiRepair';

// التحقق من صحة الجدولة
export { useAutoValidateSchedule } from './useSchedulerValidation';

// التحقق من صحة المقطع
export { useSectionValidation } from './useSectionValidation';
