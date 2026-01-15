import React, { memo } from "react";
import { Edit, Trash2, Mail, Phone, Calendar, MapPin, Shield, CreditCard } from "lucide-react";
import Avatar from "@/components/Avatar/Avatar";
import type { Secretary } from "../types";

interface SecretaryGridViewProps {
  secretaries: Secretary[];
  onEdit: (secretary: Secretary) => void;
  onDelete: (secretary: Secretary) => void;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

export const SecretaryGridView: React.FC<SecretaryGridViewProps> = memo(({
  secretaries,
  onEdit,
  onDelete,
  selectedIds = new Set(),
  onToggleSelection,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
      {secretaries.map((secretary) => (
        <div
          key={secretary._id}
          className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative ${selectedIds.has(secretary._id) ? 'ring-2 ring-emerald-500 shadow-md transform scale-[1.02]' : ''}`}
        >
          {/* Checkbox Selection Overlay */}
          <div className="absolute top-2 right-2 z-20">
             <div 
               className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors bg-white ${selectedIds.has(secretary._id) ? 'border-emerald-500 bg-emerald-50' : 'border-white/40 hover:border-white'}`}
               onClick={() => onToggleSelection?.(secretary._id)}
             >
               {selectedIds.has(secretary._id) && (
                 <div className="w-3 h-3 bg-emerald-500 rounded-full" />
               )}
             </div>
          </div>

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 relative">
            
            <div className="absolute top-2 left-2 flex gap-1 z-10">
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
                  lastSeen: secretary.lastSeen,
                }}
                userName={[secretary.firstName, secretary.fatherName, secretary.grandFatherName, secretary.lastName].filter(Boolean).join(" ")}
                gender={secretary.gender as "male" | "female" | "ذكر" | "أنثى"}
                size="lg"
                border="ring"
                showStatus={true}
              />
              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {[secretary.firstName, secretary.fatherName, secretary.grandFatherName, secretary.lastName].filter(Boolean).join(" ")}
                </h3>
                
                {/* Status Indicator in Header */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    secretary.lastSeen && new Date(secretary.lastSeen).getTime() > Date.now() - 5 * 60 * 1000
                    ? 'bg-green-500/20 text-white border-green-400/30'
                    : 'bg-white/10 text-white/70 border-white/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                      secretary.lastSeen && new Date(secretary.lastSeen).getTime() > Date.now() - 5 * 60 * 1000
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                      : 'bg-gray-400'
                    }`}></span>
                    {secretary.lastSeen && new Date(secretary.lastSeen).getTime() > Date.now() - 5 * 60 * 1000 ? 'متصل الآن' : 'غير متصل'}
                  </span>
                  
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    #{secretary.secretaryId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Gender Row */}
            <div className="flex items-center justify-start text-sm pb-2 border-b border-gray-50">
              <span className="text-gray-400 text-xs ml-2">الجنس:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                secretary.gender === 'male' || secretary.gender === 'ذكر'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-pink-50 text-pink-700'
              }`}>
                {secretary.gender === "male" ? "ذكر" : secretary.gender === "female" ? "أنثى" : secretary.gender}
              </span>
            </div>

            {/* Age Row */}
            {secretary.age && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">العمر:</span>
                <span className="font-medium">{secretary.age} سنة</span>
              </div>
            )}

            {/* Mother Name */}
            {secretary.motherName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 text-xs">اسم الأم:</span>
                <span className="font-medium">{secretary.motherName}</span>
              </div>
            )}

            {/* رقم الهوية */}
            {secretary.idNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهوية:</span>
                <span dir="ltr" className="font-medium">{secretary.idNumber}</span>
              </div>
            )}

            {/* Phone */}
            {secretary.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">رقم الهاتف:</span>
                <span dir="ltr" className="font-medium">{secretary.phoneNumber}</span>
              </div>
            )}

            {/* Email */}
            {secretary.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">البريد:</span>
                <span className="truncate font-medium">{secretary.email}</span>
              </div>
            )}

            {/* Residence */}
            {secretary.residence && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-500/70" />
                <span className="text-gray-400 text-xs text-nowrap">السكن:</span>
                <span className="truncate font-medium">{secretary.residence}</span>
              </div>
            )}

            {/* Permissions */}
            {secretary.permissions && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">الصلاحيات:</p>
                <div className="flex flex-wrap gap-1">
                  {secretary.permissions.canManageStudents && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 rounded-md">
                      الطلاب
                    </span>
                  )}
                  {secretary.permissions.canManageAttendance && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 rounded-md">
                      الحضور
                    </span>
                  )}
                  {secretary.permissions.canManageNews && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 rounded-md">
                      الأخبار
                    </span>
                  )}
                  {secretary.permissions.canViewReports && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 rounded-md">
                      التقارير
                    </span>
                  )}
                  {secretary.permissions.canManageTimetable && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 rounded-md">
                      الجداول
                    </span>
                  )}
                  {secretary.permissions.canManageMessages && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 rounded-md">
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
