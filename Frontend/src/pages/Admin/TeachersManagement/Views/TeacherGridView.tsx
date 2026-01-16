import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import { Edit, Trash2, Shield, Calendar, MapPin } from "lucide-react";
import type { Teacher } from "@/Api/teacherApi";
import Avatar from "@/components/Avatar/Avatar";
import { getGroupDisplayName } from '../utils/teacherHelpers';

interface TeacherGridViewProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  isReadOnly?: boolean;
  userRole?: string;
}

export const TeacherGridView: React.FC<TeacherGridViewProps> = ({
  teachers,
  onEdit,
  onDelete,
  isReadOnly = false,
  userRole,
}) => {
  // إخفاء teacherId للسكرتير
  const showTeacherId = userRole !== 'secretary';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" dir="rtl">
      {teachers.map((teacher) => (
        <div
          key={teacher._id}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
            {!isReadOnly && (
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <button
                  onClick={() => onEdit(teacher)}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onDelete(teacher)}
                  className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3">
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
                size="lg"
                border="ring"
                autoFetch={true}
                userRole="teacher"
                showStatus={false}
                user={teacher}
              />
              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                {showTeacherId && (
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <FaUserTie className="w-3 h-3" />
                    معلم #{teacher.teacherId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {teacher.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaEnvelope className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">البريد:</span>
                <span className="truncate font-medium">{teacher.email}</span>
              </div>
            )}
            
            {teacher.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaPhone className="w-4 h-4 text-gray-400" />
                <span dir="ltr">{teacher.phoneNumber}</span>
              </div>
            )}

            {teacher.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{teacher.age} سنة</span>
              </div>
            )}

            {teacher.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                <span className="truncate">{teacher.residence}</span>
              </div>
            )}

            {/* Groups */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">الحلقات:</p>
              <div className="flex flex-wrap gap-1">
                {teacher.groups && Array.isArray(teacher.groups) && teacher.groups.length > 0 ? (
                  <>
                    {teacher.groups.slice(0, 3).map((group, index) => (
                      <span key={index} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        {getGroupDisplayName(group)}
                      </span>
                    ))}
                    {teacher.groups.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{teacher.groups.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400">لا توجد حلقات</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
