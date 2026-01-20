import React, { useDeferredValue, useMemo } from "react";
import { Users, Search, X } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { GroupTimetableModal } from "../Model/GroupTimetable";
import { CardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/UI/EmptyState";
import { useGroupsListLogic } from "../hooks";
import type { TeacherGroup } from "../types";

interface GroupsData {
  groups: TeacherGroup[];
  summary: {
    totalGroups: number;
    groupsWithStudents: number;
    emptyGroups: number;
    totalStudents: number;
  };
}

interface GroupsListProps {
  groups: GroupsData | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  onGroupClick: (groupId: string, groupName: string) => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  isLoading,
  error,
  refetch,
  onGroupClick,
}) => {
  // استخدام الـ hook لفصل المنطق
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    timetableModal,
    handleTimetableClick,
    handleCloseTimetableModal,
  } = useGroupsListLogic({ onGroupClick });

  // Make typing smooth even with large lists
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

  // Filter groups based on search term only (memoized)
  const filteredGroups = useMemo(() => {
    const list = groups?.groups ?? [];
    if (!normalizedSearch) return list;
    return list.filter((group) =>
      group.name.toLowerCase().includes(normalizedSearch)
    );
  }, [groups?.groups, normalizedSearch]);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-emerald-50/50 via-teal-50/40 to-cyan-50/50" dir="rtl">
      <div className="w-full mx-auto">
        {/* Header with Statistics */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl border-2 border-emerald-500/30 overflow-hidden p-6 mb-6">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-800" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/20 via-teal-700/20 to-slate-700/20 pointer-events-none" />

          <div className="relative space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl ring-2 ring-white/30 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">إدارة الطلاب</h1>
                  <p className="text-sm text-white/90 mt-1 font-semibold drop-shadow-md">
                    اختر حلقة لعرض وإدارة طلابها
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full lg:w-[28rem]">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300" />
                  <input
                    type="text"
                    placeholder="بحث عن حلقة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-10 py-2.5 bg-white/95 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition-all shadow-lg hover:shadow-xl"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="مسح البحث"
                      aria-label="مسح البحث"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-white/70">
                  {searchTerm ? "يتم البحث حسب اسم الحلقة" : ""}
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            {!isLoading && !error && groups && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all hover:bg-white/15">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">
                    {groups.summary.totalGroups}
                  </div>
                  <div className="text-sm text-white/90 mt-2 font-bold drop-shadow-md">
                    إجمالي الحلقات
                  </div>
                </div>
                <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all hover:bg-white/15">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">
                    {groups.summary.groupsWithStudents}
                  </div>
                  <div className="text-sm text-white/90 mt-2 font-bold drop-shadow-md">
                    حلقات فيها طلاب
                  </div>
                </div>
                <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all hover:bg-white/15">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">
                    {groups.summary.emptyGroups}
                  </div>
                  <div className="text-sm text-white/90 mt-2 font-bold drop-shadow-md">
                    حلقات فارغة
                  </div>
                </div>
                <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all hover:bg-white/15">
                  <div className="text-3xl font-bold text-white drop-shadow-lg">
                    {groups.summary.totalStudents}
                  </div>
                  <div className="text-sm text-white/90 mt-2 font-bold drop-shadow-md">
                    إجمالي الطلاب
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">خطأ في تحميل البيانات</h3>
            <p className="text-red-700">
              {typeof error === "string" ? error : "حدث خطأ غير متوقع"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              المحاولة مرة أخرى
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <>
            {/* Summary Skeleton */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-24 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Groups Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} hasImage={false} contentLines={4} />
              ))}
            </div>
          </>
        )}

        {/* Groups Grid */}
        {!isLoading && !error && groups && (
          <>
            {groups.groups.length === 0 ? (
              <EmptyState
                icon={<Users className="w-12 h-12" />}
                title="لا توجد حلقات"
                description="لا توجد حلقات مسجلة لك حالياً"
              />
            ) : (
              <>
                {/* Groups Cards */}
                {filteredGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                      <GroupCard
                        key={group._id}
                        group={group}
                        onClick={() => onGroupClick(group._id, group.name)}
                        onTimetableClick={(e) => handleTimetableClick(e, group._id, group.name)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Search className="w-12 h-12" />}
                    title="لا توجد نتائج"
                    description="لم يتم العثور على حلقات تطابق بحثك"
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Timetable Modal */}
        <GroupTimetableModal
          isOpen={timetableModal.isOpen}
          onClose={handleCloseTimetableModal}
          groupId={timetableModal.groupId}
          groupName={timetableModal.groupName}
        />
      </div>
    </div>
  );
};
