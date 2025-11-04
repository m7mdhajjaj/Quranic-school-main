import React from "react";
import { Table, type Column } from "../UI";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Student } from "@/Api/studentApi";

interface StudentTableViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  isLoading?: boolean;
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export const StudentTableView: React.FC<StudentTableViewProps> = ({
  students,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const columns: Column<Student>[] = [
    {
      key: "studentId",
      header: "رقم الطالب",
      sortable: true,
      width: "120px",
      render: (student) => (
        <span className="font-medium text-gray-900">{student.studentId}</span>
      ),
    },
    {
      key: "name",
      header: "الاسم الكامل",
      sortable: true,
      render: (student) => (
        <span className="font-medium text-gray-900">
          {student.firstName} {student.fatherName} {student.lastName}
        </span>
      ),
    },
    {
      key: "idNumber",
      header: "رقم الهوية",
      width: "140px",
      render: (student) => (
        <span className="text-gray-600">{student.idNumber}</span>
      ),
    },
    {
      key: "age",
      header: "العمر",
      sortable: true,
      width: "80px",
      align: "center",
      render: (student) => (
        <span className="text-gray-600">{student.age || "-"}</span>
      ),
    },
    {
      key: "gender",
      header: "الجنس",
      width: "100px",
      align: "center",
      render: (student) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            student.gender === "ذكر"
              ? "bg-blue-100 text-blue-800"
              : "bg-pink-100 text-pink-800"
          }`}>
          {student.gender}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      header: "الهاتف",
      width: "140px",
      render: (student) => (
        <span className="text-gray-600 flex items-center gap-2">
          📞 {student.phoneNumber || "-"}
        </span>
      ),
    },
  ];

  const renderActions = (student: Student) => (
    <>
      <button
        onClick={() => onEdit(student)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        title="تعديل">
        <FaEdit />
      </button>
      <button
        onClick={() => onDelete(student)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        title="حذف">
        <FaTrash />
      </button>
    </>
  );

  return (
    <Table
      columns={columns}
      data={students}
      loading={isLoading}
      renderActions={renderActions}
      actionsWidth="120px"
      actionsHeader="الإجراءات"
      hoverable
      responsive
      emptyMessage="لا يوجد طلاب"
      emptyDescription="لم يتم إضافة أي طلاب في هذه الحلقة بعد"
      emptyIcon="👥"
    />
  );
};
