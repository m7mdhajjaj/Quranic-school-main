import React from "react";
import { User, Calendar, MapPin } from "lucide-react";

interface StudentFormStep1Props {
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
}

const StudentFormStep1: React.FC<StudentFormStep1Props> = ({
  formData,
  handleChange,
  handleBlur,
  calculatedAge,
  getFieldError,
}) => {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          المعلومات الشخصية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الاسم الأول <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur("firstName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("firstName")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
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

          {/* Grand Father Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم الجد <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="grandFatherName"
              value={formData.grandFatherName}
              onChange={handleChange}
              onBlur={() => handleBlur("grandFatherName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("grandFatherName")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم الأم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              onBlur={() => handleBlur("motherName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("motherName")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسم الشهرة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur("lastName")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("lastName")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              }`}
              placeholder="أدخل اسم الشهرة"
            />
            {getFieldError("lastName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("lastName")}
              </p>
            )}
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الرقم الوطني <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              onBlur={() => handleBlur("idNumber")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("idNumber")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              }`}
              placeholder="أدخل الرقم الوطني (9 أرقام)"
              maxLength={9}
            />
            {getFieldError("idNumber") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("idNumber")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Birth & Location Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          معلومات الميلاد والسكن
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Birth Date */}
          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              تاريخ الميلاد <span className="text-red-500">*</span>
            </label>
            <input
              id="birthDate"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              onBlur={() => handleBlur("birthDate")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("birthDate")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              }`}
            />
            {getFieldError("birthDate") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("birthDate")}
              </p>
            )}
            {calculatedAge !== null && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                العمر: {calculatedAge} سنة
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              الجنس <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={() => handleBlur("gender")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("gender")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              }`}
            >
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

          {/* Residence */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              مكان السكن <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
              onBlur={() => handleBlur("residence")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                getFieldError("residence")
                  ? "border-red-500 focus:ring-red-500 dark:border-red-600"
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
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

export default StudentFormStep1;
