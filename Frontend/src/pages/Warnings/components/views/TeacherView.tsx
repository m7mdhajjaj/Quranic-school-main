// ============================================================================
// TeacherView - عرض المعلم للإنذارات
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react';
import type { TeacherViewProps, Group } from '../../types/warnings';
import { EmptyState } from '@/components/UI/EmptyState';
import { Button } from '@/components/UI/Button';
import { GroupCard } from '../cards/GroupCard';
import { StudentCard } from '../cards/StudentCard';
import { WarningsPageHeader } from '../shared/WarningsPageHeader';
import { GroupStatisticsModal } from '../statistics/GroupStatisticsModal';
import { DraggableSearchButton } from '../shared/DraggableSearchButton';
import { useGroupStatistics } from '../../hooks/useGroupStatistics';
import { ArrowRight } from 'lucide-react';
import CardSkeleton from '@/components/skeletons/CardSkeleton';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

// ✅ Constants extracted outside component for performance
const ANIMATION_DELAYS = [
  '',
  'animate-delay-100',
  'animate-delay-200',
  'animate-delay-300',
  'animate-delay-400',
  'animate-delay-500',
] as const;

const SKELETON_COUNT = 3;

export const TeacherView: React.FC<TeacherViewProps> = React.memo(({
  groups,
  loading,
  loadingStudents,
  selectedGroup: selectedGroupProp,
  onGroupSelect,
  onBack,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const selectedGroup = selectedGroupProp;
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [selectedGroupForStats, setSelectedGroupForStats] =
    useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { calculateGroupStatistics } = useGroupStatistics();

  // ✅ محسّن بـ useCallback
  const handleGroupSelect = useCallback((group: Group) => {
    onGroupSelect(group);
  }, [onGroupSelect]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleShowGroupStatistics = useCallback((group: Group) => {
    setSelectedGroupForStats(group);
    setShowGroupStats(true);
  }, []);
  
  const handleCloseStats = useCallback(() => {
    setShowGroupStats(false);
  }, []);

  // ✅ Memoize statistics calculation
  const currentStatistics = useMemo(() => {
    return selectedGroupForStats 
      ? calculateGroupStatistics(selectedGroupForStats)
      : null;
  }, [selectedGroupForStats, calculateGroupStatistics]);

  const selectedGroupStatistics = useMemo(() => {
    return selectedGroup 
      ? calculateGroupStatistics(selectedGroup)
      : null;
  }, [selectedGroup, calculateGroupStatistics]);

  // ✅ Handle search
  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    console.log('🔍 Search query:', trimmedQuery);
    setSearchQuery(trimmedQuery);
  }, []);

  // ✅ Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!selectedGroup?.students) {
      console.log('❌ No students in selected group');
      return [];
    }
    
    if (!searchQuery) {
      console.log('✅ No search query, returning all students:', selectedGroup.students.length);
      return selectedGroup.students;
    }
    
    console.log('🔍 Filtering students with query:', searchQuery);
    const filtered = selectedGroup.students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().trim();
      const matches = fullName.includes(searchQuery);
      console.log(`Student: ${fullName} - Matches: ${matches}`);
      return matches;
    });
    
    console.log('✅ Filtered results:', filtered.length);
    return filtered;
  }, [selectedGroup?.students, searchQuery]);

  // عرض الحلقات
  if (!selectedGroup) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8 bg-size-200 animate-gradient"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fade-in-down">
            <WarningsPageHeader />
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: groups.length || SKELETON_COUNT }).map((_, i) => (
                <CardSkeleton key={i} hasImage={false} contentLines={2} />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, index) => {
                const delayClass = ANIMATION_DELAYS[index % ANIMATION_DELAYS.length];
                return (
                  <div
                    key={group._id}
                    className={`animate-fade-in-up ${delayClass}`}
                  >
                    <GroupCard
                      group={group}
                      onClick={() => handleGroupSelect(group)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="animate-fade-in">
              <EmptyState
                icon="📚"
                title="لا توجد حلقات مسجلة"
                description="لا يوجد حلقات متاحة لعرضها"
              />
            </div>
          )}

          {/* Modal الإحصائيات */}
          <GroupStatisticsModal
            isOpen={showGroupStats}
            onClose={handleCloseStats}
            statistics={currentStatistics}
          />
        </div>
      </div>
    );
  }

  // عرض طلاب الحلقة المختارة
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 animate-fade-in-down">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            >
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedGroup.name}
              </h1>
              <p className="text-gray-600 font-medium mt-2">
                {selectedGroup.students?.length || 0} طالب
              </p>
            </div>
            <Button
              onClick={() => handleShowGroupStatistics(selectedGroup)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>📊</span>
              <span>إظهار الإحصائيات</span>
            </Button>
          </div>
        </div>

        {/* Students List */}
        {loadingStudents ? (
          <LoadingSpinner 
            size="lg" 
            color="emerald" 
            text="جاري تحميل بيانات الطلاب..." 
          />
        ) : !loadingStudents && filteredStudents && filteredStudents.length > 0 ? (
          <>
            {searchQuery && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4" dir="rtl">
                <p className="text-emerald-700 text-sm">
                  تم العثور على <span className="font-bold">{filteredStudents.length}</span> من أصل {selectedGroup.students?.length || 0} طالب
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  onGiveWarning={(type) => onGiveWarning?.(student, type)}
                  onDeleteWarning={(type) => onDeleteWarning?.(student, type)}
                  onDeleteWarningById={(warningId) =>
                    onDeleteWarningById?.(warningId, student)
                  }
                />
              ))}
            </div>
          </>
        ) : !loadingStudents && searchQuery && filteredStudents.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="لم يتم العثور على نتائج"
            description={`لا يوجد طلاب بهذا الاسم: "${searchQuery}"`}
          />
        ) : !loadingStudents && (!selectedGroup.students || selectedGroup.students.length === 0) ? (
          <EmptyState
            icon="👨‍🎓"
            title="لا يوجد طلاب في هذه الحلقة"
            description="الحلقة فارغة حالياً"
          />
        ) : null}

        {/* Modal الإحصائيات */}
        <GroupStatisticsModal
          isOpen={showGroupStats}
          onClose={handleCloseStats}
          statistics={selectedGroupStatistics}
        />
      </div>
      
      {/* Draggable Search Button */}
      {selectedGroup && selectedGroup.students && selectedGroup.students.length > 0 && (
        <DraggableSearchButton onSearch={handleSearch} />
      )}
    </div>
  );
});
