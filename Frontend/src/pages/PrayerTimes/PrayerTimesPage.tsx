import { LoadingSpinner, PageHeader } from "@/components/UI";
import { usePrayerTimes, useNextPrayer } from "./hooks";
import { DateCard, NextPrayerCard, PrayerCard, InfoNote } from "./components";

const PrayerTimesPage = () => {
  const { prayerTimes, loading, currentDate, hijriDate } = usePrayerTimes();
  const nextPrayer = useNextPrayer(prayerTimes);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <PageHeader
          title="مواقيت الصلاة"
          subtitle="نابلس، فلسطين 🇵🇸"
          icon={<span className="text-6xl">🕌</span>}
        />

        {/* التاريخ */}
        <div className="mb-6">
          <DateCard currentDate={currentDate} hijriDate={hijriDate} />
        </div>

        {/* الصلاة القادمة */}
        {nextPrayer && (
          <div className="mb-6">
            <NextPrayerCard nextPrayer={nextPrayer} />
          </div>
        )}

        {/* مواقيت الصلاة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayerTimes.map((prayer, index) => (
            <PrayerCard key={index} prayer={prayer} />
          ))}
        </div>

        {/* ملاحظة */}
        <div className="mt-8">
          <InfoNote />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>🕋 حافظ على صلاتك في أوقاتها</p>
          <p className="mt-2 text-xs opacity-75">
            البيانات مقدمة من API Aladhan
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesPage;
