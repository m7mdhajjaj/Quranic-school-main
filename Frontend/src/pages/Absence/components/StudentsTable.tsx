// components/StudentsTable.tsx
import { useState } from "react";
import { Table, type Column } from "../../../components/UI/Table";
import { Button } from "../../../components/UI/Button";
import { Badge } from "../../../components/UI/Badge";
import { Modal } from "../../../components/UI/Modal";
import { Eye, Check, X } from "lucide-react";
import type {
  AttendanceStudent,
  MonthlyAttendanceStats,
} from "../types/absence.types";

interface StudentsTableProps {
  students: AttendanceStudent[];
  onTogglePresence: (studentId: string) => void;
  monthlyStats: Record<string, MonthlyAttendanceStats>;
  onViewHistory: (studentId: string) => void;
}

export const StudentsTable = ({
  students,
  onTogglePresence,
  monthlyStats,
  onViewHistory,
}: StudentsTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const columns: Column<AttendanceStudent>[] = [
    {
      key: "name",
      header: "اسم الطالب",
      width: "250px",
      render: (student) => (
        <div className="font-medium text-gray-900">{student.name}</div>
      ),
    },
    {
      key: "group",
      header: "الحلقة",
      width: "150px",
      align: "center",
      render: (student) => (
        <Badge variant="info" size="sm">
          {student.group || "غير محدد"}
        </Badge>
      ),
    },
    {
      key: "isPresent",
      header: "الحالة",
      width: "120px",
      align: "center",
      render: (student) =>
        student.isPresent ? (
          <Badge variant="success" size="md">
            <Check className="w-4 h-4 inline ml-1" />
            حاضر
          </Badge>
        ) : (
          <Badge variant="danger" size="md">
            <X className="w-4 h-4 inline ml-1" />
            غائب
          </Badge>
        ),
    },
    {
      key: "stats",
      header: "إحصائيات الشهر",
      width: "180px",
      align: "center",
      render: (student) => {
        const stats = monthlyStats[student._id];
        if (!stats) return <span className="text-gray-400 text-sm">-</span>;

        const rate =
          stats.totalDays > 0
            ? Math.round((stats.presentDays / stats.totalDays) * 100)
            : 0;

        return (
          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-600">
              {stats.presentDays} / {stats.totalDays}
            </div>
            <div
              className={`text-sm font-bold ${
                rate >= 90
                  ? "text-emerald-600"
                  : rate >= 70
                  ? "text-amber-600"
                  : "text-red-600"
              }`}>
              {rate}%
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table<AttendanceStudent>
        columns={columns}
        data={students}
        onRowClick={(student) => onTogglePresence(student._id)}
        hoverable
        striped
        responsive
        emptyMessage="لا يوجد طلاب"
        emptyDescription="لم يتم العثور على طلاب في هذه الحلقة"
        emptyIcon="👥"
        renderActions={(student) => (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onViewHistory(student._id);
                setSelectedStudent(student._id);
              }}
              leftIcon={<Eye className="w-4 h-4" />}>
              السجل
            </Button>
            <Button
              size="sm"
              variant={student.isPresent ? "danger" : "success"}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePresence(student._id);
              }}
              leftIcon={
                student.isPresent ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )
              }>
              {student.isPresent ? "تغيب" : "حضور"}
            </Button>
          </>
        )}
        actionsWidth="180px"
        actionsHeader="الإجراءات"
      />

      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="سجل الحضور"
          size="lg">
          <div className="text-center text-gray-600">
            سيتم عرض سجل الحضور التفصيلي هنا...
          </div>
        </Modal>
      )}
    </>
  );
};
