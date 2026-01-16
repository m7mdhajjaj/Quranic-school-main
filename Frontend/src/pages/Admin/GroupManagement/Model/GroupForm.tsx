import React, { useEffect, memo, useCallback } from "react";
import {
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Users,
  GraduationCap,
  FileText,
  Hash,
  User,
} from "lucide-react";
import { useGroupForm } from "../hooks/useGroupForm";
import type { Group } from "@/Api/groupApi";
import type { GroupFormData } from "@/Validation/groupValidation";
import type { Teacher } from "@/Api/teacherApi";

interface Props {
  onClose: () => void;
  onSuccess: (groupData: Group | GroupFormData) => void;
  group?: Group;
  teachers?: Teacher[];
  loadingTeachers?: boolean;
}

const GroupForm: React.FC<Props> = memo(({
  onClose,
  onSuccess,
  group,
  teachers: providedTeachers,
  loadingTeachers: providedLoadingTeachers,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    teachers,
    loadingTeachers,
    checkingDuplicate,
    isFormValid,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    isDuplicateError,
  } = useGroupForm({
    group,
    onSuccess,
    onClose,
    teachers: providedTeachers,
    loadingTeachers: providedLoadingTeachers,
  });

  const isEditMode = !!group;

  // منع scroll الصفحة عند فتح المودل
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 rounded-t-2xl p-4 overflow-hidden flex-shrink-0">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {isEditMode ? "تعديل بيانات الحلقة" : "إضافة حلقة جديدة"}
                </h2>
                <p className="text-white/80 text-xs mt-0.5 truncate">
                  {isEditMode ? group?.name : "أدخل بيانات الحلقة"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
              title="إغلاق"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="group-form" onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* =================== Section: معلومات الحلقة =================== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Users className="w-4 h-4" />
              <h3 className="font-semibold text-sm">معلومات الحلقة</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* اسم الحلقة */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم الحلقة *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                      getFieldError("name") 
                        ? isDuplicateError("name")
                          ? "border-orange-400 bg-orange-50"
                          : "border-red-400 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="أدخل اسم الحلقة"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {checkingDuplicate.name ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : getFieldError("name") ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : formData.name ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                </div>
                {getFieldError("name") && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {getFieldError("name")}
                  </p>
                )}
              </div>

              {/* السعة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Hash className="w-4 h-4 inline ml-1" />
                  السعة القصوى
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ""}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    getFieldError("capacity") ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* =================== Section: المعلم المسؤول =================== */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <GraduationCap className="w-4 h-4" />
              <h3 className="font-semibold text-sm">المعلم المسؤول</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                اختيار المعلم *
              </label>
              <div className="relative">
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  onBlur={() => handleBlur("teacher")}
                  disabled={loadingTeachers}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none ${
                    getFieldError("teacher") ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option value="">
                    {loadingTeachers ? "جاري التحميل..." : "اختر المعلم"}
                  </option>
                  {teachers.map((teacher: Teacher) => {
                    const fullName = [teacher.firstName, teacher.fatherName, teacher.lastName].filter(Boolean).join(' ');
                    const displayText = teacher.teacherId 
                      ? `${fullName} - ${teacher.teacherId}`
                      : fullName;
                    return (
                      <option key={teacher._id} value={teacher._id}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {loadingTeachers ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              {getFieldError("teacher") && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {getFieldError("teacher")}
                </p>
              )}
            </div>
          </div>

          {/* =================== Section: الوصف =================== */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <FileText className="w-4 h-4" />
              <h3 className="font-semibold text-sm">وصف الحلقة (اختياري)</h3>
            </div>
            
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all border-gray-200 hover:border-gray-300 resize-none"
              placeholder="أدخل وصفاً للحلقة (اختياري)"
            />
          </div>
        </form>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="group-form"
            disabled={isSubmitting || !isFormValid}
            className="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25 font-medium text-sm"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isEditMode ? "حفظ التغييرات" : "إضافة الحلقة"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

GroupForm.displayName = "GroupForm";

export default GroupForm;

