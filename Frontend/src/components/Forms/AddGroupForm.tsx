import React, { useState } from "react";

interface AddGroupFormProps {
  onClose: () => void;
  onSuccess: (groupData?: any) => void;
  group?: any; // في حال التعديل
}

const AddGroupForm: React.FC<AddGroupFormProps> = ({
  onClose,
  onSuccess,
  group,
}) => {
  // قائمة المعلمين (تقدر تجيبها لاحقًا من API أو من الأب)
  const teachersList = [
    "أ. محمد أحمد",
    "أ. خالد يوسف",
    "أ. علي محمود",
    "أ. عمر حسن",
    "أ. أحمد إبراهيم",
  ];

  const [formData, setFormData] = useState({
    name: group?.name || "",
    teacher: group?.teacher || "",
    capacity: group?.capacity?.toString() || "",
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

    if (!formData.name || !formData.teacher) {
      setError("الرجاء تعبئة اسم الحلقة واختيار اسم المعلم (*)");
      return;
    }

    setError("");

    const groupData = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    };

    console.log("Group Data:", groupData);
    onSuccess(groupData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 mx-4">
        {/* رأس الفورم */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {group ? "تعديل بيانات الحلقة" : "إضافة حلقة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
            ×
          </button>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات الحلقة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              معلومات الحلقة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اسم الحلقة */}
              <Input
                label="اسم الحلقة *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="مثال: حلقة الأولى"
              />

              {/* اختيار المعلم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المعلم *
                </label>
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">اختر المعلم</option>
                  {teachersList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* السعة القصوى */}
              <Input
                label="السعة القصوى"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="عدد الطلاب الأقصى"
              />
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
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {group ? "تعديل الحلقة" : "إضافة الحلقة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🔹 مكوّن إدخال عام
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

export default AddGroupForm;
