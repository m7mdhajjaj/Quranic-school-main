import { useState, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AttendanceStudent } from "../types/absence.types";

interface UseStudentSelectionProps {
  visibleStudents: AttendanceStudent[];
  setStudents: Dispatch<SetStateAction<AttendanceStudent[]>>;
  onChangeDetected: () => void;
}

/**
 * Hook لإدارة حالة اختيار الطلاب وتبديل حالة الحضور
 */
export const useStudentSelection = ({
  visibleStudents,
  setStudents,
  onChangeDetected,
}: UseStudentSelectionProps) => {
  const [selectedAll, setSelectedAll] = useState(false);

  // Update selectedAll based on visible students
  useEffect(() => {
    if (visibleStudents.length > 0) {
      setSelectedAll(visibleStudents.every((s) => s.isPresent));
    } else {
      setSelectedAll(false);
    }
  }, [visibleStudents]);

  // Toggle student presence
  const toggleStudentPresence = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId ? { ...s, isPresent: !s.isPresent } : s
      )
    );
    onChangeDetected();
  }, [setStudents, onChangeDetected]);

  // Toggle all students - استخدام functional update لتجنب dependency على selectedAll
  const toggleAllStudents = useCallback(() => {
    setSelectedAll((prev) => {
      const newState = !prev;
      const visibleIds = visibleStudents.map((s) => s._id);
      setStudents((prevStudents) =>
        prevStudents.map((s) =>
          visibleIds.includes(s._id) ? { ...s, isPresent: newState } : s
        )
      );
      onChangeDetected();
      return newState;
    });
  }, [visibleStudents, setStudents, onChangeDetected]);

  return {
    selectedAll,
    toggleStudentPresence,
    toggleAllStudents,
  };
};
