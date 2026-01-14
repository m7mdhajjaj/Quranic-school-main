/**
 * ============================================================================
 * Shared Hooks - مشتركة بين جميع الأدوار
 * ============================================================================
 */

// إدارة حالة الصفحة المركزية
export { useDailyMarksState } from './useDailyMarksState';

// القيم المحسوبة (memoized)
export { useComputedValues } from './useComputedValues';

// البحث عن العلامات وربطها بالمقاطع
export { useMarkFinder } from './useMarkFinder';

// فلترة المقاطع (شهر/سنة/يوم)
export { useSectionsFilter } from './useSectionsFilter';
