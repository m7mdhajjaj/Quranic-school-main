import { useState, useEffect, useCallback } from "react";
import type { Secretary } from "../types";

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
}: UseSecretaryFormProps): UseSecretaryFormReturn => {
  const [formData, setFormData] = useState<SecretaryFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!secretary;

  // =================== Reset Form on Open/Close ===================
  useEffect(() => {
    if (secretary) {
      setFormData({
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
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setShowPassword(false);
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
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
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

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    await onSubmit(submitData);
  }, [formData, isEditMode, validateForm, onSubmit]);

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
