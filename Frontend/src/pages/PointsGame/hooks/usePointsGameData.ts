// hooks/usePointsGameData.ts
import { useState, useEffect } from "react";
import {
  getDailyPoints,
  getStudentBadges,
  getStudentStats,
} from "../../../Api/pointsGameApi";
import type {
  Prayers,
  Nawafel,
  Adhkar,
  Halaqah,
  Badge,
  BadgeProgress,
  StudentStats,
} from "../types/pointsGame.types";

export const usePointsGameData = (userRole: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date().toISOString().split("T")[0];

  // State للبيانات القابلة للتعديل
  const [prayers, setPrayers] = useState<Prayers>({
    fajr: { status: "missed" },
    dhuhr: { status: "missed" },
    asr: { status: "missed" },
    maghrib: { status: "missed" },
    isha: { status: "missed" },
  });

  const [nawafel, setNawafel] = useState<Nawafel>({
    duha: false,
    qiyamAlayl: false,
    rawatib: false,
    witr: false,
  });

  const [parentRespect, setParentRespect] = useState(5);
  const [schoolAttendance, setSchoolAttendance] = useState(false);
  const [dailyStudy, setDailyStudy] = useState(0);

  const [adhkar, setAdhkar] = useState<Adhkar>({
    morning: false,
    evening: false,
    sleep: false,
    afterPrayer: false,
  });

  const [halaqah, setHalaqah] = useState<Halaqah>({
    memorizedMinutes: 0,
    reviewedMinutes: 0,
  });

  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress>({
    mosquePrayerStreak: 0,
    adhkarStreak: 0,
    parentRespectPerfect: 0,
    schoolAttendanceStreak: 0,
    overallStreak: 0,
    sunanStreak: 0,
    mosqueTwoPrayersWeek: 0,
  });

  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);

  // جلب بيانات اليوم الحالي
  const loadTodayData = async () => {
    try {
      setLoading(true);
      const data = await getDailyPoints(currentDate);
      if (data) {
        setPrayers({
          fajr: { status: data.prayers?.fajr || "missed" },
          dhuhr: { status: data.prayers?.dhuhr || "missed" },
          asr: { status: data.prayers?.asr || "missed" },
          maghrib: { status: data.prayers?.maghrib || "missed" },
          isha: { status: data.prayers?.isha || "missed" },
        });
        setNawafel(
          data.nawafel || {
            duha: false,
            qiyamAlayl: false,
            rawatib: false,
            witr: false,
          }
        );
        setParentRespect(data.parentRespect || 5);
        setSchoolAttendance(data.schoolAttendance || false);
        setDailyStudy(data.dailyStudy || 0);
        setAdhkar(
          data.adhkar || {
            morning: false,
            evening: false,
            sleep: false,
            afterPrayer: false,
          }
        );
        setHalaqah({
          memorizedMinutes: data.halaqah?.memorized || 0,
          reviewedMinutes: data.halaqah?.reviewed || 0,
        });
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات اليوم:", error);
    } finally {
      setLoading(false);
    }
  };

  // جلب بيانات الشارات
  const loadBadgesData = async () => {
    try {
      const data = await getStudentBadges();
      if (data) {
        setBadgeProgress(
          data.badgeProgress || {
            mosquePrayerStreak: 0,
            adhkarStreak: 0,
            parentRespectPerfect: 0,
            schoolAttendanceStreak: 0,
            overallStreak: 0,
            sunanStreak: 0,
            mosqueTwoPrayersWeek: 0,
          }
        );
        const convertedBadges: Badge[] = (data.earnedBadges || []).map(
          (badge: any) => ({
            id: badge.badgeId,
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
            requirement: badge.requirement,
            count: badge.count,
          })
        );
        setEarnedBadges(convertedBadges);
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الشارات:", error);
    }
  };

  // جلب الإحصائيات
  const loadStatsData = async () => {
    try {
      const data = await getStudentStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    }
  };

  useEffect(() => {
    if (userRole !== "teacher") {
      loadTodayData();
      loadBadgesData();
      loadStatsData();
    }
  }, [userRole]);

  return {
    loading,
    prayers,
    setPrayers,
    nawafel,
    setNawafel,
    parentRespect,
    setParentRespect,
    schoolAttendance,
    setSchoolAttendance,
    dailyStudy,
    setDailyStudy,
    adhkar,
    setAdhkar,
    halaqah,
    setHalaqah,
    badgeProgress,
    earnedBadges,
    stats,
    currentDate,
    loadBadgesData,
    loadStatsData,
  };
};
