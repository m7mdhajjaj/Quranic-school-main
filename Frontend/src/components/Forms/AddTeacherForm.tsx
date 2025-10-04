import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  AlertCircle,
  X,
  Loader2,
  Check,
  User,
  Phone,
  Calendar,
  MapPin,
  Mail,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Users,
  BookOpen,
} from "lucide-react";
import {
  validateTeacherWithYup,
  validateTeacherFieldWithYup,
} from "../../Validation/teacherValidation";
import type { TeacherFormData } from "../../Validation/teacherValidation";
import {
  createTeacher,
  updateTeacher,
  type Teacher,
} from "../../Api/teacherApi";
import { getAllGroups, type Group } from "../../Api/groupApi";

// دالة لتحويل التاريخ من الخادم إلى تنسيق input[type="date"]
const formatDateForInput = (dateValue?: string | Date): string => {
  if (!dateValue) return "";

  try {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return "";

    // تحويل التاريخ إلى تنسيق YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("خطأ في تحويل التاريخ:", error);
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

const EnhancedTeacherForm: React.FC<Props> = ({
  onClose,
  onSuccess,
  teacher,
}) => {
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
    groups: teacher?.groups || [], // الحلقات التي يدرسها المعلم
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasRetryableError, setHasRetryableError] = useState(false);

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
        console.error("خطأ في جلب الحلقات:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const isStep1Valid = useMemo(() => {
    const step1Fields = [
      "firstName",
      "fatherName",
      "grandFatherName",
      "motherName",
      "lastName",
      "idNumber",
      "birthDate",
      "gender",
      "residence",
    ];
    return step1Fields.every((field) =>
      formData[field as keyof typeof formData]?.toString().trim()
    );
  }, [formData]);

  const isStep2Valid = useMemo(() => {
    const step2Fields = ["email", "phoneNumber"];
    const requiredValid = step2Fields.every((field) =>
      formData[field as keyof typeof formData]?.toString().trim()
    );
    const hasNoErrors = Object.keys(errors).length === 0;
    return requiredValid && hasNoErrors;
  }, [formData, errors]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      let processedValue = value;

      if (name === "phoneNumber") {
        processedValue = value.replace(/\D/g, "").slice(0, 10);
      }

      if (name === "idNumber") {
        // السماح بالأرقام فقط وحد أقصى 9 أرقام
        processedValue = value.replace(/\D/g, "").slice(0, 9);

        // التحقق الفوري من طول رقم الهوية
        if (processedValue.length > 0 && processedValue.length < 9) {
          setErrors((prev) => ({
            ...prev,
            idNumber: `رقم الهوية يجب أن يتكون من 9 أرقام (${processedValue.length}/9)`,
          }));
        } else if (processedValue.length === 9) {
          // إزالة خطأ رقم الهوية إذا كان الطول صحيحاً
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (
              newErrors.idNumber &&
              newErrors.idNumber.includes("يجب أن يتكون من 9 أرقام")
            ) {
              delete newErrors.idNumber;
            }
            return newErrors;
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];

          // إزالة الخطأ العام إذا تم تصحيح الحقل الخطأ وإعادة تعيين حالة إعادة المحاولة
          if (
            newErrors.general &&
            (newErrors.general.includes("تصحيح") ||
              newErrors.general.includes("المحاولة"))
          ) {
            delete newErrors.general;
          }

          // تحقق من وجود أخطاء أخرى قبل إعادة تعيين حالة إعادة المحاولة
          const remainingErrors = Object.keys(newErrors).filter(
            (key) => key !== "general"
          );
          if (remainingErrors.length === 0 && hasRetryableError) {
            setHasRetryableError(false);
          }

          return newErrors;
        });
      }
    },
    [errors, hasRetryableError]
  );

  const handleBlur = useCallback(
    async (fieldName: string) => {
      setTouchedFields((prev) => new Set(prev).add(fieldName));

      // Validate field on blur
      const fieldError = await validateTeacherFieldWithYup(
        fieldName,
        formData[fieldName as keyof typeof formData],
        formData,
        !teacher // isNewTeacher
      );

      if (fieldError) {
        setErrors((prev) => ({ ...prev, [fieldName]: fieldError }));
      }
    },
    [formData, teacher]
  );

  const getFieldError = (fieldName: string): string | undefined => {
    return touchedFields.has(fieldName) ? errors[fieldName] : undefined;
  };

  // دالة للتعامل مع اختيار حلقة واحدة فقط
  const handleGroupsChange = useCallback((group: Group) => {
    setFormData((prev) => {
      const currentGroups = prev.groups || [];

      // التحقق من وجود الحلقة في المصفوفة الحالية
      const existingIndex = currentGroups.findIndex((g) => g.id === group._id);

      let newGroups: Array<{ id: string; name: string; number: number }>;
      if (existingIndex !== -1) {
        // إزالة الحلقة إذا كانت موجودة (إلغاء الاختيار)
        newGroups = [];
      } else {
        // إضافة حلقة واحدة فقط (استبدال أي حلقة موجودة)
        const groupData = {
          id: group._id,
          name: group.name,
          number: 1,
        };
        newGroups = [groupData]; // حلقة واحدة فقط
      }

      return {
        ...prev,
        groups: newGroups,
      };
    });
  }, []);

  const handleNextStep = () => {
    if (!isStep1Valid) {
      const step1Fields = [
        "firstName",
        "fatherName",
        "grandFatherName",
        "motherName",
        "lastName",
        "idNumber",
        "birthDate",
        "gender",
        "residence",
      ];
      setTouchedFields((prev) => new Set([...prev, ...step1Fields]));
    } else {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!isStep2Valid && !hasRetryableError) {
      const step2Fields = ["email", "phoneNumber"];
      setTouchedFields((prev) => new Set([...prev, ...step2Fields]));
      return;
    }

    setIsSubmitting(true);

    // مسح الأخطاء السابقة عند بدء محاولة جديدة
    setErrors({});

    // إعادة تعيين حالة الخطأ القابل للتصحيح فقط عند بداية محاولة جديدة
    setHasRetryableError(false);

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
      try {
        if (teacher && teacher._id) {
          // Update existing teacher
          apiResult = await updateTeacher(teacher._id, result.data!);
        } else {
          // Create new teacher
          apiResult = await createTeacher(result.data!);
        }
      } catch (apiError: unknown) {
        // معالجة أخطاء API بشكل مفصل
        console.error("API Error:", apiError);
        setIsSubmitting(false); // تأكد من إيقاف loading

        const error = apiError as {
          response?: { data?: { message?: string; field?: string } };
        };
        if (error.response?.data?.message) {
          const errorMessage = error.response.data.message;

          // معالجة أخطاء التكرار للحقول الحساسة (النظام الموحد الجديد)
          if (
            errorMessage.includes('رقم الهوية') && 
            (errorMessage.includes('مُستخدم بالفعل') || errorMessage.includes('موجود بالفعل'))
          ) {
            // استخراج نوع المستخدم الموجود من الرسالة
            const userType = errorMessage.includes('لطالب') ? 'طالب' :
                           errorMessage.includes('لمعلم') ? 'معلم' :
                           errorMessage.includes('لمدير') ? 'مدير' : 'مستخدم آخر';
            
            setErrors({
              idNumber: `⚠️ رقم الهوية موجود بالفعل لدى ${userType} في النظام - يرجى استخدام رقم هوية مختلف`,
              general: '🔄 يمكنك تعديل رقم الهوية والضغط على "المحاولة مرة أخرى" لحفظ البيانات',
            });
            setHasRetryableError(true);
          }
          else if (
            errorMessage.includes('رقم الهاتف') && 
            (errorMessage.includes('مُستخدم بالفعل') || errorMessage.includes('موجود بالفعل'))
          ) {
            // استخراج نوع المستخدم الموجود من الرسالة
            const userType = errorMessage.includes('لطالب') ? 'طالب' :
                           errorMessage.includes('لمعلم') ? 'معلم' :
                           errorMessage.includes('لمدير') ? 'مدير' : 'مستخدم آخر';
            
            setErrors({
              phoneNumber: `⚠️ رقم الهاتف موجود بالفعل لدى ${userType} في النظام - يرجى استخدام رقم هاتف مختلف`,
              general: '🔄 يمكنك تعديل رقم الهاتف والضغط على "المحاولة مرة أخرى" لحفظ البيانات',
            });
            setHasRetryableError(true);
          }
          else if (
            errorMessage.includes('البريد الإلكتروني') && 
            (errorMessage.includes('مُستخدم بالفعل') || errorMessage.includes('موجود بالفعل'))
          ) {
            // استخراج نوع المستخدم الموجود من الرسالة
            const userType = errorMessage.includes('لطالب') ? 'طالب' :
                           errorMessage.includes('لمعلم') ? 'معلم' :
                           errorMessage.includes('لمدير') ? 'مدير' : 'مستخدم آخر';
            
            setErrors({
              email: `⚠️ البريد الإلكتروني موجود بالفعل لدى ${userType} في النظام - يرجى استخدام بريد إلكتروني مختلف`,
              general: '🔄 يمكنك تعديل البريد الإلكتروني والضغط على "المحاولة مرة أخرى" لحفظ البيانات',
            });
            setHasRetryableError(true);
          }
          // معالجة أخطاء التحقق من صحة البيانات
          else if (errorMessage.includes("التحقق من البيانات")) {
            const fieldErrors: Record<string, string> = {};

            // استخراج أخطاء الحقول الفردية من رسالة الخطأ
            if (errorMessage.includes("رقم الهوية")) {
              fieldErrors.idNumber = "رقم الهوية يجب أن يتكون من 9 أرقام فقط";
            }
            if (errorMessage.includes("رقم الهاتف")) {
              fieldErrors.phoneNumber =
                "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
            }
            if (errorMessage.includes("البريد الإلكتروني")) {
              fieldErrors.email = "البريد الإلكتروني غير صحيح";
            }

            setErrors({
              ...fieldErrors,
              general: "يرجى تصحيح الحقول المؤشرة والمحاولة مرة أخرى",
            });
            setHasRetryableError(true);
          } else {
            setErrors({ general: errorMessage });
            setHasRetryableError(false);
          }
        } else {
          setErrors({ general: "حدث خطأ في الاتصال مع الخادم" });
          setHasRetryableError(false);
        }
        return;
      }

      if (!apiResult.success) {
        // التحقق من رسائل خطأ التوافق
        const message = apiResult.message || "حدث خطأ أثناء حفظ البيانات";
        if (message.includes("idNumber") || message.includes("رقم الهوية")) {
          setErrors({
            idNumber: "رقم الهوية موجود بالفعل في النظام - يرجى تغييره",
            general: "يرجى تصحيح رقم الهوية والمحاولة مرة أخرى",
          });
          setHasRetryableError(true);
        } else if (
          message.includes("phoneNumber") ||
          message.includes("رقم الهاتف")
        ) {
          setErrors({
            phoneNumber: "رقم الهاتف موجود بالفعل في النظام - يرجى تغييره",
            general: "يرجى تصحيح رقم الهاتف والمحاولة مرة أخرى",
          });
          setHasRetryableError(true);
        } else if (
          message.includes("email") ||
          message.includes("البريد الإلكتروني")
        ) {
          setErrors({
            email: "البريد الإلكتروني موجود بالفعل في النظام - يرجى تغييره",
            general: "يرجى تصحيح البريد الإلكتروني والمحاولة مرة أخرى",
          });
          setHasRetryableError(true);
        } else {
          setErrors({ general: message });
          setHasRetryableError(false);
        }
        setIsSubmitting(false);
        return;
      }

      setErrors({});
      setHasRetryableError(false);
      setShowSuccess(true);

      await new Promise((resolve) => setTimeout(resolve, 800));

      await onSuccess(apiResult.data!);
      setTimeout(onClose, 300);
    } catch (error: unknown) {
      console.error("Unexpected error saving teacher:", error);

      // معالجة الأخطاء غير المتوقعة
      let errorMessage = "حدث خطأ غير متوقع أثناء حفظ البيانات";

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setErrors({ general: errorMessage });
      setIsSubmitting(false);

      // عدم إغلاق النموذج إذا كان الخطأ قابلاً للتصحيح
      if (!hasRetryableError) {
        // يمكن إضافة منطق إضافي هنا للأخطاء غير القابلة للتصحيح
      }
    }
  };

  const steps = [
    { number: 1, title: "المعلومات الشخصية", icon: User },
    { number: 2, title: "التواصل والإعدادات", icon: Phone },
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
          <div className="mx-6 mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-fadeIn shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 opacity-30 animate-pulse"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-md">
                <Check className="text-white" size={20} />
              </div>
              <div>
                <span className="font-bold text-lg">
                  ✨ تم حفظ البيانات بنجاح! ✨
                </span>
                <p className="text-sm text-emerald-700 mt-1">
                  جميع المعلومات محفوظة في قاعدة البيانات
                </p>
              </div>
            </div>
          </div>
        )}

        {Object.keys(errors).length > 0 && !showSuccess && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-lg animate-fadeIn ${
              hasRetryableError
                ? "bg-orange-50 border border-orange-200 text-orange-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">
                {hasRetryableError
                  ? "يرجى تصحيح البيانات والمحاولة مرة أخرى:"
                  : "يرجى إصلاح الأخطاء التالية:"}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm ml-6">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
            {hasRetryableError && (
              <div className="mt-3 p-2 bg-orange-100 rounded text-sm">
                💡 <strong>ملاحظة:</strong> يمكنك تعديل البيانات المطلوبة والضغط
                على "المحاولة مرة أخرى" دون فقدان باقي البيانات المدخلة.
              </div>
            )}
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
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
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
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
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

              {/* حقل الحلقات المحسن */}
              <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                      <Users className="text-white" size={24} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-md"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-1">
                      الحلقة المسؤول عنها
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      اختر الحلقة الواحدة التي سيكون المعلم مسؤولاً عنها
                    </p>
                  </div>
                  <div className="text-sm text-purple-600 font-bold px-3 py-1 bg-white rounded-full border border-purple-200 shadow-sm">
                    {formData.groups?.length || 0} حلقة
                  </div>
                </div>
                <div className="space-y-4">
                  {loadingGroups ? (
                    <div className="w-full px-6 py-8 bg-white/80 backdrop-blur-sm border-2 border-dashed border-purple-300 rounded-2xl text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-r-purple-400 rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-600 font-bold text-lg mb-1">
                            جاري تحميل الحلقات
                          </p>
                          <p className="text-purple-500 text-sm">
                            يرجى الانتظار...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 shadow-inner overflow-hidden">
                      {availableGroups.length === 0 ? (
                        <div className="px-8 py-12 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Users className="text-purple-400" size={40} />
                          </div>
                          <h4 className="text-lg font-bold text-gray-700 mb-2">
                            لا توجد حلقات متاحة
                          </h4>
                          <p className="text-sm text-gray-500">
                            سيتم إضافة الحلقات من قبل الإدارة لاحقاً
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          <div className="p-4 space-y-2">
                            {availableGroups.map((group) => (
                              <label
                                key={group._id}
                                className="group flex items-center gap-4 px-4 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 rounded-xl border-2 border-transparent hover:border-purple-200 hover:shadow-md transform hover:-translate-y-1 animate-fade-in-up">
                                <div className="relative flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={
                                      formData.groups?.some(
                                        (g) => g.id === group._id
                                      ) || false
                                    }
                                    onChange={() => handleGroupsChange(group)}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-6 h-6 rounded-xl border-3 transition-all duration-300 flex items-center justify-center shadow-lg ${
                                      formData.groups?.some(
                                        (g) => g.id === group._id
                                      )
                                        ? "bg-gradient-to-br from-purple-500 to-indigo-500 border-purple-500 shadow-purple-200 scale-110"
                                        : "border-gray-300 group-hover:border-purple-400 bg-white group-hover:shadow-purple-100"
                                    }`}>
                                    {formData.groups?.some(
                                      (g) => g.id === group._id
                                    ) && (
                                      <Check
                                        className="text-white animate-in zoom-in duration-300"
                                        size={16}
                                      />
                                    )}
                                  </div>
                                  {formData.groups?.some(
                                    (g) => g.id === group._id
                                  ) && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl opacity-20 animate-pulse"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h5 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                      {group.name}
                                    </h5>
                                    <div
                                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        formData.groups?.some(
                                          (g) => g.id === group._id
                                        )
                                          ? "bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-md"
                                          : "bg-gray-300 group-hover:bg-purple-300"
                                      }`}></div>
                                  </div>
                                  {group.description && (
                                    <p className="text-xs text-gray-600 group-hover:text-purple-600 transition-colors line-clamp-2">
                                      {group.description}
                                    </p>
                                  )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                                  <ChevronRight
                                    className="text-purple-500"
                                    size={20}
                                  />
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(!formData.groups || formData.groups.length === 0) && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center animate-pulse">
                          <Users className="text-white" size={32} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-700 mb-1">
                            لم يتم اختيار أي حلقة
                          </h4>
                          <p className="text-sm text-gray-600">
                            يمكن للمعلم أن يكون مسؤولاً عن حلقة واحدة فقط أو لا
                            يكون مسؤولاً عن أي حلقة
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            اختر من القائمة أعلاه لإضافة حلقة واحدة
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.groups && formData.groups.length > 0 && (
                    <div className="mt-6 p-6 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-purple-200 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Check className="text-white" size={18} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              الحلقة المختارة
                            </h4>
                            <p className="text-sm text-gray-600">
                              المعلم مسؤول عن هذه الحلقة
                            </p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-bold rounded-xl border border-purple-200">
                          {formData.groups.length} حلقة
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.groups.map((groupData) => {
                          const group = availableGroups.find(
                            (g) => g._id === groupData.id
                          );
                          return group ? (
                            <div
                              key={groupData.id}
                              className={`group relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 animate-fade-in-up`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
                                    <BookOpen
                                      className="text-white drop-shadow-sm"
                                      size={20}
                                    />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white drop-shadow-sm">
                                      {groupData.name}
                                    </h5>
                                    <p className="text-xs text-white/80">
                                      رقم الحلقة: {groupData.number}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleGroupsChange(group)}
                                  className="w-8 h-8 bg-red-500/20 hover:bg-red-500 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 hover:rotate-90"
                                  title={`إزالة ${groupData.name} من القائمة`}>
                                  <X
                                    className="text-white drop-shadow-sm"
                                    size={16}
                                  />
                                </button>
                              </div>

                              {/* شريط متحرك */}
                              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full group-hover:w-full transition-all duration-500"></div>

                              {/* تأثير الانعكاس */}
                              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* إجمالي الحلقات */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="text-white" size={14} />
                            </div>
                            <span className="font-medium text-green-800">
                              الحلقة المختارة
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-green-500 text-white rounded-lg font-bold text-sm">
                            {formData.groups.length} حلقة
                          </div>
                        </div>
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
                disabled={isSubmitting || (!hasRetryableError && !isStep2Valid)}
                className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasRetryableError
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الحفظ...</span>
                  </>
                ) : hasRetryableError ? (
                  <>
                    <AlertCircle size={18} />
                    <span>المحاولة مرة أخرى</span>
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
