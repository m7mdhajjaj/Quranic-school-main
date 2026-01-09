/**
 * Custom hook for Points Game data management
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveDailyPoints,
  getDailyPoints,
  getStudentBadges,
  getStudentStats,
  getPointsRankings,
  getBadgesRankings,
  getTeacherGroups,
  getPointsRankingsByGroup,
  getBadgesRankingsByGroup,
} from "@/Api/pointsGameApi";
import type {
  Prayers,
  Nawafel,
  Adhkar,
  Halaqah,
  Badge,
  BadgeProgress,
  StudentStats,
  RankingStudent,
} from "@/types/pointsGame.types";

export const usePointsGame = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Teacher-specific states
  const [teacherGroups, setTeacherGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // Prayer states
  const [prayers, setPrayers] = useState<Prayers>({
    fajr: { status: "missed" },
    dhuhr: { status: "missed" },
    asr: { status: "missed" },
    maghrib: { status: "missed" },
    isha: { status: "missed" },
  });

  // Nawafel states
  const [nawafel, setNawafel] = useState<Nawafel>({
    duha: false,
    qiyamAlayl: false,
    rawatib: false,
    witr: false,
  });

  // Other activities
  const [parentRespect, setParentRespect] = useState(0);
  const [schoolAttendance, setSchoolAttendance] = useState(false);
  const [dailyStudy, setDailyStudy] = useState(0);

  // Adhkar
  const [adhkar, setAdhkar] = useState<Adhkar>({
    morning: false,
    evening: false,
    sleep: false,
    afterPrayer: false,
  });

  // Halaqah
  const [halaqah, setHalaqah] = useState<Halaqah>({
    memorizedMinutes: 0,
    reviewedMinutes: 0,
  });

  // Stats & Badges
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress | null>(
    null
  );
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [rankings, setRankings] = useState<RankingStudent[]>([]);
  const [badgeRankings, setBadgeRankings] = useState<RankingStudent[]>([]);

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);

          // Load teacher groups if user is a teacher
          if (userData.role === "teacher") {
            const groups = await getTeacherGroups();
            setTeacherGroups(groups);
            if (groups.length > 0) {
              setSelectedGroup(groups[0]._id);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Load today's points
  const loadTodayPoints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDailyPoints();

      if (data.data) {
        const dailyData = data.data;

        // Load prayers
        setPrayers({
          fajr: { status: dailyData.prayers.fajr },
          dhuhr: { status: dailyData.prayers.dhuhr },
          asr: { status: dailyData.prayers.asr },
          maghrib: { status: dailyData.prayers.maghrib },
          isha: { status: dailyData.prayers.isha },
        });

        setNawafel(dailyData.nawafel);
        setParentRespect(dailyData.parentRespect);
        setSchoolAttendance(dailyData.schoolAttendance);
        setDailyStudy(dailyData.dailyStudy);
        setAdhkar(dailyData.adhkar);
        setHalaqah(dailyData.halaqah);
      }
    } catch (error) {
      console.log("No data for today yet");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load badges
  const loadBadges = useCallback(async () => {
    try {
      const badgesData = await getStudentBadges();
      // Map API badges to app badges format
      const mappedBadges = (badgesData.earnedBadges || []).map(
        (badge: any) => ({
          id: badge.badgeId || badge.id,
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          requirement: badge.requirement,
          count: badge.count,
        })
      );
      setEarnedBadges(mappedBadges);
      setBadgeProgress(badgesData.badgeProgress || null);
    } catch (error) {
      console.error("Error loading badges:", error);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await getStudentStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  // Load rankings
  const loadRankings = useCallback(async (groupId?: string) => {
    try {
      // If groupId is provided (teacher view), use it
      // Otherwise use normal rankings (student view)
      const [pointsRanks, badgeRanks] = groupId
        ? await Promise.all([
            getPointsRankingsByGroup(groupId),
            getBadgesRankingsByGroup(groupId),
          ])
        : await Promise.all([getPointsRankings(), getBadgesRankings()]);

      // Map API rankings to app rankings format
      const mappedPointsRanks = pointsRanks.map(
        (student: any, index: number) => ({
          _id: student.studentId || student._id,
          studentId: student.studentId,
          name: student.name,
          emoji: student.emoji || "👤",
          rank: student.rank || index + 1,
          points: student.points,
          badgesCount: student.badgesCount,
          totalBadgeRepeats: student.totalBadgeRepeats,
        })
      );

      const mappedBadgeRanks = badgeRanks.map(
        (student: any, index: number) => ({
          _id: student.studentId || student._id,
          studentId: student.studentId,
          name: student.name,
          emoji: student.emoji || "👤",
          rank: student.rank || index + 1,
          points: student.points,
          badgesCount: student.badgesCount,
          totalBadgeRepeats: student.totalBadgeRepeats,
        })
      );

      setRankings(mappedPointsRanks);
      setBadgeRankings(mappedBadgeRanks);
    } catch (error) {
      console.error("Error loading rankings:", error);
    }
  }, []);

  // Save points
  const savePoints = useCallback(async () => {
    try {
      setSaving(true);

      const dataToSave = {
        prayers: {
          fajr: prayers.fajr.status,
          dhuhr: prayers.dhuhr.status,
          asr: prayers.asr.status,
          maghrib: prayers.maghrib.status,
          isha: prayers.isha.status,
        },
        nawafel,
        parentRespect,
        schoolAttendance,
        dailyStudy,
        adhkar,
        halaqah,
      };

      await saveDailyPoints(dataToSave);

      // Reload data
      await Promise.all([loadBadges(), loadStats()]);

      return true;
    } catch (error) {
      console.error("Error saving points:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    prayers,
    nawafel,
    parentRespect,
    schoolAttendance,
    dailyStudy,
    adhkar,
    halaqah,
    loadBadges,
    loadStats,
  ]);

  // Initial load
  useEffect(() => {
    if (user && user.role === "student") {
      loadTodayPoints();
      loadBadges();
      loadStats();
    }
  }, [user, loadTodayPoints, loadBadges, loadStats]);

  return {
    user,
    loading,
    saving,
    // Teacher states
    teacherGroups,
    selectedGroup,
    setSelectedGroup,
    // Prayer states
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
    earnedBadges,
    badgeProgress,
    stats,
    rankings,
    badgeRankings,
    savePoints,
    loadRankings,
  };
};
