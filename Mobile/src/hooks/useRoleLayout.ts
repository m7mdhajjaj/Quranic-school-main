import { useMemo } from "react";

type Role = "student" | "teacher" | "admin";

export interface PageInfo {
  title: string;
  breadcrumb: string;
}

export const useRoleLayout = () => {
  const getRoleLabel = useMemo(() => {
    return (role?: Role | null) => {
      if (role === "teacher") return "معلم";
      if (role === "admin") return "مدير";
      if (role === "student") return "طالب";
      return "مستخدم";
    };
  }, []);

  const getPageInfo = useMemo(() => {
    return (routeName?: string | null): PageInfo => {
      if (routeName === "Home") {
        return { title: "الرئيسية", breadcrumb: "الرئيسية / الرئيسية" };
      }
      if (routeName === "Login") {
        return { title: "تسجيل الدخول", breadcrumb: "الرئيسية / تسجيل الدخول" };
      }
      return { title: "الرئيسية", breadcrumb: "الرئيسية" };
    };
  }, []);

  return { getRoleLabel, getPageInfo };
};
