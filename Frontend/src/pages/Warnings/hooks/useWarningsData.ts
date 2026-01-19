// ============================================================================
// useWarningsData Hook - جلب بيانات الإنذارات
// ============================================================================
// ✅ محسّن مع:
// - Local caching للحلقات
// - Lazy loading للطلاب
// - AbortController لمنع race conditions
// - Optimized re-renders
// ============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/Api/api';
import * as warningApi from '@/Api/warningApi';
import type { Group, Warning, UseWarningsDataReturn } from '../types/warnings';
import { showErrorMessage } from '@/utils/sweetalertUtils';

// Cache محلي للحلقات (يمنع إعادة جلب البيانات عند كل render)
const groupsCache = new Map<string, { data: Group[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق

// ✅ دالة لمسح الكاش (يستخدم بعد الإضافة/الحذف)
export const clearWarningsCache = () => {
  groupsCache.clear();
  console.log('🗑️ Warnings cache cleared');
};

export const useWarningsData = (): UseWarningsDataReturn => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isTeacher = useMemo(() => user?.role === 'teacher', [user?.role]);
  const isStudent = useMemo(() => user?.role === 'student', [user?.role]);

  // ✅ جلب البيانات - محسّن بـ caching
  const fetchData = useCallback(async (silent = false) => {
    // ⚡ لا نفعل شيء إذا لم يكن المستخدم محدد
    if (!user?._id || (!isTeacher && !isStudent)) {
      return;
    }
    
    try {
      if (!silent) setLoading(true);

      // إلغاء أي طلب سابق
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (isTeacher) {
        const cacheKey = `teacher_${user?._id}`;
        const cached = groupsCache.get(cacheKey);
        
        // ✅ استخدام البيانات المخزنة إذا كانت حديثة
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setGroups(cached.data);
          setLoading(false);
          return;
        }

        // جلب حلقات المعلم النشطة فقط بدون طلاب (lazy loading)
        const response = await api.get(
          `/groups/teacher-id/${user?._id}/filtered?filter=active`,
          { signal: abortControllerRef.current.signal }
        );

        const groupsData = response.data?.data?.groups || [];

        // تحويل البيانات للصيغة المطلوبة
        const groupsList = groupsData.map((group: any) => ({
          _id: group._id,
          name: group.name,
          currentStudents: group.currentStudents || 0,
          totalStudents: group.totalStudents || 0,
          students: [], // سيتم جلب تفاصيل الطلاب عند اختيار الحلقة
        }));

        // ✅ حفظ في الكاش
        groupsCache.set(cacheKey, {
          data: groupsList,
          timestamp: Date.now()
        });

        setGroups(groupsList);
      } else if (isStudent) {
        // جلب إنذارات الطالب
        if (!user?._id) {
          throw new Error('User ID is undefined');
        }
        const warningsData = await warningApi.getStudentWarnings(user._id);
        setWarnings(Array.isArray(warningsData) ? warningsData : []);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Request was cancelled');
        return;
      }
      console.error('Error fetching data:', error);
      showErrorMessage('خطأ', 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [isTeacher, isStudent, user?._id]);

  // ✅ جلب إنذارات طلاب الحلقة - محسّن بـ parallel requests
  const fetchGroupStudentsWarnings = useCallback(async (group: Group): Promise<Group> => {
    try {
      // ⚡ جلب الطلاب والمفصولين بشكل متوازي
      const [studentsData, expelledData] = await Promise.all([
        warningApi.getGroupStudentsWithWarnings(group._id),
        warningApi.getExpelledStudentsFromGroup(group._id)
      ]);

      // استخدام البيانات الجاهزة من Backend مباشرة
      const studentsWithWarnings = (studentsData?.students || []).map((studentData: any) => ({
        _id: studentData._id,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        isActive: studentData.isActive,
        avatar: studentData.avatar,
        warningsCount: studentData.warningsCount || 0,
        warningsOnlyCount: studentData.warningsOnlyCount || 0,
        existingWarningTypes: studentData.existingWarningTypes || [],
        allWarnings: studentData.allWarnings || [],
      }));

      return { 
        ...group, 
        students: studentsWithWarnings,
        suspendedStudents: expelledData?.expelledStudents || []
      };
    } catch (error) {
      console.error('Error fetching students warnings:', error);
      return group;
    }
  }, []);

  // ✅ استخدام AbortController لمنع race conditions
  useEffect(() => {
    // ⚡ انتظر حتى يكون المستخدم والدور محددين
    if (!user?._id || (!isTeacher && !isStudent)) {
      return;
    }
    
    const controller = new AbortController();
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        if (!controller.signal.aborted && isMounted) {
          console.error('Error in loadData:', error);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user?._id, isTeacher, isStudent, fetchData]);

  return {
    user,
    groups,
    warnings,
    loading,
    isTeacher,
    isStudent,
    refetchData: fetchData,
    fetchGroupStudentsWarnings,
    setWarnings,
  };
};
