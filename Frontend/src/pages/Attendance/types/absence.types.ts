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
  gender?: 'male' | 'female';
  phoneNumber?: string;
  group?: string;
  teacher?: string;
  isPresent: boolean;
  totalAbsences?: number;
  absenceDates?: string[];
  attendanceRate?: number;
}

export interface MonthlyAbsence {
  month: string;
  absenceCount: number;
  totalDays: number;
  rate: number;
  absenceDates: string[]; // قائمة بتواريخ الغياب
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

export interface TeacherGroup {
  _id: string;
  name: string;
  status?: string; // active, inactive, etc.
  totalStudents?: number;
  overallAttendanceRate?: number; // 🆕 Added for Section-based rate
}

// TeacherToolbar Component
export interface TeacherToolbarProps {
  startDate: string | null;
  endDate: string | null;
  onDateRangeChange: (start: string | null, end: string | null) => void;
  availableDates?: string[]; // 🆕 التواريخ المتاحة (تواريخ المقاطع)
  currentGroupName?: string; // New prop for display only
  onBackToGroups?: () => void; // New prop for navigation
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
  hasUnsavedChanges?: boolean;
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
