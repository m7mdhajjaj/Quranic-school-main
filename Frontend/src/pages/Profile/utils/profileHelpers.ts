// utils/profileHelpers.ts
import type { UserProfile, RoleConfig } from "../types/profile.types";

export const getUserGender = (
  user: UserProfile
): "male" | "ذكر" | "أنثى" | "female" | undefined => {
  const gender = user?.gender as string | undefined;
  if (gender === "ذكر" || gender === "male") return "male";
  if (gender === "أنثى" || gender === "انثى" || gender === "female")
    return "female";
  return "male"; // default
};

export const toArabicGender = (g?: string) => {
  if (!g || g.trim() === "") return "غير محدد";
  const normalized = g.trim();
  if (normalized === "ذكر" || normalized === "male") return "ذكر";
  if (normalized === "أنثى" || normalized === "انثى" || normalized === "female")
    return "أنثى";
  return "غير محدد";
};

export const calcAge = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(+d)) return undefined;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

export const formatDate = (iso?: string) => {
  if (!iso) return "غير محدد";
  const d = new Date(iso);
  return Number.isNaN(+d)
    ? "غير محدد"
    : d.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

export const nv = (v?: string | number) =>
  v === undefined || v === null || v === "" ? "غير متوفر" : String(v);

export const getRoleConfig = (
  role?: "student" | "teacher" | "admin"
): RoleConfig => {
  const configs: Record<string, RoleConfig> = {
    student: {
      label: "طالب",
      gradient: "from-emerald-600 to-teal-600",
      lightGradient: "from-emerald-500 to-teal-500",
      icon: "🎓",
      pattern: "from-emerald-100 to-teal-100",
    },
    teacher: {
      label: "معلم",
      gradient: "from-teal-600 to-cyan-600",
      lightGradient: "from-teal-500 to-cyan-500",
      icon: "👨‍🏫",
      pattern: "from-teal-100 to-cyan-100",
    },
    admin: {
      label: "مدير",
      gradient: "from-emerald-700 to-emerald-900",
      lightGradient: "from-emerald-600 to-emerald-800",
      icon: "⚡",
      pattern: "from-emerald-100 to-emerald-200",
    },
  };
  return configs[role || "student"];
};
