import React, { memo, useCallback } from "react";
import { 
  X, Shield, User, Mail, Phone, MapPin,
  Lock, Users, AlertCircle, CheckCircle2,
  CreditCard, GraduationCap, Calendar
} from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import { DatePicker } from "@/components/UI/DatePicker";
import type { Secretary } from "../types";
import { useSecretaryForm, type SecretaryFormData, type AccessLevel } from "../hooks/useSecretaryForm";

// =================== Props ===================
interface SecretaryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SecretaryFormData) => Promise<void>;
  secretary?: Secretary | null;
  isLoading?: boolean;
}

// =================== Component ===================
export const SecretaryForm: React.FC<SecretaryFormProps> = memo(({
  isOpen,
  onClose,
  onSubmit,
  secretary,
  isLoading = false,
}) => {
  // استخدام الـ Hook للمنطق
  const {
    formData,
    errors,
    isEditMode,
    handleChange,
    handleSubmit,
  } = useSecretaryForm({ secretary, isOpen, onSubmit, onClose });

  // Memoized close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998]"
        onClick={handleClose}
      />

      {/* Modal - centered */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden z-[9999]"
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {isEditMode ? "تعديل بيانات السكرتير" : "إضافة سكرتير جديد"}
                </h2>
                <p className="text-white/80 text-xs mt-0.5 truncate">
                  {isEditMode
                    ? `${[secretary?.firstName, secretary?.lastName].filter(Boolean).join(" ")}`
                    : "أدخل بيانات السكرتير"}
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
        <form id="secretary-form" onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
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

          {/* =================== Section: الهوية والتواصل =================== */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">الهوية والتواصل</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <CreditCard className="w-4 h-4 inline ml-1" />
                  رقم الهوية *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => {
                    // السماح فقط بالأرقام والحد الأقصى 9
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    handleChange({ ...e, target: { ...e.target, name: 'idNumber', value } });
                  }}
                  maxLength={9}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left ${
                    errors.idNumber ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="رقم الهوية (9 أرقام)"
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
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left ${
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
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    // السماح فقط بالأرقام والحد الأقصى 10
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange({ ...e, target: { ...e.target, name: 'phoneNumber', value } });
                  }}
                  maxLength={10}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left ${
                    errors.phoneNumber ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="05xxxxxxxx"
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

            {/* ملاحظة: كلمة المرور الافتراضية */}
            {!isEditMode && (
              <div className="col-span-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>كلمة المرور الافتراضية هي <strong>رقم الهوية</strong></span>
                </p>
              </div>
            )}
          </div>

          {/* =================== Section: البيانات الشخصية =================== */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">البيانات الشخصية</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Birth Date - Using DatePicker Component */}
              <div>
                <DatePicker
                  label="تاريخ الميلاد"
                  value={formData.birthDate}
                  onChange={(date) =>
                    handleChange({
                      target: { name: "birthDate", value: date },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  error={errors.birthDate}
                  success={!errors.birthDate && formData.birthDate && formData.birthDate.length >= 10 ? "مقبول" : undefined}
                  required
                  minYear={1950}
                  maxYear={new Date().getFullYear() - 21}
                  minAge={21}
                />
              </div>

              {/* Gender - Full Width */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Users className="w-3.5 h-3.5 inline ml-1" />
                  الجنس *
                </label>
                <div className="flex gap-3">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                      formData.gender === "ذكر"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleChange({ target: { name: 'gender', value: 'ذكر' } } as any);
                    }}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="ذكر"
                      checked={formData.gender === "ذكر"}
                      onChange={() => {}}
                      className="sr-only"
                      tabIndex={-1}
                      readOnly
                    />
                    <FaMale className="w-4 h-4" />
                    <span className="font-medium">ذكر</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                      formData.gender === "أنثى"
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleChange({ target: { name: 'gender', value: 'أنثى' } } as any);
                    }}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="أنثى"
                      checked={formData.gender === "أنثى"}
                      onChange={() => {}}
                      className="sr-only"
                      tabIndex={-1}
                      readOnly
                    />
                    <FaFemale className="w-4 h-4" />
                    <span className="font-medium">أنثى</span>
                  </label>
                </div>
              </div>

              {/* Residence */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  مكان الإقامة *
                </label>
                <input
                  type="text"
                  name="residence"
                  value={formData.residence}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.residence ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="المدينة أو المنطقة"
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

          {/* =================== Section: الصلاحيات =================== */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-base">الصلاحيات</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* صلاحية الحلقات */}
              <div className="p-4 bg-white border-2 rounded-xl border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-lg shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">الحلقات</h4>
                </div>
                <select
                  name="permissions.groupsAccess"
                  value={formData.permissions.groupsAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية إدارة الحلقات"
                  aria-label="صلاحية إدارة الحلقات"
                  className="w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all border-emerald-200 text-sm font-medium bg-emerald-50"
                >
                  <option value="none">🚫 بدون</option>
                  <option value="view">👁️ عرض</option>
                  <option value="manage">✏️ إدارة</option>
                </select>
              </div>
              
              {/* صلاحية المعلمين */}
              <div className="p-4 bg-white border-2 rounded-xl border-teal-200 hover:border-teal-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-lg shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">المعلمين</h4>
                </div>
                <select
                  name="permissions.teachersAccess"
                  value={formData.permissions.teachersAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية إدارة المعلمين"
                  aria-label="صلاحية إدارة المعلمين"
                  className="w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all border-teal-200 text-sm font-medium bg-teal-50"
                >
                  <option value="none">🚫 بدون</option>
                  <option value="view">👁️ عرض</option>
                  <option value="manage">✏️ إدارة</option>
                </select>
              </div>
              
              {/* صلاحية الطلاب */}
              <div className="p-4 bg-white border-2 rounded-xl border-cyan-200 hover:border-cyan-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-lg shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">الطلاب</h4>
                </div>
                <select
                  name="permissions.studentsAccess"
                  value={formData.permissions.studentsAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية إدارة الطلاب"
                  aria-label="صلاحية إدارة الطلاب"
                  className="w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all border-cyan-200 text-sm font-medium bg-cyan-50"
                >
                  <option value="none">🚫 بدون</option>
                  <option value="view">👁️ عرض</option>
                  <option value="manage">✏️ إدارة</option>
                </select>
              </div>
              
              {/* صلاحية الجدول (أسبوعي وشهري) */}
              <div className="p-4 bg-white border-2 rounded-xl border-purple-200 hover:border-purple-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">الجدول</h4>
                </div>
                <select
                  name="permissions.timetableAccess"
                  value={formData.permissions.timetableAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية عرض الجدول (عرض فقط - بدون إدارة)"
                  aria-label="صلاحية عرض الجدول"
                  className="w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all border-purple-200 text-sm font-medium bg-purple-50"
                >
                  <option value="none">🚫 بدون</option>
                  <option value="view">👁️ عرض فقط</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">* الجدول عرض فقط (لا يوجد إدارة)</p>
              </div>
            </div>
          </div>
        </form>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="secretary-form"
            disabled={isLoading}
            className="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25 font-medium text-sm"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isEditMode ? "حفظ التغييرات" : "إضافة السكرتير"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// Display name for debugging
SecretaryForm.displayName = "SecretaryForm";

// Re-export types
export type { SecretaryFormData } from "../hooks/useSecretaryForm";
export default SecretaryForm;
