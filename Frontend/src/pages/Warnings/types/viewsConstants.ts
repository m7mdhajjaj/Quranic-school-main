// ============================================================================
// Views Constants - ثوابت مشتركة للـ views
// ============================================================================

// ✅ Animation delay classes
export const ANIMATION_DELAYS = [
  '',
  'animate-delay-100',
  'animate-delay-200',
  'animate-delay-300',
  'animate-delay-400',
  'animate-delay-500',
] as const;

// ✅ Loading skeleton count
export const LOADING_SKELETON_COUNT = {
  groups: 6,
  students: 5,
  warnings: 3,
} as const;

// ✅ Empty state configurations
export const EMPTY_STATES = {
  noGroups: {
    icon: '📚',
    title: 'لا توجد حلقات مسجلة',
    description: 'لا يوجد حلقات متاحة لعرضها',
  },
  noStudents: {
    icon: '👨‍🎓',
    title: 'لا يوجد طلاب في هذه الحلقة',
    description: 'الحلقة فارغة حالياً',
  },
  noWarnings: {
    icon: '✅',
    title: 'لا توجد إنذارات',
    description: 'سجلك نظيف! استمر في التفوق والالتزام 🌟',
  },
} as const;
