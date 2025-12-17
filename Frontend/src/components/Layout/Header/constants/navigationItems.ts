import {
  AlertTriangle,
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Clock,
  ClipboardList,
  FileCheck2,
  Headphones,
  Home,
  Medal,
  MessageSquare,
  Newspaper,
  PieChart,
  Sparkles,
  Target,
  UserCheck,
  Users,
  BarChart3,
  UserPlus,
} from "lucide-react";
import type { NavigationItem, RolePermissions } from "../types/navigation.types";

export const getPrimaryNavItems = (rolePermissions: RolePermissions): NavigationItem[] => {
  // العناصر المشتركة لجميع المستخدمين
  const commonItems: NavigationItem[] = [
    {
      to: "/",
      label: "الرئيسية",
      icon: Home,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  // إذا كان المستخدم أدمن، أعرض فقط عناصر الأدمن
  if (rolePermissions.isAdmin) {
    return [
      {
        to: "/admin/dashboard",
        label: "لوحة الإدارة",
        icon: BarChart3,
        color: "from-purple-600 to-indigo-600",
      },
      {
        to: "/admin/students",
        label: "إدارة الطلاب",
        icon: Users,
        color: "from-blue-600 to-cyan-600",
      },
      {
        to: "/admin/teachers",
        label: "إدارة المعلمين",
        icon: UserPlus,
        color: "from-green-600 to-emerald-600",
      },
      {
        to: "/admin/groups",
        label: "إدارة الحلقات",
        icon: BookOpen,
        color: "from-teal-600 to-cyan-600",
      },
      {
        to: "/timetable",
        label: "مواعيد الحلقات",
        icon: Clock,
        color: "from-indigo-600 to-purple-600",
      },
      {
        to: "/chat",
        label: "المحادثة",
        icon: MessageSquare,
        color: "from-green-500 to-teal-500",
      },
    ];
  }

  // إذا كان المستخدم معلم، أعرض عناصر المعلم
  if (rolePermissions.isTeacher) {
    return [
      ...commonItems,
      {
        to: "/news",
        label: "الأخبار",
        icon: Newspaper,
        color: "from-purple-500 to-pink-500",
      },
      {
        to: "/students-management",
        label: "إدارة الطلاب",
        icon: UserCheck,
        color: "from-emerald-500 to-green-500",
      },
      {
        to: "/goals",
        label: "الأهداف",
        icon: Target,
        color: "from-green-500 to-emerald-500",
      },
      {
        to: "/daily-marks",
        label: " العلامات اليومية",
        icon: Award,
        color: "from-orange-500 to-red-500",
      },
      {
        to: "/points-game",
        label: "لعبة النقاط",
        icon: Award,
        color: "from-yellow-500 to-orange-500",
      },
      {
        to: "/attendance",
        label: "الحضور والغياب",
        icon: UserCheck,
        color: "from-red-500 to-pink-500",
      },
    ];
  }

  // عناصر الطلاب (المستخدمون العاديون)
  return [
    ...commonItems,
    {
      to: "/news",
      label: "الأخبار",
      icon: Newspaper,
      color: "from-purple-500 to-pink-500",
    },
    {
      to: "/goals",
      label: "الأهداف",
      icon: Target,
      color: "from-green-500 to-emerald-500",
    },
    {
      to: "/daily-marks",
      label: " العلامات اليومية",
      icon: Award,
      color: "from-orange-500 to-red-500",
    },
    {
      to: "/points-game",
      label: "لعبة النقاط",
      icon: Award,
      color: "from-yellow-500 to-orange-500",
    },
    {
      to: "/attendance",
      label: "الحضور والغياب",
      icon: UserCheck,
      color: "from-red-500 to-pink-500",
    },
    {
      to: "/test",
      label: "اختبر نفسك",
      icon: FileCheck2,
      color: "from-indigo-500 to-purple-500",
    },
  ];
};

export const getSecondaryNavItems = (rolePermissions: RolePermissions): NavigationItem[] => {
  // الأدمن لا يحتاج للتنقل الثانوي
  if (rolePermissions.isAdmin) {
    return [];
  }

  // العناصر للمعلمين والطلاب
  return [
    {
      to: "/quran",
      label: "القرآن الكريم",
      icon: BookOpen,
      color: "from-teal-500 to-cyan-500",
      subItems: [
        {
          to: "/quran",
          label: "قرآن شفهي",
          icon: BookOpen,
          color: "from-teal-500 to-cyan-500",
        },
        {
          to: "/quran-audio",
          label: "قرآن صوتي",
          icon: Headphones,
          color: "from-blue-500 to-indigo-500",
        },
      ],
    },
    {
      to: "/azkar",
      label: "الأذكار",
      icon: BookOpenCheck,
      color: "from-green-500 to-emerald-500",
    },
    {
      to: "/prayer-times",
      label: "مواقيت الصلاة",
      icon: Clock,
      color: "from-cyan-500 to-blue-500",
    },
    {
      to: "/ranking",
      label: "الترتيب",
      icon: Medal,
      color: "from-yellow-500 to-orange-500",
    },
    {
      to: "/activities",
      label: "الأنشطة",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
    },
    {
      to: "/warnings",
      label: "الإنذارات",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
    },
    {
      to: "/reports",
      label: "التقارير الشهرية",
      icon: PieChart,
      color: "from-purple-500 to-indigo-500",
    },
    {
      to: "/timetable",
      label: "مواعيد الحلقة",
      icon: CalendarDays,
      color: "from-emerald-500 to-green-500",
    },
    {
      to: "/exam-schedule",
      label: "الامتحانات الرسمية",
      icon: ClipboardList,
      color: "from-violet-500 to-purple-500",
    },
    {
      to: "/chat",
      label: "المحادثة",
      icon: MessageSquare,
      color: "from-green-500 to-teal-500",
    },
  ];
};