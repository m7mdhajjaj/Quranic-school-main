// Group API functions
import api from "./api";
import { AxiosError } from "axios";

export interface Group {
  _id: string;
  name: string;
  number?: number; // رقم الحلقة
  teacher: string;
  teacherName?: string; // حقل إضافي للاسم
  description?: string;
  capacity?: number;
  schedule?: string;
  activeStatus: boolean;
  currentStudents?: number; // عدد الطلاب المشتركين في الحلقة
  isFull?: boolean; // هل الحلقة ممتلئة؟
  availableSpots?: number; // عدد الأماكن المتاحة
  capacityStatus?: string; // حالة السعة مثل "25/30"
  capacityPercentage?: number; // نسبة الإشغال المئوية
  timetable?: Array<{
    _id?: string;
    day: string;
    startHour: string;
    endHour: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupFormData {
  name: string;
  teacher: string;
  description?: string;
  capacity?: number;
  schedule?: string;
  activeStatus?: boolean;
}

// Query parameters for filtering groups
export interface GroupsQueryParams {
  search?: string;
  capacity?: 'all' | 'small' | 'medium' | 'large';
  status?: 'all' | 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  showing: number;
}

// Get all groups with filters and pagination
export const getAllGroups = async (params?: GroupsQueryParams): Promise<{
  success: boolean;
  data?: Group[];
  pagination?: PaginationInfo;
  message?: string;
}> => {
  try {
    console.log('📡 API: جلب الحلقات', params ? `مع فلاتر: ${JSON.stringify(params)}` : '(بدون فلاتر)');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/groups?${queryString}` : '/groups';
    
    const response = await api.get(url);
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب الحلقات",
    };
  }
};

// Get group by ID
export const getGroupById = async (
  id: string
): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب الحلقة",
    };
  }
};

// Get group students
export const getGroupStudents = async (
  groupId: string,
  includeDetails: boolean = true,
  search?: string,
  gender?: 'ذكر' | 'أنثى' | 'male' | 'female'
): Promise<{
  success: boolean;
  data?: {
    group: {
      _id: string;
      name: string;
      teacher: string;
      capacity?: number;
    };
    students: Array<{
      _id: string;
      studentId: number;
      firstName: string;
      lastName: string;
      fatherName?: string;
      grandFatherName?: string;
      motherName?: string;
      idNumber?: string;
      birthDate?: Date | string;
      age?: number;
      gender?: string;
      residence?: string;
      teacher?: string;
      group?: string;
      email?: string;
      phoneNumber?: string;
      avatar?: {
        url?: string;
        publicId?: string;
      };
      isActive?: boolean;
      lastSeen?: Date;
      createdAt?: Date;
      updatedAt?: Date;
    }>;
    totalStudents: number;
  };
  message?: string;
}> => {
  try {
    const params = new URLSearchParams();
    params.append('includeDetails', includeDetails.toString());
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (gender) {
      params.append('gender', gender);
    }
    const response = await api.get(`/groups/${groupId}/students?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group students:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء جلب طلاب الحلقة",
    };
  }
};

// Get groups by teacher
export const getGroupsByTeacher = async (
  teacherName: string
): Promise<{ success: boolean; data?: Group[]; message?: string }> => {
  try {
    const response = await api.get(`/groups/teacher/${teacherName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups by teacher:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء جلب حلقات المعلم",
    };
  }
};

// Create new group
export const createGroup = async (
  groupData: GroupFormData
): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    console.log("📡 إرسال طلب إنشاء حلقة:", groupData);
    const response = await api.post("/groups", groupData);
    console.log("✅ نجح إنشاء الحلقة:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في إنشاء الحلقة:", error);
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      details?: Record<string, unknown>;
    }>;

    // تسجيل تفاصيل أكثر عن الخطأ
    if (axiosError.response) {
      console.error("📋 تفاصيل استجابة الخطأ:", {
        status: axiosError.response.status,
        data: axiosError.response.data,
        headers: axiosError.response.headers,
      });
    }

    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "حدث خطأ أثناء إنشاء الحلقة";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update group
export const updateGroup = async (
  id: string,
  groupData: Partial<GroupFormData>
): Promise<{ success: boolean; data?: Group; message?: string }> => {
  try {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message:
        axiosError.response?.data?.message || "حدث خطأ أثناء تحديث الحلقة",
    };
  }
};

// Delete group
export const deleteGroup = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting group:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || "حدث خطأ أثناء حذف الحلقة",
    };
  }
};

// 🆕 Get groups by teacher ID with flexible filters
/**
 * جلب حلقات المعلم بفلاتر مرنة
 * 
 * أمثلة الاستخدام:
 * ```ts
 * // جلب كل الحلقات (فيها طلاب + فارغة)
 * const result = await getGroupsByTeacherIdWithFilters(teacherId, 'all');
 * 
 * // جلب الحلقات اللي فيها طلاب فقط
 * const result = await getGroupsByTeacherIdWithFilters(teacherId, 'withStudents');
 * 
 * // جلب الحلقات الفارغة فقط
 * const result = await getGroupsByTeacherIdWithFilters(teacherId, 'withoutStudents');
 * 
 * // جلب كل الحلقات مع معلومات الطلاب
 * const result = await getGroupsByTeacherIdWithFilters(teacherId, 'all', true);
 * ```
 */
export interface GroupWithStudents extends Group {
  students?: Array<{
    _id: string;
    studentId: number;
    name: string;
  }>;
  totalStudents?: number; // إجمالي عدد الطلاب في الحلقة
  hasStudents?: boolean;
  isEmpty?: boolean;
}

export interface GroupsByTeacherResponse {
  teacher: {
    _id: string;
    name: string;
  };
  groups: GroupWithStudents[];
  summary: {
    totalGroups: number;
    groupsWithStudents: number;
    emptyGroups: number;
    totalStudents: number;
  };
}

export type GroupFilter = 'all' | 'withStudents' | 'withoutStudents';

export const getGroupsByTeacherIdWithFilters = async (
  teacherId: string,
  filter: GroupFilter = 'all',
  includeStudents: boolean = false
): Promise<{ success: boolean; data?: GroupsByTeacherResponse; message?: string }> => {
  try {
    console.log(`⚡ [API] جلب حلقات المعلم - ID: ${teacherId}, فلتر: ${filter}, مع الطلاب: ${includeStudents}`);
    const startTime = Date.now();

    const params = new URLSearchParams();
    params.append('filter', filter);
    params.append('includeStudents', includeStudents.toString());

    const response = await api.get(
      `/groups/teacher-id/${teacherId}/filtered?${params.toString()}`
    );

    const duration = Date.now() - startTime;
    console.log(`✅ [API] تم جلب الحلقات في ${duration}ms`);

    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب حلقات المعلم:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب حلقات المعلم',
    };
  }
};

// Get group timetable
export const getGroupTimetable = async (groupId: string, weekStart?: string): Promise<{
  success: boolean;
  data?: {
    group: {
      _id: string;
      name: string;
    };
    timetables: Array<{
      _id: string;
      day: string;
      startHour: string;
      endHour: string;
      teacherId?: {
        firstName: string;
        lastName: string;
      };
      note?: string;
      sessionDateInWeek?: string;
      sessionDateFormatted?: string;
    }>;
    totalSessions: number;
    weekInfo?: {
      startOfWeek: string;
      endOfWeek: string;
      startFormatted: string;
      endFormatted: string;
    };
  };
  message?: string;
}> => {
  try {
    console.log(`📡 API: جلب جدول الحلقة ${groupId}`);
    // إرسال تاريخ بداية الأسبوع الحالي بتوقيت UTC
    const currentWeekStart = weekStart || new Date().toISOString();
    const response = await api.get(`/sessions/group/${groupId}`, {
      params: { weekStart: currentWeekStart }
    });
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب جدول الحلقة:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب جدول الحلقة',
    };
  }
};

// Get groups statistics
export interface GroupsStats {
  totalGroups: number;
  totalStudents: number;
  fullGroups: number;
  emptyGroups: number;
  totalCapacity: number;
  availableSeats: number;
  occupancyRate: number;
  activeGroups: number;
  byTeacher: Array<{
    teacher: string;
    groupsCount: number;
    studentsCount: number;
  }>;
}

export const getGroupsStats = async (): Promise<{
  success: boolean;
  data?: GroupsStats;
  message?: string;
}> => {
  try {
    console.log('📊 API: جلب إحصائيات الحلقات');
    const response = await api.get('/groups/stats/overview');
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء جلب الإحصائيات',
    };
  }
};

// Export groups to CSV
export const exportGroupsToCSV = async (filters?: GroupsQueryParams): Promise<Blob | null> => {
  try {
    console.log('📥 API: تصدير الحلقات إلى CSV');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'limit') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/groups/export?${queryString}` : '/groups/export';
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    console.log('✅ تم تصدير البيانات بنجاح');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في تصدير البيانات:', error);
    return null;
  }
};

// Check duplicate group name
export const checkDuplicateGroupName = async (
  field: 'name',
  value: string,
  excludeId?: string
): Promise<{
  success: boolean;
  isDuplicate: boolean;
  message?: string;
  existingGroupName?: string;
}> => {
  try {
    console.log(`🔍 API: فحص تكرار ${field}: "${value}"`);
    
    const params = new URLSearchParams();
    params.append('field', field);
    params.append('value', value);
    if (excludeId) {
      params.append('excludeId', excludeId);
    }
    
    const response = await api.get(`/groups/check-duplicate?${params.toString()}`);
    console.log('✅ نتيجة الفحص:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في فحص التكرار:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      isDuplicate: false,
      message: axiosError.response?.data?.message || 'حدث خطأ أثناء فحص التكرار',
    };
  }
};