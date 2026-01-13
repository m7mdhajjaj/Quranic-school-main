// ============================================================================
// useTeacherAttendance - Hook موحد لإدارة حضور المعلم
// ============================================================================
// دمج fetchStudentsForTeacher + loading state + error handling

import { useState, useCallback } from 'react';
import { getTeacherGroupsForAttendance } from '@/Api/attendanceApi';
import type { AttendanceStudent } from '../types/absence.types';

interface TeacherGroup {
  _id: string;
  name: string;
  status?: string;
  totalStudents?: number;
}

export const useTeacherAttendance = (teacherId: string | undefined) => {
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(
    async (date: string) => {
      if (!teacherId) {
        setError('معرف المعلم غير موجود');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getTeacherGroupsForAttendance(
          teacherId,
          date,
          'all',
          true
        );

        if (!result.success || !result.data) {
          throw new Error(result.message || 'تعذر جلب بيانات الحضور');
        }

        const { groups: groupsData, students: studentsData } = result.data;

        // تحويل بيانات الحلقات
        setGroups(
          groupsData.map((g) => ({
            _id: g._id,
            name: g.name,
            status: g.status || 'active',
            totalStudents: g.totalStudents || 0,
          }))
        );

        // تحويل بيانات الطلاب
        const formatted: AttendanceStudent[] = studentsData.map((s) => ({
          _id: s._id,
          studentId: s.studentId,
          name: s.name,
          gender: s.gender,
          phoneNumber: s.phoneNumber,
          group: s.group || 'بدون حلقة',
          teacher: s.teacher,
          isPresent: s.isPresent,
          totalAbsences: s.totalAbsences,
          absenceDates: s.absenceDates,
        }));

        setStudents(formatted);
      } catch (err) {
        const error = err as Error;
        console.error('❌ خطأ في جلب بيانات الحضور:', error);
        setError(error.message || 'تعذر جلب البيانات');
        setStudents([]);
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    },
    [teacherId]
  );

  return {
    students,
    setStudents,
    groups,
    isLoading,
    error,
    fetchAttendance,
  };
};
