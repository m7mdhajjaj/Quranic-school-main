import { useState, useCallback, useMemo, useEffect } from "react";
import {
  validateStudentWithYup,
  type StudentFormData,
} from "@/Validation/studentValidation";
import {
  createStudent,
  updateStudent,
  checkDuplicateField,
  type Student,
} from "@/Api/studentApi";
import { getAllTeachers, type Teacher } from "@/Api/teacherApi";
import { getAllGroups, type Group } from "@/Api/groupApi";
import { showSuccessToast } from "@/components/utils/toastUtils";
import { showErrorMessage } from "@/components/utils/sweetalertUtils";

// دالة لتحويل التاريخ من الخادم إلى تنسيق input[type="date"]
const formatDateForInput = (dateValue?: string | Date): string => {
  if (!dateValue) return "";

  try {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("خطأ في تحويل التاريخ:", error);
    return "";
  }
};

const normalizeGender = (value: string) => {
  const normalized = value.trim();
  if (normalized === "ذكر" || normalized === "male") return "ذكر";
  if (normalized === "أنثى" || normalized === "female") return "أنثى";
  return normalized;
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

interface UseStudentFormProps {
  student?: Student;
  defaultGroup?: string;
  onSuccess: (studentData: Student | StudentFormData) => void;
  onClose: () => void;
}

export const useStudentForm = ({
  student,
  defaultGroup,
  onSuccess,
  onClose,
}: UseStudentFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    fatherName: student?.fatherName || "",
    grandFatherName: student?.grandFatherName || "",
    motherName: student?.motherName || "",
    lastName: student?.lastName || "",
    idNumber: student?.idNumber || "",
    birthDate: formatDateForInput(student?.birthDate),
    gender: student?.gender || "",
    residence: student?.residence || "",
    group: student?.group || defaultGroup || "",
    teacher: student?.teacher || "",
    email: student?.email || "",
    phoneNumber: student?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [duplicateFieldInfo, setDuplicateFieldInfo] = useState<{
    field: string;
    userType: string;
  } | null>(null);

  // حساب العمر
  const calculatedAge = useMemo(() => {
    if (!formData.birthDate) return null;
    return calculateAge(formData.birthDate);
  }, [formData.birthDate]);

  // تحميل المعلمين
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await getAllTeachers();
        setTeachers(response.data || []);
      } catch (error) {
        console.error("خطأ في تحميل المعلمين:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  // تحميل الحلقات
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await getAllGroups();
        setGroups(response.data || []);
      } catch (error) {
        console.error("خطأ في تحميل الحلقات:", error);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // الحصول على المعلم من الحلقة المختارة
  const selectedGroupTeacher = useMemo(() => {
    if (!formData.group) return null;
    const selectedGroup = groups.find((group) => group.name === formData.group);
    if (!selectedGroup) return null;
    
    const teacher = selectedGroup.teacher as string | { firstName?: string; lastName?: string };
    if (typeof teacher === "string") return teacher;
    if (teacher && typeof teacher === "object" && teacher.firstName && teacher.lastName) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }
    return null;
  }, [formData.group, groups]);

  // التحقق من صحة الخطوة الأولى
  const isStep1Valid = useMemo(() => {
    return !!(
      formData.firstName &&
      formData.fatherName &&
      formData.lastName &&
      formData.idNumber &&
      formData.birthDate &&
      formData.gender &&
      formData.residence
    );
  }, [formData]);

  // التحقق من صحة الخطوة الثانية
  const isStep2Valid = useMemo(() => {
    return !!formData.group;
  }, [formData.group]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: name === "gender" ? normalizeGender(value) : value,
      }));

      if (touchedFields.has(name)) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [touchedFields]
  );

  const handleBlur = useCallback(async (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    
    // التحقق من التكرار للحقول الحساسة
    if (['idNumber', 'phoneNumber', 'email'].includes(fieldName)) {
      const value = formData[fieldName as keyof typeof formData];
      
      // تخطي التحقق إذا كان الحقل فارغاً
      if (!value || value === '') return;
      
      try {
        const result = await checkDuplicateField(
          fieldName as 'idNumber' | 'phoneNumber' | 'email',
          value as string,
          student?._id
        );
        
        if (result.isDuplicate) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: result.message || `${fieldName} موجود بالفعل`,
          }));
          setDuplicateFieldInfo({
            field: fieldName,
            userType: result.existingUserType || 'مستخدم',
          });
        } else {
          // إزالة الخطأ إذا كانت القيمة متاحة
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
          if (duplicateFieldInfo?.field === fieldName) {
            setDuplicateFieldInfo(null);
          }
        }
      } catch (error) {
        console.error('خطأ في التحقق من التكرار:', error);
      }
    }
  }, [formData, student?._id, duplicateFieldInfo]);

  const getFieldError = useCallback(
    (fieldName: string): string => {
      return touchedFields.has(fieldName) ? errors[fieldName] || "" : "";
    },
    [errors, touchedFields]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allFields = new Set([
      "firstName",
      "fatherName",
      "lastName",
      "idNumber",
      "birthDate",
      "gender",
      "residence",
      "group",
    ]);
    setTouchedFields(allFields);

    try {
      await validateStudentWithYup(formData);
      setErrors({});
      setIsSubmitting(true);

      // الحصول على اسم المعلم من الحلقة
      const teacherFromGroup = selectedGroupTeacher || formData.teacher;
      
      // توليد كلمة مرور تلقائية للطالب الجديد (رقم الهوية)
      const password = student?._id ? undefined : (formData.idNumber || '1234');

      const studentData = {
        ...formData,
        group: formData.group, // إرسال اسم الحلقة (String) - Schema يتوقع String
        teacher: teacherFromGroup, // اسم المعلم (String)
        age: calculatedAge || 0,
        ...(password && { password }), // إضافة كلمة المرور للطلاب الجدد فقط
        avatar: null, // القيمة الافتراضية
        isActive: false, // القيمة الافتراضية
        lastSeen: new Date(), // القيمة الافتراضية
      } as StudentFormData;

      console.log('📤 البيانات المرسلة:', studentData);

      let response;
      if (student?._id) {
        response = await updateStudent(student._id, studentData);
      } else {
        response = await createStudent(studentData);
      }

      // عرض Toast للنجاح فقط إذا كانت العملية ناجحة
      if (response.success) {
        if (student?._id) {
          showSuccessToast(`✅ تم تحديث بيانات الطالب ${formData.firstName} ${formData.lastName} بنجاح!`);
        } else {
          showSuccessToast(`✅ تم إضافة الطالب ${formData.firstName} ${formData.lastName} بنجاح!`);
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess(response.data!);
          onClose();
        }, 1000);
      } else {
        // في حالة فشل العملية (لن يحدث عادةً لأن API سترمي exception)
        setIsSubmitting(false);
        const errorMessage = response.message || "حدث خطأ أثناء حفظ البيانات";
        setErrors({ submit: errorMessage });
        showErrorMessage("خطأ في العملية", errorMessage);
      }
    } catch (error: any) {
      setIsSubmitting(false);

      if (error.name === "ValidationError") {
        const validationErrors: Record<string, string> = {};
        error.inner?.forEach((err: any) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
        
        // عرض SweetAlert للأخطاء في التحقق
        showErrorMessage(
          "خطأ في البيانات",
          "يرجى التحقق من جميع الحقول المطلوبة وإصلاح الأخطاء"
        );
      } else if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        const duplicateMatch = errorMessage.match(
          /(رقم الهوية|رقم الهاتف|البريد الإلكتروني) موجود بالفعل لدى (طالب|معلم)/
        );

        if (duplicateMatch) {
          const fieldMap: Record<string, string> = {
            "رقم الهوية": "idNumber",
            "رقم الهاتف": "phoneNumber",
            "البريد الإلكتروني": "email",
          };

          const field = fieldMap[duplicateMatch[1]];
          const userType = duplicateMatch[2];

          if (field) {
            setDuplicateFieldInfo({ field, userType });
            setErrors({ [field]: errorMessage });
            
            // عرض SweetAlert للتكرار
            showErrorMessage(
              "بيانات مكررة",
              errorMessage
            );
          }
        } else {
          setErrors({ submit: errorMessage });
          
          // عرض SweetAlert للأخطاء العامة
          showErrorMessage(
            "خطأ في العملية",
            errorMessage
          );
        }
      } else {
        const errorMsg = "حدث خطأ أثناء حفظ البيانات";
        setErrors({ submit: errorMsg });
        
        // عرض SweetAlert للأخطاء غير المتوقعة
        showErrorMessage(
          "خطأ غير متوقع",
          errorMsg
        );
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const isDuplicateError = (fieldName: string): boolean => {
    const error = errors[fieldName];
    return error ? error.includes("موجود بالفعل") : false;
  };

  const hasRetryableError = useMemo(() => {
    return Object.values(errors).some((error) => error.includes("موجود بالفعل"));
  }, [errors]);

  return {
    // State
    currentStep,
    formData,
    errors,
    touchedFields,
    isSubmitting,
    showSuccess,
    teachers,
    groups,
    loadingTeachers,
    loadingGroups,
    duplicateFieldInfo,
    calculatedAge,
    selectedGroupTeacher,
    isStep1Valid,
    isStep2Valid,
    hasRetryableError,

    // Functions
    handleChange,
    handleBlur,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
    getFieldError,
    isDuplicateError,
    setCurrentStep,
  };
};
