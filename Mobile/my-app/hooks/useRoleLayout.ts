import { useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  BarChart3,
  Target,
  Award,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Newspaper,
  UserCheck,
  AlertTriangle,
  Trophy,
  BookOpen,
  CalendarClock,
  BookMarked,
  Home,
  User,
  Key,
  LogOut,
} from "lucide-react-native";
import { LucideIcon } from "lucide-react-native";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: ("student" | "teacher" | "admin")[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  roles: ("student" | "teacher" | "admin")[];
}

/**
 * Hook لإدارة عناصر الناف حسب الرول
 * يفصل المنطق عن الكوبوننتات
 */
export const useRoleLayout = () => {
  const { user } = useAuth();

  // جميع مجموعات الناف المتاحة
  const allNavGroups: NavGroup[] = useMemo(
    () => [
      {
        title: "الرئيسية",
        roles: ["student", "teacher"],
        items: [
          {
            to: "/",
            label: "الصفحة الرئيسية",
            icon: Home,
            roles: ["student", "teacher"],
          },
        ],
      },
      {
        title: "الأكاديمية",
        roles: ["student", "teacher"],
        items: [
          {
            to: "/goals",
            label: "الأهداف",
            icon: Target,
            roles: ["student", "teacher"],
          },
          {
            to: "/daily-marks",
            label: "العلامات اليومية",
            icon: Award,
            roles: ["student", "teacher"],
          },
          {
            to: "/ranking",
            label: "التصنيف",
            icon: BarChart3,
            roles: ["student", "teacher"],
          },
          {
            to: "/exam-schedule",
            label: "جدول الامتحانات",
            icon: Calendar,
            roles: ["student", "teacher"],
          },
          {
            to: "/reports",
            label: "التقارير",
            icon: FileText,
            roles: ["student", "teacher"],
          },
          {
            to: "/timetable",
            label: "المواعيد",
            icon: Clock,
            roles: ["student", "teacher"],
          },
        ],
      },
      {
        title: "التواصل",
        roles: ["student", "teacher"],
        items: [
          {
            to: "/news",
            label: "الأخبار",
            icon: Newspaper,
            roles: ["student", "teacher"],
          },
          {
            to: "/chat",
            label: "المحادثة",
            icon: MessageSquare,
            roles: ["student", "teacher"],
          },
        ],
      },
      {
        title: "الإدارة",
        roles: ["student", "teacher"],
        items: [
          {
            to: "/attendance",
            label: "الحضور والغياب",
            icon: UserCheck,
            roles: ["student", "teacher"],
          },
          {
            to: "/warnings",
            label: "الإنذارات",
            icon: AlertTriangle,
            roles: ["student", "teacher"],
          },
        ],
      },
      {
        title: "الترفيه",
        roles: ["student", "teacher"],
        items: [
          {
            to: "/points-game",
            label: "لعبة النقاط",
            icon: Trophy,
            roles: ["student", "teacher"],
          },
        ],
      },
      {
        title: "الدينية",
        roles: ["student", "teacher"],
        items: [
          {
            to: "/prayer-times",
            label: "أوقات الصلاة",
            icon: CalendarClock,
            roles: ["student", "teacher"],
          },
          {
            to: "/quran",
            label: "القرآن الكريم",
            icon: BookOpen,
            roles: ["student", "teacher"],
          },
          {
            to: "/azkar",
            label: "الأذكار",
            icon: BookMarked,
            roles: ["student", "teacher"],
          },
        ],
      },
    ],
    []
  );

  // فلترة مجموعات الناف حسب الرول الحالي
  const navGroups = useMemo(() => {
    if (!user?.role) return [];
    return allNavGroups
      .filter((group) => group.roles.includes(user.role))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.roles.includes(user.role)),
      }))
      .filter((group) => group.items.length > 0);
  }, [user?.role, allNavGroups]);

  // للحفاظ على التوافق مع الكود القديم - إرجاع جميع العناصر في قائمة مسطحة
  const navItems = useMemo(() => {
    if (!user?.role) return [];
    return navGroups.flatMap((group) => group.items);
  }, [navGroups, user?.role]);

  // الحصول على معلومات الصفحة حسب المسار
  const getPageInfo = (pathname: string) => {
    const pageMap: Record<string, { title: string; breadcrumb: string }> = {
      "/goals": { title: "الأهداف", breadcrumb: "الرئيسية / الأهداف" },
      "/daily-marks": {
        title: "العلامات اليومية",
        breadcrumb: "الرئيسية / العلامات اليومية",
      },
      "/ranking": { title: "التصنيف", breadcrumb: "الرئيسية / التصنيف" },
      "/exam-schedule": {
        title: "جدول الامتحانات",
        breadcrumb: "الرئيسية / جدول الامتحانات",
      },
      "/reports": { title: "التقارير", breadcrumb: "الرئيسية / التقارير" },
      "/timetable": { title: "المواعيد", breadcrumb: "الرئيسية / المواعيد" },
      "/news": { title: "الأخبار", breadcrumb: "الرئيسية / الأخبار" },
      "/chat": { title: "المحادثة", breadcrumb: "الرئيسية / المحادثة" },
      "/activities": {
        title: "الأنشطة",
        breadcrumb: "الرئيسية / الأنشطة",
      },
      "/attendance": {
        title: "الحضور والغياب",
        breadcrumb: "الرئيسية / الحضور والغياب",
      },
      "/warnings": {
        title: "الإنذارات",
        breadcrumb: "الرئيسية / الإنذارات",
      },
      "/points-game": {
        title: "لعبة النقاط",
        breadcrumb: "الرئيسية / لعبة النقاط",
      },
      "/prayer-times": {
        title: "أوقات الصلاة",
        breadcrumb: "الرئيسية / أوقات الصلاة",
      },
      "/quran": {
        title: "القرآن الكريم",
        breadcrumb: "الرئيسية / القرآن الكريم",
      },
      "/azkar": { title: "الأذكار", breadcrumb: "الرئيسية / الأذكار" },
      "/profile": {
        title: "الملف الشخصي",
        breadcrumb: "الرئيسية / الملف الشخصي",
      },
      "/": { title: "الصفحة الرئيسية", breadcrumb: "الرئيسية" },
    };

    // البحث عن المسار المطابق
    for (const [path, info] of Object.entries(pageMap)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return info;
      }
    }

    return { title: "الصفحة الرئيسية", breadcrumb: "الرئيسية" };
  };

  // الحصول على اسم الرول بالعربية
  const getRoleLabel = (role?: string): string => {
    switch (role) {
      case "teacher":
        return "معلم";
      case "student":
        return "طالب";
      case "admin":
        return "مدير";
      default:
        return "مستخدم";
    }
  };

  return {
    navItems, // للحفاظ على التوافق
    navGroups, // المجموعات المنظمة
    getPageInfo,
    getRoleLabel,
    userRole: user?.role,
  };
};
