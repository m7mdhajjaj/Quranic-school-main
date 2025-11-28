/**
 * Custom hook for managing ranking data
 */

import { useState, useEffect, useCallback } from 'react';
import { getRankingByAverages } from '@/Api/rankingApi';
import type {
  StudentWithAverage,
  User,
  UseRankingDataReturn,
} from '../types/ranking';

export const useRankingData = (
  selectedMonth: number,
  selectedYear: number,
  selectedGroup: string,
  user: User | null
): UseRankingDataReturn => {
  const [students, setStudents] = useState<StudentWithAverage[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentGroup = selectedGroup || user?.group || '';

      const response = await getRankingByAverages(
        selectedMonth,
        selectedYear,
        currentGroup
      );

      if (response.success) {
        setStudents(response.data);
        // حفظ حلقات المعلم من Backend
        if (response.teacherGroups) {
          setTeacherGroups(response.teacherGroups);
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching ranking data:', error);
      setError('حدث خطأ أثناء جلب البيانات');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedGroup, user]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (selectedGroup || user?.role === 'admin') {
      fetchRankingData();
    }
  }, [fetchRankingData, selectedGroup, user]);

  return {
    students,
    teacherGroups,
    loading,
    error,
    refetch: fetchRankingData,
  };
};
