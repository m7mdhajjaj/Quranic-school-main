import React from "react";
import { Table, type Column } from "@/components/UI";
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

// دالة مساعدة للحصول على اسم الحلقة بشكل آمن
const getGroupDisplayName = (
  group:
    | string
    | { name?: string; id?: string; number?: number }
    | null
    | undefined
): string => {
  if (!group) return "حلقة غير محددة";
  if (typeof group === "string") return group;
  return group.name || "حلقة غير محددة";
};

// دالة مساعدة للحصول على اسم المعلم بشكل آمن
const getTeacherDisplayName = (
  teacher:
    | string
    | { firstName?: string; lastName?: string; name?: string }
    | null
    | undefined
): string => {
  if (!teacher) return "معلم غير محدد";
  if (typeof teacher === "string") return teacher;
  if (teacher.firstName || teacher.lastName) {
    return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
  }
  return teacher.name || "معلم غير محدد";
};

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
      width: "100px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            #{student.studentId}
          </span>
        </div>
      ),
    },
    {
      key: "name",
      header: "الاسم الكامل",
      sortable: true,
      align: "right",
      render: (student) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </div>
          {student.fatherName && (
            <div className="text-xs text-gray-500">{student.fatherName}</div>
          )}
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "رقم الهاتف",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          <span className="text-sm text-gray-900 font-mono" dir="ltr">
            {student.phoneNumber || <span className="text-gray-400">-</span>}
          </span>
        </div>
      ),
    },
    {
      key: "idNumber",
      header: "رقم الهوية",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          <span className="text-sm text-gray-900 font-mono">
            {student.idNumber || <span className="text-gray-400">-</span>}
          </span>
        </div>
      ),
    },
    {
      key: "gender",
      header: "الجنس",
      width: "80px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          {student.gender ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                student.gender === "ذكر"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-pink-50 text-pink-700 border border-pink-200"
              }`}>
              {student.gender}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "age",
      header: "العمر",
      sortable: true,
      width: "70px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          {student.age ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {student.age}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "group",
      header: "الحلقة",
      render: (student) => {
        if (student.group) {
          return (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
              <span className="truncate max-w-[150px]">
                {getGroupDisplayName(student.group)}
              </span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-gray-500 text-xs">-</span>
          </div>
        );
      },
    },
    {
      key: "teacher",
      header: "المعلم",
      render: (student) => {
        if (student.teacher) {
          return (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-medium border border-violet-200">
              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0"></div>
              <span className="truncate max-w-[150px]">
                {getTeacherDisplayName(student.teacher)}
              </span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-gray-500 text-xs">-</span>
          </div>
        );
      },
    },
    {
      key: "residence",
      header: "مكان السكن",
      render: (student) => (
        <span className="text-sm text-gray-900">
          {student.residence || <span className="text-gray-400">-</span>}
        </span>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      width: "120px",
      render: (student) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(student)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="تعديل">
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(student)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="حذف">
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" dir="rtl">
      <Table
        data={students}
        columns={columns}
        loading={isLoading}
        emptyMessage="لا يوجد طلاب"
      />
    </div>
  );
};
