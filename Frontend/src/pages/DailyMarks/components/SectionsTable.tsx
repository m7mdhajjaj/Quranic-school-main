import type { Section, Mark, SectionsTableProps } from "../types/dailyMarks";
import { Button } from "../../../components/shared/Form";
import { ProgressBar } from "../../../components/shared/Feedback";
import { Table } from "../../../components/shared/UI";
import type { Column } from "../../../components/shared/UI/Table";

// Extended section type with mark for table rendering
type SectionWithMark = Section & { mark?: Mark };

/**
 * Sections table component showing sections with marks and actions
 * Uses shared Table component with custom rendering
 */
export const SectionsTable = ({
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

  // Prepare data with marks attached
  const tableData: SectionWithMark[] = sections.map((section) => ({
    ...section,
    mark: findMark(section._id),
  }));

  // Define table columns with enhanced styling
  const columns: Column<SectionWithMark>[] = [
    {
      key: "date",
      header: "📅 التاريخ",
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
    {
      key: "memorizationSection",
      header: "📖 مقطع الحفظ",
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
      header: "⭐ علامة الحفظ",
      render: (row) => renderMarkCell(row.mark, "memorization"),
    },
    {
      key: "reviewSection",
      header: "🔄 مقطع المراجعة",
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
      header: "✨ علامة المراجعة",
      render: (row) => renderMarkCell(row.mark, "review"),
    },
  ];

  // Render action buttons for teachers with enhanced styling
  const renderActions = isTeacher
    ? (row: SectionWithMark) => (
        <div className="flex items-center gap-2 flex-wrap">
          {row.mark ? (
            <Button
              onClick={() => onUpdateMark && onUpdateMark(row.mark!, row)}
              variant="primary"
              size="xs"
              gradient={true}
              className="shadow-sm hover:shadow-md transition-all duration-200"
              title="تحديث العلامة">
              🔄 تحديث
            </Button>
          ) : (
            <Button
              onClick={() => onAddMark && onAddMark(row)}
              variant="success"
              size="xs"
              gradient={true}
              className="shadow-sm hover:shadow-md transition-all duration-200 animate-pulse"
              title="إضافة علامة">
              ➕ إضافة
            </Button>
          )}
          <Button
            onClick={() => onEditSection && onEditSection(row)}
            variant="warning"
            size="xs"
            gradient={true}
            className="shadow-sm hover:shadow-md transition-all duration-200"
            title="تعديل المقطع">
            ✏️ تعديل
          </Button>
          <Button
            onClick={() => onDeleteSection && onDeleteSection(row._id)}
            variant="danger"
            size="xs"
            gradient={true}
            className="shadow-sm hover:shadow-md transition-all duration-200"
            title="حذف المقطع">
            🗑️ حذف
          </Button>
        </div>
      )
    : undefined;

  return (
    <div className="overflow-hidden">
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
        actionsHeader="⚙️ الإجراءات"
        actionsWidth="220px"
        loadingRows={3}
        className="shadow-none border-none"
      />
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
    </div>
  );
};
