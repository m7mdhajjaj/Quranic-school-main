import React from "react";
import { 
  X, Shield, User, Mail, Phone, MapPin, 
  Calendar, Lock, Users, AlertCircle, CheckCircle2,
  CreditCard, ClipboardList, MessageSquare 
} from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import Avatar from "@/components/Avatar/Avatar";
import type { Secretary } from "../types";
import { useSecretaryForm, type SecretaryFormData } from "./useSecretaryForm";

// =================== Props ===================
interface SecretaryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SecretaryFormData) => Promise<void>;
  secretary?: Secretary | null;
  isLoading?: boolean;
}

// =================== Component ===================
export const SecretaryForm: React.FC<SecretaryFormProps> = ({
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
  } = useSecretaryForm({ secretary, isOpen, onSubmit });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 rounded-t-2xl p-6 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar Preview in Header */}
              {isEditMode && secretary ? (
                <Avatar
                  user={{
                    _id: secretary._id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    gender: formData.gender,
                    role: "secretary",
                    avatar: secretary.avatar,
                  }}
                  userName={`${formData.firstName} ${formData.lastName}`}
                  gender={formData.gender as "ذكر" | "أنثى"}
                  size="lg"
                  border="ring"
                />
              ) : (
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditMode ? "تعديل بيانات السكرتير" : "إضافة سكرتير جديد"}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {isEditMode
                    ? `تعديل بيانات: ${secretary?.firstName} ${secretary?.lastName}`
                    : "قم بإدخال بيانات السكرتير الجديد"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* =================== Section: الأسماء =================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-3">
              <User className="w-5 h-5" />
              <h3 className="font-semibold">الأسماء</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="الاسم الأول"
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.firstName}
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
                  placeholder="اسم العائلة"
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم الأب
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="اسم الأب (اختياري)"
                />
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
                  className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="اسم الجد (اختياري)"
                />
              </div>

              {/* Mother Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  اسم الأم
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="اسم الأم (اختياري)"
                />
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
              <Calendar className="w-5 h-5" />
              <h3 className="font-semibold">البيانات الشخصية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاريخ الميلاد *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  title="تاريخ الميلاد"
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.birthDate ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
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
                  <Users className="w-4 h-4 inline ml-1" />
                  الجنس *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.gender === "ذكر"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="ذكر"
                      checked={formData.gender === "ذكر"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <FaMale className="w-4 h-4" />
                    <span className="font-medium text-sm">ذكر</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.gender === "أنثى"
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="أنثى"
                      checked={formData.gender === "أنثى"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <FaFemale className="w-4 h-4" />
                    <span className="font-medium text-sm">أنثى</span>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* إدارة الطلاب */}
              <label 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.permissions.canManageStudents
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="permissions.canManageStudents"
                  checked={formData.permissions.canManageStudents}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${formData.permissions.canManageStudents ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${formData.permissions.canManageStudents ? "text-emerald-700" : "text-gray-600"}`}>
                  إدارة الطلاب
                </span>
              </label>
              
              {/* إدارة الحضور */}
              <label 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.permissions.canManageAttendance
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="permissions.canManageAttendance"
                  checked={formData.permissions.canManageAttendance}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${formData.permissions.canManageAttendance ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${formData.permissions.canManageAttendance ? "text-teal-700" : "text-gray-600"}`}>
                  إدارة الحضور
                </span>
              </label>
              
              {/* إدارة الأخبار */}
              <label 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.permissions.canManageNews
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-gray-200 hover:border-cyan-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="permissions.canManageNews"
                  checked={formData.permissions.canManageNews}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${formData.permissions.canManageNews ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Mail className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${formData.permissions.canManageNews ? "text-cyan-700" : "text-gray-600"}`}>
                  إدارة الأخبار
                </span>
              </label>
              
              {/* عرض التقارير */}
              <label 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.permissions.canViewReports
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="permissions.canViewReports"
                  checked={formData.permissions.canViewReports}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${formData.permissions.canViewReports ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Shield className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${formData.permissions.canViewReports ? "text-green-700" : "text-gray-600"}`}>
                  عرض التقارير
                </span>
              </label>

              {/* إدارة الجداول */}
              <label 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.permissions.canManageTimetable
                    ? "border-lime-500 bg-lime-50"
                    : "border-gray-200 hover:border-lime-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="permissions.canManageTimetable"
                  checked={formData.permissions.canManageTimetable}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${formData.permissions.canManageTimetable ? "bg-lime-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${formData.permissions.canManageTimetable ? "text-lime-700" : "text-gray-600"}`}>
                  إدارة الجداول
                </span>
              </label>

              {/* إدارة الرسائل */}
              <label 
                className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.permissions.canManageMessages
                    ? "border-sky-500 bg-sky-50"
                    : "border-gray-200 hover:border-sky-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="permissions.canManageMessages"
                  checked={formData.permissions.canManageMessages}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${formData.permissions.canManageMessages ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${formData.permissions.canManageMessages ? "text-sky-700" : "text-gray-600"}`}>
                  إدارة الرسائل
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              * الحقول المطلوبة
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25 font-medium"
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
        </form>
      </div>
    </div>
  );
};

// Re-export types
export type { SecretaryFormData } from "./useSecretaryForm";
export default SecretaryForm;
