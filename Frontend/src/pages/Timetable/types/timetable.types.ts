// ============================================================================
// Timetable Types - تعريفات الأنواع لجدول الحصص
// ============================================================================

export type SessionType = "hifz" | "murajaah" | "both";

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Session {
  _id?: string;
  day: string;
  startHour: string;
  endHour: string;
  note: string;
  sessionType?: SessionType; // حفظ، مراجعة، أو الاثنين
  groupId?: string;
  teacherId?: string | Teacher; // معرف المعلم أو بياناته الكاملة
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
  sessionType?: SessionType;
  teacherId: string; // معرف المعلم مطلوب
}

export interface TimetableState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  selectedGroup: string;
  teacherGroups: string[];
}

export interface ConflictError {
  isConflict: true;
  success: false;
  error: string;
  message: string;
  conflictDetails?: {
    day: string;
    startHour: string;
    endHour: string;
    note: string;
    timetableId: string;
  };
}
