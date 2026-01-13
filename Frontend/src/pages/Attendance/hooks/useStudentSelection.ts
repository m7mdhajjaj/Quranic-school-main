import { useState, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AttendanceStudent } from "../types/absence.types";

interface UseStudentSelectionProps {
  visibleStudents: AttendanceStudent[];
  setStudents: Dispatch<SetStateAction<AttendanceStudent[]>>;
  onChangeDetected: () => void;
  currentDate: string; // 🆕 التاريخ الحالي لإضافته للغيابات
}

/**
 * Hook لإدارة حالة اختيار الطلاب وتبديل حالة الحضور
 */
export const useStudentSelection = ({
  visibleStudents,
  setStudents,
  onChangeDetected,
  currentDate,
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

  // تنسيق التاريخ بصيغة DD/MM/YYYY
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Toggle student presence
  const toggleStudentPresence = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s._id === studentId) {
          const newIsPresent = !s.isPresent;
          const newTotalAbsences = (s.totalAbsences || 0) + (newIsPresent ? -1 : 1);
          
          // 🆕 تحديث absenceDates optimistically
          let newAbsenceDates = [...(s.absenceDates || [])];
          const formattedDate = formatDate(currentDate);
          
          if (!newIsPresent) {
            // إذا أصبح غائباً، أضف التاريخ الحالي إذا لم يكن موجوداً
            if (!newAbsenceDates.includes(formattedDate)) {
              newAbsenceDates = [formattedDate, ...newAbsenceDates];
            }
          } else {
            // إذا أصبح حاضراً، احذف التاريخ الحالي
            newAbsenceDates = newAbsenceDates.filter(d => d !== formattedDate);
          }
          
          return { 
            ...s, 
            isPresent: newIsPresent,
            totalAbsences: Math.max(0, newTotalAbsences),
            absenceDates: newAbsenceDates
          };
        }
        return s;
      })
    );
    onChangeDetected();
  }, [setStudents, onChangeDetected, currentDate]);

  // Toggle all students
  const toggleAllStudents = useCallback(() => {
    const newState = !selectedAll;
    setSelectedAll(newState);

    const visibleIds = visibleStudents.map((s) => s._id);
    const formattedDate = formatDate(currentDate);
    
    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (visibleIds.includes(s._id)) {
          // تحديث فقط إذا تغيرت الحالة
          if (s.isPresent !== newState) {
            const newTotalAbsences = (s.totalAbsences || 0) + (newState ? -1 : 1);
            
            // 🆕 تحديث absenceDates optimistically
            let newAbsenceDates = [...(s.absenceDates || [])];
            
            if (!newState) {
              // إذا أصبح غائباً، أضف التاريخ الحالي
              if (!newAbsenceDates.includes(formattedDate)) {
                newAbsenceDates = [formattedDate, ...newAbsenceDates];
              }
            } else {
              // إذا أصبح حاضراً، احذف التاريخ الحالي
              newAbsenceDates = newAbsenceDates.filter(d => d !== formattedDate);
            }
            
            return { 
              ...s, 
              isPresent: newState,
              totalAbsences: Math.max(0, newTotalAbsences),
              absenceDates: newAbsenceDates
            };
          }
        }
        return s;
      })
    );
    onChangeDetected();
  }, [selectedAll, visibleStudents, setStudents, onChangeDetected, currentDate]);

  return {
    selectedAll,
    toggleStudentPresence,
    toggleAllStudents,
  };
};
