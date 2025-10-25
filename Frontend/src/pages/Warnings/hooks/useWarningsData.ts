// ============================================================================
// useWarningsData Hook - جلب بيانات الإنذارات
// ============================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../Api/api";
import { getAllStudents } from "../../../Api/studentApi";
import type { Group, Warning, Student } from "../types/warnings";
import { showErrorToast } from "../../../components/utils/toastUtils";

export const useWarningsData = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);

      if (isTeacher) {
        // جلب جميع الطلاب
        const studentsRes = await getAllStudents();
        const allStudents =
          studentsRes.success && Array.isArray(studentsRes.data)
            ? studentsRes.data
            : [];

        // فلترة الطلاب حسب المعلم الحالي
        const teacherName = `${user?.firstName} ${user?.lastName}`.trim();
        const teacherStudents = allStudents.filter((student: any) => {
          const studentTeacher = student.teacher?.trim() || "";
          return studentTeacher.toLowerCase() === teacherName.toLowerCase();
        });

        // تجميع الطلاب حسب الحلقة
        const groupsMap = new Map<string, any[]>();
        teacherStudents.forEach((student: any) => {
          const groupName = student.group || "بدون حلقة";
          if (!groupsMap.has(groupName)) {
            groupsMap.set(groupName, []);
          }
          groupsMap.get(groupName)?.push({
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            warningsCount: 0,
          });
        });

        // تحويل الـ Map إلى مصفوفة
        const groupsList = Array.from(groupsMap.entries()).map(
          ([groupName, students]) => ({
            _id: groupName,
            name: groupName,
            students: students,
          })
        );

        setGroups(groupsList);
      } else if (isStudent) {
        // جلب إنذارات الطالب
        const response = await api.get(`/warnings/student/${user?._id}`);
        const warningsData = response.data || [];
        setWarnings(Array.isArray(warningsData) ? warningsData : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorToast("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // جلب إنذارات طلاب الحلقة
  const fetchGroupStudentsWarnings = async (group: Group): Promise<Group> => {
    try {
      const studentsWithWarnings = await Promise.all(
        group.students.map(async (student) => {
          try {
            const warningsRes = await api.get(
              `/warnings/student/${student._id}`
            );
            const studentWarnings = Array.isArray(warningsRes.data)
              ? warningsRes.data
              : [];

            // استخراج أنواع الإنذارات الموجودة (ما عدا التنبيه)
            const existingTypes = studentWarnings
              .map((w: any) => w.type)
              .filter((type: string) => type !== "warning");

            return {
              ...student,
              warningsCount: studentWarnings.length,
              existingWarningTypes: existingTypes,
              allWarnings: studentWarnings,
            };
          } catch (err) {
            console.error(
              `Error fetching warnings for student ${student._id}:`,
              err
            );
            return {
              ...student,
              warningsCount: 0,
              existingWarningTypes: [],
              allWarnings: [],
            };
          }
        })
      );

      return { ...group, students: studentsWithWarnings };
    } catch (error) {
      console.error("Error fetching students warnings:", error);
      return group;
    }
  };

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
