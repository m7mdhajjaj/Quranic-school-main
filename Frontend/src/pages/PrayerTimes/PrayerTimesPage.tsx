import { LoadingSpinner } from "@/components/UI";
import { usePrayerTimes, useNextPrayer } from "./hooks";
import { DateCard, NextPrayerCard, PrayerCard, InfoNote } from "./components";
import { Clock } from "lucide-react";

const PrayerTimesPage = () => {
  const { prayerTimes, loading, currentDate, hijriDate } = usePrayerTimes();
  const nextPrayer = useNextPrayer(prayerTimes);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-[98%] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                🕌 مواقيت الصلاة
              </h1>
              <p className="text-white/70 text-sm mt-1">
                نابلس، فلسطين 🇵🇸
              </p>
            </div>
          </div>
        </div>

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
