import type { Section, Mark, SectionsTableProps } from "../types/types";
import { Tooltip } from "@/components/UI";
import { Table } from "@/components/UI";
import type { Column } from "@/components/UI/Table";
import { memo } from "react";
import { RefreshCw, Plus, Edit, Trash2, RotateCcw, BookOpen, Calendar, ChevronRight, ChevronLeft, Users, FileCheck, FileEdit } from "lucide-react";
import { getMarkColor, formatDateWithDay } from "../utils";
import { useMonthNavigation, useMarkFinder } from "../hooks";
import { CardSkeleton } from "@/components/skeletons";

// Extended section type with mark for table rendering
type SectionWithMark = Section & { mark?: Mark };

/**
 * Sections table component showing sections with marks and actions
 * Uses shared Table component with custom rendering
 */
const SectionsTableComponent = ({
  sections,
  marks,
  loadingMarks,
  isTeacher,
  selectedGroup,
  studentId,
  onAddMark,
  onUpdateMark,
  onEditSection,
  onDeleteSection,
  onBulkMarks,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: SectionsTableProps) => {
  // Use custom hooks for navigation and mark finding
  const {
    isCurrentMonth,
    handlePreviousMonth,
    handleNextMonth,
    handleCurrentMonth,
    selectedMonthLabel,
  } = useMonthNavigation({
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
  });

  // Use custom hook to attach marks to sections
  // Pass studentId to filter marks by student (prevents cross-student display)
  const tableData = useMarkFinder({ sections, marks, studentId });
  
  // Render mark cell - plain text only
  const renderMarkCell = (mark: Mark | undefined, type: "review" | "memorization") => {
    const markValue = type === "review" ? mark?.reviewMark : mark?.memorizationMark;
    
    if (!markValue && markValue !== 0) {
    return (
      <div className="text-center text-gray-400 text-sm">
        -
      </div>
    );
    }

    return (
      <div className={`text-center font-semibold text-sm px-3 py-1.5 rounded-md ${getMarkColor(markValue, type)}`}>
        {markValue}/10
      </div>
    );
  };

  // Define table columns with responsive widths based on user role
  // For students: 6 columns (with row number + no actions), widths are more flexible
  // For teachers: 6 columns (with actions), widths adjust accordingly
  const baseColumns: Column<SectionWithMark>[] = [
    // Row number column - only for students, appears first (leftmost in RTL)
    ...(isTeacher ? [] : [{
      key: "rowNumber",
      header: "#",
      width: "8%",
      align: "center" as const,
      render: (_row: SectionWithMark, index: number) => (
        <div className="text-center text-gray-600 font-semibold text-sm py-2">
          {index + 1}
        </div>
      ),
    }]),
    {
      key: "memorizationSection",
      header: "مقطع الحفظ",
      width: isTeacher ? "18%" : "20%",
      render: (row) => (
        <div className="text-teal-700 font-medium text-sm bg-teal-50/50 px-3 py-2 rounded-md">
          {row.memorizationSection}
        </div>
      ),
    },
    {
      key: "memorizationMark",
      header: "علامة الحفظ",
      width: isTeacher ? "12%" : "13%",
      align: "center",
      render: (row) => renderMarkCell(row.mark, "memorization"),
    },
    {
      key: "reviewSection",
      header: "مقطع المراجعة",
      width: isTeacher ? "18%" : "20%", // Adjusted for student row number column
      render: (row) => (
        <div className="text-emerald-700 font-medium text-sm bg-emerald-50/50 px-3 py-2 rounded-md">
          {row.reviewSection}
        </div>
      ),
    },
    {
      key: "reviewMark",
      header: "علامة المراجعة",
      width: isTeacher ? "12%" : "13%",
      align: "center",
      render: (row) => renderMarkCell(row.mark, "review"),
    },
    {
      key: "date",
      header: "التاريخ",
      width: isTeacher ? "13%" : "18%",
      render: (row) => {
        const { formattedDate, dayName } = formatDateWithDay(row.date);
        
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 text-sm">{formattedDate}</span>
            <span className="text-xs text-gray-500 mt-0.5">{dayName}</span>
          </div>
        );
      },
    },
  ];

  // For teachers, columns width already account for actions column
  // Actions column will be handled by Table component with actionsWidth prop
  const columns = baseColumns;

  // Render action buttons for teachers with enhanced styling
  const renderActions = isTeacher
    ? (row: SectionWithMark) => (
        <div className="flex items-center justify-center gap-2">
          {onBulkMarks && selectedGroup && selectedGroup !== 'all' && (
            <Tooltip content="إضافة/تحديث علامات لجميع الطلاب" position="top">
              <button
                onClick={() => onBulkMarks(row)}
                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                title="إضافة/تحديث علامات لجميع الطلاب"
                type="button">
                <Users size={16} />
              </button>
            </Tooltip>
          )}
          {row.mark ? (
            <Tooltip content="تحديث العلامة" position="top">
              <button
                onClick={() => onUpdateMark && onUpdateMark(row.mark!, row)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="تحديث العلامة"
                type="button">
                <RefreshCw size={16} />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="إضافة علامة" position="top">
              <button
                onClick={() => onAddMark && onAddMark(row)}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="إضافة علامة"
                type="button">
                <Plus size={16} />
              </button>
            </Tooltip>
          )}
          <Tooltip content="تعديل المقطع" position="top">
            <button
              onClick={() => onEditSection && onEditSection(row)}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="تعديل المقطع"
              type="button">
              <Edit size={16} />
            </button>
          </Tooltip>
          <Tooltip content="حذف المقطع" position="top">
            <button
              onClick={() => onDeleteSection && onDeleteSection(row._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="حذف المقطع"
              type="button">
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      )
    : undefined;

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block w-full">
        {/* Navigation Buttons - Above Table */}
        {(onMonthChange && onYearChange && selectedMonth && selectedYear) && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-sm">
                <Calendar className="text-white" size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">الشهر المحدد</p>
                <p className="text-sm font-bold text-gray-800">
                  {selectedMonthLabel} {selectedYear}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md active:scale-95 group"
                type="button"
                title="الشهر السابق">
                <ChevronRight size={14} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">السابق</span>
              </button>

              <button
                onClick={handleCurrentMonth}
                className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg transition-all duration-150 font-semibold text-xs shadow-sm active:scale-95 ${
                  isCurrentMonth
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-600'
                    : 'bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-300 hover:border-emerald-500 text-emerald-700'
                }`}
                type="button"
                title="الشهر الحالي">
                <Calendar size={14} />
                <span>الحالي</span>
              </button>

              <button
                onClick={handleNextMonth}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md active:scale-95 group"
                type="button"
                title="الشهر التالي">
                <span className="text-xs font-semibold text-emerald-700">التالي</span>
                <ChevronLeft size={14} className="text-emerald-600" />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions Buttons - 3 Large Buttons */}
        {isTeacher && onBulkMarks && selectedGroup && selectedGroup !== 'all' && sections.length > 0 && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.slice(0, 3).map((section) => {
              const sectionMark = marks.find((m) => {
                if (!m || !m.sectionId) return false;
                const sectionId = typeof m.sectionId === "string" ? m.sectionId : m.sectionId._id;
                return sectionId === section._id;
              });
              const hasMarks = sectionMark !== undefined;
              const date = new Date(section.date);
              const formattedDate = date.toLocaleDateString("ar-SA", {
                month: "short",
                day: "numeric",
              });

              return (
                <button
                  key={section._id}
                  onClick={() => onBulkMarks(section)}
                  className={`group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    hasMarks
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:border-emerald-500 hover:shadow-lg'
                      : 'bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-300 hover:border-cyan-500 hover:shadow-lg'
                  }`}
                  type="button"
                >
                  <div className={`p-3 rounded-lg ${
                    hasMarks
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      : 'bg-gradient-to-br from-cyan-500 to-teal-600'
                  }`}>
                    {hasMarks ? (
                      <FileEdit className="text-white" size={24} />
                    ) : (
                      <FileCheck className="text-white" size={24} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-sm mb-1">
                      {formattedDate}
                    </p>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                      {section.reviewSection}
                    </p>
                    <p className={`text-xs font-semibold ${
                      hasMarks ? 'text-emerald-700' : 'text-cyan-700'
                    }`}>
                      {hasMarks ? 'تحديث العلامات' : 'إضافة العلامات'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Table with Clean Design - Responsive to column count */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden w-full border border-emerald-100">
          <Table
            columns={columns}
            data={tableData}
            loading={loadingMarks}
            emptyMessage="📝 لا توجد مقاطع في الشهر والسنة المحددة"
            hoverable={true}
            bordered={false}
            dense={false}
            responsive={true}
            showHeader={true}
            stickyHeader={true}
            renderActions={renderActions}
            actionsHeader="الإجراءات"
            actionsWidth={isTeacher ? "180px" : undefined}
            className="shadow-none"
            headerClassName="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white"
          />
        </div>
      </div>

      {/* Mobile Card View - Shown on mobile/tablet */}
      <div className="lg:hidden space-y-4 p-4">
        {loadingMarks ? (
          <div className="space-y-4">
            {/* Show 4 skeleton cards on mobile */}
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} hasImage={false} contentLines={3} />
            ))}
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 font-medium">لا توجد مقاطع في الشهر والسنة المحددة</p>
          </div>
        ) : (
          tableData.map((row, index) => (
            <div
              key={row._id || index}
              className="bg-white/85 backdrop-blur-sm rounded-xl p-5 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-400"
            >
              {/* Date */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                <Calendar size={16} className="text-gray-600" />
                <div className="flex-1">
                  {(() => {
                    const { formattedDate, dayName } = formatDateWithDay(row.date);
                    return (
                      <>
                        <span className="font-semibold text-gray-800">{formattedDate}</span>
                        <span className="text-xs text-gray-500 mr-2">{dayName}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Review Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw size={16} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-600">مقطع المراجعة</span>
                </div>
                <div className="text-emerald-700 font-semibold text-sm mb-3 bg-emerald-50 px-3 py-2 rounded-lg border-r-4 border-emerald-500">
                  {row.reviewSection}
                </div>
                <div className="flex justify-center">
                  {renderMarkCell(row.mark, "review")}
                </div>
              </div>

              {/* Memorization Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-teal-600" />
                  <span className="text-xs font-semibold text-gray-600">مقطع الحفظ</span>
                </div>
                <div className="text-teal-700 font-semibold text-sm mb-3 bg-teal-50 px-3 py-2 rounded-lg border-r-4 border-teal-500">
                  {row.memorizationSection}
                </div>
                <div className="flex justify-center">
                  {renderMarkCell(row.mark, "memorization")}
                </div>
              </div>

              {/* Actions */}
              {isTeacher && renderActions && (
                <div className="pt-3 border-t border-gray-200">
                  {renderActions(row)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </>
  );
};

export const SectionsTable = memo(SectionsTableComponent);
