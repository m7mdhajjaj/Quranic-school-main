import React, { useState, useCallback, useMemo, useEffect } from "react";
import { AlertCircle, X, Loader2, Check, User, Phone, Calendar, MapPin, Mail, CreditCard, ChevronRight, ChevronLeft, Users } from "lucide-react";
import { 
  validateTeacherWithYup, 
  validateTeacherFieldWithYup
} from "../../Validation/teacherValidation";
import type { TeacherFormData } from "../../Validation/teacherValidation";
import { createTeacher, updateTeacher, type Teacher } from "../../Api/teacherApi";
import { getAllGroups, type Group } from "../../Api/groupApi";

// دالة لتحويل التاريخ من الخادم إلى تنسيق input[type="date"]
const formatDateForInput = (dateValue?: string | Date): string => {
  if (!dateValue) return "";
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return "";
    
    // تحويل التاريخ إلى تنسيق YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('خطأ في تحويل التاريخ:', error);
    return "";
  }
};

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

interface Props {
  onClose: () => void;
  onSuccess: (teacherData?: Teacher | TeacherFormData) => void;
  teacher?: Teacher;
}

const EnhancedTeacherForm: React.FC<Props> = ({ onClose, onSuccess, teacher }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: teacher?.firstName || "",
    fatherName: teacher?.fatherName || "",
    grandFatherName: teacher?.grandFatherName || "",
    motherName: teacher?.motherName || "",
    lastName: teacher?.lastName || "",
    idNumber: teacher?.idNumber || "",
    birthDate: formatDateForInput(teacher?.birthDate),
    gender: teacher?.gender || "",
    residence: teacher?.residence || "",
    email: teacher?.email || "",
    phoneNumber: teacher?.phoneNumber || "",
    groupName: teacher?.groupName || "",
    groups: teacher?.groups || [], // إضافة حقل groups مرتبط بـ Backend
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // State للحلقات المتاحة
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const calculatedAge = useMemo(() => {
    return formData.birthDate ? calculateAge(formData.birthDate) : null;
  }, [formData.birthDate]);

  // جلب الحلقات المتاحة
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const result = await getAllGroups();
        if (result.success && result.data) {
          setAvailableGroups(result.data);
        }
      } catch (error) {
        console.error('خطأ في جلب الحلقات:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const isStep1Valid = useMemo(() => {
    const step1Fields = [
      'firstName', 'fatherName', 'grandFatherName', 'motherName', 
      'lastName', 'idNumber', 'birthDate', 'gender', 'residence'
    ];
    return step1Fields.every(field => formData[field as keyof typeof formData]?.toString().trim());
  }, [formData]);

  const isStep2Valid = useMemo(() => {
    const step2Fields = ['email', 'phoneNumber'];
    const requiredValid = step2Fields.every(field => formData[field as keyof typeof formData]?.toString().trim());
    const hasNoErrors = Object.keys(errors).length === 0;
    return requiredValid && hasNoErrors;
  }, [formData, errors]);

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

  const getFieldError = (fieldName: string): string | undefined => {
    return touchedFields.has(fieldName) ? errors[fieldName] : undefined;
  };

  // دالة للتعامل مع اختيار الحلقات المتعددة
  const handleGroupsChange = useCallback((groupId: string) => {
    setFormData(prev => {
      const currentGroups = prev.groups || [];
      let newGroups: string[];
      
      if (currentGroups.includes(groupId)) {
        // إزالة الحلقة إذا كانت محددة بالفعل
        newGroups = currentGroups.filter(id => id !== groupId);
      } else {
        // إضافة الحلقة إذا لم تكن محددة
        newGroups = [...currentGroups, groupId];
      }

      return {
        ...prev,
        groups: newGroups,
        // تحديث groupName ليكون أول حلقة مختارة أو فارغ
        groupName: newGroups.length > 0 ? newGroups[0] : ""
      };
    });
  }, []);

  const handleNextStep = () => {
    if (!isStep1Valid) {
      const step1Fields = [
        'firstName', 'fatherName', 'grandFatherName', 'motherName', 
        'lastName', 'idNumber', 'birthDate', 'gender', 'residence'
      ];
      setTouchedFields(prev => new Set([...prev, ...step1Fields]));
    } else {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!isStep2Valid) {
      const step2Fields = ['email', 'phoneNumber'];
      setTouchedFields(prev => new Set([...prev, ...step2Fields]));
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate form data first
      const dataToValidate = {
        ...formData,
        age: calculatedAge,
        password: !teacher ? formData.idNumber : undefined,
      };

      const result = await validateTeacherWithYup(dataToValidate, !teacher);

      if (!result.isValid) {
        setErrors(result.errors);
        setTouchedFields(new Set(Object.keys(formData)));
        setIsSubmitting(false);
        return;
      }

      // If validation passes, call API
      let apiResult;
      if (teacher && teacher._id) {
        // Update existing teacher
        apiResult = await updateTeacher(teacher._id, result.data!);
      } else {
        // Create new teacher
        apiResult = await createTeacher(result.data!);
      }

      if (!apiResult.success) {
        setErrors({ general: apiResult.message || 'حدث خطأ أثناء حفظ البيانات' });
        setIsSubmitting(false);
        return;
      }

      setErrors({});
      setShowSuccess(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await onSuccess(apiResult.data!);
      setTimeout(onClose, 300);
      
    } catch (error) {
      console.error("Error saving teacher:", error);
      setErrors({ general: "حدث خطأ أثناء حفظ البيانات" });
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "المعلومات الشخصية", icon: User },
    { number: 2, title: "التواصل والإعدادات", icon: Phone }
  ];

  return (
    <div
      className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-blue-600" size={28} />
                {teacher ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {teacher
                  ? "قم بتحديث معلومات المعلم"
                  : "أدخل بيانات المعلم الكاملة"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              aria-label="إغلاق">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white shadow-lg"
                        : currentStep > step.number
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep === step.number
                          ? "bg-white text-blue-600"
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
                    className={`${
                      currentStep > step.number
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
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">يرجى إصلاح الأخطاء التالية:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm ml-6">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <User className="text-blue-600" size={20} />
                  الاسم الكامل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("firstName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("firstName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("firstName")}</span>
                      </div>
                    )}
                  </div>
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
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("fatherName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("fatherName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("fatherName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الجد <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="grandFatherName"
                      type="text"
                      value={formData.grandFatherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("grandFatherName")}
                      placeholder="أدخل اسم الجد"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("grandFatherName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("grandFatherName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("grandFatherName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الأم <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="motherName"
                      type="text"
                      value={formData.motherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("motherName")}
                      placeholder="أدخل اسم الأم"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("motherName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("motherName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("motherName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم العائلة <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="أدخل اسم العائلة"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("lastName")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("lastName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("lastName")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <CreditCard className="text-blue-600" size={20} />
                  المعلومات الشخصية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <CreditCard size={14} className="text-gray-500" />
                      رقم الهوية <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="idNumber"
                      type="text"
                      value={formData.idNumber || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("idNumber")}
                      placeholder="أدخل رقم الهوية"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("idNumber")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("idNumber") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("idNumber")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-500" />
                      تاريخ الميلاد <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="birthDate"
                      type="date"
                      value={formData.birthDate || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("birthDate")}
                      title="اختر تاريخ الميلاد"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("birthDate")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("birthDate") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("birthDate")}</span>
                      </div>
                    )}
                  </div>
                  {calculatedAge && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-500" />
                        العمر
                      </label>
                      <div
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                        title={`العمر المحسوب: ${calculatedAge} سنة`}>
                        {calculatedAge} سنة
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      الجنس <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("gender")}
                      title="اختر الجنس"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("gender")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}>
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                    {getFieldError("gender") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("gender")}</span>
                      </div>
                    )}
                  </div>
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
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("residence")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <Phone className="text-green-600" size={20} />
                  معلومات التواصل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Mail size={14} className="text-gray-500" />
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="example@email.com"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("email")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("email") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("email")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone size={14} className="text-gray-500" />
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("phoneNumber")}
                      placeholder="05xxxxxxxx"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("phoneNumber")
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("phoneNumber") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("phoneNumber")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* حقل الحلقات */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <Users className="text-purple-600" size={20} />
                  الحلقات المسؤول عنها
                </h3>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Users size={14} className="text-gray-500" />
                    اختر الحلقات (اختياري)
                  </label>
                  <div className="relative">
                    {loadingGroups ? (
                      <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span>جاري تحميل الحلقات...</span>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                        {availableGroups.length === 0 ? (
                          <div className="px-3 py-2.5 text-gray-500 text-center">
                            لا توجد حلقات متاحة
                          </div>
                        ) : (
                          availableGroups.map((group) => (
                            <label
                              key={group._id}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={
                                  formData.groups?.includes(group._id) || false
                                }
                                onChange={() => handleGroupsChange(group._id)}
                                className="h-4 w-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {group.name}
                                </div>
                                {group.description && (
                                  <div className="text-xs text-gray-500">
                                    {group.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    يمكن للمعلم أن يكون مسؤولاً عن عدة حلقات أو لا يكون مسؤولاً
                    عن أي حلقة
                  </div>
                  {formData.groups && formData.groups.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        الحلقات المختارة:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.groups.map((groupId) => {
                          const group = availableGroups.find(
                            (g) => g._id === groupId
                          );
                          return group ? (
                            <span
                              key={groupId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                              {group.name}
                              <button
                                type="button"
                                onClick={() => handleGroupsChange(groupId)}
                                className="ml-1 text-purple-600 hover:text-purple-800 focus:outline-none"
                                title={`إزالة ${group.name} من القائمة`}>
                                <X size={12} />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50">
                <ChevronRight size={18} />
                <span>السابق</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50">
              إلغاء
            </button>

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStep1Valid}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <span>التالي</span>
                <ChevronLeft size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !isStep2Valid}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{teacher ? "تعديل المعلم" : "إضافة المعلم"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTeacherForm;
