// ============================================================================
// TeacherView - عرض المعلم للإنذارات
// ============================================================================

import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TeacherViewProps, Group } from '../types/warnings';
import { EmptyState } from '@/components/UI/EmptyState';
import { Button } from '@/components/UI/Button';
import { GroupCard } from '../components/cards/GroupCard';
import { StudentCard } from '../components/cards/StudentCard';
import { WarningsPageHeader } from '../components/shared/WarningsPageHeader';
import { GroupStatisticsModal } from '../components/statistics/GroupStatisticsModal';
import { DraggableSearchButton } from '../components/shared/DraggableSearchButton';
import { useGroupStatistics, type GroupStatistics } from '../hooks/useGroupStatistics';
import { ArrowRight, Users } from 'lucide-react';
import { StudentHistorySidebar } from '../components/shared/StudentHistorySidebar';

// ✅ Constants extracted outside component for performance
const ANIMATION_DELAYS = [
  '',
  'animate-delay-100',
  'animate-delay-200',
  'animate-delay-300',
  'animate-delay-400',
  'animate-delay-500',
] as const;

export const TeacherView: React.FC<TeacherViewProps> = React.memo(({
  groups,
  loading,
  loadingStudents,
  selectedGroup: selectedGroupProp,
  statistics,
  loadingStatistics,
  onGroupSelect,
  onBack,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const selectedGroup = selectedGroupProp;
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  
  const [selectedGroupForStats, setSelectedGroupForStats] =
    useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchGroupStatistics } = useGroupStatistics();
  const [groupStatisticsData, setGroupStatisticsData] = useState<GroupStatistics | null>(null);
  const [loadingGroupStats, setLoadingGroupStats] = useState(false);



  // ✅ محسّن بـ useCallback
  const handleGroupSelect = useCallback((group: Group) => {
    console.log('Selected Group:', group);
    onGroupSelect(group);
  }, [onGroupSelect]);

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleShowGroupStatistics = useCallback(async (group: Group) => {
    setSelectedGroupForStats(group);
    setShowGroupStats(true);
    setLoadingGroupStats(true);
    
    const stats = await fetchGroupStatistics(group._id);
    setGroupStatisticsData(stats);
    setLoadingGroupStats(false);
  }, [fetchGroupStatistics]);
  
  const handleCloseStats = useCallback(() => {
    setShowGroupStats(false);
  }, []);



  const handleCloseStatsModal = useCallback(() => {
    setShowGroupStats(false);
    setGroupStatisticsData(null);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setShowHistorySidebar(false);
  }, []);

  // ✅ Handle search
  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    setSearchQuery(trimmedQuery);
  }, []);

  // ✅ Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!selectedGroup?.students) {
      return [];
    }
    
    if (!searchQuery) {
      return selectedGroup.students;
    }
    
    const filtered = selectedGroup.students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().trim();
      return fullName.includes(searchQuery);
    });
    
    return filtered;
  }, [selectedGroup?.students, searchQuery]);

  // عرض الحلقات
  if (!selectedGroup) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-100 p-4 md:p-8 bg-size-200 animate-gradient"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fade-in-down">
            <WarningsPageHeader />
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-48 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* بطاقات الحلقات */}
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
            onClose={handleCloseStatsModal}
            statistics={groupStatisticsData}
            loading={loadingGroupStats}
          />
        </div>
      </div>
    );
  }

  // ✅ التحقق من وجود حلقة مختارة قبل العرض
  if (!selectedGroup) {
    return null;
  }

  // عرض طلاب الحلقة المختارة
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-100 p-4 md:p-8"
      dir="rtl"
    >
      {/* زر الطلاب المفصولين - Fixed على الشمال */}
      <button
        onClick={() => setShowHistorySidebar(true)}
        className="fixed left-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 bg-gradient-to-b from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-2 py-3 rounded-xl shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 group"
        title="عرض الطلاب المفصولين"
      >
        <span className="text-xl">⛔</span>
        <div className="flex flex-col items-center gap-0.5">
          {['الطلاب', 'المفصولين'].map((word, i) => (
            <span key={i} className="text-[10px] font-bold whitespace-nowrap leading-tight">
              {word}
            </span>
          ))}
        </div>
        {selectedGroup.suspendedStudents && selectedGroup.suspendedStudents.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md animate-pulse">
            {selectedGroup.suspendedStudents.length}
          </span>
        )}
      </button>

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-xl p-6 border border-emerald-300 animate-fade-in-down">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 hover:scale-105 transition-all duration-200"
            >
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-white">
                {selectedGroup.name}
              </h1>
              <p className="text-emerald-50 font-medium mt-2">
                {selectedGroup.currentStudents || selectedGroup.students?.length || 0} طالب
              </p>
            </div>
            
            {/* زر الإحصائيات */}
            <Button
              onClick={() => handleShowGroupStatistics(selectedGroup)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>📊</span>
              <span>إظهار الإحصائيات</span>
            </Button>
          </div>
        </div>

        {/* Layout: Students List + Suspended Students Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Students List (2/3 width) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
                طلاب الحلقة ({filteredStudents?.length || 0})
              </h2>
              
              {loadingStudents ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filteredStudents && filteredStudents.length > 0 ? (
                <>
                  {searchQuery && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4" dir="rtl">
                      <p className="text-emerald-700 text-sm">
                        تم العثور على <span className="font-bold">{filteredStudents.length}</span> من أصل {selectedGroup.students?.length || 0} طالب
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <StudentCard
                        key={`${student._id}-${student.warningsCount || 0}-${student.allWarnings?.length || 0}`}
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
              ) : searchQuery && filteredStudents.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="لم يتم العثور على نتائج"
                  description={`لا يوجد طلاب بهذا الاسم: "${searchQuery}"`}
                />
              ) : (!selectedGroup.students || selectedGroup.students.length === 0) ? (
                <EmptyState
                  icon="👨‍🎓"
                  title="لا يوجد طلاب في هذه الحلقة"
                  description="الحلقة فارغة حالياً"
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Student History Sidebar - عرض الطلاب المفصولين فقط */}
        <StudentHistorySidebar
          isOpen={showHistorySidebar}
          onClose={handleCloseHistory}
          groupId={selectedGroup?._id}
        />

        {/* Modal الإحصائيات */}
        <GroupStatisticsModal
          isOpen={showGroupStats}
          onClose={handleCloseStatsModal}
          statistics={groupStatisticsData}
          loading={loadingGroupStats}
        />
      </div>
      
      {/* Draggable Search Button */}
      {selectedGroup && selectedGroup.students && selectedGroup.students.length > 0 && (
        <DraggableSearchButton onSearch={handleSearch} />
      )}
    </div>
  );
});
