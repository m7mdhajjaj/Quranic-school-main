import React, { useState } from "react";
import { Users, Search, X } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { GroupTimetableModal } from "../Model/GroupTimetable";
import { CardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/UI/EmptyState";
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
  console.log('🔍 GroupsList - groups:', groups);
  console.log('🔍 GroupsList - isLoading:', isLoading);
  console.log('🔍 GroupsList - error:', error);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [timetableModal, setTimetableModal] = useState<{
    isOpen: boolean;
    groupId: string;
    groupName: string;
  }>({
    isOpen: false,
    groupId: "",
    groupName: "",
  });

  // Filter groups based on search term only
  const filteredGroups = groups?.groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTimetableClick = (e: React.MouseEvent, groupId: string, groupName: string) => {
    e.stopPropagation(); // Prevent card onClick from firing
    setTimetableModal({
      isOpen: true,
      groupId,
      groupName,
    });
  };

  const handleCloseTimetableModal = () => {
    setTimetableModal({
      isOpen: false,
      groupId: "",
      groupName: "",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/30" dir="rtl">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 rounded-2xl shadow-lg border-2 border-emerald-100 overflow-hidden p-6 mb-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl ring-2 ring-emerald-200 shadow-md">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">إدارة الطلاب</h1>
                <p className="text-sm text-emerald-600/80 mt-1 font-medium">
                  اختر حلقة لعرض وإدارة طلابها
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full lg:w-[28rem]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="بحث عن حلقة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-10 py-2.5 bg-white/90 backdrop-blur-sm border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-md hover:shadow-lg"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="مسح البحث"
                    aria-label="مسح البحث"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {searchTerm ? "يتم البحث حسب اسم الحلقة" : ""}
              </div>
            </div>
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
                {/* Summary */}
                <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 rounded-2xl shadow-lg border-2 border-emerald-100 overflow-hidden p-6 mb-6">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 pointer-events-none" />
                  
                  <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50 shadow-sm hover:shadow-md transition-all">
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {groups.summary.totalGroups}
                      </div>
                      <div className="text-sm text-emerald-700/80 mt-1 font-medium">
                        إجمالي الحلقات
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-teal-200/50 shadow-sm hover:shadow-md transition-all">
                      <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {groups.summary.groupsWithStudents}
                      </div>
                      <div className="text-sm text-teal-700/80 mt-1 font-medium">
                        حلقات فيها طلاب
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-cyan-200/50 shadow-sm hover:shadow-md transition-all">
                      <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                        {groups.summary.emptyGroups}
                      </div>
                      <div className="text-sm text-cyan-700/80 mt-1 font-medium">
                        حلقات فارغة
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200/50 shadow-sm hover:shadow-md transition-all">
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {groups.summary.totalStudents}
                      </div>
                      <div className="text-sm text-emerald-700/80 mt-1 font-medium">
                        إجمالي الطلاب
                      </div>
                    </div>
                  </div>
                </div>

                {/* Groups Cards */}
                {filteredGroups && filteredGroups.length > 0 ? (
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
