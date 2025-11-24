import type { Section, Mark, SectionsTableProps } from "../types/dailyMarks";
import { Button, Tooltip } from "@/components/UI";
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
      <div className="text-center font-bold text-gray-800 text-base">
        {markValue}/10
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
      header: "مقطع المراجعة",
      width: "200px",
      render: (row) => (
        <div className="text-emerald-700 font-medium text-sm">
          {row.reviewSection}
        </div>
      ),
    },
    {
      key: "reviewMark",
      header: "علامة المراجعة",
      width: "120px",
      align: "center",
      render: (row) => renderMarkCell(row.mark, "review"),
    },
    {
      key: "memorizationSection",
      header: "مقطع الحفظ",
      width: "200px",
      render: (row) => (
        <div className="text-amber-700 font-medium text-sm">
          {row.memorizationSection}
        </div>
      ),
    },
    {
      key: "memorizationMark",
      header: "علامة الحفظ",
      width: "120px",
      align: "center",
      render: (row) => renderMarkCell(row.mark, "memorization"),
    },
    {
      key: "date",
      header: "التاريخ",
      width: "150px",
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
      <div className="hidden lg:block">
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
          className="shadow-none border-none"
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
                <div className="text-emerald-700 font-medium text-sm mb-2">
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
                <div className="text-amber-700 font-medium text-sm mb-2">
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
