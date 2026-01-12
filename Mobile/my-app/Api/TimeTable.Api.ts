import api from "./api";

// ============================================================================
// TIMETABLE API (NEW CRUD SYSTEM)
// ============================================================================
// API للجدول الزمني (مواعيد الحلقات)
// ⚠️ التعارض يعتمد على التاريخ المحدد (sessionDate) وليس اليوم
// مثال: 12 يناير (اثنين) ≠ 19 يناير (اثنين) - لا تعارض بينهما

const BASE_URL = "/timetable";

// ============================================================================
// INTERFACES
// ============================================================================

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Group {
  _id: string;
  name: string;
}

export interface Section {
  _id: string;
  date: string;
  group: string;
  memorizationSection?: string;
  reviewSection?: string;
}

export interface Timetable {
  _id?: string;
  day: string;
  startHour: string;
  endHour: string;
  note: string;
  description?: string;
  groupId?: string | Group;
  teacherId?: string | Teacher;
  sectionId?: string | Section;
  sessionDate: string; // ⚠️ التاريخ المحدد (مطلوب!)
  sessionType?: "hifz" | "murajaah" | "both";
  isRecurring?: boolean;
  sectionInfo?: {
    memorizationSection?: string;
    reviewSection?: string;
    marksStatus?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface DateInfo {
  dayName: string;
  dayIndex: number;
  dateFormatted: string;
  dateShort: string;
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

export interface AvailableHoursResponse {
  success: boolean;
  data: {
    isSummerTime: boolean;
    season: "summer" | "winter";
    seasonAr: string;
    range: string;
    hours: string[];
    totalSlots: number;
  };
}

export interface TeacherAvailableHoursResponse {
  success: boolean;
  data: {
    teacherId: string;
    date: string; // "12 يناير 2026"
    dateShort: string; // "12/1/2026"
    day: string; // "الاثنين"
    isSummerTime: boolean;
    allHours: string[];
    bookedHours: string[];
    availableHours: string[];
    bookedSessions: Array<{
      startHour: string;
      endHour: string;
      note: string;
      groupName?: string;
    }>;
    stats: {
      total: number;
      booked: number;
      available: number;
    };
  };
}

export interface CheckConflictResponse {
  success: boolean;
  data: {
    hasConflict: boolean;
    message: string;
    conflictWith?: {
      _id: string;
      note: string;
      groupName: string;
      startHour: string;
      endHour: string;
      sessionDate: string;
    };
    dateInfo?: DateInfo;
  };
}

export interface GetTimetablesResponse {
  success: boolean;
  data: Timetable[];
  meta?: {
    total: number;
    teacherId?: string;
    groupId?: string;
    date?: string;
  };
}

export interface CreateTimetableResponse {
  success: boolean;
  message: string;
  data: Timetable;
  dateInfo?: DateInfo;
}

export interface ConflictError {
  success: false;
  message: string;
  conflictWith?: {
    _id: string;
    note: string;
    groupName: string;
    startHour: string;
    endHour: string;
    sessionDate: string;
  };
}

// ============================================================================
// AVAILABILITY APIs
// ============================================================================

/**
 * الأوقات المتاحة (عامة) - صيفي/شتوي
 */
export const getAvailableHours = async (): Promise<AvailableHoursResponse> => {
  const response = await api.get(`${BASE_URL}/available-hours`);
  return response.data;
};

/**
 * الأوقات المتاحة لمعلم في تاريخ محدد
 * ⚠️ date مطلوب!
 */
export const getTeacherAvailableHours = async (
  teacherId: string,
  date: string, // ⚠️ التاريخ مطلوب! (YYYY-MM-DD)
  excludeId?: string // استثناء موعد (للتعديل)
): Promise<TeacherAvailableHoursResponse> => {
  const params: Record<string, string> = { teacherId, date };
  if (excludeId) {
    params.excludeId = excludeId;
  }
  const response = await api.get(`${BASE_URL}/available-hours/teacher`, {
    params,
  });
  return response.data;
};

/**
 * فحص التعارض قبل الإنشاء/التحديث
 * ⚠️ sessionDate مطلوب!
 */
export const checkConflict = async (data: {
  teacherId: string;
  sessionDate: string; // ⚠️ التاريخ مطلوب!
  startHour: string;
  endHour: string;
  excludeId?: string; // استثناء موعد (للتعديل)
}): Promise<CheckConflictResponse> => {
  const response = await api.post(`${BASE_URL}/check-conflict`, data);
  return response.data;
};

// ============================================================================
// READ APIs
// ============================================================================

export interface GetTimetablesParams {
  teacherId?: string;
  groupId?: string;
  date?: string; // تاريخ محدد
  startDate?: string; // نطاق من
  endDate?: string; // نطاق إلى
  sectionId?: string;
}

/**
 * جلب المواعيد (مع فلترة)
 */
export const getTimetables = async (
  params?: GetTimetablesParams
): Promise<GetTimetablesResponse> => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

/**
 * جلب موعد محدد
 */
export const getTimetableById = async (
  id: string
): Promise<{ success: boolean; data: Timetable }> => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * جدول حلقة معينة
 */
export const getGroupTimetable = async (
  groupId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<GetTimetablesResponse> => {
  const response = await api.get(`${BASE_URL}/group/${groupId}`, { params });
  return response.data;
};

/**
 * موعد مقطع محدد
 */
export const getTimetableBySection = async (
  sectionId: string
): Promise<{ success: boolean; data: Timetable | null }> => {
  const response = await api.get(`${BASE_URL}/section/${sectionId}`);
  return response.data;
};

/**
 * مواعيد معلم معين
 */
export const getTeacherTimetables = async (
  teacherId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<GetTimetablesResponse> => {
  const response = await api.get(`${BASE_URL}/teacher/${teacherId}`, {
    params,
  });
  return response.data;
};

/**
 * جلب المواعيد الشهرية
 * يجلب جميع المواعيد لشهر معين
 */
export const getMonthlyPlan = async (
  month: number,
  year: number
): Promise<GetTimetablesResponse> => {
  // حساب أول وآخر يوم في الشهر
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const response = await api.get(BASE_URL, {
    params: { startDate, endDate },
  });
  return response.data;
};

// ============================================================================
// CREATE APIs
// ============================================================================

export interface CreateTimetableData {
  sessionDate: string; // ⚠️ مطلوب!
  startHour: string;
  endHour: string;
  teacherId: string;
  groupId?: string;
  sectionId?: string;
  note?: string;
  description?: string;
  sessionType?: "hifz" | "murajaah" | "both";
}

/**
 * إنشاء موعد جديد
 * ⚠️ sessionDate مطلوب!
 */
export const createTimetable = async (
  data: CreateTimetableData
): Promise<CreateTimetableResponse> => {
  try {
    const response = await api.post(BASE_URL, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data,
      };
    }
    throw error;
  }
};

/**
 * إنشاء موعد لمقطع محدد
 * (التاريخ يُؤخذ تلقائياً من المقطع)
 */
export const createTimetableForSection = async (
  sectionId: string,
  data: {
    startHour: string;
    endHour: string;
    teacherId?: string;
    sessionType?: "hifz" | "murajaah" | "both";
  }
): Promise<CreateTimetableResponse> => {
  try {
    const response = await api.post(`${BASE_URL}/section/${sectionId}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data,
      };
    }
    throw error;
  }
};

// ============================================================================
// UPDATE APIs
// ============================================================================

/**
 * تحديث موعد كامل
 */
export const updateTimetable = async (
  id: string,
  data: Partial<CreateTimetableData>
): Promise<CreateTimetableResponse> => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data,
      };
    }
    throw error;
  }
};

/**
 * تحديث الوقت فقط
 */
export const updateTimetableTime = async (
  id: string,
  data: { startHour: string; endHour: string }
): Promise<CreateTimetableResponse> => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/time`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw {
        isConflict: true,
        ...error.response.data,
      };
    }
    throw error;
  }
};

/**
 * ربط موعد بمقطع
 */
export const linkTimetableToSection = async (
  timetableId: string,
  sectionId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(
    `${BASE_URL}/${timetableId}/link/${sectionId}`
  );
  return response.data;
};

// ============================================================================
// DELETE APIs
// ============================================================================

/**
 * حذف موعد
 */
export const deleteTimetable = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * فك ربط موعد من مقطع (بدون حذف الموعد)
 */
export const unlinkTimetableFromSection = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`${BASE_URL}/${id}/unlink`);
  return response.data;
};
