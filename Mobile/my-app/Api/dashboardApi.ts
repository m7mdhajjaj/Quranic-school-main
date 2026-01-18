import api from "./api";

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
  totalAssistants: number;
  totalSecretaries: number;
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
    console.log("📊 جلب إحصائيات لوحة التحكم...");

    const response = await api.get<DashboardApiResponse>("/dashboard/stats");

    if (!response.data.success) {
      throw new Error(response.data.message || "فشل في جلب الإحصائيات");
    }

    console.log("✅ تم جلب الإحصائيات بنجاح");
    return {
      ...response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ خطأ في جلب الإحصائيات:", error);
    throw error;
  }
};

/**
 * جلب بيانات الحلقات
 */
export const fetchGroupsData = async (): Promise<{
  success: boolean;
  data: GroupData[];
}> => {
  try {
    console.log("📋 جلب بيانات الحلقات...");

    const response = await api.get<{ success: boolean; data: GroupData[] }>(
      "/groups"
    );

    if (!response.data.success) {
      throw new Error("فشل في جلب بيانات الحلقات");
    }

    console.log("✅ تم جلب بيانات الحلقات بنجاح");
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات الحلقات:", error);
    throw error;
  }
};

/**
 * جلب جميع بيانات الداشبورد (الإحصائيات فقط)
 * ملاحظة: بيانات الحلقات موجودة في fetchDashboardCharts
 */
export const fetchAllDashboardData = async () => {
  try {
    console.log("🔄 جلب إحصائيات الداشبورد...");

    const statsResponse = await fetchDashboardStats();

    return {
      stats: statsResponse.data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات الداشبورد:", error);
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
    const response = await api.post<{
      success: boolean;
      data: Partial<DashboardStats>;
    }>("/dashboard/partial-stats", { statsTypes });

    if (!response.data.success) {
      throw new Error("فشل في جلب الإحصائيات الجزئية");
    }

    return response.data.data;
  } catch (error) {
    console.error("❌ خطأ في جلب الإحصائيات الجزئية:", error);
    throw error;
  }
};

/**
 * جلب بيانات الرسوم البيانية
 */
export const fetchDashboardCharts = async () => {
  try {
    console.log("📊 جلب بيانات الرسوم البيانية...");

    const response = await api.get("/dashboard/charts");

    if (!response.data.success) {
      throw new Error("فشل في جلب بيانات الرسوم البيانية");
    }

    console.log("✅ تم جلب بيانات الرسوم البيانية بنجاح");
    return response.data.data;
  } catch (error) {
    console.error("❌ خطأ في جلب بيانات الرسوم البيانية:", error);
    throw error;
  }
};

/**
 * Interface لأفضل الطلاب
 */
export interface TopStudent {
  _id: string;
  name: string;
  totalMarks: number;
  averageMark: number;
  memorizationMarks: number;
  reviewMarks: number;
  examMarks: number;
  memorizationCount: number;
  reviewCount: number;
  examCount: number;
  group: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
}

export interface TopStudentsResponse {
  success: boolean;
  message: string;
  data: TopStudent[];
  count: number;
}

/**
 * جلب أفضل 5 طلاب بناءً على العلامات المجمعة
 * يجمع: علامات الحفظ + علامات المراجعة + علامات الامتحان
 */
export const fetchTopStudents = async (): Promise<TopStudentsResponse> => {
  try {
    console.log("🏆 جلب أفضل 5 طلاب...");

    const response = await api.get<TopStudentsResponse>("/dashboard/top-students");

    if (!response.data.success) {
      throw new Error(response.data.message || "فشل في جلب أفضل الطلاب");
    }

    console.log(`✅ تم جلب ${response.data.count} طالب بنجاح`);
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب أفضل الطلاب:", error);
    throw error;
  }
};

/**
 * Interface لأفضل المعلمين
 */
export interface TopTeacher {
  _id: string;
  name: string;
  totalMarks: number;
  averageMark: number;
  memorizationMarks: number;
  reviewMarks: number;
  examMarks: number;
  studentCount: number;
  memorizationCount: number;
  reviewCount: number;
  examCount: number;
  groups: string[];
  avatar?: {
    url?: string;
    publicId?: string;
  };
}

export interface TopTeachersResponse {
  success: boolean;
  message: string;
  data: TopTeacher[];
  count: number;
}

/**
 * جلب أفضل 5 معلمين بناءً على مجموع علامات جميع طلابهم
 * يجمع علامات جميع طلاب كل معلم من جميع حلقاته
 */
export const fetchTopTeachers = async (): Promise<TopTeachersResponse> => {
  try {
    console.log("🏆 جلب أفضل 5 معلمين...");

    const response = await api.get<TopTeachersResponse>("/dashboard/top-teachers");

    if (!response.data.success) {
      throw new Error(response.data.message || "فشل في جلب أفضل المعلمين");
    }

    console.log(`✅ تم جلب ${response.data.count} معلم بنجاح`);
    return response.data;
  } catch (error) {
    console.error("❌ خطأ في جلب أفضل المعلمين:", error);
    throw error;
  }
};

export default {
  fetchDashboardStats,
  fetchGroupsData,
  fetchAllDashboardData,
  fetchPartialStats,
  fetchDashboardCharts,
};
