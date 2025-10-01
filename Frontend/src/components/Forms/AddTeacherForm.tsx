import React, { useState, useCallback } from "react";
import { 
  validateTeacherWithYup, 
  validateTeacherFieldWithYup, 
  formatBirthDateForBackend 
} from "../../Validation/teacherValidation";
import type { TeacherFormData } from "../../Validation/teacherValidation";
import { createTeacher, updateTeacher, type Teacher } from "../../Api/teacherApi";

interface AddTeacherFormProps {
  onClose: () => void;
  onSuccess: (teacherData?: Teacher | TeacherFormData) => void;
  teacher?: Teacher;
}

const AddTeacherForm: React.FC<AddTeacherFormProps> = ({
  onClose,
  onSuccess,
  teacher,
}) => {
  const [formData, setFormData] = useState({
    firstName: teacher?.firstName || "",
    lastName: teacher?.lastName || "",
    fatherName: teacher?.fatherName || "",
    grandFatherName: teacher?.grandFatherName || "",
    motherName: teacher?.motherName || "",
    idNumber: teacher?.idNumber || "",
    email: teacher?.email || "",
    phoneNumber: teacher?.phoneNumber || "",
    birthDate: teacher?.birthDate || "",
    age: teacher?.age?.toString() || "",
    gender: teacher?.gender || "",
    residence: teacher?.residence || "",
    groupName: teacher?.groupName || "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback(async (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    
    // Validate field on blur
    const fieldError = await validateTeacherFieldWithYup(
      fieldName, 
      formData[fieldName as keyof typeof formData], 
      formData,
      !teacher // isNewTeacher
    );
    
    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldError }));
    }
  }, [formData, teacher]);

  const getFieldError = (fieldName: string): string | null => {
    return touchedFields.has(fieldName) ? errors[fieldName] || null : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare form data for validation
      const dataToValidate = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        // Format birthDate for backend if provided
        birthDate: formData.birthDate ? formatBirthDateForBackend(formData.birthDate) : null,
      };

      // Validate all fields
      const validationResult = await validateTeacherWithYup(
        dataToValidate,
        !teacher // isNewTeacher
      );

      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        // Mark all fields with errors as touched
        setTouchedFields(new Set(Object.keys(validationResult.errors)));
        setIsSubmitting(false);
        return;
      }

      // If validation passes, prepare final data and call API
      const teacherData: TeacherFormData = validationResult.data!;
      
      let result;
      if (teacher) {
        // Update existing teacher
        result = await updateTeacher(teacher._id, teacherData);
      } else {
        // Create new teacher
        result = await createTeacher(teacherData);
      }

      if (!result.success) {
        setErrors({ general: result.message || 'حدث خطأ أثناء حفظ البيانات' });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Teacher saved successfully:", result.data);
      onSuccess(result.data);
      onClose();
    } catch (error) {
      console.error('Validation error:', error);
      setErrors({ general: 'حدث خطأ في التحقق من البيانات' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 mx-4">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {teacher ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
            ×
          </button>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
          {/* المعلومات الشخصية */}
          <Section title="المعلومات الشخصية">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithValidation
                label="الاسم الأول *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("firstName")}
                required
              />
              <InputWithValidation
                label="اسم العائلة *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("lastName")}
                required
              />
              <InputWithValidation
                label="اسم الأب"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("fatherName")}
              />
              <InputWithValidation
                label="اسم الجد"
                name="grandFatherName"
                value={formData.grandFatherName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("grandFatherName")}
              />
              <InputWithValidation
                label="اسم الأم"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("motherName")}
              />
              <InputWithValidation
                label="رقم الهوية"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("idNumber")}
                placeholder="9 أرقام"
              />
              <InputWithValidation
                label="تاريخ الميلاد *"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("birthDate")}
                required
              />
              <InputWithValidation
                label="العمر"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("age")}
                placeholder="يتم حسابه تلقائياً"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الجنس
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={() => handleBlur("gender")}
                  title="اختر الجنس"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    getFieldError("gender")
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}>
                  <option value="">اختر الجنس</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
                {getFieldError("gender") && (
                  <div className="text-red-600 text-xs mt-1">
                    {getFieldError("gender")}
                  </div>
                )}
              </div>
              <InputWithValidation
                label="مكان السكن"
                name="residence"
                value={formData.residence}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("residence")}
              />
            </div>
          </Section>

          {/* معلومات التواصل */}
          <Section title="معلومات التواصل">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithValidation
                label="البريد الإلكتروني *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("email")}
                type="email"
                required
                placeholder="example@email.com"
              />
              <InputWithValidation
                label="رقم الهاتف *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={getFieldError("phoneNumber")}
                required
                placeholder="05xxxxxxxx"
              />
            </div>
          </Section>

          {/* أزرار */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {teacher ? "تعديل المعلم" : "إضافة المعلم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🔹 مكوّن إدخال مع التحقق
const InputWithValidation = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (fieldName: string) => void;
  error: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
      onBlur={() => onBlur(name)}
      required={required}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-red-300 focus:ring-red-500 bg-red-50'
          : 'border-gray-300 focus:ring-blue-500'
      }`}
    />
    {error && (
      <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
        <span>⚠️</span>
        {error}
      </div>
    )}
  </div>
);

// 🔹 مكوّن قسم
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

export default AddTeacherForm;
