import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  validateGroupWithYup,
  type GroupFormData,
} from "@/Validation/groupValidation";
import {
  createGroup,
  updateGroup,
  checkDuplicateGroupName,
  type Group,
} from "@/Api/groupApi";
import { getAllTeachers, type Teacher } from "@/Api/teacherApi";
import { showSuccessToast } from "@/components/utils/toastUtils";
import { showErrorMessage } from "@/components/utils/sweetalertUtils";

interface UseGroupFormProps {
  group?: Group;
  onSuccess: (groupData: Group | GroupFormData) => void;
  onClose: () => void;
  teachers?: Teacher[]; // المعلمون المحملون مسبقاً
  loadingTeachers?: boolean; // حالة تحميل المعلمين
}

export const useGroupForm = ({
  group,
  onSuccess,
  onClose,
  teachers: providedTeachers,
  loadingTeachers: providedLoadingTeachers = false,
}: UseGroupFormProps) => {
  const [formData, setFormData] = useState<GroupFormData>({
    name: group?.name || "",
    teacher: group?.teacher || "",
    description: group?.description || "",
    capacity: group?.capacity || 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [internalTeachers, setInternalTeachers] = useState<Teacher[]>([]);
  const [internalLoadingTeachers, setInternalLoadingTeachers] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState<Record<string, boolean>>({});

  // Refs for debounce timers
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // استخدام المعلمين الممررة أو تحميلها إذا لم يتم تمريرها
  const teachers = providedTeachers || internalTeachers;
  const loadingTeachers = providedTeachers ? providedLoadingTeachers : internalLoadingTeachers;

  // تحميل المعلمين فقط إذا لم يتم تمريرها (fallback للاستخدام من Dashboard)
  useEffect(() => {
    // إذا تم تمرير المعلمين، لا نحتاج لتحميلها
    if (providedTeachers !== undefined) return;

    let isMounted = true;
    
    const fetchTeachers = async () => {
      setInternalLoadingTeachers(true);
      try {
        const response = await getAllTeachers();
        if (isMounted && response.data) {
          setInternalTeachers(response.data);
        }
      } catch (error) {
        console.error("خطأ في تحميل المعلمين:", error);
      } finally {
        if (isMounted) {
          setInternalLoadingTeachers(false);
        }
      }
    };
    
    fetchTeachers();
    
    return () => {
      isMounted = false;
    };
  }, [providedTeachers]);

  // تنظيف timers عند إغلاق الفورم
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // التحقق من صحة النموذج
  const isFormValid = useMemo(() => {
    const hasRequiredFields = Boolean(
      formData.name?.trim() &&
      formData.teacher?.trim()
    );
    
    const hasValidCapacity = formData.capacity === undefined || 
      formData.capacity === null ||
      (formData.capacity >= 1 && formData.capacity <= 50);
    
    return hasRequiredFields && hasValidCapacity;
  }, [formData.name, formData.teacher, formData.capacity]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: name === "capacity" ? (value === "" ? undefined : Number(value)) : value,
      }));

      // مسح الأخطاء بشكل محسّن
      if (errors[name]) {
        setErrors((prev) => {
          const { [name]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(async (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    
    // التحقق من التكرار لحقل الاسم فقط
    if (fieldName === 'name') {
      const value = formData.name;
      
      // تخطي التحقق إذا كان الحقل فارغاً أو لم يتغير
      if (!value || value === '') return;
      
      // تخطي إذا كانت القيمة نفسها للحلقة الحالية
      if (group && group.name === value) return;
      
      // إلغاء أي طلب سابق
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName]);
      }
      
      // استخدام debounce للتحقق من التكرار (تأخير 500ms)
      debounceTimers.current[fieldName] = setTimeout(async () => {
        setCheckingDuplicate((prev) => ({ ...prev, [fieldName]: true }));
        
        try {
          const result = await checkDuplicateGroupName(
            'name',
            value,
            group?._id
          );
          
          if (result.isDuplicate) {
            setErrors((prev) => ({
              ...prev,
              name: result.message || 'اسم الحلقة موجود بالفعل',
            }));
          } else {
            setErrors((prev) => {
              const { name: _, ...rest } = prev;
              return rest;
            });
          }
        } catch (error) {
          console.error('خطأ في التحقق من التكرار:', error);
        } finally {
          setCheckingDuplicate((prev) => ({ ...prev, [fieldName]: false }));
        }
      }, 500);
    }
  }, [formData, group]);

  const getFieldError = useCallback(
    (fieldName: string): string => {
      if (!touchedFields.has(fieldName)) return "";
      return errors[fieldName] || "";
    },
    [errors, touchedFields]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // تعيين جميع الحقول المطلوبة كـ touched
    const allFields = new Set(["name", "teacher"]);
    setTouchedFields(allFields);

    try {
      const isNewGroup = !group?._id;
      await validateGroupWithYup(formData, isNewGroup);
      setErrors({});
      setIsSubmitting(true);

      const groupData: GroupFormData = {
        name: formData.name,
        teacher: formData.teacher,
        description: formData.description || "",
        capacity: formData.capacity || 30,
      };

      console.log('📤 البيانات المرسلة:', groupData);

      let response;
      if (group?._id) {
        response = await updateGroup(group._id, groupData);
      } else {
        response = await createGroup(groupData);
      }

      // عرض Toast للنجاح فقط إذا كانت العملية ناجحة
      if (response.success) {
        if (group?._id) {
          showSuccessToast(`✅ تم تحديث بيانات الحلقة ${formData.name} بنجاح!`);
        } else {
          showSuccessToast(`✅ تم إضافة الحلقة ${formData.name} بنجاح!`);
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess(response.data!);
          onClose();
        }, 1000);
      } else {
        // في حالة فشل العملية
        setIsSubmitting(false);
        const errorMessage = response.message || "حدث خطأ أثناء حفظ البيانات";
        
        console.error("❌ فشل في حفظ الحلقة:", errorMessage);
        
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
        setErrors({ submit: errorMessage });
        
        // عرض SweetAlert للأخطاء العامة
        showErrorMessage(
          "خطأ في العملية",
          errorMessage
        );
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

  const isDuplicateError = useCallback(
    (fieldName: string): boolean => {
      const error = errors[fieldName];
      return error ? error.includes("موجود بالفعل") : false;
    },
    [errors]
  );

  return {
    // State
    formData,
    errors,
    touchedFields,
    isSubmitting,
    showSuccess,
    teachers,
    loadingTeachers,
    checkingDuplicate,
    isFormValid,

    // Functions
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    isDuplicateError,
  };
};

