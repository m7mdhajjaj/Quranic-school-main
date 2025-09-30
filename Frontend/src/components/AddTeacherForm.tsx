import React, { useState } from "react";

interface AddTeacherFormProps {
  onClose: () => void;
  onSuccess: (teacherData?: any) => void;
  teacher?: any; // وضع التعديل إن وجد
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
    age: teacher?.age || "",
    gender: teacher?.gender || "",
    residence: teacher?.residence || "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.idNumber ||
      !formData.phoneNumber
    ) {
      setError("الرجاء تعبئة جميع الحقول المطلوبة (*)");
      return;
    }

    setError("");

    // كلمة المرور = رقم الهوية
    const password = formData.idNumber;

    // رقم المعلم التلقائي
    const teacherId = Math.floor(Math.random() * 1000) + 1002;

    const teacherData = {
      ...formData,
      teacherId,
      password,
    };

    console.log("Teacher Data:", teacherData);
    onSuccess(teacherData);
    onClose();
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
              />
              <Input
                label="اسم العائلة *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <Input
                label="اسم الأب"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
              <Input
                label="اسم الجد"
                name="grandFatherName"
                value={formData.grandFatherName}
                onChange={handleChange}
              />
              <Input
                label="اسم الأم"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
              />
              <Input
                label="رقم الهوية *"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="تاريخ الميلاد"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
              <Input
                label="العمر"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الجنس
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">اختر الجنس</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
              <Input
                label="مكان السكن"
                name="residence"
                value={formData.residence}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* معلومات التواصل */}
          <Section title="معلومات التواصل">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="البريد الإلكتروني (اختياري)"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
              <Input
                label="رقم الهاتف *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
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
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {teacher ? "تعديل المعلم" : "إضافة المعلم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🔹 مكوّن إدخال
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
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
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
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
