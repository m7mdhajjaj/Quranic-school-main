import api from './api';

// ============================================================================
// TIMETABLE API (Sessions/TimeTable)
// ============================================================================
// API للجدول الزمني (مواعيد الحلقات)
// اسم الملف session للتوافق مع Backend routes (/sessions)

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
  description?: string;
  groupId?: string;
  teacherId?: string | Teacher; // معرف المعلم أو بياناته الكاملة
  sectionId?: string;
  sessionDate?: string; // التاريخ المحدد للحصة (من المقطع)
  sessionType?: 'hifz' | 'murajaah' | 'both'; // حفظ، مراجعة، أو الاثنين
  createdAt?: string;
  updatedAt?: string;
  // خصائص إضافية للخطة الشهرية
  date?: string; // التاريخ المحدد للحصة (للتقويم الشهري)
  originalId?: string; // معرف الحصة الأصلية في حال التكرار
}

export interface MonthlyPlanResponse {
  success: boolean;
  data: Session[];
  meta: {
    total: number;
    month: string;
    year: string;
  };
}

export interface AvailableHoursResponse {
  success: boolean;
  data: {
    isSummerTime: boolean;
    season: 'summer' | 'winter';
    seasonAr: string;
    range: string;
    hours: string[];
    totalSlots: number;
    currentMonth: number;
    currentDate: string;
  };
}

export interface TeacherAvailableHoursResponse {
  success: boolean;
  data: {
    isSummerTime: boolean;
    season: 'summer' | 'winter';
    seasonAr: string;
    teacherId: string;
    day: string;
    availableHours: string[];
    bookedSessions: Array<{
      _id: string;
      startHour: string;
      endHour: string;
      note: string;
    }>;
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
  };
}

export interface ConflictError {
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

export interface GetSessionsResponse {
  success: boolean;
  timetables: Session[];
  teacherGroups: string[];
  meta?: {
    total: number;
    filter: string;
  };
}

export interface GetSessionsParams {
  weekFilter?: 'current' | 'all';
  weekStart?: string; // ISO date string
}

// Get available hours - الأوقات المتاحة حسب التوقيت الحالي (عامة)
export const getAvailableHours = async (): Promise<AvailableHoursResponse> => {
  const response = await api.get('/sessions/available-hours');
  return response.data;
};

// Get available hours for teacher - الأوقات المتاحة للمعلم في يوم معين (بعد حذف المحجوزة)
export const getAvailableHoursForTeacher = async (
  teacherId: string,
  day: string,
  excludeSessionId?: string,
  date?: string // إضافة معامل التاريخ المحدد
): Promise<TeacherAvailableHoursResponse> => {
  const params: any = { teacherId, day };
  if (excludeSessionId) {
    params.excludeSessionId = excludeSessionId;
  }
  if (date) {
    params.date = date; // تمرير التاريخ المحدد للباك اند
  }
  const response = await api.get('/sessions/available-hours-teacher', { params });
  return response.data;
};

// Get all sessions - Backend filters by user role and week
export const getAllSessions = async (params?: GetSessionsParams): Promise<GetSessionsResponse | Session[]> => {
  const response = await api.get('/sessions', { params });
  return response.data;
};

// Get monthly plan - جلب الخطة الشهرية
export const getMonthlyPlan = async (month: number, year: number): Promise<MonthlyPlanResponse> => {
  const response = await api.get('/sessions/monthly', { params: { month, year } });
  return response.data;
};

// Create session
export const createSession = async (session: Omit<Session, '_id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
  try {
    const response = await api.post('/sessions', session);
    return response.data;
  } catch (error: any) {
    // Handle conflict errors (409)
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data
      };
    }
    throw error;
  }
};

// Update session
export const updateSession = async (id: string, session: Partial<Session>): Promise<Session> => {
  try {
    const response = await api.put(`/sessions/${id}`, session);
    return response.data;
  } catch (error: any) {
    // Handle conflict errors (409)
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data
      };
    }
    throw error;
  }
};

// Delete session
export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/sessions/${id}`);
};