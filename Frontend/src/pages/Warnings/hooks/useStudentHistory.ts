// ============================================================================
// useStudentHistory - Hook لإدارة تاريخ الطلاب المفصولين - محسّن بـ Caching
// ============================================================================

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { getStudentHistory } from '@/Api/studentApi';
import { getExpelledStudentsFromGroup } from '@/Api/warningApi';
import { formatEventDate } from '../types/Constans';
import type { StudentHistoryEvent, ExpelledStudent } from '../types/warnings';

// ⚡ التخزين المؤقت للسجلات
const historyCache = new Map<string, { data: StudentHistoryEvent[]; timestamp: number }>();
const expelledCache = new Map<string, { data: ExpelledStudent[]; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 دقائق

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
  
  // ⚡ إلغاء الطلبات عند الانتقال
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Fetch expelled students - محسّن بـ Caching
  const fetchExpelledStudents = useCallback(async () => {
    if (!groupId) return;
    
    // التحقق من الـ Cache
    const cached = expelledCache.get(groupId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setExpelledStudents(cached.data);
      return;
    }
    
    // إلغاء الطلب السابق
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      setLoadingExpelled(true);
      const data = await getExpelledStudentsFromGroup(groupId);
      const students = data.expelledStudents || [];
      
      // حفظ في الـ Cache
      expelledCache.set(groupId, { data: students, timestamp: Date.now() });
      setExpelledStudents(students);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching expelled students:', err);
      setExpelledStudents([]);
    } finally {
      setLoadingExpelled(false);
    }
  }, [groupId]);

  // ✅ Fetch student history - محسّن بـ Caching
  const fetchHistory = useCallback(async () => {
    if (!selectedStudentId) return;
    
    // التحقق من الـ Cache
    const cached = historyCache.get(selectedStudentId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setHistory(cached.data);
      return;
    }
    
    // إلغاء الطلب السابق
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      const data = await getStudentHistory(selectedStudentId, { limit: 50 });
      const historyData = data.history || [];
      
      // حفظ في الـ Cache
      historyCache.set(selectedStudentId, { data: historyData, timestamp: Date.now() });
      setHistory(historyData);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
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
