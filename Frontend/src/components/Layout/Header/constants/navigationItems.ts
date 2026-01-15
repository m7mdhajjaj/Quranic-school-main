import {
  AlertTriangle,
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Clock,
  ClipboardList,
  Headphones,
  Home,
  MessageSquare,
  Newspaper,
  PieChart,
  Target,
  UserCheck,
  Users,
  UserPlus,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
} from 'lucide-react';
import type {
  NavigationItem,
  RolePermissions,
} from '../types/navigation.types';

export const getPrimaryNavItems = (
  rolePermissions: RolePermissions
): NavigationItem[] => {
  // العناصر المشتركة لجميع المستخدمين
  const homeItem: NavigationItem = {
    to: '/',
    label: 'الرئيسية',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
  };

  // ==================== Admin Navigation ====================
  if (rolePermissions.isAdmin) {
    return [
      {
        to: '/admin/dashboard',
        label: 'لوحة الإدارة',
        icon: LayoutDashboard,
        color: 'from-purple-600 to-indigo-600',
      },
      {
        to: '#users-management',
        label: 'إدارة المستخدمين',
        icon: Users,
        color: 'from-blue-600 to-cyan-600',
        subItems: [
          {
            to: '/admin/students',
            label: 'إدارة الطلاب',
            icon: Users,
            color: 'from-blue-600 to-cyan-600',
          },
          {
            to: '/admin/teachers',
            label: 'إدارة المعلمين',
            icon: UserPlus,
            color: 'from-green-600 to-emerald-600',
          },
          {
            to: '/admin/secretaries',
            label: 'إدارة السكرتارية',
            icon: UserCheck,
            color: 'from-amber-600 to-orange-600',
          },
          {
            to: '/admin/groups',
            label: 'إدارة الحلقات',
            icon: BookOpen,
            color: 'from-teal-600 to-cyan-600',
          },
        ],
      },
      {
        to: '#academic-management',
        label: 'الإدارة الأكاديمية',
        icon: CalendarDays,
        color: 'from-indigo-600 to-purple-600',
        subItems: [
          {
            to: '/timetable',
            label: 'مواعيد الحلقات',
            icon: Clock,
            color: 'from-indigo-600 to-purple-600',
          },
          {
            to: '/attendance',
            label: 'الحضور والغياب',
            icon: UserCheck,
            color: 'from-red-600 to-pink-600',
          },
        ],
      },
      {
        to: '/chat',
        label: 'المحادثة',
        icon: MessageSquare,
        color: 'from-green-500 to-teal-500',
      },
    ];
  }

  // ==================== Teacher Navigation ====================
  if (rolePermissions.isTeacher) {
    return [
      homeItem,
      {
        to: '/news',
        label: 'الأخبار',
        icon: Newspaper,
        color: 'from-purple-500 to-pink-500',
      },
      {
        to: '#management',
        label: 'إدارة الحلقة',
        icon: UserCheck,
        color: 'from-emerald-500 to-green-500',
        subItems: [
          {
            to: '/students-management',
            label: 'إدارة الطلاب',
            icon: Users,
            color: 'from-emerald-500 to-green-500',
          },
          {
            to: '/attendance',
            label: 'الحضور والغياب',
            icon: UserCheck,
            color: 'from-red-500 to-pink-500',
          },
          {
            to: '/daily-marks',
            label: 'علامات يومية',
            icon: Award,
            color: 'from-orange-500 to-red-500',
          },
          {
            to: '/exam-schedule',
            label: 'امتحانات رسمية',
            icon: ClipboardList,
            color: 'from-violet-500 to-purple-500',
          },
        ],
      },
      {
        to: '#academic',
        label: 'المتابعة',
        icon: ClipboardList,
        color: 'from-green-500 to-emerald-500',
        subItems: [
          {
            to: '/goals',
            label: 'الأهداف',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
          },
          {
            to: '/reports',
            label: 'التقارير',
            icon: PieChart,
            color: 'from-purple-500 to-indigo-500',
          },
          {
            to: '/warnings',
            label: 'الإنذارات',
            icon: AlertTriangle,
            color: 'from-red-500 to-orange-500',
          },
          {
            to: '/timetable',
            label: 'مواعيد الحلقة',
            icon: CalendarDays,
            color: 'from-emerald-500 to-green-500',
          },
        ],
      },
      {
        to: '#religious',
        label: 'القرآن والأذكار',
        icon: BookOpen,
        color: 'from-teal-500 to-cyan-500',
        subItems: [
          {
            to: '/quran',
            label: 'قرآن شفهي',
            icon: BookOpen,
            color: 'from-teal-500 to-cyan-500',
          },
          {
            to: '/quran-audio',
            label: 'قرآن صوتي',
            icon: Headphones,
            color: 'from-blue-500 to-indigo-500',
          },
          {
            to: '/azkar',
            label: 'الأذكار',
            icon: BookOpenCheck,
            color: 'from-green-500 to-emerald-500',
          },
          {
            to: '/prayer-times',
            label: 'مواقيت الصلاة',
            icon: Clock,
            color: 'from-cyan-500 to-blue-500',
          },
        ],
      },
      {
        to: '/chat',
        label: 'المحادثة',
        icon: MessageSquare,
        color: 'from-green-500 to-teal-500',
      },
    ];
  }

  // ==================== Secretary Navigation ====================
  if (rolePermissions.isSecretary) {
    return [
      homeItem,
      {
        to: '/students',
        label: 'الطلاب',
        icon: Users,
        color: 'from-blue-500 to-indigo-500',
      },
      {
        to: '/teachers',
        label: 'المعلمين',
        icon: GraduationCap,
        color: 'from-purple-500 to-violet-500',
      },
      {
        to: '/goals',
        label: 'الأهداف',
        icon: Target,
        color: 'from-green-500 to-emerald-500',
      },
      {
        to: '/chat',
        label: 'المحادثة',
        icon: MessageSquare,
        color: 'from-blue-500 to-cyan-500',
      },
    ];
  }

  // ==================== Student Navigation ====================
  if (rolePermissions.isStudent) {
    return [
      homeItem,
      {
        to: '/news',
        label: 'الأخبار',
        icon: Newspaper,
        color: 'from-purple-500 to-pink-500',
      },
      {
        to: '#academic',
        label: 'أكاديميتي',
        icon: GraduationCap,
        color: 'from-green-500 to-emerald-500',
        subItems: [
          {
            to: '/goals',
            label: 'أهدافي الحالية',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
          },
          {
            to: '/daily-marks',
            label: 'سجل علاماتي',
            icon: ScrollText,
            color: 'from-orange-500 to-red-500',
          },
          {
            to: '/reports',
            label: 'التقارير',
            icon: PieChart,
            color: 'from-purple-500 to-indigo-500',
          },
          {
            to: '/exam-schedule',
            label: 'امتحانات رسمية',
            icon: ClipboardList,
            color: 'from-violet-500 to-purple-500',
          },
          {
            to: '/warnings',
            label: 'الإنذارات',
            icon: AlertTriangle,
            color: 'from-red-500 to-orange-500',
          },
          {
            to: '/timetable',
            label: 'مواعيد حلقتي',
            icon: CalendarDays,
            color: 'from-emerald-500 to-green-500',
          },
        ],
      },
      {
        to: '#religious',
        label: 'ورد ومتابعة',
        icon: BookOpenCheck,
        color: 'from-teal-500 to-cyan-500',
        subItems: [
          {
            to: '/quran',
            label: 'قرآن شفهي',
            icon: BookOpen,
            color: 'from-teal-500 to-cyan-500',
          },
          {
            to: '/quran-audio',
            label: 'قرآن صوتي',
            icon: Headphones,
            color: 'from-blue-500 to-indigo-500',
          },
          {
            to: '/azkar',
            label: 'الأذكار',
            icon: BookOpenCheck,
            color: 'from-green-500 to-emerald-500',
          },
          {
            to: '/prayer-times',
            label: 'صلاتي',
            icon: Clock,
            color: 'from-cyan-500 to-blue-500',
          },
          {
            to: '/attendance',
            label: 'سجل حضوري',
            icon: UserCheck,
            color: 'from-red-500 to-pink-500',
          },
        ],
      },
      {
        to: '/chat',
        label: 'المحادثات',
        icon: MessageSquare,
        color: 'from-green-500 to-teal-500',
      },
    ];
  }

  // Default fallback (loading or guest)
  return [homeItem];
};

export const getSecondaryNavItems = (): NavigationItem[] => {
  // تم نقل جميع العناصر إلى القائمة الرئيسية (getPrimaryNavItems)
  // لتقديم هيكلية مبنية على الأقسام والقوائم المنسدلة
  return [];
};
