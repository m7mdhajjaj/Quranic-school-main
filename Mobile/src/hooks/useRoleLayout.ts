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
  Activity,
  UserCheck,
  AlertTriangle,
  Trophy,
  BookOpen,
  CalendarClock,
  BookMarked,
  Home,
  LayoutDashboard,
} from "lucide-react-native";

type Role = "student" | "teacher" | "admin";

export interface PageInfo {
  title: string;
  breadcrumb: string;
}

export interface NavItem {
  route: string;
  label: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  roles: Role[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  roles: Role[];
}

/**
 * Mobile version of Frontend useRoleLayout
 * - Preserves the same navGroups order/structure as Frontend
 * - Uses React Navigation route names instead of URL paths
 */
export const useRoleLayout = () => {
  const { user } = useAuth();

  const allNavGroups: NavGroup[] = useMemo(
    () => [
      {
        title: "الرئيسية",
        roles: ["admin"],
        items: [
          {
            route: "AdminDashboard",
            label: "لوحة التحكم",
            icon: LayoutDashboard,
            roles: ["admin"],
          },
        ],
      },
      {
        title: "الرئيسية",
        roles: ["student", "teacher"],
        items: [
          {
            route: "Home",
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
            route: "Goals",
            label: "الأهداف",
            icon: Target,
            roles: ["student", "teacher"],
          },
          {
            route: "DailyMarks",
            label: "العلامات اليومية",
            icon: Award,
            roles: ["student", "teacher"],
          },
          {
            route: "Ranking",
            label: "التصنيف",
            icon: BarChart3,
            roles: ["student", "teacher"],
          },
          {
            route: "ExamSchedule",
            label: "جدول الامتحانات",
            icon: Calendar,
            roles: ["student", "teacher"],
          },
          {
            route: "Reports",
            label: "التقارير",
            icon: FileText,
            roles: ["student", "teacher"],
          },
          {
            route: "Timetable",
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
            route: "News",
            label: "الأخبار",
            icon: Newspaper,
            roles: ["student", "teacher"],
          },
          {
            route: "Chat",
            label: "المحادثة",
            icon: MessageSquare,
            roles: ["student", "teacher"],
          },
          {
            route: "Activities",
            label: "الأنشطة",
            icon: Activity,
            roles: ["student", "teacher"],
          },
        ],
      },
      {
        title: "الإدارة",
        roles: ["student", "teacher"],
        items: [
          {
            route: "Attendance",
            label: "الحضور والغياب",
            icon: UserCheck,
            roles: ["student", "teacher"],
          },
          {
            route: "Warnings",
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
            route: "PointsGame",
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
            route: "PrayerTimes",
            label: "أوقات الصلاة",
            icon: CalendarClock,
            roles: ["student", "teacher"],
          },
          {
            route: "Quran",
            label: "القرآن الكريم",
            icon: BookOpen,
            roles: ["student", "teacher"],
          },
          {
            route: "Azkar",
            label: "الأذكار",
            icon: BookMarked,
            roles: ["student", "teacher"],
          },
        ],
      },
    ],
    []
  );

  const navGroups = useMemo(() => {
    if (!user?.role) return [];
    const role = user.role as Role;
    return allNavGroups
      .filter((group) => group.roles.includes(role))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.roles.includes(role)),
      }))
      .filter((group) => group.items.length > 0);
  }, [allNavGroups, user?.role]);

  const navItems = useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups]
  );

  const getPageInfo = (routeName: string): PageInfo => {
    const pageMap: Record<string, PageInfo> = {
      Goals: { title: "الأهداف", breadcrumb: "الرئيسية / الأهداف" },
      DailyMarks: {
        title: "العلامات اليومية",
        breadcrumb: "الرئيسية / العلامات اليومية",
      },
      Ranking: { title: "التصنيف", breadcrumb: "الرئيسية / التصنيف" },
      ExamSchedule: {
        title: "جدول الامتحانات",
        breadcrumb: "الرئيسية / جدول الامتحانات",
      },
      Reports: { title: "التقارير", breadcrumb: "الرئيسية / التقارير" },
      Timetable: { title: "المواعيد", breadcrumb: "الرئيسية / المواعيد" },
      News: { title: "الأخبار", breadcrumb: "الرئيسية / الأخبار" },
      Chat: { title: "المحادثة", breadcrumb: "الرئيسية / المحادثة" },
      Activities: { title: "الأنشطة", breadcrumb: "الرئيسية / الأنشطة" },
      Attendance: {
        title: "الحضور والغياب",
        breadcrumb: "الرئيسية / الحضور والغياب",
      },
      Warnings: { title: "الإنذارات", breadcrumb: "الرئيسية / الإنذارات" },
      PointsGame: {
        title: "لعبة النقاط",
        breadcrumb: "الرئيسية / لعبة النقاط",
      },
      PrayerTimes: {
        title: "أوقات الصلاة",
        breadcrumb: "الرئيسية / أوقات الصلاة",
      },
      Quran: { title: "القرآن الكريم", breadcrumb: "الرئيسية / القرآن الكريم" },
      Azkar: { title: "الأذكار", breadcrumb: "الرئيسية / الأذكار" },
      Profile: { title: "الملف الشخصي", breadcrumb: "الرئيسية / الملف الشخصي" },
      Home: { title: "الصفحة الرئيسية", breadcrumb: "الرئيسية" },
      Login: { title: "تسجيل الدخول", breadcrumb: "الرئيسية / تسجيل الدخول" },
    };

    return (
      pageMap[routeName] || { title: "الصفحة الرئيسية", breadcrumb: "الرئيسية" }
    );
  };

  const getRoleLabel = (role?: Role | null) => {
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
    navItems,
    navGroups,
    getPageInfo,
    getRoleLabel,
    userRole: user?.role,
  };
};
