import React, { memo } from "react";
import { Edit, Trash2, Mail, Phone, Calendar, MapPin, Shield, CreditCard } from "lucide-react";
import Avatar from "@/components/Avatar/Avatar";
import type { Secretary } from "../types";

interface SecretaryGridViewProps {
  secretaries: Secretary[];
  onEdit: (secretary: Secretary) => void;
  onDelete: (secretary: Secretary) => void;
}

export const SecretaryGridView: React.FC<SecretaryGridViewProps> = memo(({
  secretaries,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {secretaries.map((secretary) => (
        <div
          key={secretary._id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
            <div className="absolute top-2 left-2 flex gap-1">
              <button
                onClick={() => onEdit(secretary)}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                title="تعديل"
              >
                <Edit className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => onDelete(secretary)}
                className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Avatar
                user={{
                  _id: secretary._id,
                  firstName: secretary.firstName,
                  lastName: secretary.lastName,
                  gender: secretary.gender,
                  role: "secretary",
                  avatar: secretary.avatar,
                }}
                userName={`${secretary.firstName} ${secretary.lastName}`}
                gender={secretary.gender as "male" | "female" | "ذكر" | "أنثى"}
                size="lg"
                border="ring"
                showStatus={false}
              />
              <div className="text-white">
                <h3 className="font-bold text-lg">
                  {secretary.firstName} {secretary.lastName}
                </h3>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  سكرتير #{secretary.secretaryId}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* رقم الهوية */}
            {secretary.idNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span dir="ltr" className="font-medium">{secretary.idNumber}</span>
              </div>
            )}

            {secretary.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{secretary.email}</span>
              </div>
            )}
            
            {secretary.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span dir="ltr">{secretary.phoneNumber}</span>
              </div>
            )}

            {secretary.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{secretary.age} سنة</span>
              </div>
            )}

            {secretary.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{secretary.residence}</span>
              </div>
            )}

            {/* Permissions */}
            {secretary.permissions && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">الصلاحيات:</p>
                <div className="flex flex-wrap gap-1">
                  {secretary.permissions.canManageStudents && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      الطلاب
                    </span>
                  )}
                  {secretary.permissions.canManageAttendance && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      الحضور
                    </span>
                  )}
                  {secretary.permissions.canManageNews && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      الأخبار
                    </span>
                  )}
                  {secretary.permissions.canViewReports && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      التقارير
                    </span>
                  )}
                  {secretary.permissions.canManageTimetable && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      الجداول
                    </span>
                  )}
                  {secretary.permissions.canManageMessages && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      الرسائل
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

SecretaryGridView.displayName = "SecretaryGridView";
