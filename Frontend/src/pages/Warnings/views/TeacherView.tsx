// ============================================================================
// TeacherView - عرض المعلم للإنذارات
// ============================================================================

import React from 'react';
import type { TeacherViewProps } from '../types/warnings';
import { EmptyState } from '@/components/UI/EmptyState';
import { Button } from '@/components/UI/Button';
import { GroupCard } from '../components/cards/GroupCard';
import { StudentCard } from '../components/cards/StudentCard';
import { WarningsPageHeader } from '../components/shared/WarningsPageHeader';
import { GroupStatisticsModal } from '../components/statistics/GroupStatisticsModal';
import { useTeacherView } from '../hooks/useTeacherView';
import { ArrowRight, Users, Search, X } from 'lucide-react';
import { StudentHistorySidebar } from '../components/shared/StudentHistorySidebar';
import { ANIMATION_DELAYS, LOADING_SKELETON_COUNT, EMPTY_STATES } from '../types/viewsConstants';

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
  const {
    showGroupStats,
    showHistorySidebar,
    groupStatisticsData,
    loadingGroupStats,
    filteredStudents,
    studentsCount,
    suspendedCount,
    searchQuery,
    handleGroupSelect,
    handleBack,
    handleShowGroupStatistics,
    handleCloseStatsModal,
    handleCloseHistory,
    handleOpenHistory,
    setSearchQuery,
    clearSearch,
  } = useTeacherView({
    selectedGroup: selectedGroupProp ?? null,
    onGroupSelect,
    onBack,
  });

  // عرض الحلقات
  if (!selectedGroupProp) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-4 md:p-8"
        dir="rtl"
      >
        <div className="max-w-[98%] mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fade-in-down">
            <WarningsPageHeader />
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: LOADING_SKELETON_COUNT.groups }).map((_, i) => (
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
          ) : null}

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
  if (!selectedGroupProp) {
    return null;
  }

  // عرض طلاب الحلقة المختارة
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-4 md:p-8"
      dir="rtl"
    >
      {/* زر الطلاب المفصولين - Fixed على الشمال - REMOVED */}
      
      <div className="max-w-[98%] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10">
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
                {selectedGroupProp.name}
              </h1>
              <p className="text-emerald-50 font-medium mt-2">
                {selectedGroupProp.currentStudents || selectedGroupProp.students?.length || 0} طالب
              </p>
            </div>
            
            {/* زر الإحصائيات */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleOpenHistory}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-white border border-red-200/30 shadow-lg hover:shadow-xl transition-all duration-200 relative"
              >
                <span>⛔</span>
                <span>الطلاب المفصولين</span>
                {suspendedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white animate-pulse">
                    {suspendedCount}
                  </span>
                )}
              </Button>

              <Button
                onClick={() => handleShowGroupStatistics(selectedGroupProp)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>📊</span>
                <span>إظهار الإحصائيات</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Layout: Students List - Simplified to reduce CLS */}
        <div className="w-full space-y-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200 min-h-[60vh]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" />
                طلاب الحلقة ({studentsCount})
              </h2>
              
              {/* حقل البحث */}
              <div className="w-full sm:w-72 relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن طالب (الاسم الأول، الأب، العائلة)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            {/* نتائج البحث */}
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <span className="font-medium">نتائج البحث:</span> {filteredStudents.length} طالب
                {filteredStudents.length === 0 && (
                  <span className="text-amber-600 mr-2">- لم يتم العثور على طلاب مطابقين</span>
                )}
              </div>
            )}
              
              {loadingStudents ? (
                <div className="space-y-4">
                  {Array.from({ length: LOADING_SKELETON_COUNT.students }).map((_, i) => (
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
              ) : (!selectedGroupProp.students || selectedGroupProp.students.length === 0) ? (
                <EmptyState
                  icon={EMPTY_STATES.noStudents.icon}
                  title={EMPTY_STATES.noStudents.title}
                  description={EMPTY_STATES.noStudents.description}
                />
              ) : null}
          </div>
        </div>

        {/* Student History Sidebar - عرض الطلاب المفصولين فقط */}
        <StudentHistorySidebar
          isOpen={showHistorySidebar}
          onClose={handleCloseHistory}
          groupId={selectedGroupProp?._id}
        />

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
});

TeacherView.displayName = 'TeacherView';
