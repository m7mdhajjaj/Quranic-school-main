// hooks/usePointsGameData.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDailyPoints,
  getStudentBadges,
  getStudentStats,
} from "@/Api/pointsGameApi";
import type {
  Prayers,
  Nawafel,
  Adhkar,
  Halaqah,
  Ramadan,
  Badge,
  BadgeProgress,
  StudentStats,
} from "../types/pointsGame.types";

export const usePointsGameData = (userRole: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const currentDate = useMemo(() => new Date().toISOString().split("T")[0], []);

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

  const [ramadan, setRamadan] = useState<Ramadan>({
    taraweehRakaat: 0,
    quranPages: 0,
    fpiasting: false,
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
  const loadTodayData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDailyPoints(currentDate);
      const dailyData = response?.data;
      if (dailyData) {
        setPrayers({
          fajr: { status: dailyData.prayers?.fajr || "missed" },
          dhuhr: { status: dailyData.prayers?.dhuhr || "missed" },
          asr: { status: dailyData.prayers?.asr || "missed" },
          maghrib: { status: dailyData.prayers?.maghrib || "missed" },
          isha: { status: dailyData.prayers?.isha || "missed" },
        });
        setNawafel(
          dailyData.nawafel || {
            duha: false,
            qiyamAlayl: false,
            rawatib: false,
            witr: false,
          },
        );
        setParentRespect(dailyData.parentRespect ?? 5);
        setSchoolAttendance(dailyData.schoolAttendance || false);
        setDailyStudy(dailyData.dailyStudy || 0);
        setAdhkar(
          dailyData.adhkar || {
            morning: false,
            evening: false,
            sleep: false,
            afterPrayer: false,
          },
        );
        setHalaqah({
          memorizedMinutes: dailyData.halaqah?.memorizedMinutes || 0,
          reviewedMinutes: dailyData.halaqah?.reviewedMinutes || 0,
        });
        setRamadan({
          taraweehRakaat: dailyData.ramadan?.taraweehRakaat || 0,
          quranPages: dailyData.ramadan?.quranPages || 0,
          fpiasting: dailyData.ramadan?.fpiasting || false,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  // جلب بيانات الشارات
  const loadBadgesData = useCallback(async () => {
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
          },
        );
        const convertedBadges: Badge[] = (data.earnedBadges || []).map(
          (badge: any) => ({
            id: badge.badgeId,
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
            requirement: badge.requirement,
            count: badge.count,
          }),
        );
        setEarnedBadges(convertedBadges);
      }
    } catch {
      // swallow to keep UI responsive; handled via UI state
    }
  }, []);

  // جلب الإحصائيات
  const loadStatsData = useCallback(async () => {
    try {
      const data = await getStudentStats();
      if (data) {
        setStats(data);
      }
    } catch {
      // swallow to keep UI responsive; handled via UI state
    }
  }, []);

  useEffect(() => {
    if (userRole !== "teacher") {
      loadTodayData();
      loadBadgesData();
      loadStatsData();
    }
  }, [userRole, loadTodayData, loadBadgesData, loadStatsData]);

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
    ramadan,
    setRamadan,
    badgeProgress,
    earnedBadges,
    stats,
    currentDate,
    loadBadgesData,
    loadStatsData,
  };
};
