import type { Section, Mark, SectionsTableProps } from "../types/dailyMarks";
import { Button, Tooltip } from "@/components/UI";
import { ProgressBar } from "@/components/UI";
import { Table } from "@/components/UI";
import type { Column } from "@/components/UI/Table";
import { useMemo, memo } from "react";
import { RefreshCw, Plus, Edit, Trash2, RotateCcw, BookOpen, Calendar } from "lucide-react";

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
  onAddMark,
  onUpdateMark,
  onEditSection,
  onDeleteSection,
}: SectionsTableProps) => {
  // Find mark for a section
  const findMark = (sectionId: string) => {
    return marks.find((m) => {
      // Check if mark and sectionId exist
      if (!m || !m.sectionId) {
        return false;
      }
      
      if (typeof m.sectionId === "string") {
        return m.sectionId === sectionId;
      } else {
        return m.sectionId._id === sectionId;
      }
    });
  };

  // Render mark cell with enhanced progress bar and badge
  const renderMarkCell = (mark: Mark | undefined, type: "review" | "memorization") => {
    const markValue = type === "review" ? mark?.reviewMark : mark?.memorizationMark;
    
    if (!markValue && markValue !== 0) {
      return (
        <div className="flex items-center justify-center">
          <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium">
            لم يتم الرصد
          </span>
        </div>
      );
    }

    const color = markValue >= 9 ? "emerald" : markValue >= 7 ? "amber" : "red";
    const bgColor = markValue >= 9 ? "bg-emerald-50" : markValue >= 7 ? "bg-amber-50" : "bg-red-50";
    const textColor = markValue >= 9 ? "text-emerald-700" : markValue >= 7 ? "text-amber-700" : "text-red-700";
    const borderColor = markValue >= 9 ? "border-emerald-200" : markValue >= 7 ? "border-amber-200" : "border-red-200";

    return (
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1.5 ${bgColor} border ${borderColor} rounded-lg`}>
          <span className={`font-bold ${textColor} text-sm`}>
            {markValue}/10
          </span>
        </div>
        <div className="flex-1 min-w-[60px] max-w-[100px]">
          <ProgressBar
            value={markValue}
            max={10}
            color={color}
            size="sm"
            showPercentage={false}
          />
        </div>
      </div>
    );
  };

  // Prepare data with marks attached (memoized for performance)
  const tableData: SectionWithMark[] = useMemo(() => 
    sections.map((section) => ({
      ...section,
      mark: findMark(section._id),
    })),
    [sections, marks]
  );

  // Define table columns with enhanced styling
  const columns: Column<SectionWithMark>[] = [
    {
      key: "reviewSection",
      header: (
        <div className="flex items-center gap-2">
          <RotateCcw size={16} className="text-emerald-600" />
          <span>مقطع المراجعة</span>
        </div>
      ),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium text-sm">
            {row.reviewSection}
          </div>
        </div>
      ),
    },
    {
      key: "reviewMark",
      header: (
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-emerald-600" />
          <span>علامة المراجعة</span>
        </div>
      ),
      render: (row) => renderMarkCell(row.mark, "review"),
    },
    {
      key: "memorizationSection",
      header: (
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-amber-600" />
          <span>مقطع الحفظ</span>
        </div>
      ),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-medium text-sm">
            {row.memorizationSection}
          </div>
        </div>
      ),
    },
    {
      key: "memorizationMark",
      header: (
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-amber-600" />
          <span>علامة الحفظ</span>
        </div>
      ),
      render: (row) => renderMarkCell(row.mark, "memorization"),
    },
    {
      key: "date",
      header: (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-600" />
          <span>التاريخ</span>
        </div>
      ),
      render: (row) => {
        const date = new Date(row.date);
        const formattedDate = date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const dayName = date.toLocaleDateString("ar-SA", { weekday: "long" });
        
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{formattedDate}</span>
            <span className="text-xs text-gray-500 mt-0.5">{dayName}</span>
          </div>
        );
      },
    },
  ];

  // Render action buttons for teachers with enhanced styling
  const renderActions = isTeacher
    ? (row: SectionWithMark) => (
        <div className="flex items-center justify-center gap-2">
          {row.mark ? (
            <Tooltip content="تحديث العلامة" position="top">
              <button
                onClick={() => onUpdateMark && onUpdateMark(row.mark!, row)}
                className="group relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center transform hover:scale-105 active:scale-95 will-change-transform"
                title="تحديث العلامة"
                type="button">
                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="إضافة علامة" position="top">
              <button
                onClick={() => onAddMark && onAddMark(row)}
                className="group relative w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center transform hover:scale-105 active:scale-95 animate-pulse hover:animate-none will-change-transform"
                title="إضافة علامة"
                type="button">
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-150" />
              </button>
            </Tooltip>
          )}
          <Tooltip content="تعديل المقطع" position="top">
            <button
              onClick={() => onEditSection && onEditSection(row)}
              className="group relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center transform hover:scale-105 active:scale-95 will-change-transform"
              title="تعديل المقطع"
              type="button">
              <Edit size={16} className="group-hover:scale-110 transition-transform duration-150" />
            </button>
          </Tooltip>
          <Tooltip content="حذف المقطع" position="top">
            <button
              onClick={() => onDeleteSection && onDeleteSection(row._id)}
              className="group relative w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center transform hover:scale-105 active:scale-95 will-change-transform"
              title="حذف المقطع"
              type="button">
              <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-150" />
            </button>
          </Tooltip>
        </div>
      )
    : undefined;

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-hidden -m-6 -p-6">
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
          stickyHeader={false}
          renderActions={renderActions}
          actionsHeader="الإجراءات"
          actionsWidth="160px"
          loadingRows={3}
          className="shadow-none border-none m-0 p-0"
        />
      </div>

      {/* Mobile Card View - Shown on mobile/tablet */}
      <div className="lg:hidden space-y-4 p-4">
        {loadingMarks ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border-2 border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : tableData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 font-medium">لا توجد مقاطع في الشهر والسنة المحددة</p>
          </div>
        ) : (
          tableData.map((row, index) => (
            <div
              key={row._id || index}
              className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {/* Date */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                <Calendar size={16} className="text-gray-600" />
                <div className="flex-1">
                  <span className="font-semibold text-gray-800">
                    {new Date(row.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-gray-500 mr-2">
                    {new Date(row.date).toLocaleDateString("ar-SA", { weekday: "long" })}
                  </span>
                </div>
              </div>

              {/* Review Section */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw size={14} className="text-emerald-600" />
                  <span className="text-xs text-gray-500">مقطع المراجعة</span>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg font-medium text-sm mb-2">
                  {row.reviewSection}
                </div>
                {renderMarkCell(row.mark, "review")}
              </div>

              {/* Memorization Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-amber-600" />
                  <span className="text-xs text-gray-500">مقطع الحفظ</span>
                </div>
                <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg font-medium text-sm mb-2">
                  {row.memorizationSection}
                </div>
                {renderMarkCell(row.mark, "memorization")}
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

      <style>{`
        /* Enhanced table row hover effect */
        .table-row-hover {
          transition: all 0.2s ease-in-out;
        }
        .table-row-hover:hover {
          background: linear-gradient(to right, #f0fdf4, #ecfdf5);
          transform: scale(1.005);
        }
      `}</style>
    </>
  );
};

export const SectionsTable = memo(SectionsTableComponent);
