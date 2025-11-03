// ============================================================================
// Timetable Types - تعريفات الأنواع لجدول الحصص
// ============================================================================

export interface Session {
  _id?: string;
  day: string;
  startHour: string;
  endHour: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  teacher: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  role: "student" | "teacher" | "admin";
  group?: string;
}

export type UserRole = "student" | "teacher" | "admin";

export interface SessionFormData {
  day: string;
  startHour: string;
  endHour: string;
  note: string;
}

export interface TimetableState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  selectedGroup: string;
  teacherGroups: string[];
}
