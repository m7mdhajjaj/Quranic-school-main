// types/absence.types.ts

export interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  group?: string;
  groups?: string[];
  role: "student" | "teacher" | "admin";
}

export interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  group?: string;
  teacher?: string;
  isPresent: boolean;
  totalAbsences?: number;
  absenceDates?: string[];
}

export interface MonthlyAbsence {
  month: string;
  absenceCount: number;
  totalDays: number;
  rate: number;
}

export interface MonthlyAttendanceStats {
  presentDays: number;
  absentDays: number;
  totalDays: number;
  attendanceRate: number;
}

export interface AttendanceRecordPayload {
  studentId: string;
  date: string;
  isPresent: boolean;
}

export interface YearTotals {
  absenceCount: number;
  totalDays: number;
  rate: number;
}
