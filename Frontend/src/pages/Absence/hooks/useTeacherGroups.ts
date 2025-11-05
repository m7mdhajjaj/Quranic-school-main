// ============================================================================
// useTeacherGroups - Absence (Wrapper)
// ============================================================================
// Wrapper للـ hook المشترك مع التوافق مع الواجهة القديمة

import type { LoggedInUser } from "../types/absence.types";
import { useTeacherGroups as useSharedTeacherGroups } from '@/hooks/useTeacherGroups';

/**
 * Hook للحصول على حلقات المعلم (متوافق مع Absence)
 * @param currentUser - المستخدم الحالي
 * @returns حلقات المعلم
 */
export const useTeacherGroups = (currentUser: LoggedInUser | null) => {
  const { teacherGroups } = useSharedTeacherGroups({
    currentUser,
    enabled: !!currentUser && currentUser.role === 'teacher',
  });

  return teacherGroups;
};
