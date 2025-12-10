// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  profilePicture?: string;
  phone?: string;
}

export interface Student extends User {
  role: "student";
  group?: Group;
  points?: number;
  totalQuranParts?: number;
}

export interface Teacher extends User {
  role: "teacher";
  groups?: Group[];
}

// Group Types
export interface Group {
  _id: string;
  name: string;
  teacher?: Teacher;
  students?: Student[];
}

// Attendance Types
export interface Attendance {
  _id: string;
  student: string | Student;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  note?: string;
}

// Daily Mark Types
export interface DailyMark {
  _id: string;
  student: string | Student;
  date: string;
  memorization?: number;
  revision?: number;
  tajweed?: number;
  behavior?: number;
  note?: string;
}

// Quran Types
export interface QuranProgress {
  _id: string;
  student: string | Student;
  surah: string;
  fromAyah: number;
  toAyah: number;
  type: "memorization" | "revision";
  grade?: number;
  date: string;
}

// Chat Types
export interface Message {
  _id: string;
  sender: string | User;
  receiver?: string | User;
  group?: string | Group;
  content: string;
  createdAt: string;
  read?: boolean;
}

// Notification Types
export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// Timetable Types
export interface TimeSlot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: Teacher;
  group?: Group;
}

// Warning Types
export interface Warning {
  _id: string;
  student: string | Student;
  reason: string;
  date: string;
  issuedBy?: Teacher;
}

// Goal Types
export interface Goal {
  _id: string;
  student: string | Student;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
}

// News Types
export interface News {
  _id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  author?: User;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
}
