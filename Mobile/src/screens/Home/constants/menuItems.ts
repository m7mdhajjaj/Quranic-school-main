import { MenuItem } from "../components";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    title: "الحضور والغياب",
    icon: "📋",
    color: "#10b981",
    route: "Attendance",
  },
  {
    id: 2,
    title: "الدرجات اليومية",
    icon: "📝",
    color: "#3b82f6",
    route: "DailyMarks",
  },
  { id: 3, title: "حفظ القرآن", icon: "📖", color: "#8b5cf6", route: "Quran" },
  {
    id: 4,
    title: "الجدول الدراسي",
    icon: "📅",
    color: "#f59e0b",
    route: "Timetable",
  },
  { id: 5, title: "المحادثات", icon: "💬", color: "#06b6d4", route: "Chat" },
  {
    id: 6,
    title: "الإشعارات",
    icon: "🔔",
    color: "#ef4444",
    route: "Notifications",
  },
  { id: 7, title: "الترتيب", icon: "🏆", color: "#eab308", route: "Ranking" },
  { id: 8, title: "الأخبار", icon: "📰", color: "#78716c", route: "News" },
];
