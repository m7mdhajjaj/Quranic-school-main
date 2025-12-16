import { Card, Button } from "@/components/UI";
import { 
  Users, BookOpen, Calendar, ArrowLeft, RotateCcw, 
  Plus, Trash2, Filter, Edit 
} from "lucide-react";
import { SearchInput } from "@/components/Filters";
import { DateRangePicker } from "@/components/UI/DateRangePicker";
import SectionStatusFilter from "../../../components/SectionStatusFilter";
import type { MarkStatus } from "../../../components/SectionStatusBadge";
import { DropdownMenu } from "@/components/UI/DropdownMenu";
import { SectionCardSkeleton } from "../../../components/SectionCardSkeleton";
import type { Section } from "../../../types/types";

interface SectionsGridViewProps {
  selectedGroup: string;
  sections: Section[];
  loadingMarks: boolean;
  isFilterOpen: boolean;
  selectedStatus: MarkStatus | null;
  statusCounts: {
    all: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
  filteredSectionsByStatus: Section[];
  selectedMonth: number | null;
  selectedYear: number | null;
  selectedDay: number | null;
  searchQuery: string;
  onGroupSelect: (group: string) => void;
  onAddSection?: () => void;
  onBulkDelete?: () => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onSectionSelect: (section: Section) => void;
  onFilterToggle: () => void;
  onStatusChange: (status: MarkStatus | null) => void;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
  onDayChange: (day: number | null) => void;
  onSearchChange: (query: string) => void;
  startDate?: string | null;
  endDate?: string | null;
  onStartDateChange?: (date: string | null) => void;
  onEndDateChange?: (date: string | null) => void;
}

/**
 * عرض Grid للمقاطع مع الفلاتر
 */
export const SectionsGridView = ({
  selectedGroup,
  sections,
  loadingMarks,
  isFilterOpen,
  selectedStatus,
  statusCounts,
  filteredSectionsByStatus,
  selectedMonth,
  selectedYear,
  selectedDay,
  searchQuery,
  onGroupSelect,
  onAddSection,
  onBulkDelete,
  onEditSection,
  onDeleteSection,
  onSectionSelect,
  onFilterToggle,
  onStatusChange,
  onMonthChange,
  onYearChange,
  onDayChange,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: SectionsGridViewProps) => {
  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => onGroupSelect('')}
        className="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
        type="button"
      >
        <ArrowLeft size={20} />
        <span>العودة إلى الحلقات</span>
      </button>

      {/* Header with Section Name and Action Buttons */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 shadow-lg sticky top-4 z-[100]">
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Section Name */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedGroup}</h2>
                <p className="text-sm text-gray-600 mt-1">حلقة الدراسة</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3" dir="rtl">
              {/* إضافة مقطع */}
              {onAddSection && (
                <Button
                  onClick={onAddSection}
                  variant="primary"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all font-semibold w-[140px] h-[42px] flex items-center justify-between px-3"
                  type="button"
                  dir="rtl"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm leading-tight">إضافة</span>
                    <span className="text-sm leading-tight">مقطع</span>
                  </div>
                  <Plus size={18} />
                </Button>
              )}
              
              {/* حذف مقاطع */}
              {onBulkDelete && (
                <Button
                  onClick={onBulkDelete}
                  variant="secondary"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-700 shadow-md hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-50/30 disabled:hover:border-emerald-400 w-[140px] h-[42px] flex items-center justify-between px-3 bg-gradient-to-br from-emerald-50/80 via-emerald-50/60 to-emerald-50/40"
                  type="button"
                  disabled={sections.length === 0}
                  dir="rtl"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm leading-tight">حذف</span>
                    <span className="text-sm leading-tight">مقاطع</span>
                  </div>
                  <Trash2 size={18} className="text-emerald-700" />
                </Button>
              )}

              {/* Date Range Picker */}
              <div className="w-full md:w-auto">
                <DateRangePicker
                  startDate={startDate || null}
                  endDate={endDate || null}
                  onChange={(start, end) => {
                    if (onStartDateChange) onStartDateChange(start);
                    if (onEndDateChange) onEndDateChange(end);
                  }}
                  className="w-full md:w-auto"
                />
              </div>

              {/* Search Input */}
              <div className="w-full md:w-64">
                <SearchInput 
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="بحث..."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Filter - Always Visible when sections exist */}
      {sections.length > 0 && (
        <div className="mb-6">
          <SectionStatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
            counts={statusCounts}
          />
        </div>
      )}

      {/* Sections Cards */}
      {loadingMarks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SectionCardSkeleton key={i} />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">لا توجد مقاطع في هذه الحلقة</p>
        </Card>
      ) : filteredSectionsByStatus.length === 0 ? (
        <Card className="p-12 text-center">
          <Filter className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">لا توجد مقاطع بالحالة المحددة</p>
          <button
            onClick={() => onStatusChange(null)}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            type="button"
          >
            إظهار جميع المقاطع
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSectionsByStatus.map((section) => {
            const marksStatus = section.marksStatus || "not_started";
            const marksProgress = section.marksProgress;
            const date = new Date(section.date);
            const formattedDate = date.toLocaleDateString("ar-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            });
            const shortDate = date.toLocaleDateString("ar-SA", {
              month: "short",
              day: "numeric",
            });

            const statusConfig = {
              completed: {
                iconColor: "text-emerald-600",
                statusBadgeBg: "bg-emerald-100",
                statusBadgeText: "text-emerald-700",
                statusBadgeBorder: "border-emerald-300",
                statusDot: "bg-emerald-500",
                statusText: "تم رصد علامات",
                borderColor: "border-emerald-500",
              },
              in_progress: {
                iconColor: "text-amber-600",
                statusBadgeBg: "bg-amber-100",
                statusBadgeText: "text-amber-700",
                statusBadgeBorder: "border-amber-300",
                statusDot: "bg-amber-500",
                statusText: "لم يكتمل",
                borderColor: "border-amber-500",
              },
              not_started: {
                iconColor: "text-gray-600",
                statusBadgeBg: "bg-gray-100",
                statusBadgeText: "text-gray-700",
                statusBadgeBorder: "border-gray-300",
                statusDot: "bg-gray-500",
                statusText: "لم يرصد بعد",
                borderColor: "border-gray-400",
              },
            };

            const config = statusConfig[marksStatus];

            return (
              <Card
                key={section._id}
                onClick={() => onSectionSelect(section)}
                className={`cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-100 border-2 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 ${
                  marksStatus === "completed" 
                    ? "border-emerald-500 hover:border-emerald-600" 
                    : marksStatus === "in_progress"
                    ? "border-amber-500 hover:border-amber-600"
                    : "border-gray-400 hover:border-gray-500"
                }`}
              >
                <div className="p-6 relative">
                  {/* Dropdown Menu */}
                  {onEditSection && (
                    <div 
                      className="absolute top-4 left-4 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu
                        items={[
                          {
                            label: "تعديل المقطع",
                            icon: <Edit size={18} />,
                            onClick: () => onEditSection(section),
                            variant: "warning",
                          },
                          {
                            label: "حذف المقطع",
                            icon: <Trash2 size={18} />,
                            onClick: () => {
                              if (onDeleteSection) {
                                onDeleteSection(section._id);
                              }
                            },
                            variant: "danger",
                          },
                        ]}
                        position="left"
                        buttonClassName="hover:bg-emerald-100"
                        menuClassName="shadow-2xl"
                      />
                    </div>
                  )}

                  {/* Header with Date */}
                  <div className="mb-4 pr-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className={config.iconColor} size={20} />
                      <h3 className="text-lg font-bold text-gray-800">{shortDate}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.statusBadgeBg} ${config.statusBadgeText} rounded-lg text-xs font-bold border ${config.statusBadgeBorder}`}>
                      <div className={`w-2 h-2 ${config.statusDot} rounded-full animate-pulse`}></div>
                      {config.statusText}
                    </span>
                    {marksProgress && marksStatus === "in_progress" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                          <span>التقدم</span>
                          <span className="font-semibold">{marksProgress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all duration-300 bg-amber-500"
                            style={{ width: `${marksProgress.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          {marksProgress.studentsWithMarks} من {marksProgress.totalStudents} طالب
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Sections Info */}
                  <div className="space-y-3 mb-5">
                    <div className="bg-white/80 p-3.5 rounded-lg border border-emerald-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <RotateCcw size={16} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">مقطع المراجعة</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 pr-1 line-clamp-2 leading-relaxed">{section.reviewSection || "لا يوجد"}</p>
                    </div>
                    <div className="bg-white/80 p-3.5 rounded-lg border border-teal-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-teal-600" />
                        <span className="text-xs font-semibold text-teal-700">مقطع الحفظ</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 pr-1 line-clamp-2 leading-relaxed">{section.memorizationSection || "لا يوجد"}</p>
                    </div>
                  </div>
                  
                  {/* Action Hint */}
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 pt-4 border-t border-emerald-200/60 font-semibold">
                    <Users size={18} />
                    <span>اضغط لعرض الطلاب والعلامات</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
