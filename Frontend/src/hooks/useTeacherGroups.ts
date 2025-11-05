// ============================================================================
// useTeacherGroups - Shared Hook
// ============================================================================
// Hook مشترك لجلب حلقات المعلم - يستخدم في ExamSchedule و Absence

import { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface User {
  _id?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  role?: 'student' | 'teacher' | 'admin';
}

interface Group {
  _id: string;
  name: string;
  teacher?: string;
}

export interface UseTeacherGroupsOptions {
  currentUser: User | null;
  enabled?: boolean; // للتحكم في تفعيل الـ hook
}

export interface UseTeacherGroupsReturn {
  teacherGroups: string[];
  loadingTeacherGroups: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * الحصول على جميع الأسماء المحتملة للمعلم
 */
const getTeacherPossibleNames = (user: User): string[] => {
  const { firstName = '', fatherName = '', lastName = '' } = user;
  
  const firstLast = `${firstName} ${lastName}`.trim();
  const firstFatherLast = `${firstName} ${fatherName} ${lastName}`
    .trim()
    .replace(/\s+/g, ' ');
  
  return [firstLast, firstFatherLast, firstName].filter(
    (name): name is string => !!name && name.length > 0
  );
};

/**
 * التحقق من تطابق اسم المعلم
 */
const isTeacherMatch = (
  studentTeacher: string,
  possibleNames: string[]
): boolean => {
  const studentTeacherNormalized = studentTeacher
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
  
  return possibleNames.some((possibleName) => {
    const normalizedPossible = possibleName.toLowerCase();
    return (
      studentTeacherNormalized === normalizedPossible ||
      studentTeacherNormalized.includes(normalizedPossible) ||
      normalizedPossible.includes(studentTeacherNormalized)
    );
  });
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook لجلب حلقات المعلم من API
 * 
 * @param options - خيارات الـ hook
 * @returns معلومات حلقات المعلم وحالة التحميل
 * 
 * @example
 * ```tsx
 * const { teacherGroups, loadingTeacherGroups } = useTeacherGroups({
 *   currentUser: user,
 *   enabled: user?.role === 'teacher'
 * });
 * ```
 */
export const useTeacherGroups = ({
  currentUser,
  enabled = true,
}: UseTeacherGroupsOptions): UseTeacherGroupsReturn => {
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loadingTeacherGroups, setLoadingTeacherGroups] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeacherGroups = async () => {
    // إذا الـ hook معطل أو المستخدم مش معلم
    if (!enabled || !currentUser || currentUser.role !== 'teacher') {
      setTeacherGroups([]);
      setLoadingTeacherGroups(false);
      return;
    }

    setLoadingTeacherGroups(true);
    setError(null);

    try {
      console.log('🔍 [useTeacherGroups] جلب حلقات المعلم...');

      // Dynamic import للـ API
      const { getAllGroups } = await import('@/Api/groupApi');
      const groupsRes = await getAllGroups();

      if (!groupsRes.success || !Array.isArray(groupsRes.data)) {
        console.error('❌ [useTeacherGroups] فشل في جلب الحلقات');
        setTeacherGroups([]);
        return;
      }

      // الحصول على الأسماء المحتملة للمعلم
      const possibleNames = getTeacherPossibleNames(currentUser);
      console.log('📋 [useTeacherGroups] أسماء المعلم المحتملة:', possibleNames);
      console.log('📊 [useTeacherGroups] إجمالي الحلقات:', groupsRes.data.length);

      // فلترة الحلقات التي تخص هذا المعلم
      const teacherGroupsData = groupsRes.data.filter((group: Group) => {
        if (!group.teacher) return false;
        
        const isMatch = isTeacherMatch(group.teacher, possibleNames);
        
        if (isMatch) {
          console.log(
            `✅ [useTeacherGroups] حلقة مطابقة: ${group.name} - معلمها: ${group.teacher}`
          );
        }
        
        return isMatch;
      });

      // ترتيب الحلقات أبجدياً
      const groupNames = teacherGroupsData
        .map((g: Group) => g.name)
        .sort((a: string, b: string) => a.localeCompare(b, 'ar'));
      
      console.log(`✅ [useTeacherGroups] تم جلب ${groupNames.length} حلقة:`, groupNames);
      setTeacherGroups(groupNames);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('❌ [useTeacherGroups] خطأ في جلب حلقات المعلم:', error);
      setError(error);
      setTeacherGroups([]);
    } finally {
      setLoadingTeacherGroups(false);
    }
  };

  // تنفيذ الـ fetch عند تغيير المستخدم أو enabled
  useEffect(() => {
    fetchTeacherGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, currentUser?.role, enabled]);

  return {
    teacherGroups,
    loadingTeacherGroups,
    error,
    refetch: fetchTeacherGroups,
  };
};

export default useTeacherGroups;
