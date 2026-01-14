/**
 * ============================================================================
 * Data Hooks - جلب البيانات من الـ API
 * ============================================================================
 */

// جلب البيانات الأساسية (المستخدم، الطلاب، الحلقات)
export { useDailyMarksData } from './useDailyMarksData';

// جلب المقاطع والعلامات المفلترة
export { useFilteredMarksData } from './useFilteredMarksData';

// جلب معدلات الطالب
export { useStudentAverages } from './useStudentAverages';

// جلب إحصائيات الحلقة
export { useGroupStats } from './useGroupStats';

// جلب السور المكتملة
export { useCompletedSurahs } from './useCompletedSurahs';
