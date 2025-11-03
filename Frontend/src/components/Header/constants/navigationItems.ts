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
  Settings,
  Shield,
  Sparkles,
  Target,
  UserCheck,
  Users,
  Database,
  BarChart3,
  UserPlus,
} from "lucide-react";
import type { NavigationItem, RolePermissions } from "../types/navigation.types";

export const getPrimaryNavItems = (rolePermissions: RolePermissions): NavigationItem[] => [
  {
    to: "/",
    label: "الرئيسية",
    icon: Home,
    color: "from-blue-500 to-cyan-500",
  },
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
    to: "/absence",
    label: "الحضور والغياب",
    icon: UserCheck,
    color: "from-red-500 to-pink-500",
  },
  // عناصر خاصة بالمعلمين
  ...(rolePermissions.isTeacher && !rolePermissions.isAdmin
    ? [
        {
          to: "/my-students",
          label: "إدارة الطلاب",
          icon: UserCheck,
          color: "from-emerald-500 to-green-500",
        },
      ]
    : []),
  // عناصر خاصة بالأدمن
  ...(rolePermissions.isAdmin
    ? [
        {
          to: "/admin/dashboard",
          label: "لوحة الإدارة",
          icon: BarChart3,
          color: "from-purple-600 to-indigo-600",
        },
        {
          to: "/admin/users",
          label: "إدارة المستخدمين",
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
          to: "/admin/system",
          label: "إعدادات النظام",
          icon: Settings,
          color: "from-gray-600 to-slate-600",
        },
      ]
    : []),
  {
    to: "/test",
    label: "اختبر نفسك",
    icon: FileCheck2,
    color: "from-indigo-500 to-purple-500",
  },
];

export const getSecondaryNavItems = (rolePermissions: RolePermissions): NavigationItem[] => {
  const base: NavigationItem[] = [
    {
      to: "/quran",
      label: "القرآن الكريم",
      icon: BookOpen,
      color: "from-teal-500 to-cyan-500",
    },
    {
      to: "/quran-audio",
      label: "استمع للقران",
      icon: Headphones,
      color: "from-blue-500 to-indigo-500",
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
      to: "/arrangement",
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

  // إضافة عناصر خاصة بالأدمن في الصف الثاني
  const adminItems: NavigationItem[] = rolePermissions.isAdmin
    ? [
        {
          to: "/admin/database",
          label: "إدارة قاعدة البيانات",
          icon: Database,
          color: "from-orange-600 to-red-600",
        },
        {
          to: "/admin/security",
          label: "الأمان والصلاحيات",
          icon: Shield,
          color: "from-red-600 to-pink-600",
        },
      ]
    : [];

  return [...base, ...adminItems];
};