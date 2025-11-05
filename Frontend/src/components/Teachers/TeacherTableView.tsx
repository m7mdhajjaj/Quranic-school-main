import React from "react";
import { Table, type Column } from "@/components/UI";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Teacher } from "@/Api/teacherApi";
import Avatar from "@/components/Avatar/Avatar";

interface TeacherTableViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
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

export const TeacherTableView: React.FC<TeacherTableViewProps> = ({
  teachers,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const columns: Column<Teacher>[] = [
    {
      key: "teacherId",
      header: "رقم المعلم",
      sortable: true,
      width: "120px",
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {teacher.teacherId}
          </span>
        </div>
      ),
    },
    {
      key: "avatar",
      header: "الصورة",
      width: "80px",
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          <Avatar user={teacher} size="sm" border="ring" />
        </div>
      ),
    },
    {
      key: "name",
      header: "الاسم الكامل",
      sortable: true,
      render: (teacher) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {teacher.firstName} {teacher.lastName}
          </div>
          {teacher.fatherName && (
            <div className="text-xs text-gray-500">{teacher.fatherName}</div>
          )}
        </div>
      ),
    },
    {
      key: "email",
      header: "البريد الإلكتروني",
      sortable: true,
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          <span className="text-sm text-gray-900">{teacher.email}</span>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "رقم الهاتف",
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          <span className="text-sm text-gray-900 font-mono" dir="ltr">
            {teacher.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      key: "idNumber",
      header: "رقم الهوية",
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          <span className="text-sm text-gray-900 font-mono">
            {teacher.idNumber || <span className="text-gray-400">-</span>}
          </span>
        </div>
      ),
    },
    {
      key: "gender",
      header: "الجنس",
      width: "100px",
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          {teacher.gender ? (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                teacher.gender === "ذكر"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-pink-100 text-pink-800"
              }`}>
              {teacher.gender}
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
      render: (teacher) => (
        <div className="flex justify-center">
          {teacher.age ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              {teacher.age}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "groups",
      header: "الحلقات المدرسة",
      align: "center",
      render: (teacher) => {
        const content = (() => {
          if (
            teacher.groups &&
            Array.isArray(teacher.groups) &&
            teacher.groups.length > 0
          ) {
            if (teacher.groups.length === 1) {
              return (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="font-semibold truncate max-w-[200px]">
                    {getGroupDisplayName(teacher.groups[0])}
                  </span>
                </div>
              );
            } else {
              return (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="font-semibold">
                    {teacher.groups.length} حلقة
                  </span>
                </div>
              );
            }
          }
          return (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 rounded border border-red-200">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-red-600 text-xs font-medium">لا توجد</span>
            </div>
          );
        })();

        return <div className="flex justify-center">{content}</div>;
      },
    },
    {
      key: "residence",
      header: "مكان السكن",
      align: "center",
      render: (teacher) => (
        <div className="flex justify-center">
          <span className="text-sm text-gray-900">
            {teacher.residence || teacher.address || (
              <span className="text-gray-400">-</span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      width: "120px",
      align: "center",
      render: (teacher) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(teacher)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="تعديل">
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(teacher)}
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
        data={teachers}
        columns={columns}
        loading={isLoading}
        emptyMessage="لا يوجد معلمين"
      />
    </div>
  );
};
