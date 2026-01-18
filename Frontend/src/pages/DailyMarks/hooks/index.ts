/**
 * ============================================================================
 * Daily Marks Hooks - Central Export File
 * ============================================================================
 * 
 * Organized by ROLE and CATEGORY for better maintainability.
 * 
 * Structure:
 * ├── data/      → جلب البيانات من الـ API
 * ├── shared/    → مشتركة بين جميع الأدوار
 * ├── teacher/   → خاصة بالمعلم فقط
 * ├── student/   → خاصة بالطالب فقط
 * ├── ui/        → التحكم بالواجهة والنوافذ
 * └── modals/    → hooks خاصة بالـ modals
 */

// ============================================================================
// 📊 DATA HOOKS - جلب البيانات
// ============================================================================
export { 
  useDailyMarksData,
  useFilteredMarksData,
  useStudentAverages,
  useGroupStats,
  useCompletedSurahs 
} from './data';

// ============================================================================
// 🔄 SHARED HOOKS - مشتركة بين جميع الأدوار
// ============================================================================
export { 
  useDailyMarksState,
  useComputedValues,
  useMarkFinder,
  useSectionsFilter 
} from './shared';

// ============================================================================
// 👨‍🏫 TEACHER HOOKS - خاصة بالمعلم (V7)
// ============================================================================
export { 
  useDailyMarksHandlers,
  useStudentSelection,
  useSectionValidation 
} from './teacher';

// ============================================================================
// 👨‍🎓 STUDENT HOOKS - خاصة بالطالب
// ============================================================================
export { 
  useStudentIdForAverages 
} from './student';

// ============================================================================
// 🎨 UI HOOKS - التحكم بالواجهة
// ============================================================================
export { 
  useModalAndFormActions,
  useMonthNavigation,
  useMonthYearFilterLogic,
  useQuranSegmentInputLogic 
} from './ui';

// ============================================================================
// 🪟 MODAL HOOKS - خاصة بالـ modals
// ============================================================================
export * from './modals';
