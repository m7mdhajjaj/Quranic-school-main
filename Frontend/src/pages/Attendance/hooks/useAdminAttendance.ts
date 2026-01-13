// hooks/useAdminAttendance.ts
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AdminGroup, AdminGroupStudent } from '@/Api/attendanceApi';
import { 
  getAllGroupsForAdmin, 
  getGroupStudentsForAdmin, 
  getAvailableDatesForGroup 
} from '@/Api/attendanceApi';

export const useAdminAttendance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Groups state
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [summary, setSummary] = useState({
    totalGroups: 0,
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Selected group state
  const selectedGroupId = searchParams.get('groupId');
  const [selectedGroupStudents, setSelectedGroupStudents] = useState<AdminGroupStudent[]>([]);
  const [selectedGroupTeacher, setSelectedGroupTeacher] = useState<string>('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  // Date state
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const selectedGroup = groups.find(g => g._id === selectedGroupId) || null;

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getAllGroupsForAdmin();
      
      if (result.success && result.data) {
        setGroups(result.data.groups);
        setSummary(result.data.summary);
      } else {
        setError(result.message || 'حدث خطأ أثناء جلب البيانات');
      }
    } catch (e) {
      console.error('❌ Error fetching admin groups:', e);
      setError('تعذر جلب بيانات الحلقات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch group students
  const fetchGroupStudents = useCallback(async (groupId: string, selectedDate?: string) => {
    try {
      setIsLoadingStudents(true);
      
      const result = await getGroupStudentsForAdmin(groupId, selectedDate || date);
      
      if (result.success && result.data) {
        setSelectedGroupStudents(result.data.students);
        setSelectedGroupTeacher(result.data.group.teacherName);
      }
    } catch (e) {
      console.error('❌ Error fetching group students:', e);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [date]);

  // Fetch available dates for a group
  const fetchAvailableDates = useCallback(async (groupId: string) => {
    try {
      const result = await getAvailableDatesForGroup(groupId);
      
      if (result.success && result.data) {
        setAvailableDates(result.data.dates);
      } else {
        setAvailableDates([]);
      }
    } catch (e) {
      console.error('❌ Error fetching available dates:', e);
      setAvailableDates([]);
    }
  }, []);

  // Handle date change
  const handleDateChange = useCallback((start: string | null, end: string | null) => {
    if (start) {
      setDate(start);
    }
  }, []);

  // Handle group selection
  const handleSelectGroup = useCallback((group: AdminGroup) => {
    setSearchParams({ groupId: group._id });
  }, [setSearchParams]);

  // Handle back to groups
  const handleBackToGroups = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Initial load
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Load students when group selected or date changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupStudents(selectedGroupId, date);
      fetchAvailableDates(selectedGroupId);
    } else {
      setSelectedGroupStudents([]);
      setSelectedGroupTeacher('');
      setAvailableDates([]);
    }
  }, [selectedGroupId, date, fetchGroupStudents, fetchAvailableDates]);

  return {
    // Groups
    groups,
    summary,
    isLoading,
    error,
    fetchGroups,
    
    // Selected group
    selectedGroup,
    selectedGroupId,
    selectedGroupStudents,
    selectedGroupTeacher,
    isLoadingStudents,
    
    // Date
    date,
    availableDates,
    handleDateChange,
    
    // Actions
    handleSelectGroup,
    handleBackToGroups,
  };
};
