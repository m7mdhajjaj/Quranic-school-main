import React, { useEffect } from "react";
import {
  AlertCircle,
  X,
  Loader2,
  Check,
  User,
  School,
  Phone,
  MapPin,
  Mail,
  CreditCard,
  Users,
  ChevronLeft,
} from "lucide-react";
import { useStudentForm } from "../hooks/useStudentForm";
import { DatePicker } from "@/components/UI/DatePicker";
import type { Student } from "@/Api/studentApi";
import type { StudentFormData } from "@/Validation/studentValidation";

interface Props {
  onClose: () => void;
  onSuccess: (studentData: Student | StudentFormData) => void;
  student?: Student;
  defaultGroup?: string;
  restrictToGroup?: string;
}

const AddStudentForm: React.FC<Props> = ({
  onClose,
  onSuccess,
  student,
  defaultGroup,
}) => {
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    showSuccess,
    groups,
    loadingGroups,
    duplicateFieldInfo,
    calculatedAge,
    selectedGroupTeacher,
    isStep1Valid,
    isStep2Valid,
    hasRetryableError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
    getFieldError,
    isDuplicateError,
  } = useStudentForm({
    student,
    defaultGroup,
    onSuccess,
    onClose,
  });

  // منع scroll الصفحة عند فتح المودل
  useEffect(() => {
    // حفظ الـ overflow الأصلي
    const originalOverflow = document.body.style.overflow;
    
    // منع scroll الصفحة
    document.body.style.overflow = 'hidden';
    
    // إرجاع الـ overflow عند إغلاق المودل
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const steps = [
    { number: 1, title: "المعلومات الشخصية", icon: User },
    { number: 2, title: "الدراسة والتواصل", icon: School },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 will-change-opacity"
      dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-[10000] will-change-transform gpu-accelerate">
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-emerald-600" size={28} />
                {student ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {student
                  ? "قم بتحديث معلومات الطالب"
                  : "أدخل بيانات الطالب الكاملة"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="إغلاق">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentStep === step.number
                        ? "bg-emerald-600 text-white shadow-lg"
                        : currentStep > step.number
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === step.number
                          ? "bg-white text-emerald-600"
                          : currentStep > step.number
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}>
                      {currentStep > step.number ? (
                        <Check size={18} />
                      ) : (
                        <step.icon size={18} />
                      )}
                    </div>
                    <span className="font-semibold text-sm hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronLeft
                    className={`${currentStep > step.number
                        ? "text-green-600"
                        : "text-gray-300"
                      }`}
                    size={20}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {showSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
            <Check className="text-green-600" size={20} />
            <span className="font-medium">تم حفظ البيانات بنجاح!</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && !showSuccess && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-lg animate-fadeIn ${hasRetryableError
                ? "bg-orange-50 border border-orange-200 text-orange-700"
                : "bg-red-50 border border-red-200 text-red-700"
              }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">
                {hasRetryableError
                  ? "يرجى تصحيح البيانات والمحاولة مرة أخرى:"
                  : "يرجى إصلاح الأخطاء التالية:"}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm ml-6">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
            {hasRetryableError && duplicateFieldInfo && (
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-orange-100 rounded-lg text-sm border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-orange-600" />
                    <strong className="text-orange-800">
                      كيفية إصلاح المشكلة:
                    </strong>
                  </div>
                  <div className="text-orange-700 space-y-1">
                    <p>
                      •{" "}
                      <strong>
                        {duplicateFieldInfo.field === "idNumber"
                          ? "رقم الهوية"
                          : duplicateFieldInfo.field === "phoneNumber"
                            ? "رقم الهاتف"
                            : duplicateFieldInfo.field === "email"
                              ? "البريد الإلكتروني"
                              : "الحقل"}
                      </strong>{" "}
                      موجود بالفعل لدى{" "}
                      <strong>{duplicateFieldInfo.userType}</strong> آخر في
                      النظام
                    </p>
                    <p>• قم بتعديل البيانات المطلوبة في الحقول المؤشرة أعلاه</p>
                    <p>
                      • اضغط على زر <strong>"المحاولة مرة أخرى"</strong> لحفظ
                      البيانات
                    </p>
                    <p>• لن تفقد باقي البيانات التي أدخلتها</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* الاسم الكامل */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <Users className="text-emerald-600" size={20} />
                  الاسم الكامل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* الاسم الأول */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      الاسم الأول <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="أدخل الاسم الأول"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right transition-colors ${getFieldError("firstName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                      style={{ minHeight: '42px' }}
                    />
                    {getFieldError("firstName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs min-h-[20px]">
                        <AlertCircle size={12} />
                        <span>{getFieldError("firstName")}</span>
                      </div>
                    )}
                  </div>

                  {/* اسم الأب */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الأب <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fatherName"
                      type="text"
                      value={formData.fatherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("fatherName")}
                      placeholder="أدخل اسم الأب"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${getFieldError("fatherName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                    />
                    <div className="min-h-[20px]">
                      {getFieldError("fatherName") && (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                          <AlertCircle size={12} />
                          <span>{getFieldError("fatherName")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* اسم الجد */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الجد
                    </label>
                    <input
                      name="grandFatherName"
                      type="text"
                      value={formData.grandFatherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("grandFatherName")}
                      placeholder="أدخل اسم الجد"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-right"
                    />
                  </div>

                  {/* اسم الأم */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الأم
                    </label>
                    <input
                      name="motherName"
                      type="text"
                      value={formData.motherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("motherName")}
                      placeholder="أدخل اسم الأم"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-right"
                    />
                  </div>

                  {/* الكنية */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      الكنية <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="أدخل الكنية"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${getFieldError("lastName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                    />
                    {getFieldError("lastName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("lastName")}</span>
                      </div>
                    )}
                  </div>

                  {/* رقم الهوية */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <CreditCard size={14} className="text-gray-500" />
                      رقم الهوية <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="idNumber"
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      value={formData.idNumber || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("idNumber")}
                      placeholder="123456789 (9 أرقام)"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${
                        getFieldError("idNumber")
                          ? isDuplicateError("idNumber")
                            ? "border-orange-300 focus:ring-orange-500 bg-orange-50"
                            : "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                    />
                    {getFieldError("idNumber") && (
                      <div
                        className={`flex items-center gap-1 text-xs animate-fadeIn ${
                          isDuplicateError("idNumber")
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}>
                        <AlertCircle size={12} />
                        <span>{getFieldError("idNumber")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* تاريخ الميلاد والجنس */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <User className="text-emerald-600" size={20} />
                  المعلومات الشخصية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* تاريخ الميلاد */}
                  <div className="space-y-1">
                    <DatePicker
                      label="تاريخ الميلاد"
                      value={formData.birthDate}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "birthDate", value: date },
                        } as any)
                      }
                      error={getFieldError("birthDate")}
                      required
                      minYear={1950}
                      maxYear={new Date().getFullYear()}
                    />
                  </div>

                  {/* الجنس */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1 mb-3">
                      <User size={14} className="text-gray-500" />
                      الجنس <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={() => handleBlur("gender")}
                      title="اختر الجنس"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${
                        getFieldError("gender")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                      }`}>
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                    {getFieldError("gender") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                        <AlertCircle size={12} />
                        <span>{getFieldError("gender")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* عرض العمر المحسوب */}
                {calculatedAge !== null && (
                  <div className="mt-4">
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="text-emerald-600" size={14} />
                        <span className="text-xs text-emerald-600 font-medium">
                          العمر الحالي
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {calculatedAge} <span className="text-sm">سنة</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* العنوان */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <MapPin className="text-green-600" size={20} />
                  العنوان
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-500" />
                      مكان السكن <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="residence"
                      type="text"
                      value={formData.residence || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("residence")}
                      placeholder="أدخل مكان السكن"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${getFieldError("residence")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                    />
                    {getFieldError("residence") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("residence")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* اختيار الحلقة والمعلم */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <Users className="text-emerald-600" size={20} />
                  اختيار الحلقة والمعلم
                </h3>
                <div className="bg-gradient-to-r from-blue-100 to-emerald-100 border-2 border-blue-300 rounded-xl p-4 mb-6 shadow-sm">
                  <p className="text-sm text-blue-800 text-center font-medium">
                    <strong>📋 تعليمات:</strong> اختر الحلقة أولاً، وسيظهر المعلم المسؤول تلقائياً
                  </p>
                </div>

                <div className="space-y-6">
                  {/* اختيار الحلقة */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Users size={14} className="text-white" />
                      </div>
                      <span className="text-base">اختيار الحلقة الدراسية</span>
                      <span className="text-red-500 text-lg">*</span>
                    </label>

                    <div className="relative">
                      <select
                        name="group"
                        value={formData.group}
                        onChange={handleChange}
                        onBlur={() => handleBlur("group")}
                        disabled={loadingGroups}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 text-right appearance-none ${
                          getFieldError("group")
                            ? "border-red-300 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
                        }`}>
                        <option value="">
                          {loadingGroups ? "جاري التحميل..." : "اختر الحلقة"}
                        </option>
                        {groups.map((group: any) => (
                          <option
                            key={group._id}
                            value={group.name}
                            disabled={group.isFull}>
                            {group.name}
                            {group.capacityStatus && ` (${group.capacityStatus})`}
                            {group.isFull && " - ممتلئة!"}
                          </option>
                        ))}
                      </select>

                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Users
                          size={18}
                          className={`${
                            formData.group ? "text-emerald-500" : "text-gray-400"
                          } transition-colors duration-200`}
                        />
                      </div>
                    </div>

                    {getFieldError("group") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("group")}</span>
                      </div>
                    )}
                  </div>

                  {/* عرض المعلم المسؤول */}
                  {selectedGroupTeacher && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-teal-600 font-medium">المعلم المسؤول</p>
                          <p className="text-base font-bold text-teal-900">{selectedGroupTeacher}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* معلومات التواصل */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <Phone className="text-emerald-600" size={20} />
                  معلومات التواصل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* رقم الهاتف */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone size={14} className="text-gray-500" />
                      رقم الهاتف
                    </label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("phoneNumber")}
                      placeholder="0512345678 (10 أرقام)"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${getFieldError("phoneNumber")
                          ? isDuplicateError("phoneNumber")
                            ? "border-orange-300 focus:ring-orange-500 bg-orange-50"
                            : "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {formData.phoneNumber && (
                        <span className={formData.phoneNumber.length === 10 ? "text-green-600" : "text-orange-600"}>
                          {formData.phoneNumber.length}/10 أرقام
                        </span>
                      )}
                      {!formData.phoneNumber && "يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"}
                    </p>
                    {getFieldError("phoneNumber") && (
                      <div
                        className={`flex items-center gap-1 text-xs animate-fadeIn ${isDuplicateError("phoneNumber")
                            ? "text-orange-600"
                            : "text-red-600"
                          }`}>
                        <AlertCircle size={12} />
                        <span>{getFieldError("phoneNumber")}</span>
                      </div>
                    )}
                  </div>

                  {/* البريد الإلكتروني */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Mail size={14} className="text-gray-500" />
                      البريد الإلكتروني
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="example@email.com"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right ${getFieldError("email")
                          ? isDuplicateError("email")
                            ? "border-orange-300 focus:ring-orange-500 bg-orange-50"
                            : "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                    />
                    {getFieldError("email") && (
                      <div
                        className={`flex items-center gap-1 text-xs animate-fadeIn ${isDuplicateError("email")
                            ? "text-orange-600"
                            : "text-red-600"
                          }`}>
                        <AlertCircle size={12} />
                        <span>{getFieldError("email")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - الأزرار */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentStep === 1 ? (
                isStep1Valid ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Check size={16} />
                    جميع حقول الخطوة الأولى مكتملة
                  </span>
                ) : (
                  <span className="text-gray-500">
                    يرجى ملء جميع الحقول المطلوبة
                  </span>
                )
              ) : isStep2Valid ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Check size={16} />
                  جميع حقول الخطوة الثانية مكتملة
                </span>
              ) : (
                <span className="text-gray-500">
                  يرجى ملء جميع الحقول المطلوبة
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2">
                  رجوع
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!isStep1Valid}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                  التالي
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStep2Valid}
                  className={`px-6 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg ${hasRetryableError
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-500/30"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30"
                    }`}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      جاري الحفظ...
                    </>
                  ) : hasRetryableError ? (
                    <>
                      <Check size={18} />
                      المحاولة مرة أخرى
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {student ? "تحديث البيانات" : "حفظ البيانات"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;