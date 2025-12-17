// components/StudentView.tsx
import { memo } from 'react';
import {
  PointsSummaryCard,
  PrayersSection,
  NawafelSection,
  DailyActivitiesSection,
  AdhkarSection,
  HalaqahSection,
  MotivationalMessage,
} from './';
import type { StudentViewProps } from '../types/pointsGame.types';

export const StudentView = memo(({
  totalPoints,
  stats,
  earnedBadgesCount,
  loading,
  saving,
  prayers,
  onUpdatePrayer,
  nawafel,
  onToggleNawafel,
  parentRespect,
  schoolAttendance,
  dailyStudy,
  onParentRespectChange,
  onSchoolAttendanceToggle,
  onDailyStudyChange,
  adhkar,
  onToggleAdhkar,
  halaqah,
  onUpdateHalaqah,
  onShowRankings,
  onShowBadges,
  onSavePoints,
}: StudentViewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* إجمالي النقاط اليومية */}
      <PointsSummaryCard
        totalPoints={totalPoints}
        stats={stats}
        onShowRankings={onShowRankings}
        onShowBadges={onShowBadges}
        onSavePoints={onSavePoints}
        loading={loading}
        saving={saving}
        earnedBadgesCount={earnedBadgesCount}
      />

      {/* الأنشطة الدينية - Grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* العمود الأيمن */}
        <div className="space-y-4 sm:space-y-6">
          {/* الصلوات النوافل */}
          <NawafelSection nawafel={nawafel} onToggle={onToggleNawafel} />
        </div>

        {/* العمود الأيسر */}
        <div className="space-y-4 sm:space-y-6">
          {/* الأذكار */}
          <AdhkarSection adhkar={adhkar} onToggle={onToggleAdhkar} />

          {/* المتابعة في الحلقة */}
        </div>
      </div>
      <PrayersSection prayers={prayers} onUpdatePrayer={onUpdatePrayer} />
      {/* الأنشطة اليومية - عرض كامل */}

      <HalaqahSection halaqah={halaqah} onUpdate={onUpdateHalaqah} />

      <DailyActivitiesSection
        parentRespect={parentRespect}
        schoolAttendance={schoolAttendance}
        dailyStudy={dailyStudy}
        onParentRespectChange={onParentRespectChange}
        onSchoolAttendanceToggle={onSchoolAttendanceToggle}
        onDailyStudyChange={onDailyStudyChange}
      />

      {/* رسالة تحفيزية */}
      <MotivationalMessage totalPoints={totalPoints} />

      {/* تنبيهات مهمة - في نهاية الصفحة */}
      <div className="mt-6 sm:mt-8 space-y-3 animate-[fadeIn_0.6s_ease-in-out]">
        {/* تحذير: تزوير النقاط */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-r-4 border-red-500 rounded-lg p-3 sm:p-4 shadow-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl mt-0.5">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 mb-1 text-base sm:text-lg">
                تحذير هام
              </h3>
              <p className="text-red-700 text-xs sm:text-sm leading-relaxed font-semibold">
                أي طالب يُضبط يزور النقاط سيتم طرده من المسابقة فوراً!
                <br />
                <span className="text-red-600 text-xs mt-1 block">
                  النزاهة والأمانة هي أساس المنافسة الشريفة
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* تنبيه: تذكر أن الله يراك */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-r-4 border-orange-400 rounded-lg p-3 sm:p-4 shadow-md">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl mt-0.5">👁️</div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-800 mb-1 text-base sm:text-lg">
                تذكر أن الله يراك
              </h3>
              <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">
                كن صادقاً في تسجيل نقاطك، فالله مطلع على كل شيء. قال رسول الله
                ﷺ: <span className="font-semibold">"من غشنا فليس منا"</span>
              </p>
            </div>
          </div>
        </div>

        {/* تنبيه: املأ البيانات مرة واحدة */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-r-4 border-emerald-400 rounded-lg p-3 sm:p-4 shadow-md">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl mt-0.5">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-800 mb-1 text-base sm:text-lg">
                نصيحة مهمة
              </h3>
              <p className="text-emerald-700 text-xs sm:text-sm leading-relaxed">
                يُفضل أن تملأ جميع البيانات{' '}
                <span className="font-semibold">مرة واحدة في نهاية اليوم</span>{' '}
                لضمان دقة التسجيل والحصول على النقاط بشكل صحيح.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

StudentView.displayName = 'StudentView';
