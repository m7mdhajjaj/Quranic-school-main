import React, { memo, useCallback } from "react";
import { 
  X, HandHelping, User, Mail, Phone, MapPin,
  AlertCircle, Calendar, Users,
  CreditCard
} from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import { DatePicker } from "@/components/UI/DatePicker";
import type { TeacherAssistant } from "../types";
import { useTeacherAssistantForm, type TeacherAssistantFormData } from "../hooks/useTeacherAssistantForm";

// =================== Props ===================
interface AssistantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherAssistantFormData) => Promise<void>;
  assistant?: TeacherAssistant | null;
  isLoading?: boolean;
}

// =================== Component ===================
export const AssistantForm: React.FC<AssistantFormProps> = memo(({
  isOpen,
  onClose,
  onSubmit,
  assistant,
  isLoading = false,
}) => {
  const {
    formData,
    errors,
    isEditMode,
    groups,
    isLoadingGroups,    handleChange,
    handleGroupsChange,
    handleSubmit,
  } = useTeacherAssistantForm({ assistant, isOpen, onSubmit, onClose });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Use Portal or high z-index to ensure visibility
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto w-full h-full"
      dir="rtl"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all flex flex-col overflow-hidden z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 rounded-t-2xl p-4 overflow-hidden flex-shrink-0">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <HandHelping className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {isEditMode ? "تعديل بيانات مساعد المدرس" : "إضافة مساعد مدرس جديد"}
                </h2>
                <p className="text-white/80 text-xs mt-0.5 truncate">
                  {isEditMode
                    ? `${assistant?.firstName} ${assistant?.lastName}`
                    : "أدخل بيانات مساعد المدرس"}
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
        <form id="assistant-form" onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          
          {/* =================== Section: الأسماء =================== */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">الأسماء</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الاسم الأول *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.firstName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل الاسم الأول"
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم الأب *
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.fatherName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل اسم الأب"
                />
                {errors.fatherName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.fatherName}
                  </p>
                )}
              </div>

              {/* Grandfather Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم الجد *
                </label>
                <input
                  type="text"
                  name="grandFatherName"
                  value={formData.grandFatherName || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.grandFatherName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل اسم الجد"
                />
                {errors.grandFatherName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.grandFatherName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم العائلة *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.lastName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل اسم العائلة"
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Mother Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم الأم *
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.motherName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل اسم الأم"
                />
                {errors.motherName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.motherName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================== Section: بيانات الهوية والتواصل =================== */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">بيانات الهوية والتواصل</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رقم الهوية *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  maxLength={9}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.idNumber ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل رقم الهوية (9 أرقام)"
                  dir="ltr"
                />
                {errors.idNumber && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.idNumber}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني *
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.email ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="example@email.com"
                  dir="ltr"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف *
                  </div>
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.phoneNumber ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                />
                {errors.phoneNumber && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>


            </div>
          </div>

          {/* =================== Section: البيانات الشخصية =================== */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">البيانات الشخصية</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تاريخ الميلاد *
                </label>
                <DatePicker
                  value={formData.birthDate}
                  onChange={(date) => handleChange({ target: { name: 'birthDate', value: date } } as React.ChangeEvent<HTMLInputElement>)}
                  error={errors.birthDate}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الجنس *
                </label>
                <div className="flex gap-3">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.gender === "ذكر"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="ذكر"
                      checked={formData.gender === "ذكر"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <FaMale className="w-5 h-5" />
                    <span>ذكر</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.gender === "أنثى"
                        ? "bg-pink-50 border-pink-400 text-pink-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="أنثى"
                      checked={formData.gender === "أنثى"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <FaFemale className="w-5 h-5" />
                    <span>أنثى</span>
                  </label>
                </div>
              </div>

              {/* Residence */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    مكان السكن *
                  </div>
                </label>
                <input
                  type="text"
                  name="residence"
                  value={formData.residence}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.residence ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="أدخل مكان السكن"
                />
                {errors.residence && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.residence}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================== Section: الحلقات المسموحة =================== */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base">الحلقات المسموحة *</h3>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                الحد الأقصى: 2 حلقات
              </span>
            </div>

            {isLoadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد حلقات متاحة</p>
                <p className="text-xs text-gray-400 mt-1">جميع الحلقات لها مساعدين</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  اختر الحلقات التي يشرف عليها المساعد (حد أقصى 2):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
                  {groups.map((group) => {
                    const isSelected = formData.allowedGroups.includes(group._id);
                    const isDisabled = !isSelected && formData.allowedGroups.length >= 2;
                    // استخدام teacherInfo للاسم الثلاثي الكامل، أو teacher كـ fallback
                    const teacherName = group.teacherInfo 
                      ? `${group.teacherInfo.firstName} ${group.teacherInfo.fatherName || ''} ${group.teacherInfo.lastName}`.replace(/\s+/g, ' ').trim()
                      : typeof group.teacher === 'string' 
                        ? group.teacher 
                        : 'غير محدد';
                    
                    return (
                      <div
                        key={group._id}
                        onClick={() => {
                          if (isDisabled) return;
                          if (isSelected) {
                            handleGroupsChange(formData.allowedGroups.filter(id => id !== group._id));
                          } else {
                            handleGroupsChange([...formData.allowedGroups, group._id]);
                          }
                        }}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400 shadow-md"
                            : isDisabled
                              ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                              : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                        }`}
                      >
                        {/* Selection indicator */}
                        <div className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? "bg-emerald-500 border-emerald-500" 
                            : "border-gray-300"
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Group info */}
                        <div className="pr-2">
                          <h4 className="font-bold text-gray-800 text-sm mb-2">{group.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-gray-600">{teacherName}</span>
                          </div>
                          {group.currentStudents !== undefined && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Users className="w-3.5 h-3.5 text-teal-500" />
                              <span>{group.currentStudents || 0} طالب</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.allowedGroups && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.allowedGroups}
                  </p>
                )}
                {formData.allowedGroups.length > 0 && (
                  <p className="mt-3 text-sm text-emerald-600 font-medium">
                    ✓ تم اختيار {formData.allowedGroups.length} من 2 حلقات
                  </p>
                )}
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="assistant-form"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                isEditMode ? "تحديث البيانات" : "إضافة المساعد"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AssistantForm.displayName = "AssistantForm";
