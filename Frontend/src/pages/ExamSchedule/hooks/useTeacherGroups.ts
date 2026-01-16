// ============================================================================
// useTeacherGroups - ExamSchedule Hook
// ============================================================================
// Hook لجلب حلقات المعلم - مخصص لصفحة ExamSchedule

import { useState, useEffect, useMemo } from 'react';
import { getGroupsByTeacherIdWithFilters } from '@/Api/groupApi';

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
  const currentUser = useMemo<User | null>(() => {
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
      if (role !== 'teacher' || !currentUser || currentUser.role !== 'teacher' || !currentUser._id) {
        setTeacherGroups([]);
        setLoadingTeacherGroups(false);
        return;
      }

      setLoadingTeacherGroups(true);

      try {
        console.log('🔍 [useTeacherGroups] جلب حلقات المعلم بواسطة ID:', currentUser._id);

        // استخدام API المخصص للمعلم (لا يحتاج صلاحيات Admin/Secretary)
        const result = await getGroupsByTeacherIdWithFilters(
          currentUser._id,
          'all', // جلب كل الحلقات
          false  // لا نحتاج تفاصيل الطلاب
        );

        if (!result.success || !Array.isArray(result.data)) {
          console.error('❌ [useTeacherGroups] فشل في جلب الحلقات');
          setTeacherGroups([]);
          return;
        }

        // ترتيب الحلقات أبجدياً
        const groupNames = result.data
          .map((g) => g.name)
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
