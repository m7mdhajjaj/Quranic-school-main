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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
      {students.map((student) => (
        <div
          key={student._id}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:-translate-y-1">
          {/* Card Header with Gradient */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 text-center">
            {/* Student Avatar */}
            <div className="relative inline-block mb-4">
              <Avatar
                user={student}
                size="xl"
                border="ring"
                fallbackIcon={<FaUserGraduate className="w-8 h-8" />}
              />
              {/* Student ID Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                <span className="text-emerald-600 font-bold text-sm">
                  #{student.studentId}
                </span>
              </div>
            </div>

            {/* Gender & Age Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.gender === "ذكر"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-pink-100 text-pink-800"
                }`}>
                {student.gender}
              </span>
              {student.age && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                  {student.age} سنة
                </span>
              )}
            </div>

            {/* Active Status */}
            {student.isActive && (
              <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
            )}

            {/* Student Name */}
            <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
              {student.firstName} {student.lastName}
            </h3>
            {student.fatherName && (
              <p className="text-emerald-100 text-sm drop-shadow">
                {student.fatherName}
              </p>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {/* Contact Information */}
            {student.phoneNumber && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaPhone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">الهاتف</p>
                  <p
                    className="text-sm font-semibold text-green-700 truncate"
                    dir="ltr">
                    {student.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {student.email && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="text-sm font-semibold text-blue-700 truncate">
                    {student.email}
                  </p>
                </div>
              </div>
            )}

            {/* ID Number */}
            {student.idNumber && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUserGraduate className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">رقم الهوية</p>
                  <p className="text-sm font-semibold text-indigo-700 font-mono">
                    {student.idNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Residence */}
            {student.residence && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">السكن</p>
                  <p className="text-sm font-semibold text-purple-700">
                    {student.residence}
                  </p>
                </div>
              </div>
            )}

            {/* Group Information */}
            {student.group && (
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUsers className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">الحلقة</p>
                  <p className="text-sm font-semibold text-teal-700 truncate">
                    {getGroupDisplayName(student.group)}
                  </p>
                </div>
              </div>
            )}

            {/* Teacher Information */}
            {student.teacher && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaChalkboardTeacher className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">المعلم</p>
                  <p className="text-sm font-semibold text-orange-700 truncate">
                    {getTeacherDisplayName(student.teacher)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer - Actions */}
          <div className="px-6 pb-6">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(student)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                <FaEdit className="w-4 h-4" />
                <span className="font-medium">تعديل</span>
              </button>
              <button
                onClick={() => onDelete(student)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                <FaTrash className="w-4 h-4" />
                <span className="font-medium">حذف</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
