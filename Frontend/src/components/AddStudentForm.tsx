// مثال على كيفية استخدام Yup validation مع AddStudentForm
// يمكن استبدال الـ validation الحالي بهذا

import React, { useState } from "react";
import { 
  validateStudentWithYup, 
  normalizeGender, 
  calculateAge,
  type StudentFormData 
} from "../utils/studentValidationYup";

interface AddStudentFormWithYupProps {
  onClose: () => void;
  onSuccess: (studentData: StudentFormData) => void;
  student?: Partial<StudentFormData>;
}

const AddStudentFormWithYup: React.FC<AddStudentFormWithYupProps> = ({
  onClose,
  onSuccess,
  student,
}) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    fatherName: student?.fatherName || "",
    grandFatherName: student?.grandFatherName || "",
    motherName: student?.motherName || "",
    lastName: student?.lastName || "",
    idNumber: student?.idNumber || "",
    birthDate: student?.birthDate || "",
    gender: student?.gender || "",
    residence: student?.residence || "",
    teacher: student?.teacher || "",
    group: student?.group || "",
    email: student?.email || "",
    phoneNumber: student?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // تطبيع الجنس تلقائياً (مثل Backend set function)
    if (name === 'gender') {
      processedValue = normalizeGender(value);
    }
    
    const updatedData = {
      ...formData,
      [name]: processedValue,
      // حساب العمر تلقائياً عند تغيير تاريخ الميلاد (مثل Backend virtual)
      ...(name === 'birthDate' && value ? { age: calculateAge(value) } : {})
    };
    
    setFormData(updatedData);
    
    // إزالة أخطاء الحقل الحالي عند التعديل
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // استخدام Yup validation (يطابق Backend validation)
      const result = await validateStudentWithYup(
        {
          ...formData,
          // إضافة كلمة المرور للطلاب الجدد (مثل Backend requirement)
          password: !student ? formData.idNumber : undefined,
        },
        !student // isNewStudent
      );

      if (!result.isValid) {
        setErrors(result.errors);
        return;
      }

      // تنظيف الأخطاء عند نجاح التحقق
      setErrors({});

      // إرسال البيانات المتحققة
      await onSuccess(result.data!);
      onClose();
      
    } catch (error) {
      console.error("Error validating student:", error);
      setErrors({ general: "حدث خطأ أثناء التحقق من البيانات" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة مساعدة للحصول على خطأ الحقل
  const getFieldError = (fieldName: string) => errors[fieldName];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 mx-4 animate-fadeIn">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
            ×
          </button>
        </div>

        {/* عرض الأخطاء العامة */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="text-sm font-medium mb-2">يرجى إصلاح الأخطاء التالية:</div>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field} className="text-sm">{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
          
          {/* المعلومات الشخصية */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الأول *
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('firstName') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('firstName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('firstName')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الأب *
                </label>
                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('fatherName') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('fatherName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('fatherName')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الجد *
                </label>
                <input
                  name="grandFatherName"
                  value={formData.grandFatherName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('grandFatherName') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('grandFatherName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('grandFatherName')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الأم *
                </label>
                <input
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('motherName') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('motherName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('motherName')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم العائلة *
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('lastName') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('lastName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('lastName')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهوية *
                </label>
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  placeholder="9 أرقام"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('idNumber') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('idNumber') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('idNumber')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الميلاد *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('birthDate') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('birthDate') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('birthDate')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الجنس *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  title="اختيار الجنس"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('gender') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}>
                  <option value="">اختر الجنس</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
                {getFieldError('gender') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('gender')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مكان السكن *
                </label>
                <input
                  name="residence"
                  value={formData.residence}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('residence') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('residence') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('residence')}</p>
                )}
              </div>
            </div>
          </div>

          {/* معلومات الدراسة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الدراسة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المعلم *
                </label>
                <input
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('teacher') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('teacher') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('teacher')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الحلقة *
                </label>
                <input
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('group') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('group') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('group')}</p>
                )}
              </div>
            </div>
          </div>

          {/* معلومات التواصل */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات التواصل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="05xxxxxxxx"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('phoneNumber') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('phoneNumber') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('phoneNumber')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError('email') 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                )}
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 text-white rounded-md transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
              {isSubmitting 
                ? 'جاري الحفظ...' 
                : (student ? "تعديل الطالب" : "إضافة الطالب")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentFormWithYup;