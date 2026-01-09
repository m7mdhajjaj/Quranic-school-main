// Api/pointsGameApi.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";
import type {
  Badge,
  BadgeProgress,
  RankingStudent,
  StudentStats,
  PrayerStatus,
  Nawafel,
  Adhkar,
  Halaqah,
} from "@/types/pointsGame.types";

const POINTS_GAME_URL = `${API_URL}/points-game`;

// الحصول على التوكن من AsyncStorage
const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

// إعداد headers مع التوكن
const getHeaders = async () => {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// API Request/Response Types
export interface DailyPointsData {
  prayers: {
    fajr: PrayerStatus;
    dhuhr: PrayerStatus;
    asr: PrayerStatus;
    maghrib: PrayerStatus;
    isha: PrayerStatus;
  };
  nawafel: Nawafel;
  parentRespect: number;
  schoolAttendance: boolean;
  dailyStudy: number;
  adhkar: Adhkar;
  halaqah: Halaqah;
  date?: string; // اختياري - بصيغة YYYY-MM-DD
}

export interface StudentBadges {
  badgeProgress: BadgeProgress;
  earnedBadges: Badge[];
  totalBadgeRepeats: number;
}

// API Functions

/**
 * حفظ أو تحديث النقاط اليومية
 */
export const saveDailyPoints = async (data: DailyPointsData): Promise<any> => {
  try {
    const headers = await getHeaders();
    const response = await axios.post(`${POINTS_GAME_URL}/daily`, data, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    console.error("خطأ في حفظ النقاط:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * جلب النقاط اليومية (اليوم الحالي أو تاريخ محدد)
 */
export const getDailyPoints = async (date?: string): Promise<any> => {
  try {
    const headers = await getHeaders();
    const url = date
      ? `${POINTS_GAME_URL}/daily/${date}`
      : `${POINTS_GAME_URL}/daily`;
    const response = await axios.get(url, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    console.error("خطأ في جلب النقاط:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * جلب شارات الطالب والتقدم نحو الشارات
 */
export const getStudentBadges = async (): Promise<StudentBadges> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${POINTS_GAME_URL}/badges`, {
      headers,
    });
    return response.data.data;
  } catch (error: any) {
    console.error("خطأ في جلب الشارات:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * جلب ترتيب الطلاب حسب النقاط (في نفس الحلقة فقط)
 */
export const getPointsRankings = async (): Promise<RankingStudent[]> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${POINTS_GAME_URL}/rankings/points`, {
      headers,
    });
    return response.data.data;
  } catch (error: any) {
    console.error(
      "خطأ في جلب ترتيب النقاط:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * جلب ترتيب الطلاب حسب الشارات (في نفس الحلقة فقط)
 */
export const getBadgesRankings = async (): Promise<RankingStudent[]> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${POINTS_GAME_URL}/rankings/badges`, {
      headers,
    });
    return response.data.data;
  } catch (error: any) {
    console.error(
      "خطأ في جلب ترتيب الشارات:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * جلب إحصائيات الطالب (أسبوعي، شهري، ترتيب)
 */
export const getStudentStats = async (): Promise<StudentStats> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${POINTS_GAME_URL}/stats`, {
      headers,
    });
    return response.data.data;
  } catch (error: any) {
    console.error(
      "خطأ في جلب الإحصائيات:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * جلب الحلقات الخاصة بالمعلم
 */
export const getTeacherGroups = async (): Promise<any[]> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(`${POINTS_GAME_URL}/teacher-groups`, {
      headers,
    });
    return response.data.data || [];
  } catch (error: any) {
    console.error(
      "خطأ في جلب حلقات المعلم:",
      error.response?.data || error.message
    );
    return [];
  }
};

/**
 * جلب ترتيب الطلاب حسب النقاط لحلقة معينة (للمعلمين)
 */
export const getPointsRankingsByGroup = async (
  groupId: string
): Promise<RankingStudent[]> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(
      `${POINTS_GAME_URL}/rankings/points?groupId=${groupId}`,
      {
        headers,
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error(
      "خطأ في جلب ترتيب النقاط للحلقة:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

/**
 * جلب ترتيب الطلاب حسب الشارات لحلقة معينة (للمعلمين)
 */
export const getBadgesRankingsByGroup = async (
  groupId: string
): Promise<RankingStudent[]> => {
  try {
    const headers = await getHeaders();
    const response = await axios.get(
      `${POINTS_GAME_URL}/rankings/badges?groupId=${groupId}`,
      {
        headers,
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error(
      "خطأ في جلب ترتيب الشارات للحلقة:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export default {
  saveDailyPoints,
  getDailyPoints,
  getStudentBadges,
  getPointsRankings,
  getBadgesRankings,
  getStudentStats,
  getTeacherGroups,
  getPointsRankingsByGroup,
  getBadgesRankingsByGroup,
};
