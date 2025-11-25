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

// Get attendance records
export const getAttendance = async (params?: {
  studentId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceRecord[]> => {
  const response = await api.get('/attendance', { params });
  return response.data;
};

// Create attendance record
export const createAttendance = async (data: Omit<AttendanceRecord, '_id'>): Promise<AttendanceRecord> => {
  const response = await api.post('/attendance', data);
  return response.data;
};

// Update attendance record
export const updateAttendance = async (id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data;
};

// Delete attendance record
export const deleteAttendance = async (id: string): Promise<void> => {
  await api.delete(`/attendance/${id}`);
};

// Get attendance statistics
export const getAttendanceStats = async (studentId: string): Promise<AttendanceStats> => {
  const response = await api.get(`/attendance/stats/${studentId}`);
  return response.data;
};

// Get attendance by date
export const getAttendanceByDate = async (date: string): Promise<any[]> => {
  const response = await api.get(`/attendance/date/${date}`);
  return response.data;
};

// Get student attendance records
export const getStudentAttendance = async (studentId: string): Promise<any[]> => {
  const response = await api.get(`/attendance/student/${studentId}`);
  return response.data;
};

// Bulk create/update attendance records
export const bulkSaveAttendance = async (data: {
  date: string;
  records: Array<{
    studentId: string;
    date: string;
    isPresent: boolean;
  }>;
}): Promise<any> => {
  const response = await api.post('/attendance', data);
  return response.data;
};

// Get teacher groups for attendance page with full data
export interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  group: string;
  teacher: string;
  isPresent: boolean;
  totalAbsences: number;
  absenceDates: string[]; // formatted as DD/MM/YYYY
}

export interface TeacherGroupsFullDataResponse {
  success: boolean;
  data: {
    teacher: {
      _id: string;
      name: string;
    };
    groups: Array<{
      _id: string;
      name: string;
      totalStudents: number;
    }>;
    students: AttendanceStudent[]; // includes attendance + absence stats
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
