import React from "react";
import { Mail, Phone, Users, Loader2, Check, AlertCircle, GraduationCap } from "lucide-react";
import type { Group } from "@/Api/groupApi";

interface StudentFormStep2Props {
  formData: {
    email: string;
    phoneNumber: string;
    group: string;
        fatherName: string;

    teacher: string;
  };
  touchedFields: Set<string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleBlur: (fieldName: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
  groups: Group[];
  loadingGroups: boolean;
  selectedGroupTeacher: string | null;
  checkingDuplicate: Record<string, boolean>;
}

const StudentFormStep2: React.FC<StudentFormStep2Props> = ({
  formData,
  touchedFields,
  handleChange,
  handleBlur,
  getFieldError,
  groups,
  loadingGroups,
  selectedGroupTeacher,
  checkingDuplicate,
}) => {
  const getFieldStatus = (fieldName: string) => {
    if (checkingDuplicate[fieldName]) {
      return (
        <Loader2 className="animate-spin text-blue-500 dark:text-blue-400 w-5 h-5" />
      );
    }
    if (getFieldError(fieldName)) {
      return <AlertCircle className="text-red-500 w-5 h-5" />;
    }
    if (touchedFields.has(fieldName) && formData[fieldName as keyof typeof formData]) {
      return <Check className="text-green-500 w-5 h-5" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Contact Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          معلومات الاتصال
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          


<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم الأب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              onBlur={() => handleBlur("fatherName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("fatherName")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              }`}
              placeholder="أدخل اسم الأب"
            />
            {getFieldError("fatherName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("fatherName")}
              </p>
            )}
          </div>




          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                  getFieldError("email")
                    ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                    : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                }`}
                placeholder="example@domain.com"
                dir="ltr"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus("email")}
              </div>
            </div>
            {getFieldError("email") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("phoneNumber")}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                  getFieldError("phoneNumber")
                    ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                    : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                }`}
                placeholder="09xxxxxxxx"
                dir="ltr"
                maxLength={10}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus("phoneNumber")}
              </div>
            </div>
            {getFieldError("phoneNumber") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("phoneNumber")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          المعلومات الأكاديمية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Group */}
          <div>
            <label
              htmlFor="group"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              الحلقة <span className="text-red-500">*</span>
            </label>
            <select
              id="group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              onBlur={() => handleBlur("group")}
              disabled={loadingGroups}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("group")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              } ${loadingGroups ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">
                {loadingGroups ? "جاري التحميل..." : "اختر الحلقة"}
              </option>
              {groups.map((group) => (
                <option key={group._id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
            {getFieldError("group") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("group")}
              </p>
            )}
          </div>

          {/* Teacher - Auto-filled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              المعلم
            </label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher || selectedGroupTeacher || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              placeholder={
                formData.group ? "يتم التعيين تلقائياً" : "اختر الحلقة أولاً"
              }
            />
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              يتم تعيين المعلم تلقائياً بناءً على الحلقة المختارة
            </p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">ملاحظة:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>يتم التحقق من تكرار البريد الإلكتروني ورقم الهاتف تلقائياً</li>
              <li>سيتم تعيين المعلم تلقائياً بناءً على الحلقة المختارة</li>
              <li>جميع الحقول المميزة بـ (*) إلزامية</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFormStep2;
