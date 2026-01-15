// ============================================================================
// useTeacherGroups - ExamSchedule Hook
// ============================================================================
// Hook لجلب حلقات المعلم - مخصص لصفحة ExamSchedule

import { useState, useEffect, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

interface User {
  _id?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  role?: 'student' | 'teacher' | 'admin' | 'secretary';
}

interface Group {
  _id: string;
  name: string;
  teacher?: string;
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
 * Hook للحصول على حلقات المعلم (متوافق مع ExamSchedule)
 * @param role - دور المستخدم
 * @returns حلقات المعلم وحالة التحميل
 */
export function useTeacherGroups(role: 'student' | 'teacher' | 'admin' | 'secretary') {
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loadingTeacherGroups, setLoadingTeacherGroups] = useState(false);

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

  useEffect(() => {
    const fetchTeacherGroups = async () => {
      // إذا المستخدم مش معلم، لا نجلب شي
      if (role !== 'teacher' || !currentUser || currentUser.role !== 'teacher') {
        setTeacherGroups([]);
        setLoadingTeacherGroups(false);
        return;
      }

      setLoadingTeacherGroups(true);

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
        console.error('❌ [useTeacherGroups] خطأ في جلب حلقات المعلم:', err);
        setTeacherGroups([]);
      } finally {
        setLoadingTeacherGroups(false);
      }
    };

    fetchTeacherGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, currentUser?.role, role]);

  return { teacherGroups, loadingTeacherGroups } as const;
}
