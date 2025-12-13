// ============================================================================
// useWarningsData Hook - جلب بيانات الإنذارات
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
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

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);

      if (isTeacher) {
        // جلب حلقات المعلم مع الطلاب من Backend مباشرة
        const response = await api.get(
          `/groups/teacher-id/${user?._id}/filtered?filter=all&includeStudents=true`
        );

        const groupsData = response.data?.data?.groups || [];

        // تحويل البيانات للصيغة المطلوبة
        const groupsList = groupsData.map((group: any) => ({
          _id: group._id,
          name: group.name,
          students: (group.students || []).map((student: any) => ({
            _id: student._id,
            firstName: student.name?.split(' ')[0] || '',
            lastName: student.name?.split(' ').slice(1).join(' ') || '',
            warningsCount: 0,
          })),
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
  };

  // ✅ جلب إنذارات طلاب الحلقة - محسّن بـ useCallback
  const fetchGroupStudentsWarnings = useCallback(async (group: Group): Promise<Group> => {
    try {
      const data = await warningApi.getGroupStudentsWithWarnings(group._id);
      const studentsData = data?.students || [];

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

      return { ...group, students: studentsWithWarnings };
    } catch (error) {
      console.error('Error fetching students warnings:', error);
      return group;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

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
