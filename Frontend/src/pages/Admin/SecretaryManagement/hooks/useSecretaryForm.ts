import { useState, useEffect, useCallback, useRef } from "react";
import type { Secretary } from "../types";
import { checkDuplicate } from "@/Api/secretaryApi";
import { isEqual } from "@/utils/objectUtils";
import { showInfoToast } from "@/utils/toastUtils";


// =================== Types ===================
export interface SecretaryFormData {
  // الأسماء
  firstName: string;
  lastName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  // الهوية والتواصل
  idNumber: string;
  email: string;
  phoneNumber: string;
  password?: string;
  // البيانات الشخصية
  birthDate: string;
  gender: "ذكر" | "أنثى";
  residence: string;
  // الصلاحيات (6 صلاحيات حسب الـ Schema)
  permissions: {
    canManageStudents: boolean;
    canManageAttendance: boolean;
    canManageNews: boolean;
    canViewReports: boolean;
    canManageTimetable: boolean;
    canManageMessages: boolean;
  };
}

export interface UseSecretaryFormProps {
  secretary?: Secretary | null;
  isOpen: boolean;
  onSubmit: (data: SecretaryFormData) => Promise<void>;
  onClose?: () => void;
}

export interface UseSecretaryFormReturn {
  formData: SecretaryFormData;
  errors: Record<string, string>;
  showPassword: boolean;
  isEditMode: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
}

// =================== Initial Data ===================
const initialFormData: SecretaryFormData = {
  // الأسماء
  firstName: "",
  lastName: "",
  fatherName: "",
  grandFatherName: "",
  motherName: "",
  // الهوية والتواصل
  idNumber: "",
  email: "",
  phoneNumber: "",
  password: "",
  // البيانات الشخصية
  birthDate: "",
  gender: "ذكر",
  residence: "",
  // الصلاحيات - الافتراضي true حسب الـ Schema
  permissions: {
    canManageStudents: true,
    canManageAttendance: true,
    canManageNews: true,
    canViewReports: true,
    canManageTimetable: false,
    canManageMessages: true,
  },
};

// =================== Validation Regex ===================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^05\d{8}$/;  // 10 أرقام يبدأ بـ05
const ID_REGEX = /^\d{9}$/;       // 9 أرقام بالضبط

// =================== Hook ===================
export const useSecretaryForm = ({
  secretary,
  isOpen,
  onSubmit,
  onClose,
}: UseSecretaryFormProps): UseSecretaryFormReturn => {
  const [formData, setFormData] = useState<SecretaryFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // تخزين البيانات الأولية للمقارنة
  const [initialData, setInitialData] = useState<SecretaryFormData | null>(null);

  // Debounce timers for duplicate checks
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const isEditMode = !!secretary;
  const excludeId = isEditMode ? secretary?._id : undefined;

  // =================== Duplicate Check Function ===================
  const checkFieldDuplicate = useCallback(async (
    field: 'email' | 'phoneNumber' | 'idNumber',
    value: string
  ) => {
    // التحقق من صحة القيمة أولاً
    if (field === 'email' && !EMAIL_REGEX.test(value)) return;
    if (field === 'phoneNumber' && !PHONE_REGEX.test(value)) return;
    if (field === 'idNumber' && !ID_REGEX.test(value)) return;

    try {
      const response = await checkDuplicate(field, value, excludeId);
      if (response.isDuplicate) {
        const fieldLabels: Record<string, string> = {
          email: 'البريد الإلكتروني',
          phoneNumber: 'رقم الهاتف',
          idNumber: 'رقم الهوية',
        };
        setErrors(prev => ({
          ...prev,
          [field]: `${fieldLabels[field]} مُستخدم بالفعل (${response.existingUserType}: ${response.existingUserName})`
        }));
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    }
  }, [excludeId]);

  // =================== Debounced Duplicate Check ===================
  const debouncedDuplicateCheck = useCallback((
    field: 'email' | 'phoneNumber' | 'idNumber',
    value: string
  ) => {
    // إلغاء المؤقت السابق
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }
    
    // إنشاء مؤقت جديد (500ms)
    debounceTimers.current[field] = setTimeout(() => {
      checkFieldDuplicate(field, value);
    }, 500);
  }, [checkFieldDuplicate]);

  // =================== Reset Form on Open/Close ===================
  useEffect(() => {
    // فقط عند فتح المودال
    if (!isOpen) {
      // إعادة تعيين الفورم عند الإغلاق
      setFormData(initialFormData);
      setErrors({});
      setShowPassword(false);
      setInitialData(null);
      return;
    }

    // عند الفتح - تحميل البيانات
    if (secretary) {
      const data: SecretaryFormData = {
        // الأسماء
        firstName: secretary.firstName || "",
        lastName: secretary.lastName || "",
        fatherName: secretary.fatherName || "",
        grandFatherName: secretary.grandFatherName || "",
        motherName: secretary.motherName || "",
        // الهوية والتواصل
        idNumber: secretary.idNumber || "",
        email: secretary.email || "",
        phoneNumber: secretary.phoneNumber || "",
        password: "",
        // البيانات الشخصية
        birthDate: secretary.birthDate || "",
        gender: (secretary.gender === "male" ? "ذكر" : secretary.gender === "female" ? "أنثى" : secretary.gender) as "ذكر" | "أنثى",
        residence: secretary.residence || "",
        // الصلاحيات
        permissions: {
          canManageStudents: secretary.permissions?.canManageStudents ?? true,
          canManageAttendance: secretary.permissions?.canManageAttendance ?? true,
          canManageNews: secretary.permissions?.canManageNews ?? true,
          canViewReports: secretary.permissions?.canViewReports ?? true,
          canManageTimetable: secretary.permissions?.canManageTimetable ?? false,
          canManageMessages: secretary.permissions?.canManageMessages ?? true,
        },
      };

      setFormData(data);
      setInitialData(data);
    } else {
      setFormData(initialFormData);
      setInitialData(null);
    }
    setErrors({});
  }, [secretary, isOpen]);

  // =================== Validation ===================
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // =================== الأسماء ===================
    if (!formData.firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "الاسم الأول يجب أن يكون حرفين على الأقل";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "اسم العائلة مطلوب";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "اسم العائلة يجب أن يكون حرفين على الأقل";
    }

    // =================== الهوية والتواصل ===================
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "رقم الهوية مطلوب";
    } else if (!ID_REGEX.test(formData.idNumber.trim())) {
      newErrors.idNumber = "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-()./]/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
        newErrors.phoneNumber = "الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام";
      }
    }

    // كلمة المرور الافتراضية = رقم الهوية (لا تحتاج تحقق)

    // =================== البيانات الشخصية ===================
    if (!formData.birthDate) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 21) {
        newErrors.birthDate = "يجب أن يكون عمر السكرتير 21 عام على الأقل";
      }
    }

    if (!formData.residence.trim()) {
      newErrors.residence = "مكان السكن مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEditMode]);

  // =================== Handlers ===================
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("permissions.")) {
      const permissionKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) || undefined : value,
      }));
    }

    // Clear error when field is changed - استخدام functional update
    setErrors((prev) => {
      if (prev[name]) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });

    // التحقق من التكرار للحقول الحساسة
    if (name === 'email' || name === 'phoneNumber' || name === 'idNumber') {
      debouncedDuplicateCheck(name, value);
    }
  }, [debouncedDuplicateCheck]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق مما إذا كانت هناك تغييرات عند التعديل
    if (isEditMode && initialData) {
      if (isEqual(formData, initialData)) {
        // إغلاق المودال بدون إرسال طلب
        // نحتاج إلى طريقة لإغلاق المودال من هنا أو إرجاع قيمة
      }
      
      // لتجنب تعقيد تمرير onClose، سنقوم بفحص التغييرات وتنبيه المستخدم
      // ولكن onSubmit يتوقع إتمام العملية.
      // الحل الأمثل: إضافة فحص isEqual قبل استدعاء onSubmit
      
      const formDataToCheck = { ...formData };
      delete formDataToCheck.password; // كلمة المرور لا تأتي من السيرفر، لذا نتجاهلها في المقارنة المبدئية إلا إذا تم تعيينها
      
      const initialDataToCheck = { ...initialData };
      delete initialDataToCheck.password;

      // إذا كانت كلمة المرور فارغة في التعديل، نتجاهلها
      if (!formData.password && isEqual(formDataToCheck, initialDataToCheck)) {
        showInfoToast("لم يتم إجراء أي تغييرات");
        if (onClose) onClose();
        return; 
      }
    }

    if (!validateForm()) return;

    const submitData = { ...formData };
    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    await onSubmit(submitData);
  }, [formData, isEditMode, validateForm, onSubmit, initialData]);

  return {
    formData,
    errors,
    showPassword,
    isEditMode,
    setShowPassword,
    handleChange,
    handleSubmit,
    validateForm,
  };
};

export default useSecretaryForm;
