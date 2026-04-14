import { useMemo } from "react";
import { Table } from "@/components/UI";
import { Trash2, Plus, RefreshCw } from "lucide-react";
import type { Column } from "@/components/UI/Table";
import type { Student, Mark, Section } from "../../../types/types";
import { TableSkeleton } from "../../../components/DailyMarksSkeletons";

interface StudentsMarksTableProps {
  tableData: Array<{
    student: Student;
    mark: Mark | undefined;
  }>;
  section: Section;
  selectedMarkIds: string[];
  isDeleting: boolean;
  loading?: boolean;
  onAddMark?: (section: Section, student: Student) => void;
  onUpdateMark?: (mark: Mark, section: Section, student: Student) => void;
  onDeleteMark?: (markId: string) => void;
  onToggleMarkSelection: (markId: string) => void;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  areAllSelected: boolean;
}

/**
 * جدول علامات الطلاب مع خيارات الحذف الجماعي
 */
export const StudentsMarksTable = ({
  tableData,
  section,
  selectedMarkIds,
  isDeleting,
  loading = false,
  onAddMark,
  onUpdateMark,
  onDeleteMark,
  onToggleMarkSelection,
  onToggleSelectAll,
  onBulkDelete,
  onClearSelection,
  areAllSelected,
}: StudentsMarksTableProps) => {
  if (loading) {
    return <TableSkeleton rows={10} hasActions={true} />;
  }

  const columns: Column<(typeof tableData)[0]>[] = useMemo(
    () => [
      {
        key: "select",
        header: (
          <input
            type="checkbox"
            checked={areAllSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            aria-label="تحديد الكل"
            title="تحديد الكل"
          />
        ),
        align: "center",
        render: (row) =>
          row.mark?._id ? (
            <input
              type="checkbox"
              checked={selectedMarkIds.includes(row.mark._id)}
              onChange={() => onToggleMarkSelection(row.mark!._id)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              aria-label={`تحديد علامة الطالب ${row.student.firstName} ${row.student.lastName}`}
              title={`تحديد علامة الطالب ${row.student.firstName} ${row.student.lastName}`}
            />
          ) : null,
      },
      {
        key: "number",
        header: "رقم",
        align: "center",
        render: (_row, index) => (
          <div className="text-center font-semibold text-gray-700">
            {index + 1}
          </div>
        ),
      },
      {
        key: "name",
        header: "اسم الطالب",
        render: (row) => (
          <div className="font-semibold text-gray-800">
            {row.student.firstName} {row.student.fatherName}{" "}
            {row.student.lastName}
          </div>
        ),
      },
      {
        key: "reviewMark",
        header: "علامة المراجعة",
        align: "center",
        render: (row) => {
          const mark = row.mark?.reviewMark;
          if (mark === null || mark === undefined) {
            return <div className="text-gray-400">-</div>;
          }
          let bgColor, textColor, borderColor;
          if (mark >= 9) {
            bgColor = "bg-emerald-100";
            textColor = "text-emerald-800";
            borderColor = "border-emerald-300";
          } else if (mark >= 8) {
            bgColor = "bg-green-100";
            textColor = "text-green-800";
            borderColor = "border-green-300";
          } else if (mark >= 7) {
            bgColor = "bg-lime-100";
            textColor = "text-lime-800";
            borderColor = "border-lime-300";
          } else {
            bgColor = "bg-red-100";
            textColor = "text-red-800";
            borderColor = "border-red-300";
          }
          return (
            <div
              className={`text-center font-semibold text-sm px-3 py-1.5 rounded-md border ${bgColor} ${textColor} ${borderColor}`}>
              {mark}/10
            </div>
          );
        },
      },
      {
        key: "memorizationMark",
        header: "علامة الحفظ",
        align: "center",
        render: (row) => {
          const mark = row.mark?.memorizationMark;
          if (mark === null || mark === undefined) {
            return <div className="text-gray-400">-</div>;
          }
          let bgColor, textColor, borderColor;
          if (mark >= 9) {
            bgColor = "bg-blue-100";
            textColor = "text-blue-800";
            borderColor = "border-blue-300";
          } else if (mark >= 8) {
            bgColor = "bg-cyan-100";
            textColor = "text-cyan-800";
            borderColor = "border-cyan-300";
          } else if (mark >= 7) {
            bgColor = "bg-sky-100";
            textColor = "text-sky-800";
            borderColor = "border-sky-300";
          } else {
            bgColor = "bg-red-100";
            textColor = "text-red-800";
            borderColor = "border-red-300";
          }
          return (
            <div
              className={`text-center font-semibold text-sm px-3 py-1.5 rounded-md border ${bgColor} ${textColor} ${borderColor}`}>
              {mark}/10
            </div>
          );
        },
      },
      {
        key: "seenAt",
        header: "شاهدها الأهل",
        align: "center",
        render: (row) => {
          if (!row.mark) return <div className="text-gray-400">-</div>;
          if (row.mark.seenAt) {
            const seenDate = new Date(row.mark.seenAt);
            return (
              <div className="text-emerald-700 font-semibold text-sm">
                تمت
                <div className="text-[11px] text-gray-500 font-medium mt-1">
                  {isNaN(seenDate.getTime())
                    ? ""
                    : seenDate.toLocaleString("ar-SA")}
                </div>
              </div>
            );
          }

          return (
            <div className="text-amber-700 font-semibold text-sm">
              لم تُشاهد
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "الإجراءات",
        align: "center",
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            {row.mark ? (
              <>
                {onUpdateMark && (
                  <button
                    onClick={() =>
                      onUpdateMark(row.mark!, section, row.student)
                    }
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="تعديل العلامة"
                    type="button">
                    <RefreshCw size={16} />
                  </button>
                )}
                {onDeleteMark && row.mark._id && (
                  <button
                    onClick={() => onDeleteMark(row.mark!._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف العلامة"
                    type="button">
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            ) : (
              onAddMark && (
                <button
                  onClick={() => onAddMark(section, row.student)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="إضافة علامة"
                  type="button">
                  <Plus size={16} />
                </button>
              )
            )}
          </div>
        ),
      },
    ],
    [
      areAllSelected,
      onToggleSelectAll,
      selectedMarkIds,
      onToggleMarkSelection,
      onUpdateMark,
      onDeleteMark,
      onAddMark,
      section,
    ],
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Bulk Delete Button */}
      {selectedMarkIds.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
              {selectedMarkIds.length} محدد
            </div>
            <span className="text-sm text-emerald-700">علامة محددة للحذف</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearSelection}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              type="button">
              إلغاء التحديد
            </button>
            <button
              onClick={onBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              type="button">
              <Trash2 size={16} />
              {isDeleting ? "جاري الحذف..." : "حذف المحدد"}
            </button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={tableData}
        loading={loading}
        emptyMessage="لا يوجد طلاب في هذه الحلقة"
        hoverable={true}
        bordered={false}
        showHeader={true}
        headerClassName="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg"
        className="rounded-2xl overflow-hidden"
      />
    </div>
  );
};
