// hooks/useAttendancePageState.ts
import { useState, useEffect } from 'react';
import { todayISO } from '../utils/dateHelpers';
import { useUnsavedChanges } from './useUnsavedChanges';
import type { LoggedInUser } from '../types/absence.types';

interface UseAttendancePageStateProps {
  currentUser: LoggedInUser | null;
  selectedGroupId: string | null;
  date: string;
  fetchStudentsForTeacher: (date: string) => Promise<void>;
  fetchStudentAbsenceStats: (studentId: string, month?: number, year?: number) => Promise<void>;
  fetchAvailableDates: (groupId: string) => Promise<void>;
  setDateRange: (start: string | null, end: string | null) => void;
}

export const useAttendancePageState = ({
  currentUser,
  selectedGroupId,
  date,
  fetchStudentsForTeacher,
  fetchStudentAbsenceStats,
  fetchAvailableDates,
  setDateRange,
}: UseAttendancePageStateProps) => {
  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // استخدام hook للتحذير من التغييرات غير المحفوظة
  useUnsavedChanges({ hasUnsavedChanges });

  // جلب التواريخ المتاحة عند اختيار حلقة
  useEffect(() => {
    if (selectedGroupId && currentUser) {
      fetchAvailableDates(selectedGroupId);
    }
  }, [selectedGroupId, currentUser, fetchAvailableDates]);

  // Reset date when leaving group view (returning to groups list)
  useEffect(() => {
    if (!selectedGroupId) {
      const today = todayISO();
      setDateRange(today, today);
      setHasUnsavedChanges(false);
    }
  }, [selectedGroupId, setDateRange]);

  // Initial load
  useEffect(() => {
    if (!currentUser) return;
    if (!isInitialLoad) return; // تجنب التحميل المتكرر
    
    const loadData = async () => {
      if (currentUser.role === "teacher") {
        setIsLoadingDate(true);
        try {
          await fetchStudentsForTeacher(date);
          setHasUnsavedChanges(false);
        } finally {
          setIsLoadingDate(false);
          setIsInitialLoad(false);
        }
      } else if (currentUser.role === "admin") {
        // الأدمن يستخدم AdminView منفصل - لا يحتاج fetch هنا
        setIsInitialLoad(false);
      } else if (currentUser.role === "student") {
        try {
          await fetchStudentAbsenceStats(currentUser._id);
        } finally {
          setIsInitialLoad(false);
        }
      }
    };
    
    loadData();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoadingDate,
    setIsLoadingDate,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isInitialLoad,
  };
};
