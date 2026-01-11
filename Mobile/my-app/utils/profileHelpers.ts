// utils/profileHelpers.ts
import type { UserProfile, RoleConfig } from "@/types/profile.types";

/**
 * Calculate age from ISO date string
 */
export const calculateAge = (dateString: string): number | null => {
  if (!dateString) return null;

  try {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
};

/**
 * Format ISO date to Arabic locale string
 */
export const formatArabicDate = (iso: string): string => {
  if (!iso) return "غير محدد";

  try {
    const date = new Date(iso);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "غير محدد";
  }
};

/**
 * Get user gender in standardized format
 */
export const getUserGender = (
  user: UserProfile
): "male" | "ذكر" | "أنثى" | "female" | undefined => {
  const gender = user?.gender as string | undefined;
  if (gender === "ذكر" || gender === "male") return "male";
  if (gender === "أنثى" || gender === "انثى" || gender === "female")
    return "female";
  return "male"; // default
};

/**
 * Convert gender to Arabic format
 */
export const toArabicGender = (g?: string) => {
  if (!g || g.trim() === "") return "غير محدد";
  const normalized = g.trim();
  if (normalized === "ذكر" || normalized === "male") return "ذكر";
  if (normalized === "أنثى" || normalized === "انثى" || normalized === "female")
    return "أنثى";
  return "غير محدد";
};

/**
 * Calculate age from ISO date string
 */
export const calcAge = (iso?: string) => {
  if (!iso) return undefined;
  try {
    return calculateAge(iso);
  } catch {
    return undefined;
  }
};

/**
 * Format ISO date to Arabic locale string
 */
export const formatDate = (iso?: string) => {
  if (!iso) return "غير محدد";
  try {
    return formatArabicDate(iso);
  } catch {
    return "غير محدد";
  }
};

/**
 * Get non-empty value or fallback text
 */
export const nv = (v?: string | number) =>
  v === undefined || v === null || v === "" ? "غير متوفر" : String(v);

/**
 * Get full name from user object
 */
export const getFullName = (user: UserProfile | null): string => {
  if (!user) return "";

  const parts = [
    user.firstName,
    user.fatherName,
    user.grandFatherName,
    user.lastName,
  ].filter(Boolean);

  return parts.join(" ") || user.firstName || "";
};

/**
 * Get role configuration (label and icon only)
 */
export const getRoleConfig = (
  role?: "student" | "teacher" | "admin"
): RoleConfig => {
  const configs: Record<string, RoleConfig> = {
    student: {
      label: "طالب",
      icon: "🎓",
    },
    teacher: {
      label: "معلم",
      icon: "👨‍🏫",
    },
    admin: {
      label: "مدير",
      icon: "⚡",
    },
  };
  return configs[role || "student"];
};
