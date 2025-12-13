// hooks/useProfileHandlers.ts
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { calcAge, getRoleConfig } from "../utils/profileHelpers";
import { getFullName } from "@/utils/helpers/userHelpers";
import type { UserProfile } from "../types/profile.types";

export const useProfileHandlers = (
  user: UserProfile | null,
  edited: UserProfile | null,
  isEditing: boolean,
  updateField: (field: keyof UserProfile, value: any) => void,
  validateFieldValue: (fieldName: string, value: string | undefined) => Promise<void>,
  checkPhoneNumber: (
    value: string,
    currentValue: string | undefined,
    setFieldErrors: (updater: (prev: any) => any) => void
  ) => void,
  setEditFieldErrors: (updater: (prev: any) => any) => void,
  cancelEdit: () => void,
  resetAvatar: () => void,
  saveProfileEdit: (avatarFile?: File | null) => Promise<void>,
  uploadAvatar: () => Promise<void>,
  avatarFile: File | null
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isChangePasswordModalOpen = searchParams.get("change-password") === "true";

  const setIsChangePasswordModalOpen = (open: boolean) => {
    if (open) {
      setSearchParams({ "change-password": "true" });
    } else {
      setSearchParams({});
    }
  };

  // Computed values
  const fullName = useMemo(
    () => user ? getFullName(user) : "",
    [user]
  );

  const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

  const roleConfig = useMemo(() => getRoleConfig(user?.role), [user?.role]);

  const backgroundColor = useMemo(
    () =>
      user?.role === "admin"
        ? "bg-gradient-to-b from-emerald-50 via-green-50 to-teal-50"
        : "bg-gray-50",
    [user?.role]
  );

  const heroBgColor = useMemo(
    () =>
      user?.role === "admin"
        ? "bg-gradient-to-b from-teal-500 to-emerald-50"
        : "bg-gradient-to-b from-teal-500 to-gray-50",
    [user?.role]
  );

  // Handlers
  const handlePhoneNumberChange = async (value: string) => {
    if (!user || !edited) return;
    const numbersOnly = value.replace(/\D/g, "");
    updateField("phoneNumber", numbersOnly);
    checkPhoneNumber(numbersOnly, user.phoneNumber, setEditFieldErrors);
  };

  const handleFieldBlur = async (fieldName: string, value: string | undefined) => {
    await validateFieldValue(fieldName, value);
  };

  const handleCancelEdit = () => {
    cancelEdit();
    resetAvatar();
  };

  const handleSaveProfile = async () => {
    try {
      await saveProfileEdit(avatarFile);
      if (avatarFile) {
        await uploadAvatar();
      }
    } catch (error) {
      // Error already handled in hooks
    }
  };

  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === "student" && !isEditing && !valuePresent) return false;
    return true;
  };

  return {
    // Modal state
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    // Computed values
    fullName,
    age,
    roleConfig,
    backgroundColor,
    heroBgColor,
    // Handlers
    handlePhoneNumberChange,
    handleFieldBlur,
    handleCancelEdit,
    handleSaveProfile,
    shouldShow,
  };
};
