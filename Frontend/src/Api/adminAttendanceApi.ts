// adminAttendanceApi.ts - Admin Attendance APIs
import api from './api';

// ============================================================================
// Admin Attendance Types
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

// ============================================================================
// Admin Attendance API Functions
// ============================================================================

/**
 * Get all active groups for admin with attendance data
 */
export const getAllGroupsForAdmin = async (date?: string): Promise<AdminGroupsResponse> => {
  const response = await api.get('/attendance/admin/groups', {
    params: date ? { date } : undefined
  });
  return response.data;
};

/**
 * Get students of a specific group for admin with attendance data
 */
export const getGroupStudentsForAdmin = async (
  groupId: string,
  date?: string
): Promise<AdminGroupStudentsResponse> => {
  const response = await api.get(`/attendance/admin/groups/${groupId}/students`, {
    params: date ? { date } : undefined
  });
  return response.data;
};
