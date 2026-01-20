import React from "react";
import { Users, User, AlertCircle, GraduationCap, Loader2, Check } from "lucide-react";
import type { Teacher } from "@/Api/teacherApi";

interface GroupFormStep1Props {
  formData: {
    name: string;
    teacher: string;
    description: string;
    capacity: number | undefined;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleBlur: (fieldName: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
  isDuplicateError: (fieldName: string) => boolean;
  checkingDuplicate: Record<string, boolean>;
  teachers: Teacher[];
  loadingTeachers: boolean;
}

const GroupFormStep1: React.FC<GroupFormStep1Props> = ({
  formData,
  handleChange,
  handleBlur,
  getFieldError,
  isDuplicateError,
  checkingDuplicate,
  teachers,
  loadingTeachers,
}) => {
  // دالة لعرض حالة الحقل (loading, success, error)
  const getFieldStatus = (fieldName: string) => {
    if (checkingDuplicate[fieldName]) {
      return (
        <Loader2 className="animate-spin text-blue-500 w-5 h-5" />
      );
    }
    if (getFieldError(fieldName)) {
      return <AlertCircle className="text-red-500 w-5 h-5" />;
    }
    if (formData[fieldName as keyof typeof formData] && fieldName === 'name') {
      return <Check className="text-green-500 w-5 h-5" />;
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* معلومات الحلقة الأساسية */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
          <Users className="text-emerald-600" size={20} />
          معلومات الحلقة الأساسية
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* اسم الحلقة */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Users size={14} className="text-gray-500" />
              اسم الحلقة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="name"
                type="text"
                value={formData.name || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                placeholder="أدخل اسم الحلقة"
                className={`w-full px-3 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 text-right transition-colors ${
                  getFieldError("name")
                    ? isDuplicateError("name")
                      ? "border-orange-300 focus:ring-orange-500 bg-orange-50"
                      : "border-red-300 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                }`}
                style={{ minHeight: '42px' }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus("name")}
              </div>
            </div>
            {getFieldError("name") && (
              <div
                className={`flex items-center gap-1 text-xs min-h-[20px] ${
                  isDuplicateError("name") ? "text-orange-600" : "text-red-600"
                }`}>
                <AlertCircle size={12} />
                <span>{getFieldError("name")}</span>
              </div>
            )}
          </div>

          {/* اختيار المعلم */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap size={14} className="text-white" />
              </div>
              <span className="text-base">اختيار المعلم المسؤول</span>
              <span className="text-red-500 text-lg">*</span>
            </label>

            <div className="relative">
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                onBlur={() => handleBlur("teacher")}
                disabled={loadingTeachers}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 text-right appearance-none ${
                  getFieldError("teacher")
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
                }`}>
                <option value="">
                  {loadingTeachers ? "جاري التحميل..." : "اختر المعلم"}
                </option>
                {teachers.map((teacher: Teacher) => {
                  // بناء الاسم الثلاثي
                  const fullName = [
                    teacher.firstName,
                    teacher.fatherName,
                    teacher.lastName
                  ].filter(Boolean).join(' ');
                  
                  // قيمة الخيار: المعرف الفريد (ID) لضمان الدقة
                  const optionValue = teacher._id;
                  
                  // نص العرض: الاسم الثلاثي + رقم التسجيل
                  const displayText = teacher.teacherId 
                    ? `${fullName || `${teacher.firstName} ${teacher.lastName}`} - ${teacher.teacherId}`
                    : fullName || `${teacher.firstName} ${teacher.lastName}`;
                  
                  return (
                    <option
                      key={teacher._id}
                      value={optionValue}>
                      {displayText}
                    </option>
                  );
                })}
              </select>

              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <User
                  size={18}
                  className={`${
                    formData.teacher ? "text-emerald-500" : "text-gray-400"
                  } transition-colors duration-200`}
                />
              </div>
            </div>

            {getFieldError("teacher") && (
              <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                <AlertCircle size={12} />
                <span>{getFieldError("teacher")}</span>
              </div>
            )}
          </div>

          {/* الوصف */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Users size={14} className="text-gray-500" />
              وصف الحلقة (اختياري)
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              onBlur={() => handleBlur("description")}
              placeholder="أدخل وصف للحلقة (اختياري)"
              rows={3}
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right transition-colors resize-none ${
                getFieldError("description")
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
            {getFieldError("description") && (
              <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                <AlertCircle size={12} />
                <span>{getFieldError("description")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* السعة */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <Users className="text-blue-600" size={20} />
          سعة الحلقة
        </h3>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Users size={14} className="text-gray-500" />
            عدد الطلاب المسموح
          </label>
          <input
            name="capacity"
            type="number"
            min="1"
            max="50"
            value={formData.capacity || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("capacity")}
            placeholder="30"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right"
          />
          <p className="text-xs text-gray-500">
            الحد الأقصى: 50 طالب، القيمة الافتراضية: 30
          </p>
          {getFieldError("capacity") && (
            <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
              <AlertCircle size={12} />
              <span>{getFieldError("capacity")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupFormStep1;

