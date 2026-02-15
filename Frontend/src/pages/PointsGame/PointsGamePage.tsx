// PointsGamePage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePointsGameData } from "./hooks/usePointsGameData";
import { usePointsGameActions } from "./hooks/usePointsGameActions";
import { useRankings } from "./hooks/useRankings";
import { useTeacherGroups } from "./hooks/useTeacherGroups";
import { calculateTotalPoints } from "./utils/pointsCalculator";
import { Gamepad2, BarChart3, Calendar } from "lucide-react";
import {
  RankingsModal,
  BadgesModal,
  StudentView,
  TeacherRankingsView,
  TeacherDailyView,
} from "./components";
import type { PrayerStatus, Prayers, Ramadan } from "./types/pointsGame.types";

const PointsGamePage = () => {
  const { user } = useAuth();
  const [showRankings, setShowRankings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [rankingType, setRankingType] = useState<"points" | "badges">("points");
  const [teacherTab, setTeacherTab] = useState<"daily" | "rankings">("daily");

  // استخدام الـ hooks
  const {
    loading: dataLoading,
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
  } = usePointsGameData(user?.role);

  const { saving, saveDailyData } = usePointsGameActions(
    loadBadgesData,
    loadStatsData,
  );

  const {
    loading: rankingsLoading,
    realRankings,
    realBadgeRankings,
    loadRankings,
  } = useRankings();

  const {
    loading: groupsLoading,
    groups,
    selectedGroupId,
    setSelectedGroupId,
  } = useTeacherGroups();

  // حساب النقاط
  const totalPoints = useMemo(
    () =>
      calculateTotalPoints(
        prayers,
        nawafel,
        parentRespect,
        schoolAttendance,
        dailyStudy,
        adhkar,
        halaqah,
        ramadan,
      ),
    [
      prayers,
      nawafel,
      parentRespect,
      schoolAttendance,
      dailyStudy,
      adhkar,
      halaqah,
      ramadan,
    ],
  );

  // دالة لتحديث حالة الصلاة
  const updatePrayerStatus = useCallback(
    (prayerName: keyof Prayers, status: PrayerStatus) => {
      setPrayers((prev) => ({
        ...prev,
        [prayerName]: { status },
      }));
    },
    [setPrayers],
  );

  const handleToggleNawafel = useCallback(
    (key: keyof typeof nawafel) => {
      setNawafel((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setNawafel],
  );

  const handleToggleAdhkar = useCallback(
    (key: keyof typeof adhkar) => {
      setAdhkar((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setAdhkar],
  );

  const handleUpdateHalaqah = useCallback(
    (key: keyof typeof halaqah, value: number) => {
      setHalaqah((prev) => ({ ...prev, [key]: value }));
    },
    [setHalaqah],
  );

  const handleSchoolAttendanceToggle = useCallback(() => {
    setSchoolAttendance((prev) => !prev);
  }, [setSchoolAttendance]);

  const handleUpdateRamadan = useCallback(
    (key: keyof Ramadan, value: number | boolean) => {
      setRamadan((prev) => ({ ...prev, [key]: value }));
    },
    [setRamadan],
  );

  // دالة لحفظ النقاط اليومية
  const handleSavePoints = useCallback(async () => {
    const dailyData = {
      date: currentDate,
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
      halaqah: {
        memorizedMinutes: halaqah.memorizedMinutes,
        reviewedMinutes: halaqah.reviewedMinutes,
      },
      ramadan: {
        taraweehRakaat: ramadan.taraweehRakaat,
        quranPages: ramadan.quranPages,
        fpiasting: ramadan.fpiasting,
      },
    };

    await saveDailyData(dailyData, totalPoints);
  }, [
    currentDate,
    prayers,
    nawafel,
    parentRespect,
    schoolAttendance,
    dailyStudy,
    adhkar,
    halaqah,
    ramadan,
    saveDailyData,
    totalPoints,
  ]);

  // دالة لفتح لوحة الترتيب
  const handleShowRankings = useCallback(async () => {
    await loadRankings();
    setShowRankings(true);
  }, [loadRankings]);

  // تحميل البيانات تلقائياً للمعلم عند اختيار حلقة
  useEffect(() => {
    if (user?.role === "teacher" && selectedGroupId) {
      loadRankings(selectedGroupId);
    }
  }, [user?.role, selectedGroupId, loadRankings]);

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-3 sm:p-4 md:p-6 lg:p-8"
        dir="rtl">
        <div className="max-w-[98%] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
                {user?.role === "teacher" ? (
                  <BarChart3 className="w-8 h-8 text-white" />
                ) : (
                  <Gamepad2 className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {user?.role === "teacher"
                    ? "📊 ترتيب الطلاب"
                    : "🎮 لعبة النقاط اليومية"}
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  {user?.role === "teacher"
                    ? `المعلم: ${user?.firstName} ${user?.lastName} - تابع تقدم طلابك ومنافستهم! 🌟`
                    : `الطالب: ${user?.firstName} ${user?.lastName} - تابع نشاطاتك اليومية واجمع النقاط! 🌟`}
                </p>
              </div>
            </div>
          </div>

          {/* المعلم يرى تبويبات - نقاط اليوم أو لوحة الترتيب */}
          {user?.role === "teacher" ? (
            <div className="space-y-4">
              {/* تبويبات المعلم */}
              <div className="flex gap-2 bg-white rounded-xl border border-slate-200/60 shadow-sm p-2">
                <button
                  onClick={() => setTeacherTab("daily")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    teacherTab === "daily"
                      ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}>
                  <Calendar className="w-4 h-4" />
                  نقاط اليوم
                </button>
                <button
                  onClick={() => setTeacherTab("rankings")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    teacherTab === "rankings"
                      ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}>
                  <BarChart3 className="w-4 h-4" />
                  لوحة الترتيب
                </button>
              </div>

              {/* المحتوى حسب التبويب */}
              {teacherTab === "daily" ? (
                <TeacherDailyView
                  groups={groups}
                  selectedGroupId={selectedGroupId || ""}
                  onGroupChange={setSelectedGroupId}
                />
              ) : (
                <TeacherRankingsView
                  loading={rankingsLoading || groupsLoading}
                  rankingType={rankingType}
                  realRankings={realRankings}
                  realBadgeRankings={realBadgeRankings}
                  onChangeType={setRankingType}
                  groups={groups}
                  selectedGroupId={selectedGroupId}
                  onGroupChange={setSelectedGroupId}
                />
              )}
            </div>
          ) : (
            <StudentView
              totalPoints={totalPoints}
              stats={stats}
              earnedBadgesCount={earnedBadges.length}
              // avoid double loaders on first render (Suspense fallback already shown)
              // this flag is used mainly for the rankings button spinner
              loading={rankingsLoading}
              saving={saving}
              prayers={prayers}
              onUpdatePrayer={updatePrayerStatus}
              nawafel={nawafel}
              onToggleNawafel={handleToggleNawafel}
              parentRespect={parentRespect}
              schoolAttendance={schoolAttendance}
              dailyStudy={dailyStudy}
              onParentRespectChange={setParentRespect}
              onSchoolAttendanceToggle={handleSchoolAttendanceToggle}
              onDailyStudyChange={setDailyStudy}
              adhkar={adhkar}
              onToggleAdhkar={handleToggleAdhkar}
              halaqah={halaqah}
              onUpdateHalaqah={handleUpdateHalaqah}
              ramadan={ramadan}
              onUpdateRamadan={handleUpdateRamadan}
              onShowRankings={handleShowRankings}
              onShowBadges={() => setShowBadges(true)}
              onSavePoints={handleSavePoints}
            />
          )}
        </div>

        {/* Modal لوحة الترتيب */}
        <RankingsModal
          show={showRankings}
          loading={rankingsLoading}
          rankingType={rankingType}
          realRankings={realRankings}
          realBadgeRankings={realBadgeRankings}
          currentUserId={user?._id}
          currentUserName={`${user?.firstName} ${user?.lastName}`}
          onClose={() => setShowRankings(false)}
          onChangeType={setRankingType}
        />

        {/* مودال الشارات */}
        <BadgesModal
          show={showBadges}
          earnedBadges={earnedBadges}
          badgeProgress={badgeProgress}
          onClose={() => setShowBadges(false)}
        />
      </div>
    </>
  );
};

export default PointsGamePage;
