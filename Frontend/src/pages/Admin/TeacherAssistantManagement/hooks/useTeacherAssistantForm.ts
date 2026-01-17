import { useState, useEffect, useCallback, useRef } from "react";
import type { TeacherAssistant } from "../types";
import { checkDuplicate, getNextAssistantId } from "@/Api/teacherAssistantApi";
import { getAllGroups, type Group } from "@/Api/groupApi";
import { isEqual } from "@/utils/objectUtils";
import { showInfoToast } from "@/utils/toastUtils";

// =================== Types ===================
export interface TeacherAssistantFormData {
  // الأسماء
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  // الهوية والتواصل
  assistantId?: number;
  idNumber: string;
  email: string;
  phoneNumber: string;
  password?: string;
  // البيانات الشخصية
  birthDate: string;
  gender: "ذكر" | "أنثى";
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
  showPassword: boolean;
  isEditMode: boolean;
  groups: Group[];
  isLoadingGroups: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleGroupsChange: (groupIds: string[]) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
}

// =================== Initial Data ===================
const initialFormData: TeacherAssistantFormData = {
  firstName: "",
  lastName: "",
  fatherName: "",
  grandFatherName: "",
  motherName: "",
  assistantId: undefined,
  idNumber: "",
  email: "",
  phoneNumber: "",
  password: "",
  birthDate: "",
  gender: "ذكر",
  residence: "",
  allowedGroups: [],
};

// =================== Validation Regex ===================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^05\d{8}$/;
const ID_REGEX = /^\d{9}$/;

// =================== Hook ===================
export const useTeacherAssistantForm = ({
  assistant,
  isOpen,
  onSubmit,
  onClose,
}: UseTeacherAssistantFormProps): UseTeacherAssistantFormReturn => {
  const [formData, setFormData] = useState<TeacherAssistantFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  const [initialData, setInitialData] = useState<TeacherAssistantFormData | null>(null);

  // Debounce timers
  const emailCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditMode = !!assistant;

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      if (!isOpen) return;
      
      setIsLoadingGroups(true);
      try {
        const response = await getAllGroups();
        if (response.success && response.data) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [isOpen]);

  // Fetch next assistant ID for new assistants
  useEffect(() => {
    const fetchNextId = async () => {
      if (!isOpen || isEditMode) return;
      
      try {
        const response = await getNextAssistantId();
        if (response.success && response.nextId) {
          setFormData(prev => ({ ...prev, assistantId: response.nextId }));
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
          firstName: assistant.firstName || "",
          lastName: assistant.lastName || "",
          fatherName: assistant.fatherName || "",
          grandFatherName: assistant.grandFatherName || "",
          motherName: assistant.motherName || "",
          assistantId: assistant.assistantId,
          idNumber: assistant.idNumber || "",
          email: assistant.email || "",
          phoneNumber: assistant.phoneNumber || "",
          password: "",
          birthDate: assistant.birthDate || "",
          gender: (assistant.gender === 'male' || assistant.gender === 'ذكر') ? "ذكر" : "أنثى",
          residence: assistant.residence || "",
          allowedGroups: assistant.allowedGroups?.map(g => g._id) || [],
        };
        setFormData(loadedData);
        setInitialData(loadedData);
      } else {
        setFormData(initialFormData);
        setInitialData(null);
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, assistant]);

  // التحقق من التكرار
  const checkDuplicateField = useCallback(
    async (field: 'email' | 'phoneNumber' | 'idNumber', value: string) => {
      if (!value.trim()) return;
      
      try {
        const response = await checkDuplicate(field, value, assistant?._id);
        if (response.success && response.isDuplicate) {
          const fieldNames: Record<string, string> = {
            email: 'البريد الإلكتروني',
            phoneNumber: 'رقم الهاتف',
            idNumber: 'رقم الهوية',
          };
          setErrors(prev => ({ ...prev, [field]: `${fieldNames[field]} مستخدم بالفعل` }));
        }
      } catch (error) {
        console.error('Error checking duplicate:', error);
      }
    },
    [assistant?._id]
  );

  // Handle form change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when user types
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Debounced duplicate checks
      if (name === 'email' && EMAIL_REGEX.test(value)) {
        if (emailCheckRef.current) clearTimeout(emailCheckRef.current);
        emailCheckRef.current = setTimeout(() => checkDuplicateField('email', value), 500);
      }
      
      if (name === 'phoneNumber' && PHONE_REGEX.test(value)) {
        if (phoneCheckRef.current) clearTimeout(phoneCheckRef.current);
        phoneCheckRef.current = setTimeout(() => checkDuplicateField('phoneNumber', value), 500);
      }
      
      if (name === 'idNumber' && ID_REGEX.test(value)) {
        if (idCheckRef.current) clearTimeout(idCheckRef.current);
        idCheckRef.current = setTimeout(() => checkDuplicateField('idNumber', value), 500);
      }
    },
    [errors, checkDuplicateField]
  );

  // Handle groups change
  const handleGroupsChange = useCallback((groupIds: string[]) => {
    setFormData(prev => ({ ...prev, allowedGroups: groupIds }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "الاسم الأخير مطلوب";
    }
    if (!formData.fatherName?.trim()) {
      newErrors.fatherName = "اسم الأب مطلوب";
    }
    if (!formData.idNumber?.trim()) {
      newErrors.idNumber = "رقم الهوية مطلوب";
    } else if (!ID_REGEX.test(formData.idNumber)) {
      newErrors.idNumber = "رقم الهوية يجب أن يتكون من 9 أرقام";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else if (!PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    }
    if (!isEditMode && !formData.password?.trim()) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    }
    if (!formData.residence?.trim()) {
      newErrors.residence = "مكان السكن مطلوب";
    }
    if (formData.allowedGroups.length === 0) {
      newErrors.allowedGroups = "يجب اختيار حلقة واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEditMode]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Check if data changed in edit mode
      if (isEditMode && initialData) {
        const currentDataWithoutPassword = { ...formData };
        if (!currentDataWithoutPassword.password) {
          delete currentDataWithoutPassword.password;
        }
        
        const initialDataWithoutPassword = { ...initialData };
        delete initialDataWithoutPassword.password;

        if (isEqual(currentDataWithoutPassword, initialDataWithoutPassword)) {
          showInfoToast("لم يتم إجراء أي تغييرات");
          onClose?.();
          return;
        }
      }

      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
    [formData, validateForm, isEditMode, initialData, onSubmit, onClose]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (emailCheckRef.current) clearTimeout(emailCheckRef.current);
      if (phoneCheckRef.current) clearTimeout(phoneCheckRef.current);
      if (idCheckRef.current) clearTimeout(idCheckRef.current);
    };
  }, []);

  return {
    formData,
    errors,
    showPassword,
    isEditMode,
    groups,
    isLoadingGroups,
    setShowPassword,
    handleChange,
    handleGroupsChange,
    handleSubmit,
    validateForm,
  };
};
