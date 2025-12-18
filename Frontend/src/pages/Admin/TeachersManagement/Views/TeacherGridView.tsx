import React from "react";
import {
  FaEdit,
  FaTrash,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import { User, UserCheck, Cake } from "lucide-react";
import type { Teacher } from "@/Api/teacherApi";
import Avatar from "@/components/Avatar/Avatar";
import { getGroupDisplayName } from '../utils/teacherHelpers';

import { OnlineStatus } from "@/components/Avatar/OnlineStatus";

interface TeacherGridViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export const TeacherGridView: React.FC<TeacherGridViewProps> = ({
  teachers,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {teachers.map((teacher) => (
        <div
          key={teacher._id}
          className="group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-gray-200 hover:border-blue-300">
          {/* Card Header - Simplified */}
          <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 p-4 border-b border-gray-100">
            {/* Teacher Avatar */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                userId={teacher._id}
                userName={`${teacher.firstName} ${teacher.lastName}`}
                gender={
                  teacher.gender === "male" ||
                  teacher.gender === "female" ||
                  teacher.gender === "ذكر" ||
                  teacher.gender === "أنثى"
                    ? teacher.gender
                    : undefined
                }
                size="md"
                border="ring"
                autoFetch={true}
                userRole="teacher"
                showStatus={true}
                user={teacher}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 text-sm font-bold truncate">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                {teacher.fatherName && (
                  <p className="text-gray-500 text-xs truncate">
                    {teacher.fatherName}
                  </p>
                )}
              </div>
            </div>

            {/* Teacher ID & Status */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                #{teacher.teacherId}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    teacher.gender === "ذكر"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-pink-50 text-pink-700 border border-pink-200"
                  }`}>
                  {teacher.gender === "ذكر" ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <UserCheck className="w-3 h-3" />
                  )}
                  {teacher.gender}
                </span>
                {teacher.age && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
                    <Cake className="w-3 h-3" />
                    {teacher.age}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3 space-y-2">
            {/* Contact Information - Compact */}
            <div className="space-y-1.5">
              {teacher.phoneNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <FaPhone className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600" dir="ltr">{teacher.phoneNumber}</span>
                </div>
              )}

              {teacher.email && (
                <div className="flex items-center gap-2 text-xs">
                  <FaEnvelope className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 truncate">{teacher.email}</span>
                </div>
              )}

              {teacher.idNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <FaUserTie className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 font-mono">{teacher.idNumber}</span>
                </div>
              )}

              {teacher.residence && (
                <div className="flex items-center gap-2 text-xs">
                  <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">{teacher.residence}</span>
                </div>
              )}
            </div>

            {/* Groups - Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
              {teacher.groups && Array.isArray(teacher.groups) && teacher.groups.length > 0 ? (
                teacher.groups.slice(0, 2).map((group, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                    <FaUsers className="w-3 h-3" />
                    {getGroupDisplayName(group)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">لا توجد حلقات</span>
              )}
              {teacher.groups && teacher.groups.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                  +{teacher.groups.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Card Footer - Actions */}
          <div className="p-3 bg-gradient-to-br from-gray-50 to-emerald-50/30 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(teacher)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                <FaEdit className="w-3 h-3" />
                تعديل
              </button>
              <button
                onClick={() => onDelete(teacher)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
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
