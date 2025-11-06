import { useState, useEffect } from "react";
import { Card, LoadingSpinner, PageHeader } from "@/components/UI";

interface PrayerTime {
  name: string;
  time: string;
  icon: string;
}

const PrayerTimesPage = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);

      // تنسيق التاريخ
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // جلب مواقيت الصلاة من API
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=Nablus&country=Palestine&method=4`
      );

      const data = await response.json();

      if (data.code === 200) {
        const timings = data.data.timings;
        const date = data.data.date;

        // تحديث التاريخ الميلادي
        setCurrentDate(date.readable);

        // تحديث التاريخ الهجري
        const hijri = date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.year}`);

        // تنظيم المواقيت
        const prayers: PrayerTime[] = [
          {
            name: "الفجر",
            time: timings.Fajr,
            icon: "🌅",
          },
          {
            name: "الشروق",
            time: timings.Sunrise,
            icon: "🌄",
          },
          {
            name: "الظهر",
            time: timings.Dhuhr,
            icon: "☀️",
          },
          {
            name: "العصر",
            time: timings.Asr,
            icon: "🌤️",
          },
          {
            name: "المغرب",
            time: timings.Maghrib,
            icon: "🌆",
          },
          {
            name: "العشاء",
            time: timings.Isha,
            icon: "🌙",
          },
        ];

        setPrayerTimes(prayers);
      }
    } catch (error) {
      console.error("خطأ في جلب مواقيت الصلاة:", error);
    } finally {
      setLoading(false);
    }
  };

  // دالة للحصول على الوقت المتبقي للصلاة القادمة
  const getNextPrayer = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayerTimes.slice(0, -1)) {
      if (prayer.name === "الشروق") continue;

      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        const diff = prayerTime - currentTime;
        const hoursLeft = Math.floor(diff / 60);
        const minutesLeft = diff % 60;
        return {
          name: prayer.name,
          timeLeft: `${hoursLeft} ساعة و ${minutesLeft} دقيقة`,
        };
      }
    }

    return null;
  };

  const nextPrayer = getNextPrayer();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8"
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
          <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="text-center p-6">
              <div className="text-lg mb-2 opacity-90">التاريخ الميلادي</div>
              <div className="text-3xl font-bold mb-4">{currentDate}</div>
              <div className="text-lg mb-2 opacity-90">التاريخ الهجري</div>
              <div className="text-3xl font-bold">{hijriDate}</div>
            </div>
          </Card>
        </div>

        {/* الصلاة القادمة */}
        {nextPrayer && (
          <div className="mb-6 animate-pulse">
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="text-center p-6">
                <div className="text-2xl font-bold mb-2">
                  ⏰ الصلاة القادمة: {nextPrayer.name}
                </div>
                <div className="text-lg opacity-90">
                  متبقي: {nextPrayer.timeLeft}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* مواقيت الصلاة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayerTimes.map((prayer, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center p-6">
                <div className="text-5xl mb-3">{prayer.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {prayer.name}
                </h3>
                <div className="text-3xl font-bold text-emerald-600">
                  {prayer.time}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ملاحظة */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-r-4 border-blue-500">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-1">ملاحظة</h4>
                  <p className="text-blue-700 text-sm">
                    المواقيت المعروضة خاصة بمدينة نابلس، فلسطين. يتم تحديث
                    المواقيت تلقائياً كل يوم.
                  </p>
                </div>
              </div>
            </div>
          </Card>
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
