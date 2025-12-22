// ============================================================================
// useStudentHistory - Hook لإدارة تاريخ الطلاب المفصولين
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getStudentHistory } from '@/Api/studentApi';
import { getExpelledStudentsFromGroup } from '@/Api/warningApi';
import { formatEventDate } from '../types/Constans';
import type { StudentHistoryEvent, ExpelledStudent } from '../types/warnings';

interface UseStudentHistoryReturn {
  // State
  selectedStudentId: string | null;
  selectedStudentName: string;
  expelledStudents: ExpelledStudent[];
  history: StudentHistoryEvent[];
  loading: boolean;
  loadingExpelled: boolean;
  isExpelled: boolean;
  
  // Actions
  handleStudentSelect: (studentId: string, studentName: string) => void;
  handleBackToList: () => void;
  formatDate: (date: string) => string;
}

export const useStudentHistory = (
  isOpen: boolean,
  groupId?: string
): UseStudentHistoryReturn => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [expelledStudents, setExpelledStudents] = useState<ExpelledStudent[]>([]);
  const [history, setHistory] = useState<StudentHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExpelled, setLoadingExpelled] = useState(false);

  // ✅ Fetch expelled students
  const fetchExpelledStudents = useCallback(async () => {
    if (!groupId) return;
    
    try {
      setLoadingExpelled(true);
      const data = await getExpelledStudentsFromGroup(groupId);
      setExpelledStudents(data.expelledStudents || []);
    } catch (err) {
      console.error('Error fetching expelled students:', err);
      setExpelledStudents([]);
    } finally {
      setLoadingExpelled(false);
    }
  }, [groupId]);

  // ✅ Fetch student history
  const fetchHistory = useCallback(async () => {
    if (!selectedStudentId) return;
    
    try {
      setLoading(true);
      const data = await getStudentHistory(selectedStudentId, { limit: 50 });
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching student history:', err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  // ✅ Effects
  useEffect(() => {
    if (isOpen && groupId) {
      fetchExpelledStudents();
    }
  }, [isOpen, groupId, fetchExpelledStudents]);

  useEffect(() => {
    if (isOpen && selectedStudentId) {
      fetchHistory();
    }
  }, [isOpen, selectedStudentId, fetchHistory]);

  // ✅ Handlers
  const handleStudentSelect = useCallback((studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedStudentId(null);
    setSelectedStudentName('');
    setHistory([]);
  }, []);

  // ✅ Format date
  const formatDate = useCallback((date: string) => {
    return formatEventDate(date);
  }, []);

  // ✅ Check if student is expelled
  const isExpelled = useMemo(() => {
    return history.some(
      (event) => event.eventType === 'EXPULSION' && !history.some(
        (e) => e.eventType === 'RESTORATION' && new Date(e.createdAt) > new Date(event.createdAt)
      )
    );
  }, [history]);

  return {
    selectedStudentId,
    selectedStudentName,
    expelledStudents,
    history,
    loading,
    loadingExpelled,
    isExpelled,
    handleStudentSelect,
    handleBackToList,
    formatDate,
  };
};
