// ============================================================================
// useTeacherGroups - ExamSchedule (Wrapper)
// ============================================================================
// Wrapper للـ hook المشترك مع التوافق مع الواجهة القديمة

import { useTeacherGroups as useSharedTeacherGroups } from '@/hooks/useTeacherGroups';
import { useMemo } from 'react';

/**
 * Hook للحصول على حلقات المعلم (متوافق مع ExamSchedule)
 * @param role - دور المستخدم
 * @returns حلقات المعلم وحالة التحميل
 */
export function useTeacherGroups(role: 'student' | 'teacher' | 'admin') {
  // الحصول على المستخدم من localStorage
  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  // استخدام الـ hook المشترك
  const { teacherGroups, loadingTeacherGroups } = useSharedTeacherGroups({
    currentUser: currentUser ? { ...currentUser, role } : null,
    enabled: role === 'teacher',
  });

  return { teacherGroups, loadingTeacherGroups } as const;
}
