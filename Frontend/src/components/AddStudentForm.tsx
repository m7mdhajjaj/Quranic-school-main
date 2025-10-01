import React, { useState } from "react";
import { 
  validateStudentWithYup, 
  normalizeGender, 
  calculateAge,
  type StudentFormData
} from "../utils/studentValidationYup";

// Interface for form data (simpler than full StudentFormData)
interface FormData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  lastName: string;
  idNumber: string;
  birthDate: string;
  gender: "ذكر" | "أنثى" | "male" | "female" | "Male" | "Female" | "";
  residence: string;
  teacher: string;
  group: string;
  email: string;
  phoneNumber: string;
}

interface AddStudentFormProps {
  onClose: () => void;
  onSuccess: (studentData: StudentFormData) => void;
  student?: Partial<FormData>;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({
  onClose,
  onSuccess,
  student,
}) => {
  const [formData, setFormData] = useState<FormData>({
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

  // دالة للحصول على خطأ المجال
  const getFieldError = (fieldName: string): string => {
    return errors[fieldName] || "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // تطبيع الجنس تلقائياً
    if (name === 'gender') {
      processedValue = normalizeGender(value);
    }
    
    const updatedData = {
      ...formData,
      [name]: processedValue,
      // حساب العمر تلقائياً عند تغيير تاريخ الميلاد
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

    // إضافة كلمة المرور = رقم الهوية للطلاب الجدد
    const dataToValidate: StudentFormData = {
      ...formData,
      password: !student ? formData.idNumber : undefined, // فقط للطلاب الجدد
      age: calculateAge(formData.birthDate),
      gender: normalizeGender(formData.gender) as "ذكر" | "أنثى",
      avatar: null,
      isActive: true,
      lastSeen: new Date(),
    };

    // تشغيل Yup validation
    const validationResult = await validateStudentWithYup(dataToValidate, !student);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setIsSubmitting(false);
      return;
    }

    // تنظيف الأخطاء عند نجاح الـ validation
    setErrors({});

    // استخدام البيانات المتحققة من Yup
    const finalData = validationResult.data!;

    console.log("Student data to save:", finalData);

    try {
      await onSuccess(finalData);
      onClose();
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Section title="المعلومات الشخصية">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="الاسم الأول *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={getFieldError('firstName')}
              />
              <Input
                label="اسم الأب *"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                error={getFieldError('fatherName')}
              />
              <Input
                label="اسم الجد *"
                name="grandFatherName"
                value={formData.grandFatherName}
                onChange={handleChange}
                required
                error={getFieldError('grandFatherName')}
              />
              <Input
                label="اسم الأم *"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                required
                error={getFieldError('motherName')}
              />
              <Input
                label="اسم العائلة *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={getFieldError('lastName')}
              />
              <Input
                label="رقم الهوية *"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                placeholder="9 أرقام"
                error={getFieldError('idNumber')}
              />
              <Input
                label="تاريخ الميلاد *"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                error={getFieldError('birthDate')}
              />
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
              <Input
                label="مكان السكن *"
                name="residence"
                value={formData.residence}
                onChange={handleChange}
                required
                error={getFieldError('residence')}
              />
            </div>
          </Section>

          {/* معلومات الدراسة */}
          <Section title="معلومات الدراسة">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="اسم المعلم *"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                required
                error={getFieldError('teacher')}
              />
              <Input
                label="اسم الحلقة *"
                name="group"
                value={formData.group}
                onChange={handleChange}
                required
                error={getFieldError('group')}
              />
            </div>
          </Section>

          {/* معلومات التواصل */}
          <Section title="معلومات التواصل">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="رقم الهاتف *"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="05xxxxxxxx"
                error={getFieldError('phoneNumber')}
              />
              <Input
                label="البريد الإلكتروني (اختياري)"
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                error={getFieldError('email')}
              />
            </div>
          </Section>

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

// 🔹 مكوّنات مساعدة لإعادة الاستخدام
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
        error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-blue-500'
      }`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

export default AddStudentForm;
