import React, { memo, useCallback } from "react";
import { 
  X, HandHelping, User, Mail, Phone, MapPin,
  Lock, AlertCircle, Calendar, Users,
  CreditCard, Eye, EyeOff
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
    showPassword,
    isEditMode,
    groups,
    isLoadingGroups,
    setShowPassword,
    handleChange,
    handleGroupsChange,
    handleSubmit,
  } = useTeacherAssistantForm({ assistant, isOpen, onSubmit, onClose });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-l from-purple-600 via-indigo-600 to-purple-700 rounded-t-2xl p-4 overflow-hidden flex-shrink-0">
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
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
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
                  اسم الجد
                </label>
                <input
                  type="text"
                  name="grandFatherName"
                  value={formData.grandFatherName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="أدخل اسم الجد"
                />
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
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
                  اسم الأم
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="أدخل اسم الأم"
                />
              </div>
            </div>
          </div>

          {/* =================== Section: بيانات الهوية والتواصل =================== */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">بيانات الهوية والتواصل</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Assistant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رقم المساعد
                </label>
                <input
                  type="number"
                  name="assistantId"
                  value={formData.assistantId || ""}
                  onChange={handleChange}
                  disabled={isEditMode}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="يتم توليده تلقائياً"
                />
              </div>

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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
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

              {/* Password */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    كلمة المرور {!isEditMode && "*"}
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.password ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder={isEditMode ? "اتركها فارغة للإبقاء على كلمة المرور الحالية" : "أدخل كلمة المرور (6 أحرف على الأقل)"}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================== Section: البيانات الشخصية =================== */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
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
                {errors.birthDate && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.birthDate}
                  </p>
                )}
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
                        ? "bg-blue-50 border-blue-400 text-blue-700"
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
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
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
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">الحلقات المسموحة *</h3>
            </div>

            {isLoadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد حلقات متاحة
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  اختر الحلقات التي يمكن لمساعد المدرس الوصول إليها:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-gray-200">
                  {groups.map((group) => (
                    <label
                      key={group._id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        formData.allowedGroups.includes(group._id)
                          ? "bg-green-100 border-2 border-green-400"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.allowedGroups.includes(group._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleGroupsChange([...formData.allowedGroups, group._id]);
                          } else {
                            handleGroupsChange(formData.allowedGroups.filter(id => id !== group._id));
                          }
                        }}
                        className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{group.name}</span>
                    </label>
                  ))}
                </div>
                {errors.allowedGroups && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.allowedGroups}
                  </p>
                )}
                {formData.allowedGroups.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    تم اختيار {formData.allowedGroups.length} حلقة
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
              className="px-6 py-2.5 bg-gradient-to-l from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-50"
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
