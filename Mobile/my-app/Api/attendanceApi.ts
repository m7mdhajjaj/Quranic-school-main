import api from "./api";

// ============================================================================
// Attendance API
// ============================================================================

export interface AttendanceRecord {
  _id?: string;
  student: string;
  date: string;
  status: "present" | "absent" | "excused" | "late";
  note?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  excused: number;
  late: number;
  total: number;
}

// Get attendance records
export const getAttendance = async (params?: {
  studentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceRecord[]> => {
  const response = await api.get("/attendance", { params });
  return response.data;
};

// Create attendance record
export const createAttendance = async (
  data: Omit<AttendanceRecord, "_id">
): Promise<AttendanceRecord> => {
  const response = await api.post("/attendance", data);
  return response.data;
};

// Update attendance record
export const updateAttendance = async (
  id: string,
  data: Partial<AttendanceRecord>
): Promise<AttendanceRecord> => {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data;
};

// Delete attendance record
export const deleteAttendance = async (id: string): Promise<void> => {
  await api.delete(`/attendance/${id}`);
};

// Get attendance statistics
export const getAttendanceStats = async (
  studentId: string
): Promise<AttendanceStats> => {
  const response = await api.get(`/attendance/stats/${studentId}`);
  return response.data;
};

// Get attendance by date
export const getAttendanceByDate = async (date: string): Promise<any[]> => {
  const response = await api.get(`/attendance/date/${date}`);
  return response.data;
};

// Get student attendance records
export const getStudentAttendance = async (
  studentId: string
): Promise<any[]> => {
  const response = await api.get(`/attendance/student/${studentId}`);
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

export const getAbsentStudentsToday =
  async (): Promise<AbsentStudentsTodayResponse> => {
    const response = await api.get("/attendance/absent/today");
    return response.data;
  };

// Bulk create/update attendance records
export const bulkSaveAttendance = async (data: {
  date: string;
  records: Array<{
    studentId: string;
    isPresent: boolean;
  }>;
}): Promise<any> => {
  const response = await api.post("/attendance", data);
  return response.data;
};

// ============================================================================
// Student Attendance Statistics API
// ============================================================================

export interface MonthlyAttendanceStats {
  month: string;
  year?: number;
  monthIndex?: number;
  absenceCount: number;
  totalDays: number;
  rate: number;
  absenceDates: string[];
}

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
  weeklyStats?: WeeklyStatsResponse;
  monthlyStats?: CurrentMonthStatsResponse;
  message?: string;
}

// Get student attendance statistics (monthly breakdown with absence dates)
export const getStudentAttendanceStats = async (
  studentId: string,
  month?: number,
  year?: number
): Promise<StudentAttendanceStatsResponse> => {
  const params = new URLSearchParams();
  if (month !== undefined && month !== null) {
    params.append("month", month.toString());
  }
  if (year !== undefined && year !== null) {
    params.append("year", year.toString());
  }

  const queryString = params.toString();
  const url = queryString
    ? `/attendance/student/${studentId}/stats?${queryString}`
    : `/attendance/student/${studentId}/stats`;

  const response = await api.get(url);
  return response.data;
};

// Get teacher groups for attendance page with full data
export interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  gender?: "male" | "female";
  phoneNumber?: string;
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
      status?: string;
      totalStudents: number;
    }>;
    students: AttendanceStudent[]; // includes attendance + absence stats
    attendanceInfo?: {
      date: string;
      isAttendanceTaken: boolean;
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
  noSection?: boolean;
}

export const getTeacherGroupsForAttendance = async (
  teacherId: string,
  date?: string,
  filter: "all" | "withStudents" | "withoutStudents" = "all",
  includeAbsenceStats: boolean = true
): Promise<TeacherGroupsFullDataResponse> => {
  const response = await api.get(`/attendance/teacher/${teacherId}/groups`, {
    params: {
      filter,
      includeStudents: true,
      date,
      includeAbsenceStats,
    },
  });
  return response.data;
};

// Get teacher groups for daily marks page (without student details)
export const getTeacherGroupsForMarks = async (
  teacherId: string,
  filter: "all" | "withStudents" | "withoutStudents" = "all"
): Promise<TeacherGroupsFullDataResponse> => {
  const response = await api.get(
    `/attendance/teacher/${teacherId}/groups-for-marks`,
    {
      params: { filter, includeStudents: false }, // no student details needed for marks page
    }
  );
  return response.data;
};

// ============================================================================
// Advanced Statistics API
// ============================================================================

export interface AdvancedStatsRequest {
  studentIds: string[];
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface StudentWithStats {
  _id: string;
  studentId: number;
  name: string;
  group: string;
  isPresent: boolean;
  totalAbsences: number;
  totalPresences: number;
  totalRecords: number;
  overallAttendanceRate: number;
}

export interface AdvancedStatsResponse {
  success: boolean;
  data: {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
    students: StudentWithStats[];
    dateRange: {
      specific: string | null;
      start: string | null;
      end: string | null;
    };
  };
  message?: string;
}

// Get advanced attendance statistics
export const getAdvancedAttendanceStats = async (
  data: AdvancedStatsRequest
): Promise<AdvancedStatsResponse> => {
  const response = await api.post("/attendance/stats/advanced", data);
  return response.data;
};

export interface FilteredStatsRequest {
  teacherId: string;
  date: string;
  groupFilter?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface FilteredStatsResponse {
  success: boolean;
  data: {
    totalStudents: number;
    visibleStudents: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
    students: AttendanceStudent[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      total: number;
    };
  };
  message?: string;
}

// Get filtered attendance statistics with pagination
export const getFilteredAttendanceStats = async (
  data: FilteredStatsRequest
): Promise<FilteredStatsResponse> => {
  const response = await api.post("/attendance/stats/filtered", data);
  return response.data;
};

export interface AttendanceReportRequest {
  studentIds?: string[];
  teacherId?: string;
  groupId?: string;
  startDate: string;
  endDate: string;
}

export interface StudentReport {
  _id: string;
  studentId: number;
  name: string;
  group: string;
  teacher: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
}

export interface AttendanceReportResponse {
  success: boolean;
  data: {
    dateRange: {
      start: string;
      end: string;
      totalUniqueDays: number;
    };
    overall: {
      totalStudents: number;
      totalRecords: number;
      presentDays: number;
      absentDays: number;
      overallAttendanceRate: number;
    };
    students: StudentReport[];
  };
  message?: string;
}

// Get comprehensive attendance report
export const getAttendanceReport = async (
  data: AttendanceReportRequest
): Promise<AttendanceReportResponse> => {
  const response = await api.post("/attendance/stats/report", data);
  return response.data;
};
