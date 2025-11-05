import React from "react";
import { Table, type Column } from "@/components/UI";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Student } from "@/Api/studentApi";
import Avatar from "@/components/Avatar/Avatar";

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
      width: "120px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {student.studentId}
          </span>
        </div>
      ),
    },
    {
      key: "avatar",
      header: "الصورة",
      width: "80px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          <Avatar user={student} size="sm" border="ring" />
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
      width: "100px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          {student.gender ? (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                student.gender === "ذكر"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-pink-100 text-pink-800"
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
      width: "80px",
      align: "center",
      render: (student) => (
        <div className="flex justify-center">
          {student.age ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
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
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="font-semibold truncate max-w-[200px]">
                {getGroupDisplayName(student.group)}
              </span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 rounded border border-red-200">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
            <span className="text-red-600 text-xs font-medium">لا توجد</span>
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
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
              <span className="font-semibold truncate max-w-[200px]">
                {getTeacherDisplayName(student.teacher)}
              </span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded border border-gray-200">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
            <span className="text-gray-600 text-xs font-medium">غير محدد</span>
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
      <Table
        data={students}
        columns={columns}
        loading={isLoading}
        emptyMessage="لا يوجد طلاب"
      />
    </div>
  );
};
