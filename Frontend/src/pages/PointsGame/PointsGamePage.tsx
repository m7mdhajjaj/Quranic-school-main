// PointsGamePage.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePointsGameData } from './hooks/usePointsGameData';
import { usePointsGameActions } from './hooks/usePointsGameActions';
import { useRankings } from './hooks/useRankings';
import { calculateTotalPoints } from './utils/pointsCalculator';
import PageHeader from '@/components/UI/PageHeader';
import {
  RankingsModal,
  BadgesModal,
  StudentView,
  TeacherRankingsView,
} from './components';
import type { PrayerStatus, Prayers } from './types/pointsGame.types';

const PointsGamePage = () => {
  const { user } = useAuth();
  const [showRankings, setShowRankings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [rankingType, setRankingType] = useState<'points' | 'badges'>('points');

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
    badgeProgress,
    earnedBadges,
    stats,
    currentDate,
    loadBadgesData,
    loadStatsData,
  } = usePointsGameData(user?.role);

  const { saving, saveDailyData } = usePointsGameActions(
    loadBadgesData,
    loadStatsData
  );

  const {
    loading: rankingsLoading,
    realRankings,
    realBadgeRankings,
    loadRankings,
  } = useRankings();

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
        halaqah
      ),
    [prayers, nawafel, parentRespect, schoolAttendance, dailyStudy, adhkar, halaqah]
  );

  // دالة لتحديث حالة الصلاة
  const updatePrayerStatus = useCallback((
    prayerName: keyof Prayers,
    status: PrayerStatus
  ) => {
    setPrayers((prev) => ({
      ...prev,
      [prayerName]: { status },
    }));
  }, [setPrayers]);

  const handleToggleNawafel = useCallback(
    (key: keyof typeof nawafel) => {
      setNawafel((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setNawafel]
  );

  const handleToggleAdhkar = useCallback(
    (key: keyof typeof adhkar) => {
      setAdhkar((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setAdhkar]
  );

  const handleUpdateHalaqah = useCallback(
    (key: keyof typeof halaqah, value: number) => {
      setHalaqah((prev) => ({ ...prev, [key]: value }));
    },
    [setHalaqah]
  );

  const handleSchoolAttendanceToggle = useCallback(() => {
    setSchoolAttendance((prev) => !prev);
  }, [setSchoolAttendance]);

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
    };

    await saveDailyData(dailyData, totalPoints);
  }, [currentDate, prayers, nawafel, parentRespect, schoolAttendance, dailyStudy, adhkar, halaqah, saveDailyData, totalPoints]);

  // دالة لفتح لوحة الترتيب
  const handleShowRankings = useCallback(async () => {
    await loadRankings();
    setShowRankings(true);
  }, [loadRankings]);

  // تحميل البيانات تلقائياً للمعلم
  useEffect(() => {
    if (user?.role === 'teacher') {
      loadRankings();
    }
  }, [user?.role, loadRankings]);

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-cyan-50/40 p-3 sm:p-4 md:p-6 lg:p-8"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-0">
          {/* Header */}
          <PageHeader
            title={user?.role === 'teacher' ? 'ترتيب الطلاب' : 'لعبة النقاط اليومية'}
            subtitle={
              user?.role === 'teacher'
                ? `المعلم: ${user?.firstName} ${user?.lastName} - تابع تقدم طلابك ومنافستهم! 🌟`
                : `الطالب: ${user?.firstName} ${user?.lastName} - تابع نشاطاتك اليومية واجمع النقاط! 🌟`
            }
            icon={
              <div className="text-6xl">
                {user?.role === 'teacher' ? '📊' : '🎮'}
              </div>
            }
          />

          {/* المعلم يرى لوحة الترتيب مباشرة */}
          {user?.role === 'teacher' ? (
            <TeacherRankingsView
              loading={rankingsLoading}
              rankingType={rankingType}
              realRankings={realRankings}
              realBadgeRankings={realBadgeRankings}
              onChangeType={setRankingType}
            />
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
