// ============================================================================
// TeacherView - عرض المعلم للإنذارات
// ============================================================================

import type { TeacherViewProps, Group } from "./types/warnings";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { EmptyState } from "@/components/UI/EmptyState";
import { Button } from "@/components/UI/Button";
import { GroupCard, StudentCard, StatisticsPanel } from "./components";
import { ArrowRight, BarChart3 } from "lucide-react";
import CardSkeleton from "@/components/skeletons/CardSkeleton";

export const TeacherView: React.FC<TeacherViewProps> = ({
  groups,
  loading,
  selectedGroup: selectedGroupProp,
  onGroupSelect,
  onBack,
  onShowStatistics,
  statistics,
  showStatistics,
  loadingStatistics,
  onCloseStatistics,
  onGiveWarning,
  onDeleteWarning,
  onDeleteWarningById,
}) => {
  const selectedGroup = selectedGroupProp;

  const handleGroupSelect = async (group: Group) => {
    onGroupSelect(group);
  };

  const handleBack = () => {
    onBack?.();
  };

  // عرض الحلقات
  if (!selectedGroup) {
    return (
      <div
        className="min-h-screen bg-gray-50 p-4 md:p-6"
        dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  إدارة الإنذارات
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  اختر الحلقة لعرض الطلاب وإدارة الإنذارات
                </p>
              </div>

              {/* زر الإحصائيات */}
              <Button
                onClick={onShowStatistics}
                variant="secondary"
                className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>عرض الإحصائيات</span>
              </Button>
            </div>
          </div>

          {/* عرض الإحصائيات */}
          {showStatistics && statistics && (
            <StatisticsPanel
              statistics={statistics}
              onClose={onCloseStatistics}
            />
          )}

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: groups.length || 3 }).map((_, i) => (
                <CardSkeleton key={i} hasImage={false} contentLines={2} />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  onClick={() => handleGroupSelect(group)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📚"
              title="لا توجد حلقات مسجلة"
              description="لا يوجد حلقات متاحة لعرضها"
            />
          )}
        </div>
      </div>
    );
  }

  // عرض طلاب الحلقة المختارة
  return (
    <div
      className="min-h-screen bg-gray-50 p-4 md:p-6"
      dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="secondary"
              size="md"
              className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span>رجوع</span>
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedGroup.name}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {selectedGroup.students?.length || 0} طالب
              </p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Students List */}
        {selectedGroup.students && selectedGroup.students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
