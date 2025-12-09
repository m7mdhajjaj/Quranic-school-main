// API Configuration
// غيّر هذا الرابط حسب عنوان السيرفر
export const API_BASE_URL = "http://192.168.1.100:5000"; // استبدل بـ IP جهازك
export const SOCKET_URL = "http://192.168.1.100:5000";

// للإنتاج
// export const API_BASE_URL = 'https://your-production-server.com';
// export const SOCKET_URL = 'https://your-production-server.com';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",

  // Students
  STUDENTS: "/api/students",
  STUDENT_PROFILE: "/api/profile/student",

  // Teachers
  TEACHERS: "/api/teachers",
  TEACHER_PROFILE: "/api/profile/teacher",

  // Attendance
  ATTENDANCE: "/api/attendance",

  // Daily Marks
  DAILY_MARKS: "/api/daily-marks",

  // Quran
  QURAN: "/api/quran",

  // Chat
  CHAT: "/api/chat",

  // Notifications
  NOTIFICATIONS: "/api/notifications",

  // Rankings
  RANKINGS: "/api/ranking",

  // Dashboard
  DASHBOARD: "/api/dashboard",

  // Timetable
  TIMETABLE: "/api/timetable",

  // Warnings
  WARNINGS: "/api/warnings",

  // Goals
  GOALS: "/api/goals",

  // News
  NEWS: "/api/news",
};
