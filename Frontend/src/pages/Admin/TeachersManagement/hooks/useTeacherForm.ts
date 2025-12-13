import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  validateTeacherWithYup,
  type TeacherFormData,
} from '@/Validation/teacherValidation';
import {
  createTeacher,
  updateTeacher,
  checkDuplicateField,
  getAvailableGroupsForTeacher,
  type Teacher,
} from '@/Api/teacherApi';
import { type Group } from '@/Api/groupApi';
import { showErrorMessage } from '@/utils/sweetalertUtils';

// دالة لتحويل التاريخ من الخادم إلى تنسيق input[type="date"]
const formatDateForInput = (dateValue?: string | Date): string => {
  if (!dateValue) return '';

  try {
    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('خطأ في تحويل التاريخ:', error);
    return '';
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

interface UseTeacherFormProps {
  teacher?: Teacher;
  onSuccess: (teacherData: Teacher | TeacherFormData) => void;
  onClose: () => void;
}

export const useTeacherForm = ({
  teacher,
  onSuccess,
  onClose,
}: UseTeacherFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{
    firstName: string;
    fatherName: string;
    grandFatherName: string;
    motherName: string;
    lastName: string;
    idNumber: string;
    birthDate: string;
    gender: string;
    residence: string;
    email: string;
    phoneNumber: string;
    groups: Array<{ id: string; name: string; number?: number }>;
  }>({
    firstName: teacher?.firstName || '',
    fatherName: teacher?.fatherName || '',
    grandFatherName: teacher?.grandFatherName || '',
    motherName: teacher?.motherName || '',
    lastName: teacher?.lastName || '',
    idNumber: teacher?.idNumber || '',
    birthDate: formatDateForInput(teacher?.birthDate),
    gender: teacher?.gender || '',
    residence: teacher?.residence || '',
    email: teacher?.email || '',
    phoneNumber: teacher?.phoneNumber || '',
    groups: teacher?.groups || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [duplicateFieldInfo, setDuplicateFieldInfo] = useState<{
    field: string;
    userType: string;
  } | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState<
    Record<string, boolean>
  >({});

  // Refs for debounce timers
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        // جلب الحلقات المتاحة فقط (غير المرتبطة بمعلم أو حلقات المعلم الحالي)
        console.log('🔍 جلب الحلقات للمعلم:', teacher?._id);
        console.log('📚 حلقات المعلم الحالية:', formData.groups);
        const response = await getAvailableGroupsForTeacher(teacher?._id);
        console.log('📦 Response من Backend:', response);
        if (response.success && response.data) {
          console.log('✅ تم جلب الحلقات المتاحة:', response.data.length);
          console.log('📋 الحلقات:', response.data);
          // تحويل البيانات لتطابق واجهة Group
          const groupsData = response.data.map((g) => ({
            ...g,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          setGroups(groupsData as Group[]);
        } else {
          console.error('❌ فشل جلب الحلقات:', response.message);
          setGroups([]);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    if (currentStep === 2) {
      fetchGroups();
    }
  }, [currentStep, teacher, formData.groups]);

  const calculatedAge = useMemo(() => {
    if (formData.birthDate) {
      return calculateAge(formData.birthDate);
    }
    return null;
  }, [formData.birthDate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      // Check for duplicates on email, phoneNumber, and idNumber
      if (
        (name === 'email' || name === 'phoneNumber' || name === 'idNumber') &&
        value
      ) {
        // Clear existing timer
        if (debounceTimers.current[name]) {
          clearTimeout(debounceTimers.current[name]);
        }

        // Set new timer
        debounceTimers.current[name] = setTimeout(async () => {
          if (teacher && value === teacher[name as keyof Teacher]) {
            return; // Skip check if value hasn't changed
          }

          setCheckingDuplicate((prev) => ({ ...prev, [name]: true }));

          try {
            const response = await checkDuplicateField(name, value);
            if (response.exists) {
              setErrors((prev) => ({
                ...prev,
                [name]: `${
                  name === 'email'
                    ? 'البريد الإلكتروني'
                    : name === 'phoneNumber'
                      ? 'رقم الهاتف'
                      : 'رقم الهوية'
                } موجود بالفعل`,
              }));
              setDuplicateFieldInfo({
                field: name,
                userType: response.userType || 'معلم',
              });
            }
          } catch (error) {
            console.error('Error checking duplicate:', error);
          } finally {
            setCheckingDuplicate((prev) => ({ ...prev, [name]: false }));
          }
        }, 500);
      }
    },
    [teacher]
  );

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      if (touchedFields.has(fieldName) || Object.keys(errors).length > 0) {
        return errors[fieldName];
      }
      return undefined;
    },
    [errors, touchedFields]
  );

  const isDuplicateError = useCallback(
    (fieldName: string): boolean => {
      return (
        duplicateFieldInfo !== null && duplicateFieldInfo.field === fieldName
      );
    },
    [duplicateFieldInfo]
  );

  const handleGroupsChange = useCallback((group: Group) => {
    setFormData((prev) => {
      const isSelected = prev.groups?.some((g) => g.id === group._id);

      if (isSelected) {
        // Remove group
        return {
          ...prev,
          groups: prev.groups?.filter((g) => g.id !== group._id) || [],
        };
      } else {
        // Add group
        return {
          ...prev,
          groups: [
            ...(prev.groups || []),
            {
              id: group._id,
              name: group.name,
              number: group.number,
            },
          ],
        };
      }
    });
  }, []);

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      try {
        const validationResult = await validateTeacherWithYup(formData);

        if (!validationResult.isValid && validationResult.errors) {
          const stepErrors: Record<string, string> = {};

          if (step === 1) {
            const step1Fields = [
              'firstName',
              'fatherName',
              'grandFatherName',
              'motherName',
              'lastName',
              'idNumber',
              'birthDate',
              'gender',
              'residence',
            ];

            step1Fields.forEach((field) => {
              if (validationResult.errors![field]) {
                stepErrors[field] = validationResult.errors![field];
              }
            });
          } else if (step === 2) {
            const step2Fields = ['email', 'phoneNumber'];

            step2Fields.forEach((field) => {
              if (validationResult.errors![field]) {
                stepErrors[field] = validationResult.errors![field];
              }
            });
          }

          setErrors(stepErrors);
          return Object.keys(stepErrors).length === 0;
        }

        setErrors({});
        return true;
      } catch (error) {
        console.error('Validation error:', error);
        return false;
      }
    },
    [formData]
  );

  const isStep1Valid = useMemo(() => {
    const requiredFields = [
      'firstName',
      'fatherName',
      'grandFatherName',
      'motherName',
      'lastName',
      'idNumber',
      'birthDate',
      'gender',
      'residence',
    ];

    // تحقق من أن جميع الحقول المطلوبة ممتلئة
    const allFieldsFilled = requiredFields.every((field) => {
      const value = formData[field as keyof typeof formData];
      return value && value.toString().trim() !== '';
    });

    // تحقق من عدم وجود أخطاء في حقول Step 1
    const noErrorsInStep1 = !requiredFields.some((field) => errors[field]);

    // تحقق من عدم وجود فحص جاري للتكرار (فقط idNumber في Step 1)
    const noCheckingInProgress = !checkingDuplicate['idNumber'];

    return allFieldsFilled && noErrorsInStep1 && noCheckingInProgress;
  }, [formData, errors, checkingDuplicate]);

  const isStep2Valid = useMemo(() => {
    const requiredFields = ['email', 'phoneNumber'];

    // تحقق من أن جميع الحقول المطلوبة ممتلئة
    const allFieldsFilled = requiredFields.every((field) => {
      const value = formData[field as keyof typeof formData];
      return value && value.toString().trim() !== '';
    });

    // تحقق من عدم وجود أخطاء في حقول Step 2
    const noErrorsInStep2 = !requiredFields.some((field) => errors[field]);

    // تحقق من عدم وجود فحص جاري للتكرار
    const noCheckingInProgress = !requiredFields.some(
      (field) => checkingDuplicate[field]
    );

    return allFieldsFilled && noErrorsInStep2 && noCheckingInProgress;
  }, [formData, errors, checkingDuplicate]);

  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(2);
      setErrors({});
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const hasRetryableError = useMemo(() => {
    return duplicateFieldInfo !== null;
  }, [duplicateFieldInfo]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const validationResult = await validateTeacherWithYup(formData);

      if (!validationResult.isValid && validationResult.errors) {
        setErrors(validationResult.errors);
        showErrorMessage('خطأ في البيانات', 'يرجى إصلاح الأخطاء قبل الحفظ');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = teacher
          ? await updateTeacher(teacher._id, formData as TeacherFormData)
          : await createTeacher(formData as TeacherFormData);

        if (response.success && response.data) {
          setShowSuccess(true);

          // لا نعرض Toast هنا لأن handleAddSuccess في parent component سيعرضه
          setTimeout(() => {
            onSuccess(response.data!);
            onClose();
          }, 1500);
        } else {
          showErrorMessage('خطأ!', response.message || 'حدث خطأ أثناء الحفظ');
        }
      } catch (error: unknown) {
        console.error('Error submitting form:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
        showErrorMessage('خطأ!', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, teacher, onSuccess, onClose]
  );

  return {
    currentStep,
    formData,
    errors,
    touchedFields,
    isSubmitting,
    showSuccess,
    groups,
    loadingGroups,
    duplicateFieldInfo,
    checkingDuplicate,
    calculatedAge,
    isStep1Valid,
    isStep2Valid,
    hasRetryableError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
    getFieldError,
    isDuplicateError,
    handleGroupsChange,
  };
};
