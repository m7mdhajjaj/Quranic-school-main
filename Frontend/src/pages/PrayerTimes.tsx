import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPrayerTimes,
  getQiblaDirection,
  getPrayerSettings,
  formatTime,
  getNextPrayer,
  type PrayerTime,
  type PrayerTimesData,
  type PrayerSettings
} from "../Api/prayerTimesApi";

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  const [hijriDate, setHijriDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [, setSettings] = useState<PrayerSettings | null>(null);

  // Compass states
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [isCompassSupported, setIsCompassSupported] = useState(false);
  const [compassPermission, setCompassPermission] = useState<string>("unknown");
  const [qiblaDirection, setQiblaDirection] = useState(157); // Default for Nablus

  const prayerNames = useMemo(() => [
    { key: "Fajr", arabicName: "الفجر", icon: "🌅" },
    { key: "Sunrise", arabicName: "الشروق", icon: "☀️" },
    { key: "Dhuhr", arabicName: "الظهر", icon: "🌞" },
    { key: "Asr", arabicName: "العصر", icon: "🌆" },
    { key: "Maghrib", arabicName: "المغرب", icon: "🌇" },
    { key: "Isha", arabicName: "العشاء", icon: "🌙" },
  ], []);

  const fetchPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Get prayer settings first
      const settingsResponse = await getPrayerSettings();
      if (settingsResponse.success && settingsResponse.data) {
        setSettings(settingsResponse.data);
        setQiblaDirection(settingsResponse.data.qiblaDirection);
      }

      // Get current settings or use defaults
      const currentSettings = settingsResponse.data || {
        latitude: 32.2211,
        longitude: 35.2544,
        qiblaDirection: 157
      };

      // Fetch prayer times using API
      const response = await getPrayerTimes(
        currentSettings.latitude,
        currentSettings.longitude
      );

      if (!response.success) {
        throw new Error(response.message || "فشل في جلب مواقيت الصلاة");
      }

      const timings = response.data.timings;

      // Format prayer times
      const formattedPrayerTimes: PrayerTime[] = prayerNames.map((prayer) => ({
        name: prayer.key,
        arabicName: prayer.arabicName,
        time: formatTime(timings[prayer.key as keyof PrayerTimesData]),
        icon: prayer.icon,
      }));

      setPrayerTimes(formattedPrayerTimes);
      setCurrentDate(response.data.date.readable);
      setHijriDate(
        `${response.data.date.hijri.date} ${response.data.date.hijri.month.ar} ${response.data.date.hijri.year}`
      );

      // Find next prayer using API function
      const next = getNextPrayer(formattedPrayerTimes);
      setNextPrayer(next);

      // Get Qibla direction
      const qiblaResponse = await getQiblaDirection(
        currentSettings.latitude,
        currentSettings.longitude
      );
      if (qiblaResponse.success) {
        setQiblaDirection(qiblaResponse.data.direction);
      }

    } catch (err) {
      setError("حدث خطأ في جلب مواقيت الصلاة. يرجى المحاولة مرة أخرى.");
      console.error("Error fetching prayer times:", err);
    } finally {
      setLoading(false);
    }
  }, [prayerNames]);

  // formatTime is now imported from API

  // findNextPrayer is now imported from API as getNextPrayer

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

  // Compass functions
  const requestCompassPermission = useCallback(async () => {
    if ("DeviceOrientationEvent" in window) {
      try {
        // For iOS 13+ devices, we need to request permission
        if (
          typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission ===
          "function"
        ) {
          const permission = await (
            DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
          ).requestPermission();
          setCompassPermission(permission);
          if (permission === "granted") {
            setIsCompassSupported(true);
            startCompass();
          }
        } else {
          // For other devices, compass is available without permission
          setIsCompassSupported(true);
          setCompassPermission("granted");
          startCompass();
        }
      } catch (error) {
        console.error("Error requesting compass permission:", error);
        setCompassPermission("denied");
      }
    } else {
      setIsCompassSupported(false);
      setCompassPermission("not-supported");
    }
  }, []);

  const startCompass = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // Convert alpha to 0-360 degrees
        let heading = 360 - event.alpha;
        if (heading < 0) heading += 360;
        if (heading >= 360) heading -= 360;
        setDeviceHeading(heading);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  };

  const getQiblaArrowRotation = (): number => {
    // Calculate the rotation needed to point to Qibla
    const qiblaFromNorth = qiblaDirection - deviceHeading;
    return qiblaFromNorth;
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Update next prayer every minute
  useEffect(() => {
    if (prayerTimes.length === 0) return;
    
    const interval = setInterval(() => {
      const next = getNextPrayer(prayerTimes);
      setNextPrayer(next);
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Initialize compass
  useEffect(() => {
    requestCompassPermission();
  }, [requestCompassPermission]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
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
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPrayerTimes}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition-colors duration-300"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
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
              🧭 بوصلة القبلة
            </h3>
            <div className="text-center">
              {/* Interactive Compass */}
              <div className="relative w-48 h-48 mx-auto mb-4">
                {/* Compass Circle */}
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-4 border-gray-300 relative shadow-inner">
                  {/* North indicator */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-red-600 font-bold text-sm">
                    N
                  </div>

                  {/* Compass directions */}
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-600 font-bold text-sm">
                    E
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-600 font-bold text-sm">
                    S
                  </div>
                  <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-600 font-bold text-sm">
                    W
                  </div>

                  {/* Qibla Arrow */}
                  <div
                    className="absolute top-1/2 left-1/2 w-1 h-16 bg-green-500 transform -translate-x-1/2 -translate-y-full origin-bottom transition-transform duration-300"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${getQiblaArrowRotation()}deg)`,
                      transformOrigin: "bottom center",
                    }}>
                    {/* Arrow head */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-green-500"></div>
                  </div>

                  {/* Kaaba icon in center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                    🕋
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-700">
                  {qiblaDirection}° جنوب شرق
                </p>
                <p className="text-gray-600">من نابلس إلى مكة المكرمة</p>

                {isCompassSupported ? (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-700 text-sm">
                      🎯 البوصلة نشطة - حرك هاتفك لرؤية الاتجاه
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      اتجاه الجهاز: {Math.round(deviceHeading)}°
                    </p>
                  </div>
                ) : compassPermission === "not-supported" ? (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ البوصلة غير متاحة على هذا الجهاز
                    </p>
                  </div>
                ) : compassPermission === "denied" ? (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-red-700 text-sm">
                      ❌ تم رفض إذن البوصلة
                    </p>
                    <button
                      onClick={requestCompassPermission}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full text-xs hover:bg-green-700 transition-colors">
                      إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      🔄 جاري تحميل البوصلة...
                    </p>
                    <button
                      onClick={requestCompassPermission}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full text-xs hover:bg-green-700 transition-colors">
                      تفعيل البوصلة
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prayer Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6 ">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              💡 تذكيرات مهمة
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center justify-center">
                <span className="text-green-500 ml-3">✓</span>
                <span>تأكد من الوضوء قبل الصلاة</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-green-500 ml-3">✓</span>
                <span>استقبل القبلة عند الصلاة</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-blue-500 ml-3">📿</span>
                <span>اقرأ الأذكار بعد الصلاة</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-purple-500 ml-3">⏰</span>
                <span>حافظ على الصلاة في أوقاتها</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-orange-500 ml-3">🤲</span>
                <span>ادع الله واستغفر بعد كل صلاة</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-red-500 ml-3">🚫</span>
                <span>تجنب الانشغال أثناء الصلاة</span>
              </li>

              <li className="flex items-center justify-center">
                <span className="text-yellow-500 ml-3">🌟</span>
                <span>صل النوافل والسنن المؤكدة</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-pink-500 ml-3">👥</span>
                <span>صل في جماعة إن أمكن</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-teal-500 ml-3">💧</span>
                <span>تأكد من طهارة المكان والثوب</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-indigo-500 ml-3">🧘</span>
                <span>اخفض صوتك واخشع في الصلاة</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="text-amber-500 ml-3">💭</span>
                <span>تدبر في معاني ما تقرأ</span>
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
