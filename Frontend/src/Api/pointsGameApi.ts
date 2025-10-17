// Api/pointsGameApi.ts
import axios from "axios";
import { API_URL } from "../config";

const POINTS_GAME_URL = `${API_URL}/points-game`;

// الحصول على التوكن من localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// إعداد headers مع التوكن
const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
};

// Types
export interface Prayers {
  fajr: "mosque" | "home" | "late" | "missed";
  dhuhr: "mosque" | "home" | "late" | "missed";
  asr: "mosque" | "home" | "late" | "missed";
  maghrib: "mosque" | "home" | "late" | "missed";
  isha: "mosque" | "home" | "late" | "missed";
}

export interface Nawafel {
  duha: boolean;
  qiyamAlayl: boolean;
  rawatib: boolean;
  witr: boolean;
}

export interface Adhkar {
  morning: boolean;
  evening: boolean;
  sleep: boolean;
  afterPrayer: boolean;
}

export interface Halaqah {
  memorizedMinutes: number;
  reviewedMinutes: number;
}

export interface DailyPointsData {
  prayers: Prayers;
  nawafel: Nawafel;
  parentRespect: number;
  schoolAttendance: boolean;
  dailyStudy: number;
  adhkar: Adhkar;
  halaqah: Halaqah;
  date?: string; // اختياري - بصيغة YYYY-MM-DD
}

export interface Badge {
  badgeId: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  count: number;
  firstEarnedAt: string;
  lastEarnedAt: string;
}

export interface BadgeProgress {
  mosquePrayerStreak: number;
  adhkarStreak: number;
  parentRespectPerfect: number;
  schoolAttendanceStreak: number;
  overallStreak: number;
  sunanStreak: number;
  mosqueTwoPrayersWeek: number;
}

export interface StudentBadges {
  badgeProgress: BadgeProgress;
  earnedBadges: Badge[];
  totalBadgeRepeats: number;
}

export interface RankingStudent {
  studentId: string;
  name: string;
  points: number;
  badgesCount: number;
  totalBadgeRepeats: number;
  rank: number;
}

export interface StudentStats {
  weeklyPoints: number;
  monthlyPoints: number;
  currentRank: number;
}

// API Functions

/**
 * حفظ أو تحديث النقاط اليومية
 */
export const saveDailyPoints = async (data: DailyPointsData): Promise<any> => {
  try {
    const response = await axios.post(`${POINTS_GAME_URL}/daily`, data, {
      headers: getHeaders(),
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
    const url = date
      ? `${POINTS_GAME_URL}/daily/${date}`
      : `${POINTS_GAME_URL}/daily`;
    const response = await axios.get(url, {
      headers: getHeaders(),
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
    const response = await axios.get(`${POINTS_GAME_URL}/badges`, {
      headers: getHeaders(),
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
    const response = await axios.get(`${POINTS_GAME_URL}/rankings/points`, {
      headers: getHeaders(),
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
    const response = await axios.get(`${POINTS_GAME_URL}/rankings/badges`, {
      headers: getHeaders(),
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
    const response = await axios.get(`${POINTS_GAME_URL}/stats`, {
      headers: getHeaders(),
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

export default {
  saveDailyPoints,
  getDailyPoints,
  getStudentBadges,
  getPointsRankings,
  getBadgesRankings,
  getStudentStats,
};
