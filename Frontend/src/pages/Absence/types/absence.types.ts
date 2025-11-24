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

// ============================================
// Hook Interfaces
// ============================================

// useAttendanceStats Hook
export interface UseAttendanceStatsProps {
  allStudents: AttendanceStudent[]; // كل الطلاب (بدون فلترة)
  visibleStudents: AttendanceStudent[]; // الطلاب المرئيين (بعد الفلترة)
  isLoadingDate: boolean;
}

export interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

// useStudentStats Hook
export interface UseStudentStatsProps {
  monthlyStats: MonthlyAbsence[];
  selectedYear: number;
  selectedMonthIndex: number;
}

// ============================================
// Component Props Interfaces
// ============================================

// TeacherToolbar Component
export interface TeacherToolbarProps {
  date: string;
  onDateChange: (date: string) => void;
  groupFilter: string;
  onGroupFilterChange: (group: string) => void;
  groupsAvailable: string[];
  teacherGroups?: Array<{ _id: string; name: string; totalStudents?: number }>;
  nameQuery: string;
  onNameQueryChange: (query: string) => void;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  isDateTooOld: boolean;
  daysAgo: number;
  onSave: () => void;
  isSaving: boolean;
  isLoading?: boolean;
}

// StudentsTable Component
export interface StudentsTableProps {
  students: AttendanceStudent[];
  selectedAll: boolean;
  onToggleAll: () => void;
  onTogglePresence: (studentId: string) => void;
}

// StudentView Component
export interface StudentViewProps {
  monthlyStats: MonthlyAbsence[];
}
