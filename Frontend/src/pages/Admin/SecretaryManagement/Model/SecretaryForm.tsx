import React, { memo, useCallback } from "react";
import { 
  X, Shield, User, Mail, Phone, MapPin, Calendar,
  Lock, Users, AlertCircle, CheckCircle2,
  CreditCard, GraduationCap
} from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import Avatar from "@/components/Avatar/Avatar";
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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" dir="rtl">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal - centered - stop propagation to prevent closing when clicking inside */}
      <div 
        className="relative w-full max-w-4xl min-h-screen sm:min-h-0 sm:my-8 bg-white sm:rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 sm:rounded-t-2xl p-4 sm:p-6 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full hidden sm:block" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full hidden sm:block" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Avatar Preview in Header */}
              {isEditMode && secretary ? (
                <div className="hidden sm:block">
                  <Avatar
                    user={{
                      _id: secretary._id,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      gender: formData.gender,
                      role: "secretary",
                      avatar: secretary.avatar,
                    }}
                    userName={[formData.firstName, formData.fatherName, formData.grandFatherName, formData.lastName].filter(Boolean).join(" ")}
                    gender={formData.gender as "ذكر" | "أنثى"}
                    size="lg"
                    border="ring"
                  />
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                  <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-white truncate">
                  {isEditMode ? "تعديل بيانات السكرتير" : "إضافة سكرتير جديد"}
                </h2>
                <p className="text-white/80 text-xs sm:text-sm mt-0.5 truncate hidden sm:block">
                  {isEditMode
                    ? `تعديل بيانات: ${[secretary?.firstName, secretary?.fatherName, secretary?.grandFatherName, secretary?.lastName].filter(Boolean).join(" ")}`
                    : "قم بإدخال بيانات السكرتير الجديد"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
              title="إغلاق"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto overscroll-contain">
          {/* =================== Section: الأسماء =================== */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-2 sm:mb-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <h3 className="font-semibold text-sm sm:text-base">الأسماء</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <div className="md:col-span-2">
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
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-emerald-700 mb-3">
              <CreditCard className="w-5 h-5" />
              <h3 className="font-semibold">الهوية والتواصل</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>كلمة المرور الافتراضية هي <strong>رقم الهوية</strong>. يمكن للسكرتير تغييرها لاحقاً.</span>
                </p>
              </div>
            )}
          </div>

          {/* =================== Section: البيانات الشخصية =================== */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-emerald-700 mb-3">
              <User className="w-5 h-5" />
              <h3 className="font-semibold">البيانات الشخصية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Users className="w-4 h-4 inline ml-1" />
                  الجنس *
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl cursor-pointer transition-all ${
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
                    <FaMale className="w-5 h-5" />
                    <span className="font-medium">ذكر</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl cursor-pointer transition-all ${
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
                    <FaFemale className="w-5 h-5" />
                    <span className="font-medium">أنثى</span>
                  </label>
                </div>
              </div>

              {/* Residence */}
              <div className="md:col-span-2">
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
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-emerald-700 mb-3">
              <Shield className="w-5 h-5" />
              <h3 className="font-semibold">الصلاحيات</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* صلاحية الحلقات */}
              <div className="p-4 border-2 rounded-xl border-gray-200 hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">إدارة الحلقات</h4>
                    <p className="text-xs text-gray-500">التحكم في صفحة إدارة الحلقات</p>
                  </div>
                </div>
                <select
                  name="permissions.groupsAccess"
                  value={formData.permissions.groupsAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية إدارة الحلقات"
                  aria-label="صلاحية إدارة الحلقات"
                  className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all border-gray-200 hover:border-gray-300 text-sm"
                >
                  <option value="none">🚫 بدون وصول</option>
                  <option value="view">👁️ عرض فقط (قراءة)</option>
                  <option value="manage">✏️ إدارة كاملة (قراءة وكتابة)</option>
                </select>
              </div>
              
              {/* صلاحية المعلمين */}
              <div className="p-4 border-2 rounded-xl border-gray-200 hover:border-teal-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">إدارة المعلمين</h4>
                    <p className="text-xs text-gray-500">التحكم في صفحة إدارة المعلمين</p>
                  </div>
                </div>
                <select
                  name="permissions.teachersAccess"
                  value={formData.permissions.teachersAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية إدارة المعلمين"
                  aria-label="صلاحية إدارة المعلمين"
                  className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all border-gray-200 hover:border-gray-300 text-sm"
                >
                  <option value="none">🚫 بدون وصول</option>
                  <option value="view">👁️ عرض فقط (قراءة)</option>
                  <option value="manage">✏️ إدارة كاملة (قراءة وكتابة)</option>
                </select>
              </div>
              
              {/* صلاحية الطلاب */}
              <div className="p-4 border-2 rounded-xl border-gray-200 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">إدارة الطلاب</h4>
                    <p className="text-xs text-gray-500">التحكم في صفحة إدارة الطلاب</p>
                  </div>
                </div>
                <select
                  name="permissions.studentsAccess"
                  value={formData.permissions.studentsAccess}
                  onChange={(e) => handleChange(e)}
                  title="صلاحية إدارة الطلاب"
                  aria-label="صلاحية إدارة الطلاب"
                  className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all border-gray-200 hover:border-gray-300 text-sm"
                >
                  <option value="none">🚫 بدون وصول</option>
                  <option value="view">👁️ عرض فقط (قراءة)</option>
                  <option value="manage">✏️ إدارة كاملة (قراءة وكتابة)</option>
                </select>
              </div>
            </div>
            
            {/* ملخص الصلاحيات */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] sm:text-xs text-gray-600 flex items-start sm:items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="leading-relaxed">
                  <strong>ملاحظة:</strong> 
                  <span className="hidden sm:inline">
                    {' '}"بدون وصول" = لن يظهر الرابط في القائمة الجانبية | 
                    {' '}"عرض فقط" = يمكن المشاهدة فقط | 
                    {' '}"إدارة كاملة" = يمكن الإضافة والتعديل والحذف
                  </span>
                  <span className="sm:hidden">
                    {' '}الصلاحيات تتحكم في ظهور الصفحات
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2 sm:pb-0">
            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
              * الحقول المطلوبة
            </p>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition-colors font-medium text-sm"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25 font-medium text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden xs:inline">جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{isEditMode ? "حفظ التغييرات" : "إضافة السكرتير"}</span>
                    <span className="xs:hidden">{isEditMode ? "حفظ" : "إضافة"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

// Display name for debugging
SecretaryForm.displayName = "SecretaryForm";

// Re-export types
export type { SecretaryFormData } from "../hooks/useSecretaryForm";
export default SecretaryForm;
