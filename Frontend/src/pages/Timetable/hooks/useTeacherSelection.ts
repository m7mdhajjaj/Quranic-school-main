// ============================================================================
// useTeacherSelection - Hook لإدارة منطق اختيار المعلم والحلقات
// ============================================================================

import { useMemo } from "react";
import type { Teacher } from "../types/timetable.types";

interface UseTeacherSelectionProps {
  teachers: Teacher[];
  teacherId: string;
}

export const useTeacherSelection = ({ teachers, teacherId }: UseTeacherSelectionProps) => {
  // ✅ إيجاد بيانات المعلم المختار
  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t._id === teacherId);
  }, [teachers, teacherId]);

  // ✅ التحقق من وجود معلم مختار
  const hasSelectedTeacher = useMemo(() => {
    return !!selectedTeacher;
  }, [selectedTeacher]);

  return {
    selectedTeacher,
    hasSelectedTeacher,
  };
};
