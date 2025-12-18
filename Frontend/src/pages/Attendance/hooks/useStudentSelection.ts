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
      prev.map((s) => {
        if (s._id === studentId) {
          const newIsPresent = !s.isPresent;
          // تحديث عدد الغيابات: إذا أصبح غائباً نزيد 1، وإذا أصبح حاضراً ننقص 1
          const newTotalAbsences = (s.totalAbsences || 0) + (newIsPresent ? -1 : 1);
          return { 
            ...s, 
            isPresent: newIsPresent,
            totalAbsences: Math.max(0, newTotalAbsences)
          };
        }
        return s;
      })
    );
    onChangeDetected();
  }, [setStudents, onChangeDetected]);

  // Toggle all students
  const toggleAllStudents = useCallback(() => {
    const newState = !selectedAll;
    setSelectedAll(newState);

    const visibleIds = visibleStudents.map((s) => s._id);
    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (visibleIds.includes(s._id)) {
          // تحديث فقط إذا تغيرت الحالة
          if (s.isPresent !== newState) {
            const newTotalAbsences = (s.totalAbsences || 0) + (newState ? -1 : 1);
            return { 
              ...s, 
              isPresent: newState,
              totalAbsences: Math.max(0, newTotalAbsences)
            };
          }
        }
        return s;
      })
    );
    onChangeDetected();
  }, [selectedAll, visibleStudents, setStudents, onChangeDetected]);

  return {
    selectedAll,
    toggleStudentPresence,
    toggleAllStudents,
  };
};
