import React from "react";
import { User, Calendar, MapPin, CreditCard, Loader2, Check, AlertCircle } from "lucide-react";
import { DatePicker } from "@/components/UI/DatePicker";

interface TeacherFormStep1Props {
  formData: {
    firstName: string;
    fatherName: string;
    grandFatherName: string;
    motherName: string;
    lastName: string;
    idNumber: string;
    birthDate: string;
    gender: string;
    residence: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleBlur: (fieldName: string) => void;
  calculatedAge: number | null;
  getFieldError: (fieldName: string) => string | undefined;
  checkingDuplicate: Record<string, boolean>;
  isDuplicateError: (fieldName: string) => boolean;
}

const TeacherFormStep1: React.FC<TeacherFormStep1Props> = ({
  formData,
  handleChange,
  handleBlur,
  calculatedAge,
  getFieldError,
  checkingDuplicate,
  isDuplicateError,
}) => {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          الاسم الكامل
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الأول <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur("firstName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                getFieldError("firstName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="أدخل الاسم الأول"
            />
            {getFieldError("firstName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("firstName")}
              </p>
            )}
          </div>

          {/* Father Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الأب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              onBlur={() => handleBlur("fatherName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                getFieldError("fatherName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="أدخل اسم الأب"
            />
            {getFieldError("fatherName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("fatherName")}
              </p>
            )}
          </div>

          {/* Grand Father Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الجد <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="grandFatherName"
              value={formData.grandFatherName}
              onChange={handleChange}
              onBlur={() => handleBlur("grandFatherName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                getFieldError("grandFatherName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="أدخل اسم الجد"
            />
            {getFieldError("grandFatherName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("grandFatherName")}
              </p>
            )}
          </div>

          {/* Mother Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الأم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              onBlur={() => handleBlur("motherName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                getFieldError("motherName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="أدخل اسم الأم"
            />
            {getFieldError("motherName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("motherName")}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الشهرة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur("lastName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                getFieldError("lastName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="أدخل اسم الشهرة"
            />
            {getFieldError("lastName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("lastName")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          المعلومات الشخصية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Birth Date */}
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
            {calculatedAge !== null && (
              <p className="text-gray-600 text-sm mt-1">
                العمر: {calculatedAge} سنة
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              الجنس <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={() => handleBlur("gender")}
              title="اختر الجنس"
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-right bg-white ${
                getFieldError("gender")
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}>
              <option value="">اختر الجنس</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
            {getFieldError("gender") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("gender")}
              </p>
            )}
          </div>

          {/* ID Number */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <CreditCard size={14} className="text-gray-500" />
              رقم الهوية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="idNumber"
                inputMode="numeric"
                maxLength={9}
                value={formData.idNumber}
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
              {checkingDuplicate.idNumber && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin text-emerald-500" size={18} />
                </div>
              )}
            </div>
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

      {/* Address Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          العنوان
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Residence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              مكان السكن <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
              onBlur={() => handleBlur("residence")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${
                getFieldError("residence")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="أدخل مكان السكن"
            />
            {getFieldError("residence") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("residence")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherFormStep1;