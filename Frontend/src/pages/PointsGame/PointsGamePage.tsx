// PointsGamePage.tsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePointsGameData } from "./hooks/usePointsGameData";
import { usePointsGameActions } from "./hooks/usePointsGameActions";
import { useRankings } from "./hooks/useRankings";
import { calculateTotalPoints } from "./utils/pointsCalculator";
import {
  PointsSummaryCard,
  PrayersSection,
  NawafelSection,
  DailyActivitiesSection,
  AdhkarSection,
  HalaqahSection,
  RankingsModal,
  BadgesModal,
  TeacherView,
  MotivationalMessage,
} from "./components";
import type { PrayerStatus, Prayers } from "./types/pointsGame.types";

const PointsGamePage = () => {
  const { user } = useAuth();
  const [showRankings, setShowRankings] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [rankingType, setRankingType] = useState<"points" | "badges">("points");

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

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div
        className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="text-6xl mb-2">
                {user?.role === "teacher" ? "📊" : "🎮"}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {user?.role === "teacher"
                ? "ترتيب الطلاب"
                : "لعبة النقاط اليومية"}
            </h1>
            <p className="text-gray-600 text-lg">
              {user?.role === "teacher"
                ? "تابع تقدم طلابك ومنافستهم! 🌟"
                : "تابع نشاطاتك اليومية واجمع النقاط! 🌟"}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              {user?.role === "teacher" ? "المعلم" : "الطالب"}:{" "}
              <span className="font-bold text-blue-600">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>

          {/* المعلم يرى فقط زر لوحة الترتيب */}
          {user?.role === "teacher" ? (
            <TeacherView
              onShowRankings={handleShowRankings}
              loading={dataLoading || rankingsLoading}
            />
          ) : (
            <>
              {/* إجمالي النقاط اليومية - للطلاب فقط */}
              <PointsSummaryCard
                totalPoints={totalPoints}
                stats={stats}
                onShowRankings={handleShowRankings}
                onShowBadges={() => setShowBadges(true)}
                onSavePoints={handleSavePoints}
                loading={dataLoading || rankingsLoading}
                saving={saving}
                earnedBadgesCount={earnedBadges.length}
              />

              {/* الصلوات الفروض */}
              <PrayersSection
                prayers={prayers}
                onUpdatePrayer={updatePrayerStatus}
              />

              {/* الصلوات النوافل */}
              <NawafelSection
                nawafel={nawafel}
                onToggle={(key) =>
                  setNawafel({ ...nawafel, [key]: !nawafel[key] })
                }
              />

              {/* الأنشطة اليومية */}
              <DailyActivitiesSection
                parentRespect={parentRespect}
                schoolAttendance={schoolAttendance}
                dailyStudy={dailyStudy}
                onParentRespectChange={setParentRespect}
                onSchoolAttendanceToggle={() =>
                  setSchoolAttendance(!schoolAttendance)
                }
                onDailyStudyChange={setDailyStudy}
              />

              {/* الأذكار */}
              <AdhkarSection
                adhkar={adhkar}
                onToggle={(key) =>
                  setAdhkar({ ...adhkar, [key]: !adhkar[key] })
                }
              />

              {/* المتابعة في الحلقة */}
              <HalaqahSection
                halaqah={halaqah}
                onUpdate={(key, value) =>
                  setHalaqah({ ...halaqah, [key]: value })
                }
              />

              {/* رسالة تحفيزية */}
              <MotivationalMessage totalPoints={totalPoints} />
            </>
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
