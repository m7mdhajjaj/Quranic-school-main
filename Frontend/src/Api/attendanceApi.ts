import api from './api';

// ============================================================================
// Attendance API
// ============================================================================

export interface AttendanceRecord {
  _id?: string;
  student: string;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  note?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  excused: number;
  late: number;
  total: number;
}

// Get attendance statistics
export const getAttendanceStats = async (studentId: string): Promise<AttendanceStats> => {
  const response = await api.get(`/attendance/stats/${studentId}`);
  return response.data;
};

// Get student attendance records
export const getStudentAttendance = async (studentId: string): Promise<any[]> => {
  const response = await api.get(`/attendance/student/${studentId}`);
  return response.data;
};

// Get student attendance statistics (monthly breakdown with absence dates)
export interface MonthlyAttendanceStats {
  month: string;          // "محرم 2025"
  year?: number;          // 🆕 السنة (رقم)
  monthIndex?: number;    // 🆕 فهرس الشهر (0-11)
  absenceCount: number;   // عدد أيام الغياب
  totalDays: number;      // إجمالي أيام الدراسة
  rate: number;           // نسبة الغياب
  absenceDates: string[]; // تواريخ الغياب مرتبة
}

// 🆕 إحصائيات الأسبوع الحالي
export interface WeeklyStatsResponse {
  totalDays: number;
  absenceCount: number;
  presenceCount: number;
  rate: number;
  attendanceRate: number;
  weekStart: string;
  weekEnd: string;
  absenceDates: string[];
}

// 🆕 إحصائيات الشهر الحالي
export interface CurrentMonthStatsResponse {
  totalDays: number;
  absenceCount: number;
  presenceCount: number;
  rate: number;
  attendanceRate: number;
  month: string;
  year: number;
  absenceDates: string[];
}

export interface StudentAttendanceStatsResponse {
  success: boolean;
  data: MonthlyAttendanceStats[];
  weeklyStats: WeeklyStatsResponse;
  monthlyStats: CurrentMonthStatsResponse;
}

export const getStudentAttendanceStats = async (
  studentId: string,
  month?: number,
  year?: number
): Promise<StudentAttendanceStatsResponse> => {
  const params = new URLSearchParams();
  if (month !== undefined && month !== null) {
    params.append('month', month.toString());
  }
  if (year !== undefined && year !== null) {
    params.append('year', year.toString());
  }
  
  const queryString = params.toString();
  const url = queryString 
    ? `/attendance/student/${studentId}/stats?${queryString}`
    : `/attendance/student/${studentId}/stats`;
  
  const response = await api.get(url);
  return response.data;
};

// Get absent students for today
export interface AbsentStudentToday {
  _id: string;
  fullName: string;
  teacher: string;
  group: string;
}

export interface AbsentStudentsTodayResponse {
  success: boolean;
  data: AbsentStudentToday[];
  count: number;
  message?: string;
}

export const getAbsentStudentsToday = async (): Promise<AbsentStudentsTodayResponse> => {
  const response = await api.get('/attendance/absent/today');
  return response.data;
};

// Bulk create/update attendance records (Upsert - سجل واحد لكل طالب/تاريخ)
export interface BulkSaveAttendanceResponse {
  message: string;
  stats?: {
    new: number;      // عدد السجلات الجديدة
    updated: number;  // عدد السجلات المُعدّلة
  };
}

export const bulkSaveAttendance = async (data: {
  date: string;
  records: Array<{
    studentId: string;
    isPresent: boolean;
  }>;
}): Promise<BulkSaveAttendanceResponse> => {
  const response = await api.post('/attendance', data);
  return response.data;
};

// Get teacher groups for attendance page with full data
export interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  gender?: 'male' | 'female'; // 🆕 النوع
  phoneNumber?: string;      // 🆕 الهاتف
  group: string;
  teacher: string;
  isPresent: boolean;
  totalAbsences: number;
  absenceDates: string[]; // formatted as DD/MM/YYYY
}

export interface TeacherGroupsFullDataResponse {
  success: boolean;
  data?: {
    teacher: {
      _id: string;
      name: string;
    };
    groups: Array<{
      _id: string;
      name: string;
      totalStudents: number;
    }>;
    students: AttendanceStudent[];
    // 🆕 معلومات الحضور للتاريخ المحدد
    attendanceInfo?: {
      date: string;
      isAttendanceTaken: boolean; // ✅ هل تم أخذ الحضور؟
      totalRecords: number;
    };
    summary: {
      totalGroups: number;
      groupsWithStudents: number;
      groupsWithoutStudents: number;
      totalStudents: number;
      presentToday: number;
      absentToday: number;
      attendanceRateToday: number;
    };
  };
  message?: string;
  noSection?: boolean; // 🆕 للإشارة إلى عدم وجود مقطع
  date?: string; // 🆕 التاريخ المطلوب
}

export const getTeacherGroupsForAttendance = async (
  teacherId: string,
  date?: string,
  filter: 'all' | 'withStudents' | 'withoutStudents' = 'all',
  includeAbsenceStats: boolean = true
): Promise<TeacherGroupsFullDataResponse> => {
  const response = await api.get(`/attendance/teacher/${teacherId}/groups`, {
    params: { 
      filter, 
      includeStudents: true,
      date,
      includeAbsenceStats
    }
  });
  return response.data;
};

// Get teacher groups for daily marks page (without student details)
export const getTeacherGroupsForMarks = async (
  teacherId: string,
  filter: 'all' | 'withStudents' | 'withoutStudents' = 'all'
): Promise<TeacherGroupsFullDataResponse> => {
  const response = await api.get(`/attendance/teacher/${teacherId}/groups-for-marks`, {
    params: { filter, includeStudents: false } // no student details needed for marks page
  });
  return response.data;
};

// Get available dates for attendance (sections dates)
export interface AvailableDatesResponse {
  success: boolean;
  data?: {
    dates: string[]; // Array of dates in YYYY-MM-DD format
    total: number;
    details: Array<{
      date: string;
      group: string;
    }>;
  };
  message?: string;
}

export const getAvailableDates = async (
  teacherId: string,
  groupId?: string
): Promise<AvailableDatesResponse> => {
  const response = await api.get(`/attendance/teacher/${teacherId}/available-dates`, {
    params: { groupId }
  });
  return response.data;
};

// ============================================================================
// Admin APIs
// ============================================================================

export interface AdminGroupStudent {
  _id: string;
  studentId: number;
  name: string;
  gender: 'male' | 'female';
  phoneNumber: string;
  group: string;
  isPresent: boolean;
  totalAbsences: number;
  absenceDates: string[];
  attendanceRate: number;
}

export interface AdminGroup {
  _id: string;
  name: string;
  status: string;
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  students: AdminGroupStudent[];
}

export interface AdminGroupsResponse {
  success: boolean;
  data?: {
    groups: AdminGroup[];
    summary: {
      totalGroups: number;
      totalStudents: number;
      presentToday: number;
      absentToday: number;
      attendanceRate: number;
    };
  };
  message?: string;
}

// Get all active groups for admin
export const getAllGroupsForAdmin = async (date?: string): Promise<AdminGroupsResponse> => {
  const response = await api.get('/attendance/admin/groups', {
    params: date ? { date } : undefined
  });
  return response.data;
};

export interface AdminGroupStudentsResponse {
  success: boolean;
  data?: {
    group: {
      _id: string;
      name: string;
      teacherName: string;
    };
    students: AdminGroupStudent[];
    summary: {
      totalStudents: number;
      presentToday: number;
      absentToday: number;
      attendanceRate: number;
    };
  };
  message?: string;
}

// Get students of a specific group for admin
export const getGroupStudentsForAdmin = async (
  groupId: string,
  date?: string
): Promise<AdminGroupStudentsResponse> => {
  const response = await api.get(`/attendance/admin/groups/${groupId}/students`, {
    params: date ? { date } : undefined
  });
  return response.data;
};
