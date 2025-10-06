import api from './api';

export interface GroupData {
  name: string;
  currentStudents?: number;
  capacity?: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalGroups: number;
  totalActivities: number;
  totalNews: number;
  averageMarks: number;
  averageExamMarks: number;
  activeStudents: number;
  attendanceRate: number;
  upcomingExams: number;
  recentMarksCount: number;
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
  timestamp?: string;
}

/**
 * جلب إحصائيات لوحة التحكم بشكل محسّن ومتوازٍ
 */
export const fetchDashboardStats = async (): Promise<DashboardApiResponse> => {
  try {
    console.log('📊 جلب إحصائيات لوحة التحكم...');
    
    const response = await api.get<DashboardApiResponse>('/dashboard/stats');

    if (!response.data.success) {
      throw new Error(response.data.message || 'فشل في جلب الإحصائيات');
    }

    console.log('✅ تم جلب الإحصائيات بنجاح');
    return {
      ...response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    throw error;
  }
};

/**
 * جلب بيانات الحلقات
 */
export const fetchGroupsData = async (): Promise<{ success: boolean; data: GroupData[] }> => {
  try {
    console.log('📋 جلب بيانات الحلقات...');
    
    const response = await api.get<{ success: boolean; data: GroupData[] }>('/groups');

    if (!response.data.success) {
      throw new Error('فشل في جلب بيانات الحلقات');
    }

    console.log('✅ تم جلب بيانات الحلقات بنجاح');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الحلقات:', error);
    throw error;
  }
};

/**
 * جلب جميع بيانات الداشبورد بشكل متوازٍ (الإحصائيات + الحلقات)
 */
export const fetchAllDashboardData = async () => {
  try {
    console.log('🔄 جلب جميع بيانات الداشبورد...');
    
    const [statsResponse, groupsResponse] = await Promise.all([
      fetchDashboardStats(),
      fetchGroupsData()
    ]);

    return {
      stats: statsResponse.data,
      groups: groupsResponse.data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الداشبورد:', error);
    throw error;
  }
};

/**
 * جلب إحصائيات محددة فقط (للتحديثات الجزئية)
 */
export const fetchPartialStats = async (
  statsTypes: string[]
): Promise<Partial<DashboardStats>> => {
  try {
    const response = await api.post<{ success: boolean; data: Partial<DashboardStats> }>(
      '/dashboard/partial-stats',
      { statsTypes }
    );

    if (!response.data.success) {
      throw new Error('فشل في جلب الإحصائيات الجزئية');
    }

    return response.data.data;
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات الجزئية:', error);
    throw error;
  }
};

export default {
  fetchDashboardStats,
  fetchGroupsData,
  fetchAllDashboardData,
  fetchPartialStats,
};
