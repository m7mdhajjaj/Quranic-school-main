import { useState, useEffect, useCallback, useRef } from 'react';
import type { TeacherAssistant } from '../types';
import { checkDuplicate, getNextAssistantId } from '@/Api/teacherAssistantApi';
import { getAllGroups, type Group } from '@/Api/groupApi';
import { isEqual } from '@/utils/objectUtils';
import { showInfoToast } from '@/utils/toastUtils';
import { DEBOUNCE_TIME, VALIDATION_RULES, MESSAGES } from '../constants';
import {
  validateAssistantFieldWithYup,
  validateAssistantWithYup,
} from '@/Validation/assistantValidation';

// =================== Types ===================
export interface TeacherAssistantFormData {
  // الأسماء
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  motherName: string;
  // الهوية والتواصل
  assistantId?: number;
  idNumber: string;
  email: string;
  phoneNumber: string;
  // البيانات الشخصية
  birthDate: string;
  gender: 'ذكر' | 'أنثى';
  residence: string;
  // العلاقات
  allowedGroups: string[];
}

export interface UseTeacherAssistantFormProps {
  assistant?: TeacherAssistant | null;
  isOpen: boolean;
  onSubmit: (data: TeacherAssistantFormData) => Promise<void>;
  onClose?: () => void;
}

export interface UseTeacherAssistantFormReturn {
  formData: TeacherAssistantFormData;
  errors: Record<string, string>;
  isEditMode: boolean;
  groups: Group[];
  isLoadingGroups: boolean;
  currentStep: number;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleGroupsChange: (groupIds: string[]) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
}

// =================== Initial Data ===================
const initialFormData: TeacherAssistantFormData = {
  firstName: '',
  lastName: '',
  fatherName: '',
  grandFatherName: '',
  motherName: '',
  assistantId: undefined,
  idNumber: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  gender: 'ذكر',
  residence: '',
  allowedGroups: [],
};

// =================== Hook ===================
export const useTeacherAssistantForm = ({
  assistant,
  isOpen,
  onSubmit,
}: UseTeacherAssistantFormProps): UseTeacherAssistantFormReturn => {
  const [formData, setFormData] =
    useState<TeacherAssistantFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [initialData, setInitialData] =
    useState<TeacherAssistantFormData | null>(null);

  // Debounce timers
  const emailCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditMode = !!assistant;

  // Fetch groups - only active groups without assistant OR with current assistant
  useEffect(() => {
    const fetchGroups = async () => {
      if (!isOpen) return;

      setIsLoadingGroups(true);
      try {
        const response = await getAllGroups();
        if (response.success && response.data) {
          // فلترة الحلقات النشطة فقط
          // والتي ليس لها مساعد، أو التي المساعد الحالي مشرف عليها
          const availableGroups = response.data.filter((group: Group) => {
            // الحلقة يجب أن تكون نشطة
            if (!group.activeStatus) return false;

            // إذا الحلقة ليس لها مساعد - متاحة
            if (!group.teacherAssistant) return true;

            // في وضع التعديل: إذا المساعد الحالي هو المشرف - متاحة
            if (isEditMode && assistant?._id) {
              const assistantId =
                typeof group.teacherAssistant === 'object'
                  ? group.teacherAssistant._id
                  : group.teacherAssistant;
              return assistantId === assistant._id;
            }

            // غير متاحة
            return false;
          });
          setGroups(availableGroups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [isOpen, isEditMode, assistant?._id]);

  // Fetch next assistant ID for new assistants
  useEffect(() => {
    const fetchNextId = async () => {
      if (!isOpen || isEditMode) return;

      try {
        const response = await getNextAssistantId();
        if (response.success && response.nextId) {
          setFormData((prev) => ({ ...prev, assistantId: response.nextId }));
        }
      } catch (error) {
        console.error('Error fetching next ID:', error);
      }
    };

    fetchNextId();
  }, [isOpen, isEditMode]);

  // تحميل البيانات عند فتح النموذج
  useEffect(() => {
    if (isOpen) {
      if (assistant) {
        const loadedData: TeacherAssistantFormData = {
          firstName: assistant.firstName || '',
          lastName: assistant.lastName || '',
          fatherName: assistant.fatherName || '',
          grandFatherName: assistant.grandFatherName || '',
          motherName: assistant.motherName || '',
          assistantId: assistant.assistantId,
          idNumber: assistant.idNumber || '',
          email: assistant.email || '',
          phoneNumber: assistant.phoneNumber || '',
          birthDate: assistant.birthDate || '',
          gender:
            assistant.gender === 'male' || assistant.gender === 'ذكر'
              ? 'ذكر'
              : 'أنثى',
          residence: assistant.residence || '',
          allowedGroups: assistant.allowedGroups?.map((g) => g._id) || [],
        };
        setFormData(loadedData);
        setInitialData(loadedData);
      } else {
        setFormData(initialFormData);
        setInitialData(null);
      }
      setErrors({});
      setCurrentStep(1);
    }
  }, [isOpen, assistant]);

  // التحقق من التكرار عبر جميع المستخدمين
  const checkDuplicateField = useCallback(
    async (field: 'email' | 'phoneNumber' | 'idNumber', value: string) => {
      if (!value.trim()) return;

      try {
        const response = await checkDuplicate(field, value, assistant?._id);
        if (response.success && response.isDuplicate) {
          // عرض رسالة تفصيلية مع نوع المستخدم واسمه
          const message =
            response.message ||
            `${response.existingUserType ? `مستخدم بالفعل لـ ${response.existingUserType}` : 'مستخدم بالفعل'}` +
              (response.existingUserName
                ? ` (${response.existingUserName})`
                : '');
          setErrors((prev) => ({ ...prev, [field]: message }));
        }
      } catch (error) {
        console.error('Error checking duplicate:', error);
      }
    },
    [assistant?._id],
  );

  // Debounced duplicate checks helper
  const debouncedCheck = useCallback(
    (
      field: 'email' | 'phoneNumber' | 'idNumber',
      value: string,
      regex: RegExp,
      timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    ) => {
      if (value && regex.test(value)) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(
          () => checkDuplicateField(field, value),
          DEBOUNCE_TIME.DUPLICATE_CHECK,
        );
      }
    },
    [checkDuplicateField],
  );

  // Handle form change with Yup validation
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error immediately
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Validate field
      const error = await validateAssistantFieldWithYup(
        name,
        value,
        formData,
        !isEditMode,
      );
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }

      // Check duplicates using optimized helper
      if (name === 'email')
        debouncedCheck(
          'email',
          value,
          VALIDATION_RULES.EMAIL_REGEX,
          emailCheckRef,
        );
      if (name === 'phoneNumber')
        debouncedCheck(
          'phoneNumber',
          value,
          VALIDATION_RULES.PHONE_REGEX,
          phoneCheckRef,
        );
      if (name === 'idNumber')
        debouncedCheck(
          'idNumber',
          value,
          VALIDATION_RULES.ID_NUMBER_REGEX,
          idCheckRef,
        );
    },
    [errors, formData, isEditMode, debouncedCheck],
  );

  // Handle groups change
  const handleGroupsChange = useCallback((groupIds: string[]) => {
    setFormData((prev) => ({ ...prev, allowedGroups: groupIds }));
  }, []);
const validateStep1 = useCallback(async (): Promise<boolean> => {
    const step1Fields = ['firstName', 'lastName', 'fatherName', 'grandFatherName', 'motherName', 'idNumber', 'email', 'phoneNumber'];
    let isValid = true;
    const newErrors: Record<string, string> = { ...errors }; // Keep existing errors

    for (const field of step1Fields) {
      const error = await validateAssistantFieldWithYup(
        field, 
        (formData as any)[field], 
        formData, 
        !isEditMode
      );
      
      if (error) {
        newErrors[field] = error;
        isValid = false;
      } else {
        delete newErrors[field];
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [formData, isEditMode, errors]);

  const nextStep = useCallback(async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) {
        setCurrentStep(2);
      }
    }
  }, [currentStep, validateStep1]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  }, [currentStep]);

  
  // Validate form with Yup
  const validateForm = useCallback(async (): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> => {
    const dataToValidate = {
      ...formData,
      allowedGroups: formData.allowedGroups.map((id) => {
        const group = groups.find((g) => g._id === id);
        return {
          id: id,
          name: group?.name || '',
          number: group?.number || null,
        };
      }),
    };

    const validation = await validateAssistantWithYup(
      dataToValidate,
      !isEditMode,
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return { isValid: false, errors: validation.errors };
    }

    // Additional validation for groups
    if (formData.allowedGroups.length === 0) {
      const groupError = { allowedGroups: 'يجب اختيار حلقة واحدة على الأقل' };
      setErrors((prev) => ({ ...prev, ...groupError }));
      return { isValid: false, errors: groupError };
    }

    setErrors({});
    return { isValid: true, errors: {} };
  }, [formData, groups, isEditMode]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      console.log('🚀 Submit triggered - Form Data:', formData);

      const validationResult = await validateForm();
      console.log('✅ Validation result:', validationResult.isValid);
      console.log('📋 Validation errors:', validationResult.errors);

      if (!validationResult.isValid) {
        console.log('❌ Form validation failed, stopping submission');
        console.log('🔍 Error details:', validationResult.errors);
        return;
      }

      // Check if data changed (for both edit and add modes)
      if (initialData) {
        // في وضع التعديل: تحقق إذا تم تغيير أي بيانات
        if (isEqual(formData, initialData)) {
          console.log(
            'ℹ️ No changes detected - Data is identical to initial data',
          );
          showInfoToast(MESSAGES.INFO.NO_CHANGES);
          return;
        }
        console.log('✨ Changes detected - Proceeding with submission');
      } else {
        // في وضع الإضافة: تحقق إذا البيانات لا تزال فارغة (default values)
        const isStillEmpty = isEqual(formData, initialFormData);
        if (isStillEmpty) {
    currentStep,
    nextStep,
    prevStep,
    setCurrentStep,
          console.log('⚠️ Form is still empty - cannot submit');
          showInfoToast(MESSAGES.INFO.FILL_REQUIRED);
          return;
        }
      }

      try {
        console.log('📤 Submitting form data:', formData);
        await onSubmit(formData);
      } catch (error) {
        console.error('❌ Form submission error:', error);
      }
    },
    [formData, validateForm, isEditMode, initialData, onSubmit, errors],
  );

  // Cleanup on unmount
  useEffect(() => {
    const emailTimer = emailCheckRef.current;
    const phoneTimer = phoneCheckRef.current;
    const idTimer = idCheckRef.current;

    return () => {
      if (emailTimer) clearTimeout(emailTimer);
      if (phoneTimer) clearTimeout(phoneTimer);
      if (idTimer) clearTimeout(idTimer);
    };
  }, []);

  return {
    formData,
    errors,

    isEditMode,
    groups,
    isLoadingGroups,
    handleChange,
    handleGroupsChange,
    handleSubmit,
    validateForm,
  };
};
