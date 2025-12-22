// ============================================================================
// useWarningsData Hook - جلب بيانات الإنذارات
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/Api/api';
import * as warningApi from '@/Api/warningApi';
import type { Group, Warning, UseWarningsDataReturn } from '../types/warnings';
import { showErrorToast } from '@/utils/toastUtils';

export const useWarningsData = (): UseWarningsDataReturn => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = useMemo(() => user?.role === 'teacher', [user?.role]);
  const isStudent = useMemo(() => user?.role === 'student', [user?.role]);

  // ✅ جلب البيانات - محسّن بـ useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (isTeacher) {
        // جلب حلقات المعلم النشطة فقط بدون طلاب (lazy loading)
        const response = await api.get(
          `/groups/teacher-id/${user?._id}/filtered?filter=active`
        );

        const groupsData = response.data?.data?.groups || [];

        // تحويل البيانات للصيغة المطلوبة
        const groupsList = groupsData.map((group: any) => ({
          _id: group._id,
          name: group.name,
          currentStudents: group.currentStudents || 0, // ✅ عدد الطلاب من API
          totalStudents: group.totalStudents || 0,
          students: [], // سيتم جلب تفاصيل الطلاب عند اختيار الحلقة
        }));

        setGroups(groupsList);
      } else if (isStudent) {
        // جلب إنذارات الطالب
        if (!user?._id) {
          throw new Error('User ID is undefined');
        }
        const warningsData = await warningApi.getStudentWarnings(user._id);
        setWarnings(Array.isArray(warningsData) ? warningsData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorToast('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [isTeacher, isStudent, user?._id]);

  // ✅ جلب إنذارات طلاب الحلقة - محسّن بـ useCallback
  const fetchGroupStudentsWarnings = useCallback(async (group: Group): Promise<Group> => {
    try {
      // جلب الطلاب والإنذارات
      const data = await warningApi.getGroupStudentsWithWarnings(group._id);
      const studentsData = data?.students || [];

      // جلب الطلاب المفصولين (للعرض في العداد)
      const expelledData = await warningApi.getExpelledStudentsFromGroup(group._id);
      const expelledStudents = expelledData?.expelledStudents || [];

      // استخدام البيانات الجاهزة من Backend مباشرة
      const studentsWithWarnings = studentsData.map((studentData: any) => ({
        _id: studentData._id,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        isActive: studentData.isActive, // حالة الطالب
        avatar: studentData.avatar, // صورة الطالب من Cloudinary
        warningsCount: studentData.warningsCount || 0,
        warningsOnlyCount: studentData.warningsOnlyCount || 0, // عدد التنبيهات
        existingWarningTypes: studentData.existingWarningTypes || [],
        allWarnings: studentData.allWarnings || [],
      }));

      return { 
        ...group, 
        students: studentsWithWarnings,
        suspendedStudents: expelledStudents // إضافة الطلاب المفصولين
      };
    } catch (error) {
      console.error('Error fetching students warnings:', error);
      return group;
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user?._id, fetchData]);

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
