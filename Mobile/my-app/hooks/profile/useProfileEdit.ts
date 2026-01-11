// hooks/profile/useProfileEdit.ts
import { useState } from "react";
import { Alert } from "react-native";
import { updateProfile } from "@/Api/profileApi";
import type { UserProfile, Endpoint } from "@/types/profile.types";

export const useProfileEdit = (
  user: UserProfile | null,
  endpoint: Endpoint,
  onSuccess?: (updatedUser: UserProfile) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const beginEdit = () => {
    setEdited(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEdited(null);
    setFieldErrors({});
  };

  const updateField = (field: string, value: any) => {
    if (edited) {
      setEdited({ ...edited, [field]: value });
      // Clear error for this field
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const saveProfile = async () => {
    if (!user || !edited) return;

    setFieldErrors({});
    setIsSaving(true);

    try {
      const payload: Partial<UserProfile> = {
        firstName: edited.firstName,
        fatherName: edited.fatherName,
        grandFatherName: edited.grandFatherName,
        motherName: edited.motherName,
        lastName: edited.lastName,
        birthDate: edited.birthDate,
        residence: edited.residence,
        phoneNumber: edited.phoneNumber,
      };

      await updateProfile(payload);

      const updatedUser = { ...user, ...payload };
      setEdited(null);
      setIsEditing(false);

      if (onSuccess) {
        onSuccess(updatedUser);
      }

      Alert.alert("نجح", "تم حفظ التعديلات بنجاح");
    } catch (error: any) {
      const message = error?.response?.data?.message || "فشل حفظ التعديلات";
      Alert.alert("خطأ", message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    edited,
    isSaving,
    fieldErrors,
    beginEdit,
    cancelEdit,
    saveProfile,
    updateField,
    setFieldErrors,
  };
};
