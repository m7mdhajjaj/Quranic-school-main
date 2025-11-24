// PointsGamePage.tsx
import { useState, useEffect } from 'react';
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
  const totalPoints = calculateTotalPoints(
    prayers,
    nawafel,
    parentRespect,
    schoolAttendance,
    dailyStudy,
    adhkar,
    halaqah
  );

  // دالة لتحديث حالة الصلاة
  const updatePrayerStatus = (
    prayerName: keyof Prayers,
    status: PrayerStatus
  ) => {
    setPrayers((prev) => ({
      ...prev,
      [prayerName]: { status },
    }));
  };

  // دالة لحفظ النقاط اليومية
  const handleSavePoints = async () => {
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
  };

  // دالة لفتح لوحة الترتيب
  const handleShowRankings = async () => {
    await loadRankings();
    setShowRankings(true);
  };

  // تحميل البيانات تلقائياً للمعلم
  useEffect(() => {
    if (user?.role === 'teacher') {
      loadRankings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:p-4 md:p-6 lg:p-8"
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
              loading={dataLoading || rankingsLoading}
              saving={saving}
              prayers={prayers}
              onUpdatePrayer={updatePrayerStatus}
              nawafel={nawafel}
              onToggleNawafel={(key) =>
                setNawafel({ ...nawafel, [key]: !nawafel[key] })
              }
              parentRespect={parentRespect}
              schoolAttendance={schoolAttendance}
              dailyStudy={dailyStudy}
              onParentRespectChange={setParentRespect}
              onSchoolAttendanceToggle={() =>
                setSchoolAttendance(!schoolAttendance)
              }
              onDailyStudyChange={setDailyStudy}
              adhkar={adhkar}
              onToggleAdhkar={(key) =>
                setAdhkar({ ...adhkar, [key]: !adhkar[key] })
              }
              halaqah={halaqah}
              onUpdateHalaqah={(key, value) =>
                setHalaqah({ ...halaqah, [key]: value })
              }
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
