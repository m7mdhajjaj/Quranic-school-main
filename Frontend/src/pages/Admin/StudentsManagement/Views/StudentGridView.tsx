import React from "react";
import {
  FaEdit,
  FaTrash,
  FaUserGraduate,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa";
import type { Student } from "@/Api/studentApi";
import Avatar from "@/components/Avatar/Avatar";

interface StudentGridViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
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

export const StudentGridView: React.FC<StudentGridViewProps> = ({
  students,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {students.map((student) => (
        <div
          key={student._id}
          className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 hover:border-blue-300">
          {/* Card Header - Simplified */}
          <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 p-4 border-b border-gray-100">
            {/* Student Avatar */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                user={student}
                size="md"
                border="ring"
                fallbackIcon={<FaUserGraduate className="w-5 h-5" />}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 text-sm font-bold truncate">
                  {student.firstName} {student.lastName}
                </h3>
                {student.fatherName && (
                  <p className="text-gray-500 text-xs truncate">
                    {student.fatherName}
                  </p>
                )}
              </div>
            </div>

            {/* Student ID & Status */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                #{student.studentId}
              </span>
              <div className="flex items-center gap-1.5">
                {student.isActive && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    student.gender === "ذكر"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-pink-50 text-pink-700"
                  }`}>
                  {student.gender}
                </span>
                {student.age && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {student.age}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3 space-y-2">
            {/* Contact Information - Compact */}
            <div className="space-y-1.5">
              {student.phoneNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <FaPhone className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600" dir="ltr">{student.phoneNumber}</span>
                </div>
              )}

              {student.email && (
                <div className="flex items-center gap-2 text-xs">
                  <FaEnvelope className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 truncate">{student.email}</span>
                </div>
              )}

              {student.idNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <FaUserGraduate className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 font-mono">{student.idNumber}</span>
                </div>
              )}

              {student.residence && (
                <div className="flex items-center gap-2 text-xs">
                  <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">{student.residence}</span>
                </div>
              )}
            </div>

            {/* Group & Teacher - Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
              {student.group && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                  <FaUsers className="w-3 h-3" />
                  {getGroupDisplayName(student.group)}
                </span>
              )}

              {student.teacher && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-medium">
                  <FaChalkboardTeacher className="w-3 h-3" />
                  {getTeacherDisplayName(student.teacher)}
                </span>
              )}
            </div>
          </div>

          {/* Card Footer - Actions */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(student)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
                <FaEdit className="w-3 h-3" />
                تعديل
              </button>
              <button
                onClick={() => onDelete(student)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium">
                <FaTrash className="w-3 h-3" />
                حذف
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
