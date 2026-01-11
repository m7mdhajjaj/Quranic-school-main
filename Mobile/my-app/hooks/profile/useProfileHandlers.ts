// hooks/profile/useProfileHandlers.ts
import { useMemo } from "react";
import { getFullName, calcAge, getRoleConfig } from "@/utils/profileHelpers";
import type { UserProfile } from "@/types/profile.types";

export const useProfileHandlers = (
  user: UserProfile | null,
  edited: UserProfile | null,
  isEditing: boolean
) => {
  // Computed values
  const fullName = useMemo(() => (user ? getFullName(user) : ""), [user]);

  const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

  const roleConfig = useMemo(() => getRoleConfig(user?.role), [user?.role]);

  const backgroundColor = useMemo(
    () =>
      user?.role === "admin"
        ? "#d1fae5" // Light green for admin
        : "#f9fafb", // Light gray for others
    [user?.role]
  );

  const heroBgColor = useMemo(
    () =>
      user?.role === "admin"
        ? "#10b981" // Emerald green
        : "#14b8a6", // Teal
    [user?.role]
  );

  // Visibility handler - for students, hide empty fields when not editing
  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === "student" && !isEditing && !valuePresent) return false;
    return true;
  };

  return {
    fullName,
    age,
    roleConfig,
    backgroundColor,
    heroBgColor,
    shouldShow,
  };
};
