// utils/profileHelpers.ts
import { calculateAge, formatArabicDate } from "@/utils/helpers/dateHelpers";
import type { UserProfile, RoleConfig } from "../types/profile.types";

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
 * Get role configuration (label and icon only)
 */
export const getRoleConfig = (
  role?: "student" | "teacher" | "admin" | "secretary" | "teacherAssistant"
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
    secretary: {
      label: "سكرتير",
      icon: "📋",
    },
    teacherAssistant: {
      label: "مساعد مدرس",
      icon: "🤝",
    },
  };
  return configs[role || "student"] || configs["student"];
};
