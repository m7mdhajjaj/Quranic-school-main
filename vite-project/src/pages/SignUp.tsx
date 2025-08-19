import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

interface FormData {
  firstName: string;
  fatherName: string;
  motherName: string;
  familyName: string;
  idNumber: string;
  gender: string;
  dateOfBirth: string;
  role: string;
  courseName: string;
  teacherName: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  // Initialize AOS animation library
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    fatherName: "",
    motherName: "",
    familyName: "",
    idNumber: "",
    gender: "",
    dateOfBirth: "",
    role: "",
    courseName: "أزهار الحمد", // Default value
    teacherName: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user makes changes
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName) newErrors.firstName = "الاسم مطلوب";
    if (!formData.fatherName) newErrors.fatherName = "اسم الأب مطلوب";
    if (!formData.motherName) newErrors.motherName = "اسم الأم مطلوب";
    if (!formData.familyName) newErrors.familyName = "العائلة مطلوبة";
    if (!formData.idNumber) newErrors.idNumber = "رقم الهوية مطلوب";
    if (!formData.gender) newErrors.gender = "الجنس مطلوب";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "تاريخ الميلاد مطلوب";
    if (!formData.role) newErrors.role = "الدور مطلوب";
    if (!formData.courseName) newErrors.courseName = "اسم الدورة مطلوب";

    // Teacher name is required only if role is student
    if (formData.role === "طالب" && !formData.teacherName) {
      newErrors.teacherName = "اسم المعلم مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Form submitted:", formData);
      setSubmitSuccess(true);

      // Redirect to home page after successful submission
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4" data-aos="fade-up">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">
              التسجيل في المدرسة القرآنية
            </h2>
          </div>

          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">تم التسجيل بنجاح!</h3>
              <p className="text-gray-600">سيتم توجيهك للصفحة الرئيسية...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم - First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-gray-700 font-medium mb-2">
                    الاسم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* اسم الاب - Father's Name */}
                <div>
                  <label
                    htmlFor="fatherName"
                    className="block text-gray-700 font-medium mb-2">
                    اسم الأب <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.fatherName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.fatherName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fatherName}
                    </p>
                  )}
                </div>

                {/* اسم الام - Mother's Name */}
                <div>
                  <label
                    htmlFor="motherName"
                    className="block text-gray-700 font-medium mb-2">
                    اسم الأم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.motherName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.motherName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.motherName}
                    </p>
                  )}
                </div>

                {/* العائله - Family Name */}
                <div>
                  <label
                    htmlFor="familyName"
                    className="block text-gray-700 font-medium mb-2">
                    العائلة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="familyName"
                    name="familyName"
                    value={formData.familyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.familyName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.familyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.familyName}
                    </p>
                  )}
                </div>

                {/* رقم الهويه - ID Number */}
                <div>
                  <label
                    htmlFor="idNumber"
                    className="block text-gray-700 font-medium mb-2">
                    رقم الهوية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.idNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.idNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.idNumber}
                    </p>
                  )}
                </div>

                {/* الجنس - Gender */}
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-gray-700 font-medium mb-2">
                    الجنس <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}>
                    <option value="">اختر الجنس</option>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>

                {/* تاريخ الميلاد - Date of Birth */}
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-gray-700 font-medium mb-2">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                {/* قائمه معلم او طالب - Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-gray-700 font-medium mb-2">
                    الدور <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.role ? "border-red-500" : "border-gray-300"
                    }`}>
                    <option value="">اختر الدور</option>
                    <option value="معلم">معلم</option>
                    <option value="طالب">طالب</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                {/* قائمه اسم الدوره - Course Name */}
                <div>
                  <label
                    htmlFor="courseName"
                    className="block text-gray-700 font-medium mb-2">
                    اسم الدورة <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="courseName"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.courseName ? "border-red-500" : "border-gray-300"
                    }`}>
                    <option value="أزهار الحمد">أزهار الحمد</option>
                    {/* يمكن إضافة المزيد من الدورات هنا */}
                  </select>
                  {errors.courseName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.courseName}
                    </p>
                  )}
                </div>

                {/* اسم المعلم - Teacher's Name */}
                <div className={formData.role !== "طالب" ? "opacity-50" : ""}>
                  <label
                    htmlFor="teacherName"
                    className="block text-gray-700 font-medium mb-2">
                    اسم المعلم{" "}
                    {formData.role === "طالب" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    id="teacherName"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    disabled={formData.role !== "طالب"}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.teacherName ? "border-red-500" : "border-gray-300"
                    }`}>
                    <option value="">اختر المعلم</option>
                    <option value="أحمد محمد">أحمد محمد</option>
                    <option value="محمد علي">محمد علي</option>
                    <option value="فاطمة أحمد">فاطمة أحمد</option>
                    <option value="نور الهدى">نور الهدى</option>
                  </select>
                  {errors.teacherName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.teacherName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-green-600 text-white font-medium rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التسجيل...
                    </span>
                  ) : (
                    "تسجيل"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-600 font-medium hover:underline">
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
