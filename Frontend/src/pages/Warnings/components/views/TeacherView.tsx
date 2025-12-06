// ============================================================================
// TeacherView - عرض المعلم للإنذارات
// ============================================================================

import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react';
import type { TeacherViewProps, Group } from '../../types/warnings';
import { EmptyState } from '@/components/UI/EmptyState';
import { Button } from '@/components/UI/Button';
import { GroupCard } from '../cards/GroupCard';
import { StudentCard } from '../cards/StudentCard';
import { WarningsPageHeader } from '../shared/WarningsPageHeader';
import { GroupStatisticsModal } from '../statistics/GroupStatisticsModal';
import { DraggableSearchButton } from '../shared/DraggableSearchButton';
import { SuspendedStudentsList } from '../suspended/SuspendedStudentsList';
import { useGroupStatistics } from '../../hooks/useGroupStatistics';
import { useSuspendedStudents } from '../../hooks/useSuspendedStudents';
import { ArrowRight, Users, UserX } from 'lucide-react';
import CardSkeleton from '@/components/skeletons/CardSkeleton';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import AuthContext from '@/Context/AuthContext';
import { socketManager } from '@/Socket/SocketManager';

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
  statistics,
  loadingStatistics,
  onGroupSelect,
  onBack,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const selectedGroup = selectedGroupProp;
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [viewingSuspendedStudents, setViewingSuspendedStudents] = useState(false);
  const [selectedGroupForStats, setSelectedGroupForStats] =
    useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { calculateGroupStatistics } = useGroupStatistics();
  
  // 🔴 جلب الطلاب المفصولين
  console.log('👤 Teacher ID for suspended students:', user?._id);
  const { 
    suspendedStudents, 
    loading: loadingSuspended, 
    refetch: refetchSuspended 
  } = useSuspendedStudents(user?._id || '');
  
  console.log('📋 Suspended students count:', suspendedStudents.length);

  // 🔔 الاستماع لأحداث Socket.IO لتحديث القائمة
  useEffect(() => {
    const handleWarningUpdate = () => {
      console.log('🔄 Warning update detected - refreshing suspended students list');
      refetchSuspended();
    };

    const socket = socketManager.getSocket();
    if (socket) {
      // تحديث عند أي تغيير في الإنذارات
      socket.on('warningCreated', handleWarningUpdate); // عند إنشاء إنذار جديد
      socket.on('warningDeleted', handleWarningUpdate); // عند حذف إنذار
      socket.on('suspensionExpired', handleWarningUpdate); // عند انتهاء فصل
      socket.on('warningStatisticsUpdated', handleWarningUpdate); // عند تحديث الإحصائيات
    }

    return () => {
      if (socket) {
        socket.off('warningCreated', handleWarningUpdate);
        socket.off('warningDeleted', handleWarningUpdate);
        socket.off('suspensionExpired', handleWarningUpdate);
        socket.off('warningStatisticsUpdated', handleWarningUpdate);
      }
    };
  }, [refetchSuspended]);

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

  const handleViewSuspendedStudents = useCallback(() => {
    setViewingSuspendedStudents(true);
  }, []);

  const handleBackFromSuspended = useCallback(() => {
    setViewingSuspendedStudents(false);
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
          ) : groups.length > 0 || suspendedStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 🔴 بطاقة الطلاب المفصولين */}
              {suspendedStudents.length > 0 && (
                <div className="animate-fade-in-up">
                  <div
                    onClick={handleViewSuspendedStudents}
                    className="group relative bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                    </div>

                    {/* Content */}
                    <div className="relative p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <UserX className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">الطلاب المفصولين</h3>
                            <p className="text-white/80 text-sm">Students Suspended</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          <span className="text-lg font-semibold">{suspendedStudents.length} طالب</span>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </div>
              )}

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
            onClose={handleCloseStats}
            statistics={currentStatistics}
          />
        </div>
      </div>
    );
  }

  // عرض قائمة الطلاب المفصولين
  if (viewingSuspendedStudents) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 p-4 md:p-8"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 animate-fade-in-down">
            <Button
              onClick={handleBackFromSuspended}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="font-semibold">رجوع للحلقات</span>
            </Button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-red-900 flex items-center gap-3">
                <UserX className="w-8 h-8" />
                الطلاب المفصولين ({suspendedStudents.length})
              </h2>
            </div>
          </div>

          {/* Suspended Students List */}
          <div className="animate-fade-in">
            <SuspendedStudentsList
              students={suspendedStudents}
              loading={loadingSuspended}
            />
          </div>
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
      <div className="max-w-[1920px] mx-auto space-y-6">
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

        {/* Layout: Students List + Suspended Students Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Students List (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                طلاب الحلقة ({filteredStudents?.length || 0})
              </h2>
              
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
            </div>
          </div>

          {/* Right: Suspended Students Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 sticky top-4 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
              <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-2xl flex-shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserX className="w-6 h-6" />
                  الطلاب المفصولين ({suspendedStudents.length})
                </h2>
              </div>

              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#f87171 #fee2e2' }}>
                {loadingSuspended ? (
                  <LoadingSpinner size="md" color="red" text="جاري التحميل..." />
                ) : suspendedStudents.length > 0 ? (
                  <SuspendedStudentsList
                    students={suspendedStudents}
                    loading={false}
                  />
                ) : (
                  <EmptyState
                    icon="✅"
                    title="لا يوجد طلاب مفصولين"
                    description="جميع الطلاب نشطون"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

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
