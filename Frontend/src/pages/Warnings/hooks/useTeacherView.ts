// ============================================================================
// useTeacherView Hook - منطق عرض المعلم
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import type { Group } from '../types/warnings';
import { useGroupStatistics, type GroupStatistics } from './useGroupStatistics';

interface UseTeacherViewProps {
  selectedGroup: Group | null;
  onGroupSelect: (group: Group) => void;
  onBack?: () => void;
}

export const useTeacherView = ({
  selectedGroup,
  onGroupSelect,
  onBack,
}: UseTeacherViewProps) => {
  // ===== State Management =====
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [groupStatisticsData, setGroupStatisticsData] = useState<GroupStatistics | null>(null);
  const [loadingGroupStats, setLoadingGroupStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { fetchGroupStatistics } = useGroupStatistics();

  // ===== Handlers =====
  const handleGroupSelect = useCallback((group: Group) => {
    onGroupSelect(group);
  }, [onGroupSelect]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleShowGroupStatistics = useCallback(async (group: Group) => {
    setShowGroupStats(true);
    setLoadingGroupStats(true);
    
    const stats = await fetchGroupStatistics(group._id);
    setGroupStatisticsData(stats);
    setLoadingGroupStats(false);
  }, [fetchGroupStatistics]);

  const handleCloseStatsModal = useCallback(() => {
    setShowGroupStats(false);
    setGroupStatisticsData(null);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setShowHistorySidebar(false);
  }, []);

  const handleOpenHistory = useCallback(() => {
    setShowHistorySidebar(true);
  }, []);

  // ===== Computed Values =====
  const filteredStudents = useMemo(() => {
    if (!selectedGroup?.students) {
      return [];
    }
    
    // إذا لا يوجد بحث، أرجع كل الطلاب
    if (!searchQuery.trim()) {
      return selectedGroup.students;
    }
    
    // البحث في الاسم الكامل (الأول، الأب، الجد، العائلة)
    const query = searchQuery.trim().toLowerCase();
    return selectedGroup.students.filter((student) => {
      const fullName = [
        student.firstName,
        student.middleName,
        student.fatherName,
        student.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      return fullName.includes(query);
    });
  }, [selectedGroup?.students, searchQuery]);
  
  // مسح البحث
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const studentsCount = useMemo(() => 
    filteredStudents?.length || 0,
    [filteredStudents]
  );

  const suspendedCount = useMemo(() => 
    selectedGroup?.suspendedStudents?.length || 0,
    [selectedGroup?.suspendedStudents]
  );

  return {
    // State
    showGroupStats,
    showHistorySidebar,
    groupStatisticsData,
    loadingGroupStats,
    searchQuery,
    
    // Computed
    filteredStudents,
    studentsCount,
    suspendedCount,
    
    // Handlers
    handleGroupSelect,
    handleBack,
    handleShowGroupStatistics,
    handleCloseStatsModal,
    handleCloseHistory,
    handleOpenHistory,
    setSearchQuery,
    clearSearch,
  };
};
