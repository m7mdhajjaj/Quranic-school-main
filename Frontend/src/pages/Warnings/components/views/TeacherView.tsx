// ============================================================================
// TeacherView - عرض المعلم للإنذارات
// ============================================================================

import React, { useState } from "react";
import type { TeacherViewProps, Group } from "../../types/warnings";
import { EmptyState } from "@/components/UI/EmptyState";
import { Button } from "@/components/UI/Button";
import { GroupCard } from "../cards/GroupCard";
import { StudentCard } from "../cards/StudentCard";
import { WarningsPageHeader } from "../shared/WarningsPageHeader";
import { GroupStatisticsModal } from "../statistics/GroupStatisticsModal";
import { ArrowRight } from "lucide-react";
import CardSkeleton from "@/components/skeletons/CardSkeleton";
import "../../styles/animations.css";

export const TeacherView: React.FC<TeacherViewProps> = ({
  groups,
  loading,
  selectedGroup: selectedGroupProp,
  onGroupSelect,
  onBack,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const selectedGroup = selectedGroupProp;
  const [showGroupStats, setShowGroupStats] = useState(false);
  const [selectedGroupForStats, setSelectedGroupForStats] = useState<Group | null>(null);

  const handleGroupSelect = async (group: Group) => {
    onGroupSelect(group);
  };

  const handleBack = () => {
    onBack?.();
  };

  const handleShowGroupStatistics = (group: Group) => {
    setSelectedGroupForStats(group);
    setShowGroupStats(true);
  };

  const calculateGroupStatistics = (group: Group) => {
    const students = group.students || [];
    const studentsWithWarnings = students.filter(
      (s) => (s.warningsCount || 0) > 0
    );

    const warningsByType = {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
      expulsion: 0,
    };

    let totalWarnings = 0;

    students.forEach((student) => {
      totalWarnings += student.warningsCount || 0;
      student.existingWarningTypes?.forEach((type) => {
        if (type in warningsByType) {
          warningsByType[type as keyof typeof warningsByType]++;
        }
      });
      // حساب التنبيهات
      warningsByType.warning += student.warningsOnlyCount || 0;
    });

    const topStudents = students
      .filter((s) => (s.warningsCount || 0) > 0)
      .sort((a, b) => (b.warningsCount || 0) - (a.warningsCount || 0))
      .slice(0, 5)
      .map((s) => ({
        name: `${s.firstName} ${s.lastName}`,
        warningsCount: s.warningsCount || 0,
      }));

    return {
      groupName: group.name,
      totalStudents: students.length,
      studentsWithWarnings: studentsWithWarnings.length,
      totalWarnings,
      warningsByType,
      topStudents,
    };
  };

  // عرض الحلقات
  if (!selectedGroup) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8 animate-gradient"
        dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fade-in-down">
            <WarningsPageHeader />
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: groups.length || 3 }).map((_, i) => (
                <CardSkeleton key={i} hasImage={false} contentLines={2} />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, index) => {
                const delays = ['', 'animate-delay-100', 'animate-delay-200', 'animate-delay-300', 'animate-delay-400', 'animate-delay-500'];
                const delayClass = delays[index % delays.length];
                return (
                  <div
                    key={group._id}
                    className={`animate-fade-in-up ${delayClass}`}>
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
            onClose={() => setShowGroupStats(false)}
            statistics={
              selectedGroupForStats
                ? calculateGroupStatistics(selectedGroupForStats)
                : null
            }
          />
        </div>
      </div>
    );
  }

  // عرض طلاب الحلقة المختارة
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 animate-fade-in-down">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedGroup.name}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-gray-600 font-medium">
                  {selectedGroup.students?.length || 0} طالب
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleShowGroupStatistics(selectedGroup)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <span>📊</span>
              <span>إظهار الإحصائيات</span>
            </Button>
          </div>
        </div>



        {/* Students List */}
        {selectedGroup.students && selectedGroup.students.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {selectedGroup.students.map((student) => (
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
        ) : (
          <EmptyState
            icon="👨‍🎓"
            title="لا يوجد طلاب في هذه الحلقة"
            description="الحلقة فارغة حالياً"
          />
        )}
      </div>
    </div>
  );
};
