import React from "react";
import {
  FaEdit,
  FaTrash,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import type { Teacher } from "@/Api/teacherApi";
import Avatar from "@/components/Avatar/Avatar";

interface TeacherGridViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
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

export const TeacherGridView: React.FC<TeacherGridViewProps> = ({
  teachers,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
      {teachers.map((teacher) => (
        <div
          key={teacher._id}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
          {/* Card Header with Gradient */}
          <div className="relative bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 p-6 text-center">
            {/* Teacher Avatar */}
            <div className="relative inline-block mb-4">
              <Avatar
                user={teacher}
                size="xl"
                border="ring"
                fallbackIcon={<FaUserTie className="w-8 h-8" />}
              />
              {/* Teacher ID Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                <span className="text-purple-600 font-bold text-sm">
                  #{teacher.teacherId}
                </span>
              </div>
            </div>

            {/* Gender & Age Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  teacher.gender === "ذكر"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-pink-100 text-pink-800"
                }`}>
                {teacher.gender}
              </span>
              {teacher.age && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                  {teacher.age} سنة
                </span>
              )}
            </div>

            {/* Active Status */}
            {teacher.isActive && (
              <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
            )}

            {/* Teacher Name */}
            <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
              {teacher.firstName} {teacher.lastName}
            </h3>
            {teacher.specialCircle && (
              <p className="text-purple-100 text-sm drop-shadow">
                {teacher.specialCircle}
              </p>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {/* Contact Information */}
            {teacher.phoneNumber && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaPhone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">الهاتف</p>
                  <p
                    className="text-sm font-semibold text-green-700 truncate"
                    dir="ltr">
                    {teacher.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {teacher.email && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="text-sm font-semibold text-blue-700 truncate">
                    {teacher.email}
                  </p>
                </div>
              </div>
            )}

            {/* Residence/Address */}
            {(teacher.residence || teacher.address) && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">السكن</p>
                  <p className="text-sm font-semibold text-purple-700">
                    {teacher.residence || teacher.address}
                  </p>
                </div>
              </div>
            )}

            {/* Groups Information */}
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">الحلقات</p>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                  {teacher.groups && Array.isArray(teacher.groups)
                    ? teacher.groups.length
                    : 0}{" "}
                  حلقة
                </span>
              </div>
              {teacher.groups &&
              Array.isArray(teacher.groups) &&
              teacher.groups.length > 0 ? (
                <div className="space-y-1">
                  {teacher.groups.slice(0, 3).map((group, index) => {
                    const groupName = getGroupDisplayName(group);
                    return (
                      <div
                        key={index}
                        className="text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded truncate"
                        title={groupName}>
                        {groupName}
                      </div>
                    );
                  })}
                  {teacher.groups.length > 3 && (
                    <div className="text-xs text-orange-600 text-center">
                      +{teacher.groups.length - 3} حلقة أخرى
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  لا توجد حلقات
                </p>
              )}
            </div>
          </div>

          {/* Card Footer - Actions */}
          <div className="px-6 pb-6">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(teacher)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                <FaEdit className="w-4 h-4" />
                <span className="font-medium">تعديل</span>
              </button>
              <button
                onClick={() => onDelete(teacher)}
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
