import { useState, useEffect } from "react";

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  icon: string;
}

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

interface ApiResponse {
  data: {
    timings: PrayerTimesData;
    date: {
      readable: string;
      hijri: {
        date: string;
        month: {
          ar: string;
        };
        year: string;
      };
    };
  };
}

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  const [hijriDate, setHijriDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

  const prayerNames = [
    { key: "Fajr", arabicName: "الفجر", icon: "🌅" },
    { key: "Sunrise", arabicName: "الشروق", icon: "☀️" },
    { key: "Dhuhr", arabicName: "الظهر", icon: "🌞" },
    { key: "Asr", arabicName: "العصر", icon: "🌆" },
    { key: "Maghrib", arabicName: "المغرب", icon: "🌇" },
    { key: "Isha", arabicName: "العشاء", icon: "🌙" },
  ];

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      setError("");

      // Using Aladhan API for Nablus, Palestine
      // Coordinates for Nablus: 32.2211, 35.2544
      const response = await fetch(
        "https://api.aladhan.com/v1/timings?latitude=32.2211&longitude=35.2544&method=4&tune=0,0,0,0,0,0,0,0,0"
      );

      if (!response.ok) {
        throw new Error("فشل في جلب مواقيت الصلاة");
      }

      const data: ApiResponse = await response.json();
      const timings = data.data.timings;

      // Format prayer times
      const formattedPrayerTimes: PrayerTime[] = prayerNames.map((prayer) => ({
        name: prayer.key,
        arabicName: prayer.arabicName,
        time: formatTime(timings[prayer.key as keyof PrayerTimesData]),
        icon: prayer.icon,
      }));

      setPrayerTimes(formattedPrayerTimes);
      setCurrentDate(data.data.date.readable);
      setHijriDate(
        `${data.data.date.hijri.date} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`
      );

      // Find next prayer
      findNextPrayer(formattedPrayerTimes);
    } catch (err) {
      setError("حدث خطأ في جلب مواقيت الصلاة. يرجى المحاولة مرة أخرى.");
      console.error("Error fetching prayer times:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "مساءً" : "صباحاً";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const findNextPrayer = (prayers: PrayerTime[]) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Exclude Sunrise from prayer times for next prayer calculation
    const actualPrayers = prayers.filter((p) => p.name !== "Sunrise");

    for (const prayer of actualPrayers) {
      const [time, period] = prayer.time.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let prayerMinutes = hours * 60 + minutes;

      // Adjust for PM times
      if (period === "مساءً" && hours !== 12) {
        prayerMinutes += 12 * 60;
      } else if (period === "صباحاً" && hours === 12) {
        prayerMinutes = minutes;
      }

      if (prayerMinutes > currentTime) {
        setNextPrayer(prayer);
        return;
      }
    }

    // If no prayer found for today, next prayer is Fajr tomorrow
    setNextPrayer(actualPrayers[0]);
  };

  const getTimeUntilNextPrayer = (): string => {
    if (!nextPrayer) return "";

    const now = new Date();
    const [time, period] = nextPrayer.time.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let targetHour = hours;
    if (period === "مساءً" && hours !== 12) {
      targetHour += 12;
    } else if (period === "صباحاً" && hours === 12) {
      targetHour = 0;
    }

    const target = new Date();
    target.setHours(targetHour, minutes, 0, 0);

    // If target time has passed today, set it for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const timeDiff = target.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hoursLeft} ساعة و ${minutesLeft} دقيقة`;
  };

  useEffect(() => {
    fetchPrayerTimes();

    // Update every minute
    const interval = setInterval(() => {
      if (prayerTimes.length > 0) {
        findNextPrayer(prayerTimes);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center"
        dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل مواقيت الصلاة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center"
        dir="rtl">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPrayerTimes}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition-colors duration-300">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4"
      dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🕌 مواقيت الصلاة
            </h1>
            <p className="text-xl text-green-600 font-semibold mb-2">
              نابلس - فلسطين
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-600">
              <span className="bg-green-100 px-4 py-2 rounded-full">
                📅 {currentDate}
              </span>
              <span className="bg-amber-100 px-4 py-2 rounded-full">
                🌙 {hijriDate}
              </span>
            </div>
          </div>

          {/* Next Prayer Alert */}
          {nextPrayer && (
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="text-2xl mb-2">{nextPrayer.icon}</div>
              <h3 className="text-2xl font-bold mb-2">
                الصلاة القادمة: {nextPrayer.arabicName}
              </h3>
              <p className="text-xl font-semibold mb-1">{nextPrayer.time}</p>
              <p className="text-green-100">
                متبقي: {getTimeUntilNextPrayer()}
              </p>
            </div>
          )}
        </div>

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {prayerTimes.map((prayer, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
                nextPrayer?.name === prayer.name
                  ? "ring-2 ring-green-400 bg-green-50"
                  : ""
              }`}>
              <div className="text-center">
                <div className="text-4xl mb-3">{prayer.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {prayer.arabicName}
                </h3>
                <p
                  className={`text-3xl font-bold ${
                    nextPrayer?.name === prayer.name
                      ? "text-green-600"
                      : "text-gray-700"
                  }`}>
                  {prayer.time}
                </p>
                {nextPrayer?.name === prayer.name && (
                  <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2">
                    الصلاة القادمة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Qibla Direction */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🧭 اتجاه القبلة
            </h3>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <div className="text-4xl text-white">🕋</div>
              </div>
              <p className="text-xl font-semibold text-gray-700">
                157° جنوب شرق
              </p>
              <p className="text-gray-600 mt-2">من نابلس إلى مكة المكرمة</p>
            </div>
          </div>

          {/* Prayer Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              💡 تذكيرات مهمة
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 ml-3">✓</span>
                <span>تأكد من الوضوء قبل الصلاة</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 ml-3">✓</span>
                <span>استقبل القبلة عند الصلاة</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 ml-3">✓</span>
                <span>اقرأ الأذكار بعد الصلاة</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 ml-3">✓</span>
                <span>حافظ على الصلاة في أوقاتها</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchPrayerTimes}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium">
            🔄 تحديث المواقيت
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
