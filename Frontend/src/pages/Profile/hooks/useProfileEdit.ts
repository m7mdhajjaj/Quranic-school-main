// hooks/useProfileEdit.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { showSuccessToast, showInfoToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import { updateUserById } from "@/Api/profileApi";
import { validateProfileData, type FieldErrors } from "@/Validation/profileValidation";
import { canEditFieldLocal } from "../utils/editLimits";
import { isEqual } from "@/utils/objectUtils";
import type { UserProfile, Endpoint } from "../types/profile.types";

export const useProfileEdit = (
  user: UserProfile | null,
  endpoint: Endpoint,
  onSuccess?: (updatedUser: UserProfile) => void
) => {
  const { updateUser: updateAuthUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [remainingBirth, setRemainingBirth] = useState<number>(2);

  const beginEdit = () => {
    setEdited(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEdited(null);
    setFieldErrors({});
  };

  // Load edit limits from backend
  useEffect(() => {
    const loadEditLimits = async () => {
      if (!user?._id) return;
      try {
        const limits = await canEditFieldLocal();
        setRemainingBirth(limits.remaining);
      } catch (error) {
        console.error("Error loading edit limits:", error);
      }
    };
    loadEditLimits();
  }, [user?._id]);

  const saveProfile = async (avatarFile?: File | null) => {
    if (!user) return;
    
    // إذا المستخدم بس بدو يرفع صورة بدون تعديل البيانات
    if (!edited) {
      // ما في شي لازم نحفظه، الصورة رح ترفع بشكل منفصل
      return;
    }

    // مقارنة البيانات الأصلية مع المعدلة
    const fieldsToCompare: (keyof UserProfile)[] = [
      'firstName',
      'fatherName',
      'grandFatherName',
      'motherName',
      'lastName',
      'birthDate',
      'residence',
      'idNumber',
      'phoneNumber',
    ];

    // إضافة مجموعات المعلم إذا كان الدور معلم
    if (user.role === "teacher") {
      fieldsToCompare.push('groups');
    }

    // بناء كائنات للمقارنة
    const originalData: Partial<UserProfile> = {};
    const editedData: Partial<UserProfile> = {};

    for (const field of fieldsToCompare) {
      // تطبيع التواريخ للمقارنة
      if (field === 'birthDate') {
        const normalizeForCompare = (date: string | Date | undefined | null): string | null => {
          if (!date) return null;
          if (typeof date === "string") return date.split("T")[0].trim();
          if (date instanceof Date) return date.toISOString().split("T")[0];
          return null;
        };
        originalData[field] = normalizeForCompare(user[field] as string | Date | undefined) as any;
        editedData[field] = normalizeForCompare(edited[field] as string | Date | undefined) as any;
      } else {
        originalData[field] = user[field];
        editedData[field] = edited[field];
      }
    }

    // مقارنة البيانات
    if (isEqual(originalData, editedData) && !avatarFile) {
      showInfoToast("لم يتم إجراء أي تغييرات على البيانات");
      return;
    }

    setFieldErrors({});

    const validation = await validateProfileData({
      firstName: edited.firstName,
      fatherName: edited.fatherName,
      grandFatherName: edited.grandFatherName,
      lastName: edited.lastName,
      motherName: edited.motherName,
      email: edited.email,
      phoneNumber: edited.phoneNumber,
      birthDate: edited.birthDate,
      gender: user.gender,
      residence: edited.residence,
      idNumber: edited.idNumber,
      role: user.role || "student",
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      showErrorMessage("خطأ", "يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsSaving(true);

    const payload: Partial<UserProfile> = {
      firstName: edited.firstName,
      fatherName: edited.fatherName,
      grandFatherName: edited.grandFatherName,
      motherName: edited.motherName,
      lastName: edited.lastName,
      birthDate: edited.birthDate,
      residence: edited.residence,
      idNumber: edited.idNumber,
      phoneNumber: edited.phoneNumber,
    };

    if (user.role === "teacher" && edited.groups !== undefined) {
      payload.groups = edited.groups;
    }

    // Compare birthDate values properly
    const normalizeDate = (date: string | Date | undefined | null): string | null => {
      if (!date) return null;
      if (typeof date === "string") {
        return date.split("T")[0].trim();
      }
      if (date instanceof Date) {
        return date.toISOString().split("T")[0];
      }
      return null;
    };

    const currentBirthDateStr = normalizeDate(user.birthDate);
    const editedBirthDateStr = normalizeDate(edited.birthDate);
    const changingBirth =
      currentBirthDateStr !== editedBirthDateStr && editedBirthDateStr !== null;

    if (changingBirth) {
      const b = await canEditFieldLocal();
      if (!b.allowed) {
        showErrorMessage("خطأ", "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك");
        setIsSaving(false);
        return;
      }
    }

    try {
      await updateUserById(endpoint, user._id, payload);

      // Update remainingBirth count if birthDate was changed
      if (changingBirth) {
        const updatedLimits = await canEditFieldLocal();
        setRemainingBirth(updatedLimits.remaining);
      }

      const updatedUser = { ...user, ...payload };
      setEdited(null);
      setIsEditing(false);
      
      if (onSuccess) {
        onSuccess(updatedUser);
      }

      showSuccessToast("تم حفظ التعديلات بنجاح");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            editLimit?: { allowed: boolean; remaining: number; count: number };
          };
          status?: number;
        };
      };

      // Handle edit limit error specifically
      if (
        axiosError?.response?.data?.editLimit &&
        !axiosError.response.data.editLimit.allowed
      ) {
        const limits = axiosError.response.data.editLimit;
        setRemainingBirth(limits.remaining);
        showErrorMessage(
          "خطأ",
          axiosError.response.data.message ||
            "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
      } else {
        const msg =
          axiosError?.response?.data?.message || "تعذّر حفظ التعديلات";
        showErrorMessage("خطأ", msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setEdited((p) => (p ? { ...p, [field]: value } : p));
  };

  return {
    isEditing,
    edited,
    isSaving,
    fieldErrors,
    remainingBirth,
    beginEdit,
    cancelEdit,
    saveProfile,
    updateField,
    setFieldErrors,
  };
};
